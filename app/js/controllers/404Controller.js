/* globals angular */

angular.module('app').controller('404Controller', ($scope, $stateParams) => {
  $scope.alias = $stateParams.alias
})
