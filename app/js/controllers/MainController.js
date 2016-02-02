(function(){
	angular.module('app').controller('MainController',function($scope,$timeout,$rootScope,modals,user,growl){

		$scope.$watch('account',function(){
			$rootScope.orderAddrs = user.getOrderAddrs()
			$rootScope.storeAddrs = user.getStoreAddrs()
			$rootScope.submarketAddrs = user.getSubmarketAddrs()
		})

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
			user.verifyKeypair().then(function(){
				modals.openStore()
			})
		}

		$scope.openSubmarketModal = function(){
			user.verifyKeypair().then(function(){
				modals.openSubmarket()
			})
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