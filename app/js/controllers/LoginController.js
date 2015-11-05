(function(){

angular.module('app').controller('LoginController',function($scope,$rootScope,user,growl,modals){
	$scope.userExists = !! user.getStorage()

	$scope.login = function(){
		var isPassword = user.checkPassword($scope.password)
		
		if(!isPassword){
			growl.addErrorMessage('Sorry, thats not correct')
			return
		}

		user.password = $scope.password
		user.loadData()

		growl.addSuccessMessage('Login successful!')
		$rootScope.isLoggedIn = true

		window.location.hash="/"
	}

	$scope.reset = function(){
		if(!confirm('Are you sure? All SafeMarket data located on this computer will be destroyed and you will not be able to recover it.'))
			return

		user.reset()
		$scope.userExists = false
		growl.addSuccessMessage('Account reset')
	}

	$scope.register = function(){

		if(!$scope.password){
			growl.addErrorMessage('You must choose a password')
			return
		}
		
		if($scope.password != $scope.password1){
			growl.addErrorMessage('Passwords do not match')
			return
		}

		user.password = $scope.password
		user.loadData()
		user.save()

		growl.addSuccessMessage('Account created')
		$rootScope.isLoggedIn = true

		window.location.hash = '/'
		modals.openSettings()
	}

})


})();