/* globals angular */

angular.module('app').controller('AddCommentController', ($scope, user) => {

  $scope.$watch('text', (text) => {
    $scope.estimatedGas = !text ? 0 : $scope.forum.contract.addComment.estimateGas(0, text)
  })

  $scope.addComment = function addComment() {
    $scope.isAddingComment = true

    if ($scope.identity.addr === user.data.account) {
      $scope.commentsGroup.addComment($scope.commentsGroup.id, $scope.text).then(() => {
        $scope.commentsGroup.update().then(() => {
          $scope.text = null
          $scope.isAddingComment = false
        })
      })
    } else {
      $scope
        .commentsGroup.addCommentAs($scope.commentsGroup.id, $scope.text, $scope.identity.addr)
        .then(() => {
          $scope.commentsGroup.update().then(() => {
            $scope.text = null
            $scope.isAddingComment = false
          })
        })
    }
  }
})
