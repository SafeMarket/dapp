angular.module('app').controller('SettingsModalController',function($scope,AffiliateReg,growl,user,ticker,helpers,txMonitor,Keystore,$modalInstance){

  $scope.currencies = Object.keys(ticker.rates)
  $scope.user = user
  $scope.accounts = web3.eth.accounts
  $scope.allAccounts = $scope.accounts.concat(user.data.affiliateAccounts)
  $scope.affiliateAccount = ""
  $scope.affiliateCode = ""

  $scope.$watch('user.data.account',function(){
    $scope.balanceInEther = web3.fromWei(web3.eth.getBalance(user.data.account))
    user.save()
  })

  $scope.$watch('affiliateAccount',function(){
    var rawCode = AffiliateReg.contract.getCode.call($scope.affiliateAccount)
    if(rawCode != 0x0)
      $scope.affiliateCode = web3.toAscii(rawCode)
    else {
        $scope.affiliateCode = ''
    }
  })

  $scope.$watch('user.data.currency',function(){
    user.setDisplayCurrencies()
    user.save()
  })

  $scope.submit = function(){
    user.save()
    $modalInstance.close()
  }

  $scope.addKeypair = function(){
    $scope.isChangingKeys = true
    user.addKeypair().then(function(){

      var doSet = confirm('A new keypair has been generated. Would you like to set it as your primary key?')

      if(doSet)
      $scope.setPrimaryKeypair(user.keypairs.length-1)

      $scope.isChangingKeys = false
    })
  }

  $scope.registerAffiliateCode = function() {
    $scope.isChangingKeys = true

    var code = $scope.affiliateCode,
    account = $scope.affiliateAccount,
    estimatedGas = AffiliateReg.contract.claimCode.estimateGas(code,account),
    doContinue = helpers.confirmGas(estimatedGas)

    if(!doContinue){
      $scope.isChangingKeys = false
      return
    }

    AffiliateReg.claimCode(code, account).then(function(err, res){
      $scope.isChangingKeys = false
      user.addAffiliateAccount(account)
      $scope.allAccounts = $scope.accounts.concat(user.data.affiliateAccounts)
    })
  }

  $scope.setPrimaryKeypair = function(index){

    var keyData = user.keypairs[index].public.toPacketlist().write()

    txMonitor.propose('Set Your Primary Keypair', Keystore.setKey,[keyData]).then(function(){
      $scope.user.loadKeypair()
    })
  }

  $scope.deleteKeypair = function(index){
    var doContinue = confirm('Are you sure? If this keypair was used to encrypt any messages, you will no longer be able to decrypt them')
    if(!doContinue) return

    user.data.keypairs.splice(index,1)
    user.save()
    user.loadKeypairs()
  }

  $scope.reset = function(){
    var doContinue = confirm('Are you sure? This will delete all the SafeMarket data on this computer.')
    if(!doContinue) return

    $modalInstance.close()

    user.reset()
    user.logout()
    window.location.hash = 'login'
  }

});