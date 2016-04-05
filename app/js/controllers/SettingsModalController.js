/* globals angular, web3 */

angular.module('app').controller('SettingsModalController', ($scope, growl, user, ticker, helpers, txMonitor, utils, $modalInstance, Keystore) => {

  $scope.seed = user.getSeed()
  $scope.accounts = user.getAccounts()
  $scope.account = user.getAccount()
  $scope.currencies = Object.keys(ticker.rates)
  $scope.currency = user.getCurrency()

  $scope.recipientTypes = {
    internal: 'One of my SafeMarket accounts',
    external: 'An external account'
  }
  $scope.recipientType = 'internal'
  $scope.internalRecipient = $scope.accounts[0]
  $scope.externalRecipient = ''
  $scope.amountTypes = {
    everything: 'Transfer everything',
    fixed: 'A fixed amount'
  }
  $scope.amountType = 'everything'
  $scope.transferAmountInUserCurrency = '0'

  $scope.$watch('account', (account) => {

    user.setAccount(account)
    $scope.balance = user.getBalance()
    $scope.keypairs = user.getKeypairs()

    user.fetchKeypair().then((keypair) => {
      $scope.keypair = keypair
    })
    user.setRootScopeVars()

    user.save()
  })

  $scope.$watch('currency', (currency) => {
    user.setCurrency(currency)
    user.save()
  })

  $scope.submit = function submit() {
    user.save()
    $modalInstance.dismiss()
  }

  $scope.addKeypair = function addKeypair() {

    $scope.isChangingKeys = true

    user.addKeypair().then(() => {

      user.save()

      $scope.keypairs = user.getKeypairs()

      if (confirm('A new keypair has been generated. Would you like to set it as your primary key?')) {
        $scope.setPrimaryKeypair(user.getKeypairs().length - 1)
      }

      $scope.isChangingKeys = false
    })
  }

  $scope.setPrimaryKeypair = function setPrimaryKeypair(index) {

    const keyData = user.getKeypairs()[index].public.toPacketlist().write()

    txMonitor.propose('Set Your Primary Keypair', Keystore.setKey, [keyData]).then(() => {
      user.fetchKeypair().then((keypair) => {
        $scope.keypair = keypair
      })
    })
  }

  $scope.deleteKeypair = function deleteKeypair(index) {

    if (!confirm('Are you sure? If this keypair was used to encrypt any messages, you will no longer be able to decrypt them')) {
      return
    }

    user.deleteKeypair(index)
    user.save()
  }

  $scope.reset = function reset() {

    if (!confirm('Are you sure? This will delete all the SafeMarket data on this computer.')) {
      return
    }

    $modalInstance.close()

    user.reset()
    user.logout()
    window.location.hash = 'login'

  }

  $scope.transfer = function transfer() {

    const recipient = $scope.recipientType === 'internal'
      ? $scope.internalRecipient
      : utils.hexify($scope.externalRecipient)

    const value = $scope.amountType === 'everything'
      ? user.getBalance()
      : utils.convertCurrency($scope.transferAmountInUserCurrency, { from: user.getCurrency(), to: 'WEI' })

    if (!utils.isAddr(recipient)) {
      return growl.addErrorMessage('Invalid address')
    }

    if ($scope.account === recipient) {
      return growl.addErrorMessage('You are trying to send money to and from the same account')
    }

    if (value <= 0) {
      return growl.addErrorMessage('Amount must be greater than 0')
    }

    const txObject = {
      to: recipient,
      value,
      gas: web3.eth.estimateGas({
        to: recipient,
        value
      })
    }
    const gasCost = web3.eth.gasPrice.times(txObject.gas)

    if ($scope.amountType === 'everything') {
      txObject.value = user.getBalance().minus(gasCost)
    }

    txMonitor.propose('Transfer Ether', web3.eth.sendTransaction, [txObject]).then(() => {
      $scope.balance = user.getBalance()
      $scope.transferAmountInUserCurrency = 0
    })
  }

  $scope.refreshBalance = function refreshBalance() {
    $scope.balance = web3.eth.getBalance($scope.account)
    growl.addSuccessMessage('Balance refreshed')
  }

})
