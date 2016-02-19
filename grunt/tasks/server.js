module.exports = function(grunt){
  grunt.registerTask('server',function(){
    var express = require('express')
      ,compression = require('compression')
      ,geth = grunt.file.readYAML('config/geth.yml')
      ,done = this.async()

    Object.keys(geth).forEach(function(env){
      var rpccorsdomainParts = geth[env].rpccorsdomain.split(':')
        ,port = parseInt(rpccorsdomainParts[rpccorsdomainParts.length-1])
        ,app = express()

      app.use(compression())
      app.use(express.static(process.cwd()+'/generated/dapp/'+env))
      app.listen(port,'127.0.0.1')

      grunt.log.writeln('Running',env,'server on port http://127.0.0.1:'+port)      
    })
  })
}