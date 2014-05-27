#
#
#


from pocket import Pocket
import os

consumer_key = os.getenv("POCKET")
redirect_uri = "https://dotmarks.net/pocket"


request_token = Pocket.get_request_token(
    consumer_key=consumer_key,
    redirect_uri=redirect_uri,
)

auth_url = Pocket.get_auth_url(
    code=request_token,
    redirect_uri=redirect_uri,
)
print 'Please authorize the app using the following url and press ENTER here'
print auth_url
raw_input()

access_token = Pocket.get_access_token(
    consumer_key=consumer_key,
    code=request_token,
)
print 'Got authenticated request token'
print request_token


def add_url(url):
    print 'adding', url
    print pocket_instance.add(url=url)


def get10():
    return pocket_instance.get(count=10, detailType='simple')


pocket_instance = Pocket(consumer_key, access_token)

links = get10()
for link in links:
    print str(link)
