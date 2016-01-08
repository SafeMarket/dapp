(function(){
	angular.module('app').controller('MainController',function($scope,$timeout,$rootScope,modals,user,growl){

		$scope.user = user

		$scope.goBack = function(){
			window.history.back()
		}

		$scope.refresh = function(){
			$scope.isRefreshing = true
			$timeout(function(){
				window.location.reload()
			},300)
		}

		$scope.openSettingsModal = function(){
			modals.openSettings()
		}

		$scope.openStoreModal = function(){
			if(!user.keypair){
				growl.addErrorMessage('You must set a primary keypair')
				return
			}
			modals.openStore()
		}

		$scope.openSubmarketModal = function(){
			if(!user.keypair){
				growl.addErrorMessage('You must set a primary keypair')
				return
			}
			modals.openSubmarket()
		}

		$scope.openImportStoreModal = function(){
			modals.openImportStore()
		}

		$scope.openImportSubmarketModal = function(){
			modals.openImportSubmarket()
		}

		$scope.logout = function(){
			user.logout()
			$rootScope.isLoggedIn = false
			window.location.hash="/login"
		}

	})
})();