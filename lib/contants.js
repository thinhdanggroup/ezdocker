const createDockerFile =
{
  type: 'confirm',
  name: 'isCreateDockerfile',
  message: 'Do you want create Dockerfile',
  default: false
}

const inputName =
{
  type: 'input',
  name: 'name',
  message: 'Input name of your service : ',
  default: 'ezdocker'
}


const inputTag =
{
  type: 'input',
  name: 'tag',
  message: 'Input tag of your service : ',
  default: 'latest'
}


const createReactApp =
{
  type: 'input',
  name: 'dirStaticWeb',
  message: 'Folder store static web',
  default: 'build'
}


const createJavaApp =
{
  type: 'input',
  name: 'jarName',
  message: 'Name of Java File',
  default: 'any.jar'
}


const selectService =
{
  type: 'list',
  name: 'service',
  message: 'Docker compose contain services?',
  choices: ['react-app', 'java', 'database', 'end']
}


const selectAction =
{
  type: 'list',
  name: 'expose',
  message: 'Select a action: ',
  choices: ['expose a port', 'persistent data', 'end']
}

const selectDatabase =
{
  type: 'list',
  name: 'name',
  message: 'Select a db: ',
  choices: ['mysql', 'redis', 'another']
}

const exposePort = [
  {
    type: 'input',
    name: 'srcPort',
    message: 'Input host port:',
    default: 8080
  },
  {
    type: 'input',
    name: 'dstPort',
    message: 'Input container port:',
    default: 8080
  }]


const persistentData = [
  {
    type: 'input',
    name: 'srcDir',
    message: 'Input host directory:',
    default: '.'
  },
  {
    type: 'input',
    name: 'dstDir',
    message: 'Input container directory:',
    default: '/app'
  }]


module.exports =
  {
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
  }