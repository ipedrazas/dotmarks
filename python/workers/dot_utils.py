from urllib2 import Request, urlopen, URLError
from BeautifulSoup import BeautifulSoup
from datetime import datetime
import hashlib
from urlparse import urlparse
from constants import LAST_UPDATED, RESET_PASSWORD_DATE, RESET_PASSWORD_HASH


def get_date():
    return datetime.utcnow().replace(microsecond=0)


def get_title_from_url(url):
    print "getting title from " + url
    try:
        hdr = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) '
               'AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu '
               'Chromium/34.0.1847.116 Chrome/34.0.1847.116 '
               'Safari/537.36'}

        req = Request(url, headers=hdr)
        soup = BeautifulSoup(urlopen(req))
        print str(soup)
        if soup.title is not None:
            return soup.title.string
        elif soup.h1 is not None:
            return soup.h1.string.strip()
    except IOError as e:
        print e
        print "    I/O error({0}): {1}".format(e.errno, e.strerror)
    except URLError, err:
        print
        print "    Some other error happened:", err.reason


def get_hash(email):
    m = hashlib.sha1()
    m.update(email + str(get_date()))
    return m.hexdigest()


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
        logger.info(result)
        tags.append(result['tag'])
    return tags


def auto_tag(item):
    atags = []
    at_url = tags_by_url(item['url'])
    if at_url:
        atags.extend(at_url)
    return atags