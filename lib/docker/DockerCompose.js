const { write2File, deleteFile } = require("../fileHandler")
const { DOCKER_COMPOSE_FILE_NAME } = require('../contants')
class DockerCompose {
  constructor(nameService, json) {
    this.nameService = nameService;
    this.volume = json.volume
    this.port = json.port
    this.tag = json.tag
    this.image = json.name
    this.build()
  }
  build() {
    this.createPullImage()
    this.createPortAndVolume()
    this.createEnviroment()
  }

  createEnviroment() { }
  createPortAndVolume() {
    let prefixTab = '\t\t'
    // volumes
    for (let j in this.volume) {
      if (j === 0) {
        write(prefixTab, "volumes: ")
      }
      write(prefixTab, "-\t" +
        this.volume[j].src + ":" + this.volume[j].dst)
    }
    // ports
    for (let j in this.port) {
      if (j == 0) write(prefixTab, "ports:")
      write(prefixTab, "-\t" +
        this.port[j].src + ":" + this.port[j].dst)
    }
  }
}

class ServiceCompose extends DockerCompose {
  createPullImage() {
    let prefixTab = "\t"
    // add name service

    write(prefixTab, this.nameService + ":")

    // add container name 
    prefixTab += "\t"

    write(prefixTab, "container_name: " + this.nameService)

    // add image name
    write(prefixTab, "image: " + this.nameService + ":latest")

  }
}

class DatabaseCompose extends DockerCompose {
  createPullImage() {
    let prefixTab = "\t"
    // add name service

    write(prefixTab, this.nameService + ":")

    // add container name 
    prefixTab += "\t"

    write(prefixTab, "container_name: " + this.nameService + "-" + this.image)

    // add image name
    write(prefixTab, "image: " + this.image + ":" + this.tag)
  }
  createEnviroment() {
    if (this.env) {
    }
  }
}

const write = (prefixTab, content) => {
  write2File(DOCKER_COMPOSE_FILE_NAME, prefixTab + content + "\n");
}

module.exports = {
  ServiceCompose,
  DatabaseCompose
}