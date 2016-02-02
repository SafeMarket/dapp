(function(){

angular.module('app').controller('ImportSubmarketModalController',function($scope,$modalInstance,growl,user,utils,AliasReg){


	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		try{
			utils.check({
				alias:$scope.alias
			},{
				alias:{
					presence:true
					,type:'alias'
					,aliasOfContract:'Submarket'
				}
			})
		}catch(e){
			return growl.addErrorMessage(e)
		}

		var submarketAddr = AliasReg.getAddr($scope.alias)
			,submarket = new Submarket(submarketAddr)

		if(submarket.owner !== user.getAccount())
			return growl.addErrorMessage('You are not the owner of that submarket')

		user.addSubmarket(submarketAddr)
		user.save()

		$modalInstance.close()

	}

})


})();