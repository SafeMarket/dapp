/* globals angular */

angular.module('app').controller('SubmarketController', ($scope, $state, Submarket, Store, user, $stateParams, modals) => {

  $scope.submarket = new Submarket($stateParams.submarketAddr, true)
  console.log($scope.submarket)
  $scope.addr = $stateParams.submarketAddr
  $scope.user = user
  $scope.stores = $scope.submarket.approvesAliases.approvedAliases.map((alias) => {
    return new Store(alias)
  })

  $scope.openSubmarketModal = function openSubmarketModal() {
    modals
      .openSubmarket($scope.submarket)
      .result.then((submarket) => {
        $scope.submarket = submarket
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
