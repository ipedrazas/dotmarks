
#
#  docker build --no-cache=true -t dotmarks .
#  docker run -d -p 5000:5000 dotmarks
#


#
# TODO: link redis & MongoDB
#

FROM ubuntu

# Install Python Setuptools
RUN apt-get update && apt-get install -y build-essential wget \
    python-setuptools python-pip libffi-dev python-dev


# Install MongoDB.
RUN \
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 && \
  echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list && \
  apt-get update && \
  apt-get install -y mongodb-org && \
  mkdir -p /data/db

# Define mountable directories.
VOLUME ["/data"]

# Define working directory.
WORKDIR /data

# Define default command.
CMD ["mongod"]

# Expose ports.
#   - 27017: process
#   - 28017: http
EXPOSE 27017
EXPOSE 28017


# Install Redis.
RUN \
  cd /tmp && \
  wget http://download.redis.io/redis-stable.tar.gz && \
  tar xvzf redis-stable.tar.gz && \
  cd redis-stable && \
  make && \
  make install && \
  cp -f src/redis-sentinel /usr/local/bin && \
  mkdir -p /etc/redis && \
  cp -f *.conf /etc/redis && \
  rm -rf /tmp/redis-stable* && \
  sed -i 's/^\(bind .*\)$/# \1/' /etc/redis/redis.conf && \
  sed -i 's/^\(daemonize .*\)$/# \1/' /etc/redis/redis.conf && \
  sed -i 's/^\(dir .*\)$/# \1\ndir \/data/' /etc/redis/redis.conf && \
  sed -i 's/^\(logfile .*\)$/# \1/' /etc/redis/redis.conf

# Define default command.
CMD ["redis-server", "/etc/redis/redis.conf"]

# Expose ports.
EXPOSE 6379


# Install requirements.txt
ADD python/requirements.txt /src/python/requirements.txt
RUN cd /src/python; pip install -r requirements.txt

# Add the Flask App
ADD python /src/python

# Add the AngularJs App
ADD javascript /src/www

# EXPOSE PORT
EXPOSE 5000
EXPOSE 8001

# Run the Flask APP
CMD python src/app.py

# Run the web server
RUN cd /src/www
CMD python -m SimpleHTTPServer 8001
