(function(){
	angular.module('app').controller('MainController',function($scope,modals,user,growl){

		$scope.user = user

		$scope.openSettingsModal = function(){
			modals.openSettings()
		}

		$scope.openStoreModal = function(){
			if(!user.keypair){
				//growl.addErrorMessage('You must set a primary keypair')
				//return
			}
			modals.openStore()
		}

		$scope.openMarketModal = function(){
			if(!user.keypair){
				//growl.addErrorMessage('You must set a primary keypair')
				//return
			}
			modals.openMarket()
		}

		$scope.openImportStoreModal = function(){
			modals.openImportStore()
		}

		$scope.openImportMarketModal = function(){
			modals.openImportMarket()
		}

	})
})();