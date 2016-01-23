angular.module('app').controller('SettingsModalController',function($scope,AffiliateReg,growl,user,ticker,helpers,txMonitor,Keystore,$modalInstance){

  $scope.currencies = Object.keys(ticker.rates)
  $scope.user = user
  $scope.accounts = web3.eth.accounts
  $scope.affiliateAccount = ''
  $scope.affiliateCode = ''
  $scope.newAffiliateCode = true;

  $scope.$watch('user.data.account',function(){
    $scope.balanceInEther = web3.fromWei(web3.eth.getBalance(user.data.account))
    user.save()
  })

  $scope.$watch('affiliateCode',function(){
    var rawAcc = AffiliateReg.contract.getAddr.call($scope.affiliateCode)
    if(parseInt(rawAcc,16) === 0)
      $scope.affiliateAccount = ''
    else {
      $scope.affiliateAccount = rawAcc
    }
    $scope.newAffiliateCode = user.data.affiliateCodes.indexOf($scope.affiliateCode) == -1
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

    try{
			AffiliateReg.claimCode.check(code,account)
		}catch(e){
			growl.addErrorMessage(e)
			return
		}

    AffiliateReg.claimCode(code, account,$scope.newAffiliateCode).then(function(err, res){
      $scope.isChangingKeys = false
      user.addAffiliateCode(code)
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