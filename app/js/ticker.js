(function(){
angular.module('safemarket').service('ticker',function($interval,$http,$q){
	
	var ticker = this
		,rates = null

	updateRates()

	$interval(function(){
		updateRates()
	},10*60*1000);

	function updateRates(){
		fetchRates().then(function(_rates){
			rates = _rates
		})
	}

	function fetchRates(){

		var deferred = $q.defer()

		getBlockchainTicker().then(function(blockchainTicker){

				getPoloniexTicker().then(function(poloniexTicker){

					var rates = {}
					Object.keys(blockchainTicker).forEach(function(currency){
						rates[currency] = new BigNumber(blockchainTicker[currency]['15m']).times(poloniexTicker.BTC_ETH.last)
					})

					rates['ETH'] = new BigNumber(1)
					deferred.resolve(rates)

				},function(error){
					deferred.reject(error)
				})

			},function(error){
				deferred.reject(error)
			})

		return deferred.promise
	}

	function getBlockchainTicker(){
		return $q(function(resolve,reject){
			$http
				.get('https://blockchain.info/ticker')
				.success(function(response){
					resolve(response)
				})
				.error(function(error){
					reject(error)
				})
		})
	}

	function getPoloniexTicker(){
		return $q(function(resolve,reject){
			$http
				.get('https://poloniex.com/public?command=returnTicker')
				.success(function(response){
					resolve(response)
				})
				.error(function(error){
					reject(error)
				})
		})
	}

	function getRates(){
		var deferred = $q.defer()
			,interval = setInterval(resolveIfSet,1000)

		function resolveIfSet(){
			if(!rates) return
			deferred.resolve(rates)
			clearInterval(interval)
		}

		resolveIfSet()

		return deferred.promise
	}

	this.getRates = getRates
})
})();