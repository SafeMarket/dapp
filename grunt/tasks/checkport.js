module.exports = function(grunt){

  grunt.registerMultiTask('checkport',function(){

    var net = require('net')
        ,options = this.options({
          host:"127.0.0.1"
          ,port:8000
        }),done = this.async()

    client = new net.Socket();

    client.once('connect', function running(){
      done(true)
    });

    client.once('error', function notRunning(){
      done(false)
    });

    client.connect({port: options.port, host: options.host});

  })
}