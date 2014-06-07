from urllib2 import Request, urlopen, URLError
from BeautifulSoup import BeautifulSoup
from datetime import datetime


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
