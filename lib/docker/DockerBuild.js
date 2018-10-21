
const { reactAppTemplate, javaAppTemplate } = require('../template')
const { write2File, deleteFile } = require("../fileHandler")


class Dockerfile {
  constructor(name, tag, listport, file) {
    this.nameService = name
    this.fileNameDocker = "Dockerfile-" + name
    this.listport = listport;
    this.file = file;
    this.tag = tag
    this.getTemplate();
    this.build();
  }
  build() {
    deleteFile(this.fileNameDocker)
    this.createDockerFile();
    // Write to build script
    this.buildScript();
  }

  buildScript() {
    let contentBuildScript = `docker build -t ${this.nameService}:latest -f ${this.fileNameDocker} . \n`
    write2File("build.sh", contentBuildScript)
  }
}

class ReactDockerfile extends Dockerfile {
  getTemplate() {
    this.template = reactAppTemplate.split("|");
  }
  createDockerFile() {
    if (this.listport.length > 1) {
      throw "React app should be expose at least a port!!!"
    }
    this.template.forEach((line) => {
      let writeData = ""
      if (line == "PORT") {
        for (let j in this.listport) {
          writeData += "EXPOSE " + this.listport[j].src + "\n";
        }
      }
      else if (line == "CMD") {
        writeData += "CMD serve -s " + this.file + " -l " + this.listport[0].src
      }
      else if (line == "BUILD") {
        writeData += "RUN npm run " + this.file + " --production"
      }
      else if (line.includes("#")) {
        writeData = "\n" + line;
      }
      else writeData = line

      write2File(this.fileNameDocker, writeData + "\n")
    })
  }
}

class JavaDockerfile extends Dockerfile {
  getTemplate() {
    this.template = javaAppTemplate.split("|");
  }
  createDockerFile() {
    this.template.forEach((line) => {
      let writeData = ""
      if (line == "PORT") {
        for (let j in this.listport) {
          writeData += "EXPOSE " + this.listport[j].src + "\n";
        }
      }
      else if (line == "CMD") {
        writeData += `"ENTRYPOINT ["java", " - Djava.security.egd=file: /dev/./ urandom", " - jar", "${this.file}"]`
      }
      else if (line == "BUILD") {
        writeData += `ADD \${JAR_FILE} ${this.file}`
      }
      else if (line.includes("#")) {
        writeData = "\n" + line;
      }
      else writeData = line

      write2File(this.fileNameDocker, writeData + "\n")
    })

  }
}

module.exports = {
  ReactDockerfile,
  JavaDockerfile
}