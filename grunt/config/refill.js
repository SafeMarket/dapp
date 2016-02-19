module.exports = function(grunt){
  return {
    development: {
      options: {
        env: 'development'
        ,from: '0x'+grunt.file.readYAML("config/geth.yml").development.unlock
        ,to: "0x1049a6c61c46a7c1e12d919189701bf26a1a2011"
      }
    }
  }
}