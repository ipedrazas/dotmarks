from eve import Eve
from eve.auth import BasicAuth
from eve.utils import config
import bcrypt
from workers.postworker import populate_dotmark, parse_log
from workers.postworker import process_attachment
from flask import Response, request
import os
from workers.postworker import send_mail_password_reset
from workers.postworker import post_login
from workers.constants import LAST_UPDATED
from workers.constants import RESET_PASSWORD_DATE, RESET_PASSWORD_HASH
import json
from dot_utils import get_date

from flask import make_response, jsonify


def get_hash(password, salt):
    return bcrypt.hashpw(password.encode('utf-8'), salt.encode('utf-8'))


class BCryptAuth(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource, method):

        if 'users' == resource:
            if username == 'admin' and password == 'admin':
                return True

        users = app.data.driver.db['users']
        user = users.find_one({"username": username})

        if user:
            self.set_request_auth_value(user['username'])
            is_valid_password = \
                get_hash(password, user['salt']) == user['password']

            if user and is_valid_password:
                post_login.delay(user)
                return True
        return False

    def authenticate(self):
        app.logger.debug('authenticate called')
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


def add_headers(resp):
    if isinstance(config.X_DOMAINS, str):
        domains = [config.X_DOMAINS]
    else:
        domains = config.X_DOMAINS

    if config.X_HEADERS is None:
        headers = []
    elif isinstance(config.X_HEADERS, str):
        headers = [config.X_HEADERS]
    else:
        headers = config.X_HEADERS

    xdomains = ', '.join(domains)
    xheaders = ', '.join(headers)

    methods = app.make_default_options_response().headers.get('allow', '')
    resp.headers.add('Access-Control-Allow-Origin', xdomains)
    resp.headers.add('Access-Control-Allow-Headers', xheaders)
    resp.headers.add('Access-Control-Allow-Methods', methods)
    resp.headers.add('Access-Control-Allow-Max-Age', config.X_MAX_AGE)

    return resp


@app.route('/sendMailReset', methods=['POST', 'OPTIONS'])
def send_mail_password():

    ## TODO: Check that email exists
    document = {}
    status = 200

    if request.method == 'OPTIONS':
        resp = app.make_default_options_response()
    else:
        data = json.loads(request.data)
        email = data['email']
        if email:
            send_mail_password_reset.delay(email)
            document = {'result': 'All ok'}
        else:
            status = 406
            document = {'error': 'email not found'}

        resp = make_response(jsonify(document), status)
        resp.mimetype = 'application/json'

    return add_headers(resp)


# @crossdomain(origin='*')
@app.route('/resetPassword', methods=['POST, OPTIONS'])
def reset_password():
    print "reset_password"
    document = {}
    status = 200

    if request.method == 'OPTIONS':
        resp = app.make_default_options_response()
    else:

        try:
            data = json.loads(request.data)
            password = data['password']
            token = data['token']
            if password and token:
                users = app.data.driver.db['users']
                user = users.find_one({"_reseth": token})
                if user:
                    pwd = get_hash(password, user['salt'])
                    updates = {
                        RESET_PASSWORD_DATE: None,
                        RESET_PASSWORD_HASH: None,
                        LAST_UPDATED: get_date(),
                        "password": pwd
                    }
                    users.update({"_reseth": token}, {"$set": updates})
                    document = {'result': 'password updated'}
            else:
                status = 406
                document = {'err': 'email not found'}
        except:
            document = {'err': 'data not valid'}
            status = 400

        resp = make_response(jsonify(document), status)
        resp.mimetype = 'application/json'

    return add_headers(resp)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
