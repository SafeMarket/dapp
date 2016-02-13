module.exports = function(grunt){
  return {
    development: {
      options: {
        flags: grunt.file.readYAML("config/geth.yml").development
      }
    },production:{
      options:{
        flags: grunt.file.readYAML("config/geth.yml").production
      }
    }
  }
}