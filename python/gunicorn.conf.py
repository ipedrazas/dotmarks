import multiprocessing


bind = 'unix:/tmp/gunicorn-api.dotmaerks.dev.socket'
workers = multiprocessing.cpu_count() * 2 + 1
timeout = 60
