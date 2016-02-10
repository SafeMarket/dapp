angular.module('app').controller('AffiliateController',function($scope,modals,user){

	function updateAffiliates(){
		$scope.affiliates = user.getAffiliates()
	}

	updateAffiliates()

	$scope.openAffiliateModal = function(affiliate){
		modals.openAffiliate(affiliate).result.then(updateAffiliates)
	}

	$scope.deleteAffiliate = function(affiliate){
		affiliate.delete().then(updateAffiliates)
	}
});