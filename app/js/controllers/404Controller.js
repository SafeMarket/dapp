(function(){

angular.module('app').controller('404Controller',function($scope,$routeParams){
	$scope.alias = $routeParams.alias
})

})();