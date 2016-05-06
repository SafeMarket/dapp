/* globals angular */

angular.module('app').controller('SetReviewModalController', ($scope, $modalInstance, order) => {

  $scope.score = 3
  $scope.scores = [0, 1, 2, 3, 4, 5]

  $scope.cancel = function cancel() {
    $modalInstance.dismiss('cancel')
  }

  $scope.submit = function submit() {
    order.setReview($scope.score, $scope.text).then(() => {
      $modalInstance.close()
    })
  }

})
