angular.module('app').controller('TxMonitorModalController',function($scope,$interval,$q,$modalInstance,proposal,user,txMonitor){

	$scope.proposal = proposal

	if(typeof proposal.args[proposal.args.length-1] !== 'object')
		proposal.args.push({})

	var txOptions = proposal.args[proposal.args.length-1]
		,isFactory = typeof proposal.contractFactoryOrFunction === 'object'

	console.log(proposal.contractFactoryOrFunction)

	proposal.value = txOptions.value = txOptions.value || 0
	proposal.gas = txOptions.gas = txOptions.gas || (proposal.contractFactoryOrFunction.estimateGas.apply(proposal.contractFactoryOrFunction, proposal.args)*2)
	proposal.cost = web3.eth.gasPrice.times(proposal.value+proposal.gas).toNumber()

	$scope.isThrown = web3.eth.getBlock(web3.eth.blockNumber).gasLimit<proposal.gas
	$scope.isProposalAffordable = user.balance.lessThan(proposal.cost)

	var currentBlockNumber
		,currentBlockTimestamp

	$scope.approve = function(){

		$scope.isSyncing = true
		$scope.isApproved = true

		$scope.secondsWaited  = 0
		var waitInterval = $interval(function(){
			$scope.secondsWaited = new BigNumber(Date.now()).minus(startTimestamp).div(1000).floor().toNumber()
		})

		var args = proposal.args.slice(0)

		args.push(function(error,result){

			console.log(arguments)

			if(result && result.transactionHash && ! result.address) //contract without transaction hash
				return

			if(error){
				$scope.error = error
				$scope.isSyncing = false
				return
			}
      
			txMonitor.waitForTx(result.transactionHash || result).then(function(receipt){
				$interval.cancel(waitInterval)
				$modalInstance.close(receipt)
			})

		})

		console.log(args)
		console.log('isFactory',isFactory)

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
		$modalInstance.dismiss()
	}

	var startTimestamp = Date.now()

	$scope.secondsWaited = 0

});