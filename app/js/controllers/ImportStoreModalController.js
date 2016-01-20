(function(){

angular.module('app').controller('ImportStoreModalController',function($scope,$modalInstance,growl,user,utils,AliasReg){


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
					,aliasOfContract:'Store'
				}
			})
		}catch(e){
			return growl.addErrorMessage(e)
		}

		var storeAddr = AliasReg.getAddr($scope.alias)
			,store = new Store(storeAddr)

		if(store.owner !== user.data.account)
			return growl.addErrorMessage('You are not the owner of that store')

		user.data.storeAddrs.push(storeAddr)
		user.save()

		$modalInstance.close()

	}

})

})();