/* globals angular, web3 */

angular.module('app').service('txMonitor', function txMonitorService($interval, $modal, $q) {

  const txMonitor = this
  let waitInterval

  this.txs = []

  this.waitForTx = function waitForTx(hex) {
    const deferred = $q.defer()

    waitInterval = $interval(() => {

      const receipt = web3.eth.getTransactionReceipt(hex)

      if (receipt) {
        $interval.cancel(waitInterval)
        deferred.resolve(receipt)
      }

    }, 1000)

    return deferred.promise
  }


  this.stopWaiting = function stopWaiting() {
    $interval.cancel(waitInterval)
  }

  this.openModal = function openModal(proposal) {
    return $modal.open({
      size: 'md',
      templateUrl: 'txMonitorModal.html',
      controller: 'TxMonitorModalController',
      resolve: {
        proposal: function resolveProposal() {
          return proposal
        }
      }
    })
  }

  this.propose = function propose(label, contractFactoryOrFunction, args) {

    console.log('propose', label)

    if (typeof label !== 'string') {
      throw new Error('Label should be a string')
    }

    const deferred = $q.defer()
    const proposal = {
      label: label,
      contractFactoryOrFunction: contractFactoryOrFunction,
      args: args
    }

    txMonitor.openModal(proposal).result.then((receipt) => {
      deferred.resolve(receipt)
    })

    return deferred.promise
  }

})
