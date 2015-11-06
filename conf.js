exports.config = {
	seleniumAddress: 'http://localhost:4444/wd/hub'
	,specs: [
		'spec/auth.spec.js'
		,'spec/settings.spec.js'
		,'spec/market.spec.js'
		,'spec/store.spec.js'
	]
	,allScriptsTimeout: 20000
}