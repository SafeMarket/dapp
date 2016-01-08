"use strict"
LIVERELOAD_PORT = 35728
lrSnippet = require("connect-livereload")(port: LIVERELOAD_PORT)

# var conf = require('./conf.'+process.env.NODE_ENV);
mountFolder = (connect, dir) ->
    connect.static require("path").resolve(dir)


# # Globbing
# for performance reasons we're only matching one level down:
# 'test/spec/{,*}*.js'
# use this if you want to recursively match all subfolders:
# 'test/spec/**/*.js'
module.exports = (grunt) ->
    require("load-grunt-tasks") grunt
    require("time-grunt") grunt
    
    # configurable paths
    yeomanConfig =
        app: "client"
        dist: "dist"
        docs: "documentation"

    try
        yeomanConfig.app = require("./bower.json").appPath or yeomanConfig.app
    grunt.initConfig
        yeoman: yeomanConfig
        watch:
            coffee:
                files: ["<%= yeoman.app %>/scripts/**/*.coffee"]
                tasks: ["coffee:dist"]

            compass:
                files: ["<%= yeoman.app %>/styles/**/*.{scss,sass}"]
                tasks: ["compass:server"]

            less:
                files: ["<%= yeoman.app %>/styles-less/**/*.less"]
                tasks: ["less:server"]

            jade:
                files: ["<%= yeoman.docs %>/jade/*.jade"]
                tasks: ["jade:docs"]

            livereload:
                options:
                    livereload: LIVERELOAD_PORT

                files: [
                    "<%= yeoman.app %>/index.html"
                    "<%= yeoman.app %>/views/**/*.html"
                    "<%= yeoman.app %>/styles/**/*.scss"
                    "<%= yeoman.app %>/styles-less/**/*.less"
                    ".tmp/styles/**/*.css"
                    "{.tmp,<%= yeoman.app %>}/scripts/**/*.js"
                    "<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}"
                    "<%= yeoman.docs %>/jade/*.jade"
                ]

        connect:
            options:
                port: 9000
                
                # Change this to '0.0.0.0' to access the server from outside.
                hostname: "127.0.0.1"

            livereload:
                options:
                    middleware: (connect) ->
                        [lrSnippet, mountFolder(connect, ".tmp"), mountFolder(connect, yeomanConfig.app)]
            docs:
                options:
                    middleware: (connect) ->
                        [lrSnippet, mountFolder(connect, yeomanConfig.docs)]

            test:
                options:
                    middleware: (connect) ->
                        [mountFolder(connect, ".tmp"), mountFolder(connect, "test")]

            dist:
                options:
                    middleware: (connect) ->
                        [mountFolder(connect, yeomanConfig.dist)]

        open:
            server:
                url: "http://127.0.0.1:<%= connect.options.port %>"

        clean:
            dist:
                files: [
                    dot: true
                    src: [".tmp", "<%= yeoman.dist %>/*", "!<%= yeoman.dist %>/.git*"]
                ]
            all: [
                ".tmp", ".sass-cache"
                "client/bower_components"
                "documentation/jade", "documentation/config.codekit"
                "landing/jade", "landing/config.codekit"
                "node_modules"
                ".DS_Store"
                ".git"
            ]
            server: ".tmp"

        jshint:
            options:
                jshintrc: ".jshintrc"

            all: ["Gruntfile.js", "<%= yeoman.app %>/scripts/**/*.js"]

        jade: 
            docs:
                options: 
                    pretty: true

                files:
                    "<%= yeoman.docs %>/index.html": ["<%= yeoman.docs %>/jade/index.jade"]

        compass:
            options:
                sassDir: "<%= yeoman.app %>/styles"
                cssDir: ".tmp/styles"
                generatedImagesDir: ".tmp/styles/ui/images/"
                imagesDir: "<%= yeoman.app %>/styles/ui/images/"
                javascriptsDir: "<%= yeoman.app %>/scripts"
                fontsDir: "<%= yeoman.app %>/fonts"
                importPath: "<%= yeoman.app %>/bower_components"
                httpImagesPath: "styles/ui/images/"
                httpGeneratedImagesPath: "styles/ui/images/"
                httpFontsPath: "fonts"
                relativeAssets: true
            dist:
                options:
                    outputStyle: 'compressed'
                    debugInfo: false
                    noLineComments: true
            server:
                options:
                    debugInfo: true
            forvalidation:
                options:
                    debugInfo: false
                    noLineComments: false
        # if you want to use the compass config.rb file for configuration:
        # compass:
        #   dist:
        #     options:
        #       config: 'config.rb'

        less:
            server:
                options:
                    strictMath: true
                    dumpLineNumbers: true
                    sourceMap: true
                    sourceMapRootpath: ""
                    outputSourceFiles: true
                files: [
                    expand: true
                    cwd: "<%= yeoman.app %>/styles-less"
                    src: "main.less"
                    dest: ".tmp/styles"
                    ext: ".css"                    
                ]
            dist:
                options:
                    cleancss: true,
                    report: 'min'
                files: [
                    expand: true
                    cwd: "<%= yeoman.app %>/styles-less"
                    src: "main.less"
                    dest: ".tmp/styles"
                    ext: ".css"                    
                ]


        coffee:
            server:
                options:
                    sourceMap: true
                    # join: true,
                    sourceRoot: ""
                files: [
                    expand: true
                    cwd: "<%= yeoman.app %>/scripts"
                    src: "**/*.coffee"
                    dest: ".tmp/scripts"
                    ext: ".js"
                ]
            dist:
                options:
                    sourceMap: false
                    sourceRoot: ""
                files: [
                    expand: true
                    cwd: "<%= yeoman.app %>/scripts"
                    src: "**/*.coffee"
                    dest: ".tmp/scripts"
                    ext: ".js"
                ]

        useminPrepare:
            html: "<%= yeoman.app %>/index.html"
            options:
                dest: "<%= yeoman.dist %>"
                flow:
                    steps:
                        js: ["concat"]
                        css: ["cssmin"]
                    post: []

        
        # 'css': ['concat']
        usemin:
            html: ["<%= yeoman.dist %>/**/*.html", "!<%= yeoman.dist %>/bower_components/**"]
            css: ["<%= yeoman.dist %>/styles/**/*.css"]
            options:
                dirs: ["<%= yeoman.dist %>"]

        htmlmin:
            dist:
                options: {}
                
                #removeCommentsFromCDATA: true,
                #                    // https://github.com/yeoman/grunt-usemin/issues/44
                #                    //collapseWhitespace: true,
                #                    collapseBooleanAttributes: true,
                #                    removeAttributeQuotes: true,
                #                    removeRedundantAttributes: true,
                #                    useShortDoctype: true,
                #                    removeEmptyAttributes: true,
                #                    removeOptionalTags: true
                files: [
                    expand: true
                    cwd: "<%= yeoman.app %>"
                    src: ["*.html", "views/*.html"]
                    dest: "<%= yeoman.dist %>"
                ]

        
        # Put files not handled in other tasks here
        copy:
            dist:
                files: [
                    expand: true
                    dot: true
                    cwd: "<%= yeoman.app %>"
                    dest: "<%= yeoman.dist %>"
                    src: [
                        "favicon.ico"
                        # bower components that has image, font dependencies
                        "bower_components/font-awesome/css/*"
                        "bower_components/font-awesome/fonts/*"
                        "bower_components/weather-icons/css/*"
                        "bower_components/weather-icons/fonts/*"
                        "bower_components/weather-icons/font/*"

                        "fonts/**/*"
                        "i18n/**/*"
                        "images/**/*"
                        # "styles/bootstrap/**/*"
                        "styles/fonts/**/*"
                        "styles/img/**/*"
                        "styles/ui/images/*"
                        "views/**/*"
                    ]
                ,
                    expand: true
                    cwd: ".tmp"
                    dest: "<%= yeoman.dist %>"
                    src: ["styles/**", "assets/**"]
                ,
                    expand: true
                    cwd: ".tmp/images"
                    dest: "<%= yeoman.dist %>/images"
                    src: ["generated/*"]
                ]

            styles:
                expand: true
                cwd: "<%= yeoman.app %>/styles"
                dest: ".tmp/styles/"
                src: "**/*.css"


        concurrent:
            server: ["coffee:server", "compass:server", "copy:styles"]
            dist: ["coffee:dist", "compass:dist", "copy:styles", "htmlmin"]
            lessServer: ["coffee:server", "less:server", "copy:styles"]
            lessDist: ["coffee:dist", "less:dist", "copy:styles", "htmlmin"]

        cssmin:
            options:
                keepSpecialComments: '0'
            dist: {}    # usemin takes care of that

        concat:
            options:
                separator: grunt.util.linefeed + ';' + grunt.util.linefeed
            dist: {}   # usemin takes care of that

        uglify:
            options:
                mangle: false
                compress:
                    drop_console: true
            dist:
                files:
                    "<%= yeoman.dist %>/scripts/app.js": [
                        ".tmp/**/*.js"
                        "<%= yeoman.app %>/scripts/**/*.js"
                        "!<%= yeoman.app %>/scripts/vendors/**"
                    ]

    grunt.registerTask "docs", ->
        grunt.task.run ["jade:docs", "connect:docs", "open", "watch"]

    grunt.registerTask "server", (target) ->
        return grunt.task.run(["serve:dist"])  if target is "dist"
        grunt.task.run(["serve"])

    grunt.registerTask "serve", (target) ->
        return grunt.task.run(["build", "open", "connect:dist:keepalive"])  if target is "dist"
        grunt.task.run ["clean:server", "concurrent:server", "connect:livereload", "open", "watch"]

    # grunt.registerTask "lessServer", (target) ->
    #     return grunt.task.run(["lessBuild", "open", "connect:dist:keepalive"])  if target is "dist"
    #     grunt.task.run ["clean:server", "concurrent:lessServer", "connect:livereload", "open", "watch"]

    grunt.registerTask "build", ["clean:dist", "useminPrepare", "concurrent:dist", "copy:dist", "cssmin", "concat", "uglify", "usemin"]
    # grunt.registerTask "lessBuild", ["clean:dist", "useminPrepare", "concurrent:lessDist", "copy:dist", "cssmin", "concat", "uglify", "usemin"]

    grunt.registerTask "default", ["server"]