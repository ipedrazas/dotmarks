

dotMarks
========

### Self Hosted Bookmarks

Bookmarks? really? this is the thing. I'm lazy... I just wanted one single place to keep them all. I use delicious, Pocket, Kippt. I have bookmarks in my chromes, firefox and different browsers... all over the place. Which is fine. but as I said, I'm lazy, so I've ended up with a very wide amount of links spread between systems.

Every app has its purpouse but I just wanted to have a master copy of all of them. This is dotMarks. A system to keep your bookmarks. It's not going to replace any of the systems you currently use, it's just going to keep all your bookmarks there, you know, just in case you need them.

### Interior design
The system is built using [Eve][1] a Python REST API Framework. A [Nicola Iarocci][2] Project, MongoDB, Celery and Redis with a frontend built using Angular.js

I've tried to make the installation as painless as possible. I've added a Vagrant file that should allow you to run the system locally in very little time. Ideally you want to run your own instance of dotMarks (that's why I call it self-hosted, you see :) )

I will provide instructions to install it and run it in a Digital Ocean box soon.

### What's in the tin?
The project provides the backend to store and classify all your bookmarks. It comes with a Chrome extension to allow you to add bookmarks to your system as painless as possible... besides a few integrations:

 - Pocket, or GetPocket
 - Delicious
 - Twitter Favourites: I don't know you, but I fav those tweets with interesting links.
 - bulk load: paste a bunch of URLs or just upload your bookmarks files and let the system do the work for you: as I said before... I'm a bit lazy :)

### First steps

Once you have the system installed you will have to run the 3 elements:

 - Flask API backend
 - Celery worker
 - Http Server

#### Api

The easiest thing is just to run the flask application from the command line. Make sure the virtualenv is activated:

 > The command line should be something like
  **(dotmarks)vagrant@dotmarks [time] [/vagrant][master]**
       cd python
       python start.py

#### Celery workers:

> cd python
  celery -A worker worker

#### HTTP server:

> cd javascript
  server 8000

## Installation

### Dependencies
The project comes with a vagrant file with ansible provisioning.

The VagrantFile defines the box with a fixed IP and with a hostname:

>   config.vm.hostname = "dotmarks.dev"
    config.vm.network "private_network", ip: "192.168.33.10"

I use a vagrant plugin to manage the DNS resolution between boxes. The plugin is called vagrant-hostsupdater and it adds an entry in your hosts file with the name defined by **config.vm.hostname** and the ip associated to it by the parameter **config.vm.network**. If you don't want to use the plugin, you can remove these two parameters and use port forwarding insetad but I've found easier to use it this way.

To install the vagrant plugin just execute this command:

> vagrant plugin install vagrant-hostupdater

The project uses NFS to speed up read/write access. Nfs comes pre-installed in OS X and to install in Linux you only need these 3 packages:

> nfs-common nfs-kernel-server portmap

In case you want to disable nfs, you can comment out the following line:

> config.vm.synced_folder '.', '/vagrant', nfs: true

Once you have double checked that you have all the dependencies installed or you have configured the environment accordingly, just type the following command:

> vagrant up

and if you do have all the dependencies, the ansible provisioning will do the rest.

Once the vagrant box is started and provisioned you will have to log in and start the different processes.


## Setup

Once you have the environment installed you will have to set it up. The first thing you have to do is to create a user




>  Ping [me](https://twitter.com/ipedrazas) if you have questions or suggestions, or just to say 'Hi'.


  [1]: http://python-eve.org/
  [2]: https://twitter.com/nicolaiarocci
