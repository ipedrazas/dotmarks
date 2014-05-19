

DEBUG = True

# Enable reads (GET), inserts (POST) and DELETE for resources/collections
# (if you omit this line, the API will default to ['GET'] and provide
# read-only access to the endpoint).
RESOURCE_METHODS = ['GET', 'POST', 'DELETE']

# Enable reads (GET), edits (PATCH) and deletes of individual items
# (defaults to read-only item access).
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']

PUBLIC_METHODS = ['GET']
PUBLIC_ITEM_METHODS = ['GET']

# We enable standard client cache directives for all resources exposed by the
# API. We can always override these global settings later.
CACHE_CONTROL = 'max-age=20'
CACHE_EXPIRES = 20

XML = False
# Enable CORS for all domains
X_DOMAINS = "*"
X_HEADERS = "Content-Type, accept, Authorization," \
    " Access-Control-Request-Headers, Access-Control-Allow-Origin"

MONGO_QUERY_BLACKLIST = ['$where']


logs = {
    'schema': {
        'user': {
            'type': 'string'
        },
        'source_id': {
            'type': 'string'
        },
        'action': {
            'type': 'string'
        },
        'value': {
            'type': 'string'
        }
    }
}

users = {
    # 'additional_lookup': {
    #     'url': '[\w]+',
    #     'field': 'username',
    # },

    'cache_control': '',
    'cache_expires': 0,

    'schema': {
        'username': {
            'type': 'string',
            'unique': True,
            'required': True
        },
        'password': {
            'type': 'string',
            'required': True
        }
    }
}

dotmarks = {

    'schema': {
        # 'public_methods': ['GET'],
        # 'public_item_methods': ['GET'],
        'url': {
            'type': 'string',
            'minlength': 7,
            'required': True,
            'unique': True,
        },
        'title': {
            'type': 'string'
        },
        'username': {
            'type': 'string',
            'required': True,
        },
        'tags': {
            'type': 'list'
        },
        'atags': {              # Automatic Tags
            'type': 'list'
        },
        'views': {
            'type': 'integer'
        },
        # To specify where the link comes from
        'source': {
            'type': 'string'
        },
        'star': {
            'type': 'boolean',
            'default': False
        }
    }
}

atags = {
    'schema': {
        'tag': {
            'type': 'string',
            'unique': True,
            'required': True,
        },
        'entries': {
            'type': 'list'
        }
    }
}

# The DOMAIN dict explains which resources will be available and how they will
# be accessible to the API consumer.
DOMAIN = {
    'dotmarks': dotmarks,
    'users': users,
    'logs': logs,
    'atags': atags,
}
