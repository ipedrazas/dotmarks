from flask import Flask
from celery import Celery
from datetime import datetime
import urllib2
from BeautifulSoup import BeautifulSoup
from pymongo import MongoClient
from bson.objectid import ObjectId
from urlparse import urlparse


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


def get_date():
    return datetime.utcnow().replace(microsecond=0)


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
            updates['atags'] = auto_tag(item)

        if 'title' not in item or not item['title']:
            print "processing %s" % item['url']
            soup = BeautifulSoup(urllib2.urlopen(item['url']))
            if soup.title is not None:
                updates['title'] = soup.title.string
            elif soup.h1 is not None:
                updates['title'] = soup.h1.string.strip()

        if updates:
            do_update(item['_id'], updates)
