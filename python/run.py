from eve import Eve
import pdb

from worker import populate_dotmark



def after_insert(resource, items):
	print "after insert"
	for item in items:
		populate_dotmark.delay(item)


def before_insert(resource_name, items):
	print "Something is going to be inserted"

app = Eve()


app.on_insert += before_insert
app.on_inserted += after_insert

if __name__ == '__main__':
    app.run( host = '0.0.0.0', port = 5000, debug = True)