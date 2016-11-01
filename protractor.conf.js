var rand = Math.floor(Math.random()*99999999)
var failFast = require('protractor-fail-fast')

exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub'
	,specs: [
		//'spec/auth.spec.js',
		'spec/settings.spec.js',
		//'spec/affiliate.spec.js',
		//'spec/submarket.spec.js',
		'spec/store.spec.js'
	]
	,allScriptsTimeout: 60000
	,onPrepare: function() {
			
		require('jasmine-reporters');

		var mkdirp = require('mkdirp')
  	var reportsDir = 'generated/reports/'

    mkdirp.sync(reportsDir)

    jasmine.getEnv().addReporter(
    	new jasmine.JUnitXmlReporter(reportsDir, true, true, 'report.')
    )

	  jasmine.getEnv().addReporter(failFast.init())
	},afterLaunch: function() {
		failFast.clean()
	},rootElement:'#app'
	,jasmineNodeOpts: {
		defaultTimeoutInterval:60000,
		realtimeFailure: true,
		stopSpecOnExpectationFailure: true
	},params:{
		storeAlias:'store'+rand
		,submarketAlias:'submarket'+rand
		,affiliateCode:'aff'+rand
	}, plugins: [{
		package: 'protractor-fail-fast'
	}]

}