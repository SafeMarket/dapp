module.exports = function(grunt){
  grunt.registerTask('gitstatuscheck',function(){
    var cp = require('child_process')
      ,childProcess = cp.exec("git status --porcelain")
      ,hasUncommitted = false
      ,done = this.async()

    childProcess.stdout.on('data',function(data){
      grunt.log.error(data)
      hasUncommitted = true
    })

    childProcess.on('exit',function(){
      if(hasUncommitted)
        return done(false)
      else{
        grunt.log.success("No uncommitted changes");
        done()
      }
    })
  })
}
