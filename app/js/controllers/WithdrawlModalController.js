/* globals angular, web3 */

angular.module('app').controller('WithdrawlModalController', ($scope, order, utils, user, growl, $modalInstance) => {

  $scope.addr = order.addr
  $scope.userCurrency = user.getCurrency()

  $scope.amountInUserCurrency = utils.convertCurrencyAndFormat(order.received, {
    from: 'WEI',
    to: user.getCurrency()
  })

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
        }, amountInUserCurrency: {
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

    $scope.isSyncing = true

    let amount = utils.convertCurrency($scope.amountInUserCurrency, {
      from: user.getCurrency(),
      to: 'WEI'
    })

    if (amount.greaterThan(order.received)) {
      amount = web3.toBigNumber(order.received.toString())
    }

    order.withdraw(amount).then(() => {
      $modalInstance.close()
    })

  }

})
