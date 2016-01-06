(function(){

angular.module('app').controller('LeaveReviewModalController',function($scope,$modalInstance,order,utils){

	$scope.score = 3 
	$scope.scores = [0,1,2,3,4,5]

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		order.leaveReview($scope.score,$scope.text).then(function(){
			$modalInstance.close()
		})

	}

})


})();