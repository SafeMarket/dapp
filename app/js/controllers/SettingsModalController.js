angular.module('app').controller('SettingsModalController',function($scope,AffiliateReg,growl,user,ticker,helpers,txMonitor,Keystore,$modalInstance){

  $scope.currencies = Object.keys(ticker.rates)
  $scope.user = user
  $scope.accounts = web3.eth.accounts
  $scope.affiliateAccount = ''
  $scope.newAffiliateAccount = ''
  $scope.affiliateCode = ''
  $scope.newAffiliateCode = ''

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
  })

  $scope.$watch('newAffiliateCode',function(){
    var rawAcc = AffiliateReg.contract.getAddr.call($scope.newAffiliateCode)
    if(parseInt(rawAcc,16) !== 0)
    $scope.newAffiliateAccount = rawAcc
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

  $scope.claimAffiliateCode = function() {
    var code = $scope.newAffiliateCode,
    account = $scope.newAffiliateAccount

    try{
      AffiliateReg.claimCode.check(code,account)
    }catch(e){
      growl.addErrorMessage(e)
      return
    }

    AffiliateReg.claimCode(code, account).then(function(err, res){
      user.addAffiliateCode(code)
    })
  }

  $scope.updateAffiliateCode = function() {
    var code = $scope.affiliateCode,
    account = $scope.affiliateAccount

    try{
      AffiliateReg.changeAffiliate.check(code,account)
    }catch(e){
      growl.addErrorMessage(e)
      return
    }

    AffiliateReg.changeAffiliate(code, account)
  }

  $scope.releaseAffiliateCode = function() {
    var code = $scope.affiliateCode

    try{
      AffiliateReg.releaseCode.check(code)
    }catch(e){
      growl.addErrorMessage(e)
      return
    }

    AffiliateReg.releaseCode(code).then(function(err, res){
      user.deleteAffiliateCode(code)
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