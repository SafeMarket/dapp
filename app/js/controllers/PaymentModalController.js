/* globals angular, web3 */

angular.module('app').controller('PaymentModalController', ($scope, addr, amount, currency, utils, user, growl, $modalInstance, txMonitor) => {

  $scope.addr = addr
  $scope.userCurrency = user.getCurrency()

  $scope.displayCurrencies = []

  if ($scope.userCurrency !== 'ETH') {
    $scope.displayCurrencies.push('ETH')
  }

  if (amount.greaterThan(0)) {
    $scope.amountInUserCurrency = utils.convertCurrencyAndFormat(amount, {
      from: currency,
      to: user.getCurrency()
    })
  } else {
    $scope.amountInUserCurrency = '0'
  }

  if (user.getCurrency() !== 'ETH') {

    $scope.$watch('amountInUserCurrency', (amountInUserCurrency) => {
      $scope.amountInEther = utils.convertCurrencyAndFormat(amountInUserCurrency, {
        from: user.getCurrency(),
        to: 'ETH'
      })
    })

    $scope.$watch('amountInEther', (amountInEther) => {
      $scope.amountInUserCurrency = utils.convertCurrencyAndFormat(amountInEther, {
        from: 'ETH',
        to: user.getCurrency()
      })
    })

  }

  $scope.cancel = function cancel() {
    $modalInstance.dismiss('cancel')
  }

  $scope.submit = function submit() {

    try {
      utils.check({
        addr: $scope.addr,
        amountInUserCurrency: $scope.amountInUserCurrency
      }, {
        addr: {
          presence: true,
          type: 'address'
        },
        amountInUserCurrency: {
          presence: true,
          type: 'string',
          numericality: {
            greaterThan: 0
          }
        }
      })
    } catch (e) {
      growl.addErrorMessage(e)
      return
    }

    const _amount = utils.convertCurrency($scope.amountInUserCurrency, {
      from: user.getCurrency(),
      to: 'WEI'
    })

    const txObject = {
      value: _amount.toNumber(),
      to: addr
    }

    txObject.gas = web3.eth.estimateGas(txObject)

    txMonitor.propose('Make a Payment', web3.eth.sendTransaction, [txObject]).then(() => {
      $scope.balance = user.getBalance()
      $scope.transferAmountInUserCurrency = 0
    }).then(() => {
      $modalInstance.close()
    })
  }
})
