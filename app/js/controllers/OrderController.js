/* globals angular, _ */

angular.module('app').controller('OrderController', ($scope, Order, pgp, user, $stateParams, modals) => {

  $scope.order = new Order($stateParams.orderAddr)

  let isOrderUpdated = false

  $scope.order.updatePromise.then((order) => {
    $scope.userRole = order.getRoleForAddr(user.getAccount())
    isOrderUpdated = true
  })

  function setMessagesAndUpdates() {

    if (!isOrderUpdated) {
      return
    }

    let messagesAndUpdates = []

    if (Array.isArray($scope.order.messages)) {
      messagesAndUpdates = messagesAndUpdates.concat($scope.order.messages)
    }

    if (Array.isArray($scope.order.updates)) {
      messagesAndUpdates = messagesAndUpdates.concat($scope.order.updates)
    }

    $scope.messagesAndUpdates = messagesAndUpdates

  }

  $scope.$watch('order.messages', setMessagesAndUpdates, true)
  $scope.$watch('order.updates', setMessagesAndUpdates, true)


  $scope.addMessage = function addMessage() {

    const keys = _.map($scope.order.keys, (key) => { return key.key })

    pgp.encrypt(keys, $scope.messageText).then((pgpMessage) => {
      $scope.order.addMessage(pgpMessage).then(() => {
        $scope.messageText = ''
        $scope.order.update()
      })
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
