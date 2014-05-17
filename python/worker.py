from flask import Flask
from celery import Celery
from datetime import datetime
import urllib2
from BeautifulSoup import BeautifulSoup
from pymongo import MongoClient
from bson.objectid import ObjectId


client = MongoClient('mongodb://localhost:27017/')
db = client.eve

LAST_UPDATED = '_updated'

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



@celery.task()
def parse_log(item):
    print "processing %s" % item['source_id']
    oid = item['source_id']
    if(item['action']=='click'):
        db.dotmarks.update({"_id": ObjectId(oid)}, {"$inc": {"views": 1}}, upsert=False)
    if(item['action']=='star'):
        updates = {'star': 'true' in item['value']}
        updates[LAST_UPDATED] = datetime.utcnow().replace(microsecond=0)
        db.dotmarks.update({'_id': ObjectId(oid)}, {'$set': updates}, upsert=False)


@celery.task()
def populate_dotmark(item):
    if 'url' and '_id' in item:
        if 'title' not in item or not item['title']:
            print "processing %s" % item['url']
            soup = BeautifulSoup(urllib2.urlopen(item['url']))
            title = soup.title.string
            updates = {'title': title}
            updates[LAST_UPDATED] = datetime.utcnow().replace(microsecond=0)
            db.dotmarks.update({'_id': item['_id']}, {'$set': updates}, upsert=False)
        return 1