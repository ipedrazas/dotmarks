from eve import Eve
import pdb
import time
from worker import populate_dotmark
from eve.methods.common import payload, parse


def after_insert_dotmark(items):
	print "after insert"
	for item in items:
		populate_dotmark.delay(item)

def before_insert_entries(request):
	print 'processing entries'	
	payl = payload()
	print 'vamos alla'
	for value in payl:
		document = []
		doc_issues = {}
		print value
		document = parse(value, 'entries')
		print payl[value]

	# if 'start' in lookup:
	# 	item['start'] = time.strptime(item['start'], "%d/%m/%Y")   

app = Eve()


# app.on_pre_POST_entries += before_insert_entries
app.on_inserted_dotmarks += after_insert_dotmark

if __name__ == '__main__':
    app.run( host = '0.0.0.0', port = 5000, debug = True)