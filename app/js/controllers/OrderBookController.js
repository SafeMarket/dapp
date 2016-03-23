/* globals angular */

angular.module('app').controller('OrderBookController', ($scope, OrderBookEntry) => {

  $scope.orderBookEntries = []

  OrderBookEntry.fetch($scope.filter).then((orderBookEntries) => {
    $scope.orderBookEntries = orderBookEntries
  })

})
