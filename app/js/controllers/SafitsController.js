/* globals angular */

angular.module('app').controller('SafitsController', ($scope, safitsReg, user) => {
  $scope.logs = safitsReg.getLogs(user.getAccount())
  console.log($scope.logs)
})
