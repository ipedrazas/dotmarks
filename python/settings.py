

DEBUG=True

# Enable reads (GET), inserts (POST) and DELETE for resources/collections
# (if you omit this line, the API will default to ['GET'] and provide
# read-only access to the endpoint).
RESOURCE_METHODS = ['GET', 'POST', 'DELETE']

# Enable reads (GET), edits (PATCH) and deletes of individual items
# (defaults to read-only item access).
ITEM_METHODS = ['GET', 'PATCH', 'DELETE']

# We enable standard client cache directives for all resources exposed by the
# API. We can always override these global settings later.
CACHE_CONTROL = 'max-age=20'
CACHE_EXPIRES = 20

# Enable CORS for all domains
X_DOMAINS = "*"

dotmarks = {

    'schema': {
        'url': {
            'type': 'string',
            'minlength': 7,
            'required': True,
            'unique': True,
            },
        'title':{
            'type': 'string'
        },
        'username':{
            'type': 'string',
            'required': True,
        },
        'tags': {
            'type': 'list'
        }
    }
}

entries = {
    'item_title': 'entry',
    'additional_lookup': {
        'url': 'regex("[\w]+")',
        'field': 'username'
    },
    'schema':{
        'title': {
            'type': 'string',
            'required': True
        },
        'start': {
            'type': 'datetime',
            'required': True
        },
        'end': {
            'type': 'datetime'
        },
        'image': {
            'type': 'string'
        },
        'group': {
            'type': 'string'
        },
        'tags': {
            'type': 'list'
        },
        'username':{
            'type': 'string',
            'required': True,
        },
    }
}

# The DOMAIN dict explains which resources will be available and how they will
# be accessible to the API consumer.
DOMAIN = {
    'dotmarks': dotmarks,
    'entries': entries
}
