exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub'
	,specs: [
		'spec/auth.spec.js'
		,'spec/settings.spec.js'
		,'spec/market.spec.js'
		,'spec/store.spec.js'
	]
	,allScriptsTimeout: 20000
	,onPrepare: function() {
			
		require('jasmine-reporters');

		var mkdirp = require('mkdirp')
        	,reportsDir = 'reports/'

        mkdirp.sync(reportsDir)

	    jasmine.getEnv().addReporter(
	    	new jasmine.JUnitXmlReporter(reportsDir, true, true, 'report.')
	    );
	}

}