
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
} = require("./contants/askQuestion")

const {
  reactAppTemplate
} = require("./contants/dockerTemplate")

const {
  ReactDockerfile,
  JavaDockerfile
} = require("./docker/DockerBuild");

const {
  ServiceCompose,
  DatabaseCompose
} = require("./docker/DockerCompose")
const {
  write2File,
  deleteFile
} = require("./fileHandler");

const {
  createService
} = require('./question/question')
const { prompt } = require('inquirer');


const buildJsonDocker = () => {
  let jsonBuild = {
    services: []
  }
  return new Promise((resolve, reject) => {
    prompt([inputName, inputTag, createDockerFile]).then(answers => {
      jsonBuild = { ...jsonBuild, ...answers };
      createService(jsonBuild).then(() => {
        resolve(jsonBuild);
      })
    })
  })
}


const buildDockerfile = (json) => {
  deleteFile("build.sh")
  write2File("build.sh", "#!/bin/bash\n")

  const listService = json.services.filter(data => data.type !== "database")

  let nameDocker = getListName(listService)

  for (let i in listService) {
    let nameService = json.name + "-" + nameDocker[i];
    switch (listService[i].type) {
      case "react-app":
        new ReactDockerfile(nameService, listService[i].tag, listService[i].port, listService[i].file)

        break;
      case "java":
        new JavaDockerfile(nameService, listService[i].tag, listService[i].port, listService[i].file)
        break;
      default:
        throw "Invalid service"
    }
  }
}

const createDockerCompose = (json) => {
  deleteFile("docker-compose.yml")
  write2File("docker-compose.yml", "version: 2 \nservices:\n")

  const listService = json.services.filter(data => data.type !== "database")
  const listDb = json.services.filter(data => data.type === "database")

  getListName(listService).forEach((value, idx) => new ServiceCompose(value, listService[idx]))
  getListName(listDb).forEach((value, idx) => new DatabaseCompose(value, listDb[idx]))

}

const getListName = (listService) => {
  let nameDocker = []
  let counter = {}

  for (let i in listService) {
    counter[listService[i].type] = typeof counter[listService[i].type] === "undefined" ? 0 : counter[listService[i].type]++
    nameDocker.push(counter[listService[i].type] === 0 ?
      listService[i].type :
      listService[i].type + "-" + counter[listService[i].type])
  }
  return nameDocker;
}

module.exports =
  {
    buildJsonDocker,
    buildDockerfile,
    createDockerCompose,
  }