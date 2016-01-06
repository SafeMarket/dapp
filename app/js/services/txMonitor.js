angular.module('app').service('txMonitor',function($interval, $modal, $q, $modalStack){
	
	var txMonitor = this
		,waitInterval

	this.txs = []

	this.getTx = function(txHex, duration, pause){
		var tx = new Tx(txHex, duration, pause)
		return tx
	}

	this.waitForTx = function(hex){
		var deferred = $q.defer()

		waitInterval = $interval(function(){

			var receipt = web3.eth.getTransactionReceipt(hex)

			if(receipt){
				$interval.cancel(waitInterval)
				deferred.resolve(receipt)
			}

		},1000)

		return deferred.promise
	}


	this.stopWaiting = function(){
		$interval.cancel(waitInterval)
	}

	this.openModal = function(proposal){		
		return $modal.open({
			size: 'md'
			,templateUrl: 'txMonitorModal.html'
			,controller: 'TxMonitorModalController'
			,resolve:{
				proposal:function(){
					return proposal
				}
			}
	    });
	}

	this.propose = function(label,contractFactoryOrFunction,args){
		if(typeof label !== 'string')
			throw('Label should be a string')

		var deferred = $q.defer()
			,proposal = {
				label: label
				,contractFactoryOrFunction: contractFactoryOrFunction
				,args: args
			}

		txMonitor.openModal(proposal).result.then(function(receipt){
			console.log(receipt)
			deferred.resolve(receipt)
		})

		return deferred.promise
	}
});