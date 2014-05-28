

# MongoDB Configuration


## User Administrator Creation
  use admin


db.createUser(
  {
    user: "dmUser",
    pwd: "ZOPa676KL5K5AALlfakjhdf7adfh47r3897gl",
    roles:
    [
      {
        role: "readWrite",
        db: "eve"
      },
      {
        role: "readWrite",
        db: "admin"
      }
    ]
  }
)



##  Enable Authentication /etc/mongodb.conf
  # uncomment this line:
  auth=True

Restart mongodb
  sudo service mongodb restart

