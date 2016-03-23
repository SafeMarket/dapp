/* globals angular */

angular.module('app').controller('SubmarketController', ($scope, $state, Submarket, user, $stateParams, modals) => {

  $scope.submarket = new Submarket($stateParams.submarketAddr, true)
  $scope.addr = $stateParams.submarketAddr
  $scope.user = user

  $scope.openSubmarketModal = function openSubmarketModal() {
    modals
      .openSubmarket($scope.submarket)
      .result.then(() => {
        $scope.submarket.update()
      })
  }

  $scope.openAliasesModal = function openAliasesModal() {
    modals
      .openAliases($scope.submarket)
      .result.then(() => {
        $scope.submarket.update()
      })
  }

  $scope.tabs = [
    { heading: 'About', route: 'submarket.about', active: false },
    { heading: 'Stores', route: 'submarket.stores', active: false },
    { heading: 'Forum', route: 'submarket.forum', active: false },
    { heading: 'All Orders', route: 'submarket.orders', active: false }
  ]

  $scope.go = function go(route) {
    $state.go(route)
  }

  $scope.$on('$stateChangeSuccess', () => {
    $scope.tabs.forEach((tab) => {
      tab.active = $state.is(tab.route)
    })
  })
})
