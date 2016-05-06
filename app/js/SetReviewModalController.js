/* globals angular */

angular.module('app').controller('SetReviewModalController', ($scope, $modalInstance, order) => {

  $scope.isSubmarket = !!order.submarket
  $scope.storeScore = order.review.isSet ? order.review.storeScore : 3
  $scope.submarketScore = order.review.isSet ? order.review.submarketScore : ($scope.isSubmarket ? 3 : 0)

  $scope.text = order.review.text
  $scope.scores = [0, 1, 2, 3, 4, 5]

  $scope.cancel = function cancel() {
    $modalInstance.dismiss('cancel')
  }

  $scope.submit = function submit() {
    order.setReview($scope.storeScore, $scope.submarketScore, $scope.text).then(() => {
      $modalInstance.close()
    })
  }

})
