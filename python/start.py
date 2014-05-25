from eve import Eve
from eve.auth import BasicAuth
import bcrypt
from worker import populate_dotmark, parse_log
from flask import Response


class BCryptAuth(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource, method):
        # print 'check_auth'
        # filter = resource != 'users' and method != 'POST'
        # print filter
        # if not filter:
        users = app.data.driver.db['users']
        print "username: " + username
        print "pwd: " + password
        print users
        user = users.find_one({"username": username})
        # self.set_request_auth_value(account['_id'])
        if user:
            is_valid_password = bcrypt.hashpw(
                password.encode('utf-8'),
                user['salt'].encode('utf-8')
            ) == user['password']
            return user and is_valid_password

    def authenticate(self):
        return Response(
            'Please provide valid credentials', 401,
            {'WWW-Authenticate': 'Basic realm:"%s"' % __package__})


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


def before_fetching_dotmarks(request, lookup):
    print lookup
    lookup["sort"] = [("views", -1)]


app = Eve(auth=BCryptAuth)


app.on_inserted_dotmarks += after_insert_dotmark
app.on_inserted_logs += after_insert_log
app.on_insert_users += before_adding_user
app.on_pre_GET_dotmarks += before_fetching_dotmarks

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
