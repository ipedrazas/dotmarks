from eve import Eve
import pdb
import time
from worker import populate_dotmark
from eve.methods.common import payload, parse


def after_insert_dotmark(items):
    print 'after insert'
    for item in items:
        populate_dotmark.delay(item)


app = Eve()

app.on_inserted_dotmarks += after_insert_dotmark

if __name__ == '__main__':
    app.run( host = '0.0.0.0', port = 5000, debug = True)