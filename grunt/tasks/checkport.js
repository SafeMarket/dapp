module.exports = function(grunt){

  grunt.registerMultiTask('checkport',function(){

    var net = require('net')
        ,options = this.options({
          host:"127.0.0.1"
          ,port:8000
        }),done = this.async()

    client = new net.Socket();

    client.once('connect', function running(){
      grunt.log.success(options.host,options.port,'is running')
      done(true)
    });

    client.once('error', function notRunning(){
      grunt.log.error(options.host,options.port,'is not running')
      done(false)
    });

    client.connect({port: options.port, host: options.host});

  })
}