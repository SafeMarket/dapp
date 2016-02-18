module.exports = function(grunt){
  return {
    development: {
      options: {
        flags: grunt.file.readYAML("config/geth.yml").development
        ,commands:{
          js: 'js/peer.js'
        }
      }
    },production:{
      options:{
        flags: grunt.file.readYAML("config/geth.yml").production
      }
    }
  }
}