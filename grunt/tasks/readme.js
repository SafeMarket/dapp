module.exports = function(grunt){

	grunt.registerTask('readme',function(){
	    var packageObj = grunt.file.readJSON("package.json")
	    	,readmeTemplate = grunt.file.read("readme.template.md")
	    	,readme = readmeTemplate.split("{{version}}").join(packageObj.version)

	    grunt.file.write("readme.md",readme)
    })
    
}