module.exports = function(grunt){
  
  require("load-grunt-tasks")(grunt)
  grunt.option('stack',true)

  grunt.registerTask('release',[
    "fileExists:bin"
    ,"checkport"
    ,"gitcheckout:master"
    ,"gitadd:all"
    ,"gitstatuscheck"
    ,"prompt:release"
    ,"clean:reports"
    ,"protractor"
    ,"version::patch"
    ,"build"
    ,"clean:packages"
    ,"electron"
    ,"compress"
    ,"readme"
    ,"gitadd:all"
    ,"gitcommit:release"
    ,"tagrelease"
    ,"gitpush:master"
    ,"wait:ten"
    ,"githubAsset"
  ])

  grunt.registerTask('build',["clean:workspaces", "concat", "copy", "index"])

}