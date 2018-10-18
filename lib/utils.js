
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

const {
  reactAppTemplate
} = require("./template")

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

  let counter = {}
  let nameDocker = []

  for (let i in listService) {
    counter[listService[i].type] = typeof counter[listService[i].type] === "undefined" ? 0 : counter[listService[i].type]++
    nameDocker.push(listService[i].type + "-" + counter[listService[i].type])
  }

  for (let i in listService) {
    switch (listService[i].type) {
      case "react-app":
        deleteFile("Dockerfile-" + nameDocker[i])

        if (listService[i].port.length > 1) {
          console.log("React app should be expose at least a port!!!")
          break;
        }
        reactAppTemplate.split("|")
          .forEach((line) => {
            let writeData = ""
            if (line == "PORT") {
              for (let j in listService[i].port) {
                writeData += "EXPOSE " + listService[i].port[j].src + "\n";
              }
            }
            else if (line == "CMD") {
              writeData += "CMD serve -s " + listService[i].file + " -l " + listService[i].port[0].src
            }
            else if (line == "BUILD") {
              writeData += "RUN npm run " + listService[i].file + " --production"
            }
            else if (line.includes("#")) {
              writeData = "\n" + line;
            }
            else writeData = line

            write2File("Dockerfile-" + nameDocker[i], writeData + "\n")
          })
        break;
      case "java":
        console.log("java")
        break;
      default:
        console.log("end")
    }
  }


  deleteFile("build.sh")
  write2File("build.sh", "#!/bin/bash\n")
  for (let i in listService) {
    let contentBuild = "docker build -t " + json.name + "-" + nameDocker[i] + ":" + json.tag +
      " -f " + "Dockerfile-" + nameDocker[i] + " ."
    write2File("build.sh", contentBuild)
  }
}

const createDockerCompose = (json) => {
  deleteFile("docker-compose.yml")
  const listService = json.services.filter(data => data.type !== "database")
  const listDb = json.services.filter(data => data.type === "database")

  let nameDocker = getListName(listService)
  let nameDb = getListName(listDb)

  write2File("docker-compose.yml", "version: 2 \nservices:\n")
  for (let i in listService) {
    createServiceDockerCompose(listService[i], json.name, nameDocker[i]);
  }

  for (let i in nameDb) {
    createDatabaseDockerCompose(listDb[i], json.name, nameDb[i]);
  }
}

const createServiceDockerCompose = (serviceInfo, prefixName, name) => {
  let prefixTab = "\t"
  // add name service

  write2File("docker-compose.yml", prefixTab + prefixName + "-" + name + ":\n")

  // add container name 
  prefixTab += "\t"

  write2File("docker-compose.yml", prefixTab + "container_name: " + prefixName + "-" + name + "\n")

  // add image name
  write2File("docker-compose.yml", prefixTab + "image: " + prefixName + "-" + name + ":latest\n")

  // volumes
  write2File("docker-compose.yml", prefixTab + "volumes:\n")

  for (let j in serviceInfo.volume) {
    write2File("docker-compose.yml",
      prefixTab + "-\t" +
      serviceInfo.volume[j].src + ":" + serviceInfo.volume[j].dst
      + "\n")
  }
  // ports
  write2File("docker-compose.yml", prefixTab + "ports:\n")

  for (let j in serviceInfo.port) {
    write2File("docker-compose.yml",
      prefixTab + "-\t" +
      serviceInfo.port[j].src + ":" + serviceInfo.port[j].dst
      + "\n")
  }
}

const createDatabaseDockerCompose = (serviceInfo, prefixName, name) => {
  let prefixTab = "\t"
  // add name service

  write2File("docker-compose.yml", prefixTab + prefixName + "-" + name + ":\n")

  // add container name 
  prefixTab += "\t"

  write2File("docker-compose.yml", prefixTab + "container_name: " + prefixName + "-" + name + "\n")

  // add image name
  write2File("docker-compose.yml", prefixTab + "image: " + serviceInfo.name + ":" + serviceInfo.tag + "\n")

  // volumes
  write2File("docker-compose.yml", prefixTab + "volumes:\n")

  for (let j in serviceInfo.volume) {
    write2File("docker-compose.yml",
      prefixTab + "-\t" +
      serviceInfo.volume[j].src + ":" + serviceInfo.volume[j].dst
      + "\n")
  }
  // ports
  write2File("docker-compose.yml", prefixTab + "ports:\n")

  for (let j in serviceInfo.port) {
    write2File("docker-compose.yml",
      prefixTab + "-\t" +
      serviceInfo.port[j].src + ":" + serviceInfo.port[j].dst
      + "\n")
  }
}

const getListName = (listService) => {
  let nameDocker = []
  let counter = {}

  for (let i in listService) {
    counter[listService[i].type] = typeof counter[listService[i].type] === "undefined" ? 0 : counter[listService[i].type]++
    nameDocker.push(listService[i].type + "-" + counter[listService[i].type])
  }
  return nameDocker;
}

const write2File = (filename, content) => {
  try {
    fs.appendFileSync(filename, content)
  } catch (e) {
    console.log(e)
  }
}

const deleteFile = (fileName) => {
  try {
    fs.unlinkSync(fileName)
  } catch (e) { }
}
module.exports =
  {
    buildJsonDocker,
    buildDockerfile,
    createDockerCompose
  }