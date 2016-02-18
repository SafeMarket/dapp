angular.module('app').controller('TxMonitorModalController',function($scope,$interval,$q,$modalInstance,proposal,user,txMonitor){
	
	$scope.currency = user.getCurrency()
	$scope.proposal = proposal

	if(typeof proposal.args[proposal.args.length-1] !== 'object')
		proposal.args.push({})

	var txOptions = proposal.args[proposal.args.length-1]
		,gasLimit = web3.eth.getBlock('latest').gasLimit
		,isFactory = typeof proposal.contractFactoryOrFunction === 'object'
		,waitInterval

	txOptions.gasPrice = web3.eth.gasPrice.toNumber()
	
	proposal.value = txOptions.value = txOptions.value ? txOptions.value : 0

	if(typeof proposal.value === 'string')
		proposal.value = web3.toDecimal(proposal.value)

	if(txOptions.gas){
		proposal.gas = txOptions.gas
	}else{
		var estimatedGas = proposal.contractFactoryOrFunction.estimateGas.apply(proposal.contractFactoryOrFunction, proposal.args)
		
		if(estimatedGas < gasLimit)
			estimatedGas = Math.min(gasLimit,estimatedGas*2)

		proposal.gas = txOptions.gas = estimatedGas
	}

	proposal.gasCost = txOptions.gasPrice * txOptions.gas
	proposal.cost = proposal.gasCost + proposal.value

	$scope.isThrown = proposal.gas > web3.eth.getBlock(web3.eth.blockNumber).gasLimit
	$scope.isProposalAffordable = user.getBalance().toNumber() > proposal.cost

	var currentBlockNumber
		,currentBlockTimestamp

	$scope.approve = function(){

		var startTimestamp = Date.now()

		$scope.isSyncing = true
		$scope.isApproved = true

		$scope.secondsWaited  = 0
		waitInterval = $interval(function(){
			console.log('wait')
			$scope.secondsWaited = new BigNumber(Date.now()).minus(startTimestamp).div(1000).floor().toNumber()
		},1000)

		var args = proposal.args.slice(0)

		args.push(function(error,result){

			if(result && result.transactionHash && ! result.address) //contract without transaction hash
				return

			if(error){
				$scope.error = error
				$scope.isSyncing = false
				$interval.cancel(waitInterval)
				return
			}

			txMonitor.waitForTx(result.transactionHash || result).then(function(receipt){
				$interval.cancel(waitInterval)
				$modalInstance.close(receipt)
			},function(){
				$scope.error = 'Transaction failed to sync'
				$scope.isSyncing = false
				$interval.cancel(waitInterval)
			})

		})
		
		if(isFactory)
			proposal.contractFactoryOrFunction.new.apply(proposal.contractFactoryOrFunction,args)
		else
			proposal.contractFactoryOrFunction.apply(window,args)

	}

	$scope.cancel = function(){
		$modalInstance.dismiss()
	}

	$scope.stopWaiting = function(){
		txMonitor.stopWaiting()
		$interval.cancel(waitInterval)
		$modalInstance.dismiss()
	}

	$scope.secondsWaited = 0

});