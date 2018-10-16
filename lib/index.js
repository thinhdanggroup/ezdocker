const {
  buildJsonDocker,
  buildDockerfile
} = require("./utils")
const program = require("commander")
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



program
  .version('0.0.1')
  .description('Contact management system');


program
  .command("create")
  .alias("c")
  .description("Gennerate Dockerfile and docker-compose")
  .action(() => {
    buildJsonDocker().then((result) => {
      console.log(result)
    })
  });

program.
  command("build")
  .alias("b")
  .description("Build from json file")
  .action(() => {
    let json = {
      services: [
        { type: 'react-app', port: [{ srcPort: 80, dstPort: 80 }], volume: [], file: 'build' },
        { type: 'database', port: [], volume: [], file: 'build' }
      ],
      name: 'ezdocker',
      tag: 'latest',
      isCreateDockerfile: false
    }
    buildDockerfile(json)
  })
// critical important line
program.parse(process.argv)