module.exports = function(grunt){

  try{
    var githubToken = grunt.file.read("config/production/githubToken")
  }catch(e){
    grunt.log.warn('Github token not set')
    return {}
  }


	return {
		options:{
        	repo: "git@github.com:SafeMarket/dapp.git"
        	,credentials: {
          	token: githubToken
        	}
        	,files: [
            "generated/reports/reports.zip"
            ,"generated/packages/SafeMarket-mac-x64.zip"
            ,"generated/packages/SafeMarket-win32-x64.zip"
            ,"generated/packages/SafeMarket-linux-x64.zip"
        	]
      	,releaseName: "Version {tag}"
    	}
	}
}