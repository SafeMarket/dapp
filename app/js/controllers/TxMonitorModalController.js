/* globals angular, web3 */

angular.module('app').controller('TxMonitorModalController', ($scope, $interval, $q, $modalInstance, proposal, user, txMonitor) => {

  $scope.currency = user.getCurrency()
  $scope.proposal = proposal

  if (typeof proposal.args[proposal.args.length - 1] !== 'object') {
    proposal.args.push({})
  }

  const txOptions = proposal.args[proposal.args.length - 1]
  const gasLimit = web3.eth.getBlock('latest').gasLimit
  const isFactory = typeof proposal.contractFactoryOrFunction === 'object'
  let waitInterval = null

  if (txOptions.gasPrice) {
    txOptions.gasPrice = web3.toBigNumber(txOptions.gasPrice)
  } else {
    txOptions.gasPrice = web3.eth.gasPrice
  }

  proposal.value = txOptions.value = txOptions.value ? txOptions.value : 0

  if (typeof proposal.value === 'string') {
    proposal.value = web3.toDecimal(proposal.value)
  }

  if (txOptions.gas) {
    proposal.gas = web3.toBigNumber(txOptions.gas)
  } else {

    const args = angular.copy(proposal.args)
    let estimatedGas = proposal.contractFactoryOrFunction.estimateGas.apply(proposal.contractFactoryOrFunction, args)

    if (estimatedGas < gasLimit) {
      estimatedGas = Math.min(Math.floor(gasLimit * 0.9), estimatedGas * 2)
    }

    proposal.gas = txOptions.gas = web3.toBigNumber(estimatedGas)
  }

  proposal.gasCost = txOptions.gasPrice.times(txOptions.gas)
  proposal.cost = proposal.gasCost.plus(proposal.value)

  $scope.isThrown = proposal.gas.greaterThan(web3.eth.getBlock(web3.eth.blockNumber).gasLimit)
  $scope.isProposalAffordable = user.getBalance().greaterThan(proposal.cost)

  $scope.approve = function approve() {

    const startTimestamp = Date.now()

    $scope.isSyncing = true
    $scope.isApproved = true

    $scope.secondsWaited = 0
    waitInterval = $interval(() => {
      $scope.secondsWaited = web3.toBigNumber(Date.now()).minus(startTimestamp).div(1000).floor().toNumber()
    }, 1000)

    const args = proposal.args.slice(0)

    args.push((error, result) => {

      if (result && result.transactionHash && ! result.address) {
        return
      }

      if (error) {
        $scope.error = error
        $scope.isSyncing = false
        $interval.cancel(waitInterval)
        return
      }

      txMonitor.waitForTx(result.transactionHash || result).then((receipt) => {
        $interval.cancel(waitInterval)
        $modalInstance.close(receipt)
      }, () => {
        $scope.error = 'Transaction failed to sync'
        $scope.isSyncing = false
        $interval.cancel(waitInterval)
      })

    })

    if (isFactory) {
      proposal.contractFactoryOrFunction.new.apply(proposal.contractFactoryOrFunction, args)
    } else {
      proposal.contractFactoryOrFunction.apply(window, args)
    }

  }

  $scope.cancel = function cancel() {
    $modalInstance.dismiss()
  }

  $scope.stopWaiting = function stopWaiting() {
    txMonitor.stopWaiting()
    $interval.cancel(waitInterval)
    $modalInstance.dismiss()
  }

  $scope.secondsWaited = 0

})
