
const fs = require('fs');


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

module.exports = {
  write2File,
  deleteFile,
}