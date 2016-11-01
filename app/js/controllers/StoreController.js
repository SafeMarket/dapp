/* globals angular, web3, _ */

angular.module('app').controller('StoreController', ($scope, $filter, $state, utils, Store, Submarket, user, $stateParams, modals, growl, helpers, constants, orderReg) => {

  $scope.storeAddr = $stateParams.storeAddr
  $scope.store = new Store($stateParams.storeAddr)
  $scope.safemarketFeeMilliperun = orderReg.contract.safemarketFeeMilliperun()

  $scope.tabs = [
    { heading: 'About', route: 'store.about', active: false },
    { heading: 'Products', route: 'store.products', active: false },
    { heading: 'Orders', route: 'store.orders', active: false }
  ]

  $scope.go = function go(route) {
    $state.go(route)
  }

  $scope.$on('$stateChangeSuccess', () => {
    $scope.tabs.forEach((tab) => {
      tab.active = $state.is(tab.route)
    })
  })

  $scope.$watch('userCurrency', setDisplayCurrencies)

  function setDisplayCurrencies() {
    $scope.displayCurrencies = _.uniq([user.getCurrency(), $scope.store.currency, 'ETH'])
  }

  $scope.store.updatePromise.then((store) => {
    setDisplayCurrencies()
  }, (err) => {
    growl.addErrorMessage(err)
  })

  $scope.openStoreModal = function openStoreModal() {
    modals
      .openStore($scope.store)
      .result.then((store) => {
        $scope.store = store
      })
  }

})
