module.exports = (grunt) ->

  grunt.option 'stack', true

  grunt.loadNpmTasks(
    "grunt-embark"
    ,"grunt-version"
    ,"grunt-protractor-runner"
    ,"grunt-tagrelease"
    ,"grunt-git"
    ,"grunt-contrib-connect"
    ,"grunt-compress"
  )

  grunt.loadTasks "tasks"

  grunt.initConfig(

    ipfsadd:
      packages:
        options:
          paths:[
            "packages/SafeMarket-darwin-x64.zip"
            "packages/SafeMarket-win32-x64.zip"
            "packages/SafeMarket-linux-x64.zip"
          ]
          save: "packages/ipfs.json"

    gitcheckout:
      master:
        options:
          branch: "master"
      release:
        options:
          branch: "release"

    gitmerge:
      master:
        options:
          branch: "master"
          force: true

    gitadd:
      all:
        options:
          all: true

    gitcommit:
      release:
        options:
          message: "release"

    gitpush:
      master:
        options:
          tags: true
          origin: 'origin'
          branch: 'master'
      release:
        options:
          tags: true
          origin: 'origin'
          branch: 'release'

    version:
      project:
        src: "package.json"

    protractor:
      options:
        keepAlive: false
      all:
        configFile: "protractor.conf.js"
        args:
          '--save':
            ''
    electron:
      all:
        options:
          version: "0.34.3"
          name: "SafeMarket"
          dir: "generated/dapp"
          platform: "all"
          arch: "x64"
          out: "packages/"

    compress:
      darwin:
        options:
          archive: 'packages/SafeMarket-darwin-x64.zip'
          mode: 'zip'
        files:[
          src: '**/**'
          cwd: 'packages/SafeMarket-darwin-x64/',
          expand: true
        ]
      win32:
        options:
          archive: 'packages/SafeMarket-win32-x64.zip'
          mode: 'zip'
        files:[
          src: '**/**'
          cwd: 'packages/SafeMarket-win32-x64/',
          expand: true
        ]
      linux:
        options:
          archive: 'packages/SafeMarket-linux-x64.zip'
          mode: 'zip'
        files:[
          src: '**/**'
          cwd: 'packages/SafeMarket-linux-x64/',
          expand: true
        ]

    tagrelease: 
      file: 'package.json'
      commit:  true
      message: 'Release %version%'
      annotate: false
      prefix: 'v'

    files:
      electron: 
        src: [
          "main.js"
          "package.json"
        ]

      web3:
        "app/js/web3.js"

      js:
        src: [
          "node_modules/solc/bin/soljson-latest.js"
          "bower_components/crypto-js/build/rollups/aes.js"
          "bower_components/msgpack-javascript/msgpack.js"
          "bower_components/cryptocoin/dist/cryptocoin.js"
          "bower_components/validate/validate.min.js"
          "bower_components/lodash/lodash.min.js"
          "bower_components/q/q.js"
          "bower_components/openpgp/dist/openpgp.js"
          "bower_components/bignumber.js/bignumber.js"
          "bower_components/marked/lib/marked.js"
          "bower_components/angular/angular.js"
          "bower_components/angular-route/angular-route.min.js"
          "bower_components/angular-growl/build/angular-growl.min.js"
          "bower_components/angular-timeago/dist/angular-timeago.js"
          "bower_components/angular-bootstrap/ui-bootstrap-tpls.js"
          "bower_components/angular-marked/angular-marked.js"
          "bower_components/angular-sanitize/angular-sanitize.min.js"
          "bower_components/angular-ui-router/release/angular-ui-router.min.js"
          "app/js/app.js"
          "app/js/safemarket.js"
          "app/js/**/*.js"
        ]

      css:
        src: [
          "bobower_components/angular/angular-csp.css"
          "bower_components/bootstrap/dist/css/bootstrap.min.css"
          "assets/slim/dist/styles/main.css"
          "bower_components/angular-growl/build/angular-growl.min.css"
          "app/css/**/*.css"
        ]

      html:
        src: [
          "app/html/**/*.html"
        ]

      fonts:
        src: [
          "bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff2"
          "assets/slim/dist/fonts/glyphicons-halflings-regular.woff"
          "assets/slim/dist/fonts/glyphicons-halflings-regular.ttf"
        ]

      coffee:
        dest: "generated/dapp/compiled-coffee"
        compiled: [
          "generated/dapp/compiled-coffee/app.coffee"
          "generated/dapp/compiled-coffee/**/*.js"
        ]

      contracts:
        src: [
          "app/contracts/**/*.sol"
        ]

    coffee:
      compile:
        expand: true
        cwd: 'coffee'
        src: '**/*.coffee'
        dest: '<%= files.coffee.dest %>'
        ext: '.js'

    concat:
      app:
        src: ["<%= files.web3 %>", 'generated/tmp/abi.js', "<%= files.js.src %>", "<%= files.coffee.compiled %>"]
        dest: "generated/dapp/js/app.min.js"
      css:
        src: "<%= files.css.src %>"
        dest: "generated/dapp/css/app.min.css"

    watch:
      options:
        livereload: true

      html:
        files: ["<%= files.html.src %>"]
        tasks: ["copy"]

      js:
        files: ["<%= files.js.src %>","<%= files.web3 %>"]
        tasks: ["concat"]

      css:
        files: ["<%= files.css.src %>"]
        tasks: ["concat"]

      coffee:
        files: ["coffee/**/*.coffee"]
        tasks: ["coffee", "concat"]

      contracts:
        files: ["<%= files.contracts.src %>"]
        tasks: ["deploy", "concat", "copy"]

      config:
        files: ["config/blockchain.yml", "config/contracts.yml", "Gruntfile.coffee"]
        tasks: ["deploy", "concat", "copy"]

    copy:
      electron:
        files: [
          {expand: true, src: ["<%= files.electron.src %>"], dest: 'generated/dapp/', flatten: true}
        ]
      html:
        files: [
          {expand: true, src: ["<%= files.html.src %>"], dest: 'generated/dapp/', flatten: true}
        ]
      fonts:
        files: [
          {expand: true, src: ["<%= files.fonts.src %>"], dest: 'generated/dapp/fonts', flatten: true}
        ]
      css:
        files:
          "dist/dapp/css/app.min.css" : "<%= files.css.src %>"

      contracts:
        files:
          "dist/contracts/": '<%= files.contracts.src %>'

    uglify:
      dist:
        src: "<%= concat.app.dest %>" # input from the concat process
        dest: "dist/dapp/js/app.min.js"

    clean:
      workspaces: ["dist", "generated"]
      packages: ["packages/**/*"]

    deploy:
      contracts: '<%= files.contracts.src %>'
      dest: 'generated/tmp/abi.js'
  )

  # loading external tasks (aka: plugins)
  # Loads all plugins that match "grunt-", in this case all of our current plugins
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks)

  grunt.registerTask "deploy", ["copy", "coffee", "deploy_contracts", "concat", "copy", "server", "watch"]
  grunt.registerTask "build", ["copy", "clean:workspaces", "deploy_contracts", "coffee", "concat", "uglify", "copy"]
  grunt.registerTask "release", [
    "gitadd:all"
    "gitstatuscheck"
    "protractor"
    "version::patch"
    "move_reports"
    "electron"
    "compress"
    "ipfsadd:packages"
    "readme"
    "clean:packages"
    "gitadd:all"
    "gitcommit:release"
    "tagrelease"
    "gitpush:master"
  ]

  grunt.registerTask "move_reports", ()->
    fs = require('fs')
    packageJson = fs.readFileSync('package.json','utf8')
    packageObj = JSON.parse(packageJson)
    fs.renameSync('reports/latest', 'reports/'+packageObj.version)

  grunt.registerTask "readme", ()->
    fs = require('fs')
    packageJson = fs.readFileSync('package.json','utf8')
    packageObj = JSON.parse(packageJson)
    hashesJson = fs.readFileSync('packages/ipfs.json','utf8')
    hashesObj = JSON.parse(hashesJson)
    readmeTemplate = fs.readFileSync('readme.template.md','utf8')

    readme = readmeTemplate
      .split('{{version}}').join(packageObj.version)
      .split('{{hashes.mac}}').join(hashesObj['packages\/SafeMarket-darwin-x64.zip'])
      .split('{{hashes.linux}}').join(hashesObj['packages\/SafeMarket-linux-x64.zip'])
      .split('{{hashes.win}}').join(hashesObj['packages\/SafeMarket-win32-x64.zip'])

    fs.writeFileSync('readme.md',readme)
    

  grunt.registerTask "gitstatuscheck", ()->
    cp = require('child_process')
    childProcess = cp.exec('git status --porcelain')
    hasUncommitted = false
    done = this.async()

    childProcess.stdout.on 'data', (data)->
      grunt.log.error data
      hasUncommitted = true
    
    
    childProcess.on 'exit', (code)->
      if hasUncommitted
        return done false
      else
        grunt.log.success('No uncommitted changes');
        done()
      