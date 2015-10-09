module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-embark"
  grunt.loadTasks "tasks"

  grunt.initConfig(
    files:
      web3:
        "app/js/web3.js"

      js:
        src: [
          "bower_components/crypto-js/build/rollups/aes.js"
          "bower_components/msgpack-javascript/msgpack.js"
          "bower_components/cryptocoin/dist/cryptocoin.js"
          "bower_components/validate/validate.min.js"
          "bower_components/lodash/lodash.min.js"
          "bower_components/q/q.js"
          "bower_components/openpgp/dist/openpgp.js"
          "bower_components/bignumber.js/bignumber.min.js"
          "bower_components/angular/angular.min.js"
          "bower_components/angular-route/angular-route.min.js"
          "bower_components/angular-growl/build/angular-growl.min.js"
          "bower_components/angular-timeago/dist/angular-timeago.js"
          "bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"
          "app/js/index.js"
          "app/js/safemarket.js"
          "app/js/pgp.js"
          "app/js/ticker.js"
          "app/js/utils.js"
          "app/js/Store.js"
          "app/js/Market.js"
          "app/js/Order.js"
          "app/js/Key.js"
          "app/js/Forum.js"
          "app/js/CommentsGroup.js"
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
        files: ["<%= files.js.src %>","node_modules/embark-framework/js/web3.js"]
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

    deploy:
      contracts: '<%= files.contracts.src %>'
      dest: 'generated/tmp/abi.js'
  )

  # loading external tasks (aka: plugins)
  # Loads all plugins that match "grunt-", in this case all of our current plugins
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks)

  grunt.registerTask "deploy", ["copy", "coffee", "deploy_contracts", "concat", "copy", "server", "watch"]
  grunt.registerTask "build", ["copy", "clean", "deploy_contracts", "coffee", "concat", "uglify", "copy"]

