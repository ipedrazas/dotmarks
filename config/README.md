

# MongoDB Configuration


## User Administrator Creation
use admin
db.createUser(
  {
    user: "mongodbAdmin",
    pwd: "mongodbpassword",
    roles:
    [
      {
        role: "mongodbAdmin",
        db: "admin"
      }
    ]
  }
)


##  Enable Authentication