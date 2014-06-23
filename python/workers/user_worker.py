from flask import Flask
from celery import Celery
from pymongo import MongoClient
from constants import LAST_UPDATED, RESET_PASSWORD_DATE, RESET_PASSWORD_HASH
from dot_utils import get_date
from celery.utils.log import get_task_logger


logger = get_task_logger(__name__)
client = MongoClient('mongodb://localhost:27017/')
db = client.eve


def make_celery(app):
    celery = Celery('users', broker=app.config['CELERY_BROKER_URL'])
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
def post_login(item):
    if 'username' in item:
        updates = {
            RESET_PASSWORD_DATE: None,
            RESET_PASSWORD_HASH: None,
            LAST_UPDATED: get_date()
        }
        db.users.update(
            {{'username': item['username']}},
            {"$set": updates},
            upsert=False)
