module.exports = function(grunt){
  return {
    development: {
      options: {
        port: grunt.file.readYAML("config/geth.yml").development.rpcport
      }
    },production:{
      options:{
        port: grunt.file.readYAML("config/geth.yml").production.rpcport
      }
    },webdriver:{
      options:{
        port: 4444
      }
    },server:{
      options:{
        port: 8000
      }
    }
  }
}