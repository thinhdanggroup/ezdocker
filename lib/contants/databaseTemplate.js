

const mysql = {
  port: 6379,
  data: "/var/lib/mysql",
  env: [
    {
      message: "Root password",
      key: "MYSQL_ROOT_PASSWORD"
    },
    {
      message: "User database",
      key: "MYSQL_DATABASE"
    },
    {
      message: "Create mysql user",
      key: "MYSQL_USER"
    },
    {
      message: "Create password mysql user",
      key: "MYSQL_PASSWORD"
    }
  ]
}

const redis = {
  port: 6379,
  data: "/data",
  env: []
}

const mongodb = {
  port: 27018,
  data: '/data/db',
  env: [
    {
      message: "Username for root",
      key: "MONGO_INITDB_ROOT_USERNAME"
    },
    {
      message: "Password for root user",
      key: "MONGO_INITDB_ROOT_PASSWORD"
    }
  ]
}

module.exports = {
  mysql,
  redis,
  mongodb
}