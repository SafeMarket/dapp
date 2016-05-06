/* globals angular */

angular.module('app').controller('OrdersController', ($scope, Order) => {
  $scope.orders = Order.byFilter($scope.filter, 0, 10)
  console.log($scope.orders)
})
