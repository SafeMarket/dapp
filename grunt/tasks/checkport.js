module.exports = function(grunt){

  grunt.registerMultiTask('checkport',function(){
    var options = this.options({
      host:"127.0.0.1"
      ,port:8000
    }),done = this.async()
    ,tcpPortUsed = require('tcp-port-used')
    ,done = this.async()

    tcpPortUsed.check(options.port,options.host).then(function(inUse){
      if(inUse){
        grunt.log.success(host,port,"is running")
        return done(true)
      }else{
        grunt.log.warn(host,port,"is not running")
        return done(false)
      }
    },function(err){
      grunt.log.warn(err)
      return done(false)
    })

  })
}