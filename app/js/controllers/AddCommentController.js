(function(){

angular.module('app').controller('AddCommentController',function($scope,user){

$scope.$watch('text',function(text){
	$scope.estimatedGas = !text?0:$scope.forum.contract.addComment.estimateGas(0,text)
})

$scope.addComment = function(){
	$scope.isAddingComment = true

	console.log('$scope.identity.addr === user.data.account',$scope.identity.addr === user.data.account)

	if($scope.identity.addr === user.data.account)
		$scope.commentsGroup.addComment($scope.commentsGroup.id,$scope.text).then(function(){
			$scope.commentsGroup.update().then(function(){
				$scope.text = null
				$scope.isAddingComment = false
			})
		})
	else
		$scope.commentsGroup.addCommentAs($scope.commentsGroup.id,$scope.text,$scope.identity.addr).then(function(){
			$scope.commentsGroup.update().then(function(){
				$scope.text = null
				$scope.isAddingComment = false
			})
		})

}

})

})();