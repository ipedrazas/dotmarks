
from flask import Flask, Response, request

import json
from dot_utils import get_date
from decorators import crossdomain
from workers.mail_worker import send_mail_password_reset
import bcrypt
from workers.constants import LAST_UPDATED
from workers.constants import RESET_PASSWORD_DATE, RESET_PASSWORD_HASH


app = Flask(__name__)


def get_hash(password, salt):
    return bcrypt.hashpw(password.encode('utf-8'), salt.encode('utf-8'))


@app.route("/version")
def version():
    return '.dotMarks v0.0.1a'


@crossdomain(origin='*')
@app.route('/sendMailReset', methods=['POST', 'OPTIONS'])
def send_mail_password():
    # app.logger.debug('send_mail_password')
    print('send_mail_password')
    try:
        data = json.loads(request.data)
        email = data['email']
    except:
        email = request.form['email']

    app.logger.debug(email)
    if email:
        send_mail_password_reset.delay(email)
        response = Response(
            'confirmation mail sent', 200)
    else:
        response = Response(
            'email not found', 406)

    # response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('AccessControlAllowMethods', 'POST, OPTIONS')
    return response


@crossdomain(origin='*')
@app.route('/resetPassword', methods=['POST', 'OPTIONS'])
def reset_password():
    print "reset_password"
    try:
        data = json.loads(request.data)
        print data
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
                response = Response('password updated', 200)
        else:
            response = Response('email not found', 406)
    except:
        response = Response('data not valid', 400)

    # response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('AccessControlAllowMethods', 'POST, OPTIONS')
    # response.headers.add('Access-Control-Allow-Headers', '*')

    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
