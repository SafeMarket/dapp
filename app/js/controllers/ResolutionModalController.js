/* globals angular, web3, _ */

angular.module('app').controller('ResolutionModalController', ($scope, $modalInstance, order) => {

  $scope.order = order
  $scope.percentBuyerRaw = '.5'

  $scope.$watch('percentBuyerRaw', (percentBuyerRaw) => {
    $scope.percentBuyer = web3.toBigNumber(percentBuyerRaw, 10)
    $scope.percentStoreOwner = $scope.percentBuyer.minus(1).times(-1)
  })

  $scope.cancel = function cancel() {
    $modalInstance.dismiss('cancel')
  }

  $scope.submit = function submit() {
    $scope.isSyncing = true
    order.resolve($scope.percentBuyer.times(100).round()).then(() => {
      $modalInstance.close()
    })
  }

})
