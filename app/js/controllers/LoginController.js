/* globals angular */

angular.module('app').controller('LoginController', ($scope, $rootScope, user, growl, modals) => {

  $rootScope.userExists = user.verifyExistence()

  $scope.login = function login() {

    if (!user.login($scope.password)) {
      growl.addErrorMessage('Sorry, thats not correct')
      return
    }

    growl.addSuccessMessage('Login successful!')
    window.location.hash = '/'
  }

  $scope.reset = function reset() {

    if (!confirm('Are you sure? All SafeMarket data located on this computer will be destroyed and you will not be able to recover it.')) {
      return
    }

    user.reset()
    growl.addSuccessMessage('Account reset')

  }

  $scope.register = function register() {

    if (!$scope.password) {
      growl.addErrorMessage('You must choose a password')
      return
    }

    if ($scope.password !== $scope.password1) {
      growl.addErrorMessage('Passwords do not match')
      return
    }

    user.register($scope.password)

    growl.addSuccessMessage('Account created')

    modals.openSettings()

  }

})
