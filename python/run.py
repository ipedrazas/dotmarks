from eve import Eve
#from eve.auth import BasicAuth
#from werkzeug.security import check_password_hash

from worker import populate_dotmark, parse_log




# class Sha1Auth(BasicAuth):
#     def check_auth(self, username, password, allowed_roles):
#         # use Eve's own db driver; no additional connections/resources are used
#         accounts = app.data.driver.db['accounts']
#         account = accounts.find_one({'username': username})
#         return account and \
#             check_password_hash(account['password'], password)


def after_insert_dotmark(items):
    for item in items:
        populate_dotmark.delay(item)

def after_insert_log(items):
    print str(items)
    for item in items:
        parse_log.delay(item)

app = Eve()


@app.route("/hello")
def hello():
    return "Hello World!"

app.on_inserted_dotmarks += after_insert_dotmark
app.on_inserted_logs += after_insert_log

if __name__ == '__main__':
    app.run( host = '0.0.0.0', port = 5000, debug = True)