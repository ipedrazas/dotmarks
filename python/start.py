from eve import Eve
from eve.auth import BasicAuth
import bcrypt
from worker import populate_dotmark, parse_log


class BCryptAuth(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource, method):
        if resource == 'users':
            return username == 'superuser' and password == 'password'
        else:
            accounts = app.data.driver.db['users']
            account = accounts.find_one({'username': username})
            print username
            print password
            print account
            return account and \
                bcrypt.hashpw(
                    password.encode('utf-8'),
                    account['salt'].encode('utf-8')
                ) == account['password']


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


app = Eve(auth=BCryptAuth)


app.on_inserted_dotmarks += after_insert_dotmark
app.on_inserted_logs += after_insert_log
app.on_insert_users += before_adding_user


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
