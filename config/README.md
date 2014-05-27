

# MongoDB Configuration


## User Administrator Creation
  use admin
  db.addUser('mongoUser', 'ZOPa676KL5K5AALlfakjhdf7adfh47r3897gl')


##  Enable Authentication /etc/mongodb.conf
  # uncomment this line:
  auth=True

Restart mongodb
  sudo service mongodb restart


