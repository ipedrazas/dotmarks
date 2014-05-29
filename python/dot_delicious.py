from pymongo import MongoClient
from bson.objectid import ObjectId
import gridfs
from BeautifulSoup import BeautifulSoup, SoupStrainer
#import base64


client = MongoClient('mongodb://localhost:27017/')
db = client.eve
fs = gridfs.GridFS(db)
dks = db.dotmarks


def parse_html(oid):
    cursor = db.attachments.find({'_id': ObjectId(oid)})
    for attachment in cursor:
        html = fs.get(attachment['file']).read()
        # print html
        for link in BeautifulSoup(html, parseOnlyThese=SoupStrainer('a')):
            if link:
                # print link.contents
                dk = {}
                dk['url'] = link['href']
                tags = link['tags'].split(',')
                if tags:
                    dk['tags'] = tags
                dk['username'] = attachment['user']
                if link.contents[0]:
                    dk['title'] = link.contents[0]
                dks.insert(dk)
                print dk


if __name__ == '__main__':
    parse_html('53866072f3c4d508a43e6866')
