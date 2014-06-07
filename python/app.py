from eve import Eve
from eve.auth import BasicAuth
import bcrypt
from workers.dotmarks_postworker import populate_dotmark, parse_log
from workers.dotmarks_postworker import process_attachment
from flask import Response, request
import os
from workers.mail_worker import send_mail_password_reset
from workers.user_worker import post_login
from workers.constants import LAST_UPDATED
from workers.constants import RESET_PASSWORD_DATE, RESET_PASSWORD_HASH
import json
from dot_utils import get_date


class BCryptAuth(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource, method):
        if 'users' == resource:
            if username == 'admin' and password == 'admin':
                return True

        users = app.data.driver.db['users']
        user = users.find_one({"username": username})

        if user:
            self.set_request_auth_value(user['username'])
            is_valid_password = bcrypt.hashpw(
                password.encode('utf-8'),
                user['salt'].encode('utf-8')
            ) == user['password']

            if user and is_valid_password:
                post_login.delay(user)
                return True
        return False

    def authenticate(self):
        response = Response(
            'Please provide valid credentials', 401,
            {'WWW-Authenticate': 'Basic realm:"%s"' % __package__})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


def after_insert_dotmark(items):
    for item in items:
        populate_dotmark.delay(item)


def after_insert_log(items):
    print str(items)
    for item in items:
        parse_log.delay(item)


def find_user(username):
    users = app.data.driver.db['users']
    return users.find_one({'username': username})


def before_adding_user(items):
    for item in items:
        item['salt'] = bcrypt.gensalt()
        item['password'] = \
            bcrypt.hashpw(item['password'].encode('utf-8'), item['salt'])


def after_inserting_atachment(items):
    for item in items:
        process_attachment.delay(item)


#
# Hack to read settings when using gunicorn
#
SETTINGS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), 'settings.py')

app = Eve(auth=BCryptAuth, settings=SETTINGS_PATH)


app.on_inserted_attachments += after_inserting_atachment
app.on_inserted_dotmarks += after_insert_dotmark
app.on_inserted_logs += after_insert_log
app.on_insert_users += before_adding_user


@app.route("/version")
def version():
    return '.dotMarks v0.0.1a'


@app.route('/sendMailReset', methods=['POST'])
def send_mail_password():
    data = json.loads(request.data)
    email = data['email']

    if email:
        send_mail_password_reset.delay(email)
        response = Response(
            'confirmation mail sent', 200)
    else:
        response = Response(
            'email not found', 406)

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/sendMailReset', methods=['POST'])
def reset_password():
    data = json.loads(request.data)
    password = data['password']
    token = data['token']
    if password and token:
        users = app.data.driver.db['users']
        user = users.find_one({"_reseth": token})
        if user:
            pwd = bcrypt.hashpw(user['password'].encode('utf-8'), user['salt'])
            updates = {
                RESET_PASSWORD_DATE: None,
                RESET_PASSWORD_HASH: None,
                LAST_UPDATED: get_date(),
                "password": pwd
            }
            users.update({"_reseth": token}, {"$set": updates})
            response = Response('password updated', 200)
    else:
        response = Response(
            'email not found', 406)

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
