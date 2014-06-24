from flask import Flask
from celery import Celery
from pymongo import MongoClient
from bson.objectid import ObjectId
from dot_delicious import parse_html
from dot_utils import get_date, get_title_from_url, get_hash, do_update
from dot_utils import auto_tag
from mail_utils import create_reset_mail_object
from celery.utils.log import get_task_logger
from constants import LAST_UPDATED, RESET_PASSWORD_DATE, RESET_PASSWORD_HASH


logger = get_task_logger(__name__)
client = MongoClient('mongodb://localhost:27017/')
db = client.eve


def make_celery(app):
    celery = Celery('dotmarks', broker=app.config['CELERY_BROKER_URL'])
    celery.conf.update(app.config)
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)
    celery.Task = ContextTask
    return celery


flask_app = Flask(__name__)
flask_app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    CELERY_RESULT_BACKEND='redis://localhost:6379'
)
celery = make_celery(flask_app)


@celery.task()
def process_attachment(item):
    if '_id' in item:
        parse_html(item['_id'])


@celery.task()
def parse_log(item):
    if 'source_id' in item:
        oid = item['source_id']
        if(item['action'] == 'click'):
            db.dotmarks.update(
                {"_id": ObjectId(oid)},
                {"$inc": {"views": 1}, "$set": {LAST_UPDATED: get_date()}},
                upsert=False)

        if(item['action'] == 'star'):
            updates = {'star': 'true' in item['value']}
            do_update(oid, updates)


@celery.task()
def populate_dotmark(item):
    logger.info("processing %s" % item['url'])
    updates = {}
    if 'url' and '_id' in item:
        if 'title' not in item or not item['title']:
            updates['title'] = get_title_from_url(item['url'])
            item['title'] = updates['title']

        atags = auto_tag(item)
        if atags:
            updates['atags'] = atags

        if updates:
            do_update(item['_id'], updates)


@celery.task()
def send_mail_password_reset(email):
    user = db.users.find_one({'email': email})
    if user:
        hashlink = get_hash(email)
        create_reset_mail_object(email, str(hashlink))
        updates = {
            RESET_PASSWORD_DATE: get_date(),
            RESET_PASSWORD_HASH: get_date(),
            LAST_UPDATED: get_date()
        }
        db.users.update(
            {'_id': ObjectId(user['_id'])},
            {"$inc": {"r": 1}, "$set": updates},
            upsert=False)
    else:
        logger.error("no user found with email: " + email)


@celery.task()
def post_login(item):
    if 'username' in item:
        updates = {
            RESET_PASSWORD_DATE: None,
            RESET_PASSWORD_HASH: None,
            LAST_UPDATED: get_date()
        }
        db.users.update(
            {'username': item['username']},
            {"$set": updates},
            upsert=False)
