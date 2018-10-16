
const {
  createDockerFile,
  inputName,
  inputTag,
  createReactApp,
  createJavaApp,
  selectService,
  selectAction,
  exposePort,
  persistentData,
  selectDatabase
} = require("./contants")
const { prompt } = require('inquirer');
const fs = require('fs');

let jsonBuild = {
  services: []
}
const buildJsonDocker = () => {
  return new Promise((resolve, reject) => {
    prompt([inputName, inputTag, createDockerFile]).then(answers => {
      jsonBuild = { ...jsonBuild, ...answers };
      createService().then(() => {
        resolve(jsonBuild);
      })
    })
  })
}
const createService = () => {
  return new Promise((resolve, reject) => {
    prompt([selectService]).then(answers => {
      let service = {
        type: answers.service,
        port: [],
        volume: []
      }
      switch (service.type) {
        case "react-app":
          prompt([createReactApp]).then((answersReact => {
            createListExpose(service).then(
              (resListExposeService) => {
                createService().then(res => {
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
            createListExpose(service).then(
              (resListExposeService) => {
                createService().then(res => {
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
                  createDatabase(service).then(() => {
                    resolve();
                  })
                })
                break;
              default:
                service.name = answersDatabase.name
                createDatabase(service).then(() => {
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

const createDatabase = (service) => {
  return new Promise((resolve, reject) => {
    prompt([inputTag]).then(ans => {
      service.tag = ans.tag;
      createListExpose(service).then(
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
const createListExpose = (service) => {
  return new Promise(
    (resolve, reject) => {
      createExpose().then(res => {
        if (res !== "end") {
          if (res.typePort) {
            service.port.push(res.data);
          } else {
            service.volume.push(res.data);
          }
          createListExpose(service).then((res) => {
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
const createExpose = () => {
  return new Promise((resolve, reject) => {
    prompt([selectAction]).then(answers => {

      switch (answers.expose) {
        case "expose a port":
          prompt(exposePort).then(ans => {
            resolve({ typePort: true, data: ans })
          })
          break;
        case "persistent data":
          prompt(persistentData).then(ans => {
            resolve({ typePort: false, data: ans })
          })
          break;
        default:
          resolve("end")
      }
    })
  })
}

const buildDockerfile = (json) => {
  const listService = json.services.filter(data => data.type !== "database")
  console.log(listService)
  for (let i in listService) {
    switch (listService[i].type) {
      case "react-app":
        try {
          fs.unlinkSync('Dockerfile')
        } catch (e) { }

        if (listService[i].port.length != 1) {
          console.log("React app should be expose a port!!!")
          break;
        }

        fs.readFileSync('lib/template/react_app_template').toString().split('\n')
          .forEach((line) => {
            let writeData = ""
            if (line == "PORT") {
              for (let j in listService[i].port) {
                writeData += "EXPOSE " + listService[i].port[j].srcPort + "\n";
              }
            }
            else if (line == "CMD") {
              writeData += "CMD serve -s " + listService[i].file + " -l " + listService[i].port[0].srcPort
            }
            else if (line == "BUILD") {
              writeData += "RUN npm run " + listService[i].file + " --production"
            }
            else writeData = line

            fs.appendFile('Dockerfile', writeData + "\n", function (err) {
              if (err) return console.log(err);
              console.log(writeData);
            });
          })
        break;
      case "java":
        console.log("java")
        break;
      default:
        console.log("end")
    }
  }
}
module.exports =
  {
    buildJsonDocker,
    buildDockerfile,
  }