angular.module('app').controller('AffiliateModalController',function($scope,affiliate,user,$modalInstance,Affiliate,AffiliateReg,utils,growl){
	$scope.isEditing = !!affiliate
	$scope.code = affiliate ? affiliate.code : ''
	$scope.owner = (affiliate ? affiliate.owner : user.getAccount()).replace('0x','')
	$scope.coinbase = (affiliate ? affiliate.coinbase : user.getAccount()).replace('0x','')

	$scope.cancel = function(){
		$modalInstance.dismiss()
	}

	$scope.submit = function(){

		var owner = '0x'+$scope.owner
			,coinbase = '0x'+$scope.coinbase

		try{
			utils.check({
				code:$scope.code
				,owner:owner
				,coinbase:coinbase
			},{
				code:{
					presence:true
					,type:'string'
				},owner:{
					presence:true
					,type:'address'
				},coinbase:{
					presence:true
					,type:'address'
				}
			})
		}catch(e){
			return growl.addErrorMessage(e)
		}

		if(!$scope.isEditing){
			
			if(AffiliateReg.getIsCodeTaken($scope.code)){
				growl.addErrorMessage('The code "'+$scope.code+'" is taken')
				return
			}

			Affiliate.create($scope.code,owner,coinbase).then(function(){
				console.log('add affiliate')
				user.addAffiliate($scope.code)
				$modalInstance.close()
			})

			return
		}

		var affiliate = new Affiliate($scope.code)
		affiliate.set(owner,coinbase).then(function(){
			$modalInstance.close()
		})
	

	}
});