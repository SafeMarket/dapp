module.exports = function(grunt){

  try{
    var githubToken = grunt.file.readJSON(".env.json").github.token
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
            "reports/reports.zip"
            ,"packages/SafeMarket-mac-x64.zip"
            ,"packages/SafeMarket-win32-x64.zip"
            ,"packages/SafeMarket-linux-x64.zip"
        	]
      	,releaseName: "Version {tag}"
    	}
	}
}