module.exports = function gruntfile(grunt) {
  require('load-grunt-tasks')(grunt)

  grunt.option('stack', true)

  grunt.registerTask('release', [
    'fileExists:bin',
    'checkport',
    'gitcheckout:master',
    'gitadd:all',
    'gitstatuscheck',
    'prompt:release',
    'build',
    'clean:reports',
    'protractor',
    'solc-output-deploy:production',
    'version::patch',
    'clean:packages',
    'electron',
    'compress',
    'readme',
    'gitadd:all',
    'gitcommit:release',
    'tagrelease',
    'gitpush:master',
    'wait:ten',
    'githubAsset'
  ])

  grunt.registerTask('contracts', [
    'concat:contracts',
    'solc',
    'solc-output-deploy:development',
    'create-info-js'
  ])

  grunt.registerTask('build', ['concat', 'contracts', 'index', 'copy'])

  grunt.registerTask('run', ['build', 'ticker:development', 'refill:development', 'watch'])

  grunt.registerTask('test', ['refill:development', 'protractor'])
}
