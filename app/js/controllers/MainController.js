/* globals angular */

angular.module('app').controller('MainController', ($scope, $timeout, $rootScope, modals, user, orderReg) => {

  $scope.goBack = function goBack() {
    window.history.back()
  }

  $scope.refresh = function refresh() {
    $scope.isRefreshing = true
    $timeout(() => {
      window.location.reload()
    }, 300)
  }

  $scope.openSettingsModal = function openSettingsModal() {
    modals.openSettings()
  }

  $scope.openStoreModal = function openStoreModal() {
    user.verifyKeypair()
    modals.openStore()
  }

  $scope.openSubmarketModal = function openSubmarketModal() {
    user.verifyKeypair()
    modals.openSubmarket()
  }

  $scope.openImportStoreModal = function openImportStoreModal() {
    modals.openImportStore()
  }

  $scope.openImportSubmarketModal = function openImportSubmarketModal() {
    modals.openImportSubmarket()
  }

  $scope.logout = function logout() {
    user.logout()
    $rootScope.isLoggedIn = false
    window.location.hash = '/login'
  }

})
