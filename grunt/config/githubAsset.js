module.exports = function(grunt){
  	return {
  		options:{
          	repo: "git@github.com:SafeMarket/dapp.git"
          	,credentials: {
            	token: grunt.file.readJSON(".env.json").github.token
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