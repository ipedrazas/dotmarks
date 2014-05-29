from flask import Flask
from celery import Celery
from pymongo import MongoClient
from bson.objectid import ObjectId
from urlparse import urlparse
from dot_delicious import parse_html
from dot_utils import get_date
from net_utils import get_title_from_url
from constants import LAST_UPDATED


client = MongoClient('mongodb://localhost:27017/')
db = client.eve


def make_celery(app):
    celery = Celery(app.import_name, broker=app.config['CELERY_BROKER_URL'])
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


def do_update(oid, updates):
    updates[LAST_UPDATED] = get_date()
    db.dotmarks.update({'_id': ObjectId(oid)}, {'$set': updates}, upsert=False)


def get_domain(url):
    parsed_uri = urlparse(url)
    # ignore the uri.scheme (http|s)
    domain = parsed_uri.netloc
    posWWW = domain.find('www')
    if posWWW != -1:
        domain = domain[4:]
    return domain


def tags_by_url(url):
    results = db.atags.find({'entries': get_domain(url)})
    tags = []
    for result in results:
        print result
        tags.append(result['tag'])
    return tags


def auto_tag(item):
    atags = []
    at_url = tags_by_url(item['url'])
    if at_url:
        atags.extend(at_url)
    return atags


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
    print "processing %s" % item['url']
    updates = {}
    if 'url' and '_id' in item:
        atags = auto_tag(item)
        if atags:
            updates['atags'] = atags

        if 'title' not in item or not item['title']:
            updates['title'] = get_title_from_url(item['url'])

        if updates:
            do_update(item['_id'], updates)
