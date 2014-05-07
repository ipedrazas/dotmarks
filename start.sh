sudo /etc/init.d/redis-server start

cd python
python run.py &
celery -A worker worker &

cd ../javascript
npm start &

