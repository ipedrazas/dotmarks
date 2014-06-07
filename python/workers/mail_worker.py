from flask import Flask
from celery import Celery
from pymongo import MongoClient
from constants import LAST_UPDATED, RESET_PASSWORD_DATE, RESET_PASSWORD_HASH
from dot_utils import get_date
import hashlib
from os.path import join, abspath, dirname
import os
import sendgrid


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


def get_hash(email):

    m = hashlib.sha1()
    m.update(email + get_date())
    m.hexdigest()


def read_file(filename):
    path = abspath(join(dirname(__file__), '.')) + filename
    print path
    f = open(path, 'r')
    return f.read()


def send_invitation_mail(mail):
    print 'Mail sent to ' + mail['to_address']
    sendgrid_user = os.getenv("SENDGRID_USER")
    sendgrid_password = os.getenv("SENDGRID_PASSWORD")
    s = sendgrid.Sendgrid(sendgrid_user, sendgrid_password, secure=True)
    message = sendgrid.Message((
        mail['from'], mail['from_name']),
        mail['subject'], mail['txt_body'], mail['html_body'])
    message.add_to(mail['to_address'], mail['to_name'])
    s.web.send(message)


def create_reset_mail_object(email, hashlink):
    subject = 'Reset Password Request'
    mail = read_file('/mail_templates/reset_password_mail.html')
    html_mail = mail.decode('utf-8') % (hashlink)
    txt_mail = 'All '
    mail = {'from': "info@dotmarks.net",
            'from_name': '.dotMarks',
            'subject': subject,
            'txt_body': txt_mail,
            'html_body': html_mail,
            'to_address': email,
            'to_name': email
            }
    send_invitation_mail(mail)


@celery.task()
def send_mail_password_reset(email):
    user = db.users.find({'email': email})
    if user:
        hashlink = get_hash(email)
        create_reset_mail_object(user['email'], hashlink)
        #update user
        db.dotmarks.update(
            {"email": email},
            {"$inc": {"r": 1}, "$set": {LAST_UPDATED: get_date(),
                                        RESET_PASSWORD_DATE: get_date(),
                                        RESET_PASSWORD_HASH: hashlink}},
            upsert=False)
