
#
#  docker build --no-cache=true -t dotmarks .
#  docker run -d -p 5000:5000 dotmarks
#


FROM ubuntu

# Install Python Setuptools
RUN apt-get update && apt-get install -y \
    python-setuptools

# Install pip
RUN easy_install pip

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
