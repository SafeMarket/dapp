/* globals angular, _ */

angular.module('app').controller('OrderController', ($scope, Order, user, $stateParams, modals, utils) => {

  $scope.order = new Order($stateParams.orderAddr)

  let isOrderUpdated = false

  $scope.order.updatePromise.then((order) => {
    $scope.userRole = order.getRoleForAddr(user.getAccount())
    isOrderUpdated = true
  })

  $scope.addMessage = function addMessage() {
    $scope.order.addMessage($scope.messageText).then(() => {
      $scope.messageText = ''
      $scope.order.update()
    })
  }

  $scope.cancel = function cancel() {
    $scope.order.cancel().then(() => {
      $scope.order.update()
    })
  }

  $scope.markAsShipped = function cancel() {
    $scope.order.markAsShipped().then(() => {
      $scope.order.update()
    })
  }

  $scope.dispute = function dispute() {
    $scope.order.dispute().then(() => {
      $scope.order.update()
    })
  }

  $scope.finalize = function finalize() {
    $scope.order.finalize().then(() => {
      $scope.order.update()
    })
  }

  $scope.openResolutionModal = function openResolution() {
    modals.openResolution($scope.order).result.then(() => {
      $scope.order.update()
    })
  }

  $scope.makePayment = function makePayment() {
    modals.openPayment($scope.order.addr, $scope.order.unpaid, 'WEI').result.then(() => {
      $scope.order.update()
    })
  }

  $scope.makeWithdrawl = function makeWithdrawl() {
    modals.openWithdrawl($scope.order).result.then(() => {
      $scope.order.update()
    })
  }

  $scope.leaveReview = function leaveReview() {
    modals.openLeaveReview($scope.order).result.then(() => {
      $scope.order.update()
    })
  }

})
