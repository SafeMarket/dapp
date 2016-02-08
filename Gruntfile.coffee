module.exports = (grunt) ->

  grunt.option 'stack', true

  if grunt.file.exists('.env.json')
    githubToken = grunt.file.readJSON('.env.json').github.token
  else
    githubToken = ''

  grunt.loadNpmTasks(
    "grunt-embark"
    ,"grunt-version"
    ,"grunt-protractor-runner"
    ,"grunt-tagrelease"
    ,"grunt-git"
    ,"grunt-contrib-connect"
    ,"grunt-compress"
    ,"grunt-port-checker"
    ,"grunt-node-version"
    ,"grunt-github-release-asset"
    ,"grunt-wait"
    ,"grunt-prompt"
    ,"grunt-rename"
    ,"grunt-file-exists"
    ,"grunt-solc"
    ,"grunt-infosphere"
  )

  grunt.loadTasks "tasks"

  grunt.initConfig(

    solc:
      contracts:
        options:
          files:["generated/tmp/contracts.sol"]
          doOptimize: true

    infosphere: 
        default:
            options:
                files:
                    infosphere: 'app/contracts/0/Infosphere.sol'
                    infosphered: 'app/contracts/1/infosphered.sol'

    node_version:
      options:
        nvm: false

    wait:
      ten:
        options:
          delay: 10000

    prompt:
      release:
        options:
          questions:[{
            config: "githubAsset.options.description"
            type: "input"
            message: "Release description:"
          }]

    githubAsset:
        options:
          repo: 'git@github.com:SafeMarket/dapp.git'
          credentials: {
            token: githubToken
          }
          files: [
            "reports/reports.zip"
            "packages/SafeMarket-mac-x64.zip"
            "packages/SafeMarket-win32-x64.zip"
            "packages/SafeMarket-linux-x64.zip"
          ]
          releaseName: 'Version {tag}'

    checkport:
      dev_chain:
        options:
          port: 8101
      prooduction_chain:
        options:
          port: 8545
      webdriver:
        options:
          port: 4444
      server:
        options:
          port: 8000

    ipfsadd:
      packages:
        options:
          files:[
            "packages/SafeMarket-mac-x64.zip"
            "packages/SafeMarket-win32-x64.zip"
            "packages/SafeMarket-linux-x64.zip"
          ]
          output: "packages/ipfs.json"

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
      darwin:
        options:
          version: "0.34.3"
          name: "SafeMarket"
          dir: "generated/dapp"
          platform: "darwin"
          arch: "x64"
          out: "packages/"
          icon: "generated/tmp/SafeMarket.icns"
      linux:
        options:
          version: "0.34.3"
          name: "SafeMarket"
          dir: "generated/dapp"
          platform: "linux"
          arch: "x64"
          out: "packages/"
      win32:
        options:
          version: "0.34.3"
          name: "SafeMarket"
          dir: "generated/dapp"
          platform: "win32"
          arch: "x64"
          out: "packages/"

    compress:
      darwin:
        options:
          archive: 'packages/SafeMarket-mac-x64.zip'
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
      reports:
        options:
          archive: 'reports/reports.zip'
          mode: 'zip'
        files:[
          src: '**/**'
          cwd: 'reports/',
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

      modules: 
        src: [
          "node_modules/electron/**/*"
          "node_modules/q/**/*"
          "modules/**/*"
        ]

      bin: 
        src: [
          "bin/**/*"
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
          "node_modules/hooked-web3-provider/node_modules/web3/dist/web3.js"
          "node_modules/hooked-web3-provider/build/hooked-web3-provider.js"
          "node_modules/eth-lightwallet/dist/lightwallet.min.js"
          "app/js/validators.js"
          "app/js/app.js"
          "app/js/splash.js"
          "app/js/**/*.js"
        ]

      css:
        src: [
          "bower_components/angular/angular-csp.css"
          "bower_components/bootstrap/dist/css/bootstrap.min.css"
          "assets/slim/dist/styles/main.css"
          "bower_components/angular-growl/build/angular-growl.min.css"
          "app/css/**/*.css"
        ]

      html:
        src: [
          "app/html/**/*.html"
        ]

      images:
        src: [
          "app/images/*"
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
        src: ["app/js/refresh.js","<%= files.web3 %>", 'generated/tmp/info.js', "<%= files.js.src %>", "<%= files.coffee.compiled %>"]
        dest: "generated/dapp/js/app.min.js"
      css:
        src: "<%= files.css.src %>"
        dest: "generated/dapp/css/app.min.css"
      contracts:
        src: "<%= files.contracts.src %>"
        dest: "generated/tmp/contracts.sol"

    watch:
      options:
        livereload: true

      env:
        files:[".env.json"]

      html:
        files: ["<%= files.html.src %>"]
        tasks: ["copy"]

      images:
        files: ["<%= files.images.src %>"]
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
      bin:
        files: [
          {expand: true, src: ["<%= files.bin.src %>"], dest: 'generated/dapp/', flatten: false}
        ]
        options:
          mode: true
      modules:
        files: [
          {expand: true, src: ["<%= files.modules.src %>"], dest: 'generated/dapp/', flatten: false}
        ]
      html:
        files: [
          {expand: true, src: ["<%= files.html.src %>"], dest: 'generated/dapp/', flatten: true}
        ]
      index:
        files: [
          {
          expand: true, src: "app/html/index.html", dest: 'generated/dapp/', flatten:true
          }
        ]
      images:
        files: [
          {expand: true, src: ["<%= files.images.src %>"], dest: 'generated/dapp/images', flatten: true}
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
      icns:
        files: [
          {
            expand: true,
            cwd: "assets/"
            src: ['SafeMarket.icns'],
            dest: 'generated/tmp'
          }
        ]

    uglify:
      dist:
        src: "<%= concat.app.dest %>" # input from the concat process
        dest: "dist/dapp/js/app.min.js"

    clean:
      workspaces: ["dist", "generated"]
      packages: ["packages/**/*"]
      reports: ["reports/**/*"]

    deploy:
      contracts: 'generated/tmp/contracts.sol'
      dest: 'generated/tmp/info.js'
    fileExists:
      bin: ["<%= files.bin.src %>"]
  )

  # loading external tasks (aka: plugins)
  # Loads all plugins that match "grunt-", in this case all of our current plugins
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  env = if grunt.cli.tasks.indexOf('release')>-1 || grunt.cli.tasks.indexOf('quickrelease')>-1 || grunt.cli.tasks.indexOf('superquickrelease')>-1 then 'production' else grunt.option('env') || 'development';

  grunt.registerTask "re", ["github-release"]
  
  grunt.registerTask "deploy", ["copy", "indexUnsafe", "coffee", "concat:contracts", "deploy_contracts:"+env, "concat", "copy", "server", "watch"]
  grunt.registerTask "build", ["clean:workspaces", "copy", "indexUnsafe", "concat:contracts", "deploy_contracts:"+env, "coffee", "concat", "copy", "indexUnsafe"]
  grunt.registerTask "release", [
    "node_version"
    "fileExists:bin"
    "checkport"
    "gitcheckout:master"
    "gitadd:all"
    "gitstatuscheck"
    "prompt:release"
    "clean:reports"
    "protractor"
    "version::patch"
    "build"
    "clean:packages"
    "electron"
    "compress"
    "readme"
    "gitadd:all"
    "gitcommit:release"
    "tagrelease"
    "gitpush:master"
    "wait:ten"
    "githubAsset"
  ]

  grunt.registerTask "readme", ()->
    fs = require('fs')
    packageJson = fs.readFileSync('package.json','utf8')
    packageObj = JSON.parse(packageJson)
    readmeTemplate = fs.readFileSync('readme.template.md','utf8')

    readme = readmeTemplate
      .split('{{version}}').join(packageObj.version)

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

  grunt.registerTask "indexUnsafe", ()->
    fs = require('fs')
    indexHtml = fs.readFileSync('app/html/index.html','utf8')
    indexHtml = indexHtml.replace("img-src 'self';","img-src *;")
    fs.writeFileSync('generated/dapp/index.unsafe.html',indexHtml)


  grunt.registerMultiTask "checkport", ()->
    
    tcpPortUsed = require 'tcp-port-used'

    options = this.options()
    host = options.host || '127.0.0.1'
    port = parseInt(options.port)

    if(!options.port || isNaN options.port)
      grunt.log.warn('options.port must be a number')
      return false
    
    done = this.async()

    tcpPortPromise = tcpPortUsed.check port, host

    tcpPortPromise.then (inUse)->
      if inUse
        grunt.log.success(host,port,'is running')
        return done true
      else
        grunt.log.warn(host,port,'is not running')
        return done false
    ,(err)->
      grunt.log.error(err)
      return done false

    
      
    
      