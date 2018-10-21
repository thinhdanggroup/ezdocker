const {
  buildJsonDocker,
  buildDockerfile,
  createDockerCompose
} = require("./utils")
const program = require("commander")
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
      console.log("============")
      console.log(result)
      console.log("============")
      if (result.isCreateDockerfile) {
        buildDockerfile(result)
      }
      createDockerCompose(result)
    })
  });

program.
  command("build")
  .alias("b")
  .description("Build from json file")
  .action(() => {
    let json = {
      services: [
        { type: 'react-app', port: [{ src: 80, dst: 80 }], volume: [], file: 'build' },
        { type: 'java', port: [{ src: 80, dst: 80 }], volume: [], file: 'app.jar' },
        { type: 'database', port: [], name: "mysql", tag: "latest", volume: [], file: 'build' }
      ],
      name: 'ezdocker',
      tag: 'latest',
      isCreateDockerfile: false
    }
    buildDockerfile(json)
    createDockerCompose(json)
  })
// critical important line
program.parse(process.argv)