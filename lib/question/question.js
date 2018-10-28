
const { prompt } = require('inquirer');
const {
  createDockerFile,
  inputName,
  inputTag,
  createReactApp,
  createJavaApp,
  selectService,
  selectActionService,
  selectActionDB,
  exposePort,
  persistentData,
  selectDatabase,
  askEnvironment
} = require('../contants/askQuestion')

const {
  mysql,
  redis,
  mongodb
} = require('../contants/databaseTemplate')
const createService = (jsonBuild) => {
  return new Promise((resolve, reject) => {
    prompt([selectService]).then(answers => {
      let service = {
        type: answers.service,
        port: [],
        volume: [],
        env: []
      }
      switch (service.type) {
        case "react-app":
          prompt([createReactApp]).then((answersReact => {
            askServiceInfo(service).then(
              (resListExposeService) => {
                createService(jsonBuild).then(res => {
                  resListExposeService.file = answersReact.dirStaticWeb;
                  jsonBuild.services.push(resListExposeService)
                  resolve()
                })
              }
            )

          }))
          break;
        case "java":
          prompt([createJavaApp]).then((answersJava) => {
            askServiceInfo(service).then(
              (resListExposeService) => {
                createService(jsonBuild).then(res => {
                  resListExposeService.file = answersJava.jarName;
                  jsonBuild.services.push(resListExposeService)
                  resolve()
                })
              }
            )
          })
          break;
        case "database":
          prompt([selectDatabase]).then((answersDatabase => {
            switch (answersDatabase.name) {
              case "another":
                prompt([inputName]).then((name) => {
                  service.name = name;
                  createDatabase(service, jsonBuild).then(() => {
                    resolve();
                  })
                })
                break;
              default:
                service.name = answersDatabase.name
                createDatabase(service, jsonBuild).then(() => {
                  resolve();
                })
            }

          }))
          break;
        default:
          resolve()
      }
    }
    )
  })
}

const createDatabase = (service, jsonBuild) => {
  return new Promise((resolve, reject) => {
    prompt([inputTag]).then(ans => {
      service.tag = ans.tag;
      askServiceInfo(service).then(
        (resListExposeService) => {
          createService().then(res => {
            jsonBuild.services.push(resListExposeService)
            resolve(jsonBuild)
          })
        }
      )
    })

  })
}
const askServiceInfo = (service) => {
  return new Promise(
    (resolve, reject) => {
      askPublicInfo(service).then(res => {
        if (res !== "end") {
          if (res.type === "port") {
            service.port.push(res.data);
          } else if (res.type === "volume") {
            service.volume.push(res.data);
          } else if (res.type === "environment") {
            service.env.push(res.data)
          }
          askServiceInfo(service).then((res) => {
            resolve(res)
          })
        }
        else {
          resolve(service)
        }
      })

    }
  )


}
const askPublicInfo = (service) => {
  let { question, portQuestion, volumeQuestion, environment } = setDefaultValue(service)

  return new Promise((resolve, reject) => {
    prompt([question]).then(answers => {
      switch (answers.expose) {
        case "expose a port":
          prompt(portQuestion).then(ans => {
            resolve({ type: "port", data: ans })
          })
          break;
        case "persistent data":
          prompt(volumeQuestion).then(ans => {
            resolve({ type: "volume", data: ans })
          })
          break;
        case "environment":
          prompt(environment).then(ans => {
            resolve({ type: "enviroment", data: ans })
          })
          break;
        default:
          resolve("end")
      }
    })
  })
}

const setDefaultValue = (service) => {
  let question
  let portQuestion = exposePort
  let volumeQuestion = persistentData
  let environment = []

  if (service.type === "database") {
    question = selectActionDB
    let db = { port: 80, data: ".", env: [] };
    switch (service.name) {
      case "mysql":
        db = mysql
        break;
      case "mongodb":
        db = mongodb
        break;
      case "redis":
        db = redis
        break;
      default:

    }
    portQuestion.forEach((value, idx) => value.default = db.port)
    volumeQuestion.forEach((value, idx) => value.default = db.data)
    db.env.forEach((value, idx) => {
      environment.push({
        ...askEnvironment,
        message: value.message,
        name: value.key
      })
    })
  }
  else {
    question = selectActionService
  }
  return {
    question,
    portQuestion,
    volumeQuestion,
    environment,
  }
}

module.exports = {
  createService,
}