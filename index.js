var Geth = require('./modules/geth.js')

geth = new Geth('geth','--datadir /Users/aakilfernandes/SafeMarket/')

geth.quickstart('password').then(function(){
	console.log('yeah!!!')
})