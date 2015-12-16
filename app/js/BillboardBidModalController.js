(function(){

angular.module('app').controller('BillboardBidModalController',function($scope,slot,utils,user,growl,$modalInstance){
	$scope.slot = slot
	$scope.userCurrency = user.data.currency
	$scope.identities = user.getIdentities()

	$scope.bidInEther = utils.convertCurrency(slot.minimumBid,{from:'WEI',to:'ETH'})

	if(user.data.currency !=='ETH'){
		$scope.$watch('bidInEther',function(bidInEther){
			$scope.bidInUserCurrency = utils.convertCurrency(bidInEther,{
				from:'ETH'
				,to:user.data.currency
			})
		})
	}

	$scope.cancel = function(){
		$modalInstance.dismiss('cancel')
	}

	$scope.submit = function(){
		try{
			utils.check({
				bid:utils.convertCurrency($scope.bidInEther,{from:'ETH',to:'WEI'}).toNumber()
				,text:$scope.text
			},{
				bid:{
					presence:true
					,type:'number'
					,numericality:{
						integer:true
						,greaterThanOrEqualTo:slot.minimumBid.toNumber()
					}
				},text:{
					presence:true
					,type:'string'
					,length:{
						lessThanOrEqualTo:140
					}
				}
			})
		}catch(e){
			return growl.addErrorMessage(e)
		}

		$scope.isSyncing = true

		console.log('slot.index',slot.index)

		var data = utils.convertObjectToHex({text:$scope.text})
			,value = utils.convertCurrency($scope.bidInEther,{from:'ETH',to:'WEI'}).toNumber()
			,gas = Billboard.bidOnSlot.estimateGas(slot.index,data)
			
		console.log('data',data)
		console.log('value',value)

		var txHex = Billboard.bidOnSlot(slot.index,data,{
				value:value
				,gas:gas*2
			})

		utils.waitForTx(txHex).then(function(){
			$scope.isSyncing = false
			$modalInstance.close()
		})

	}
})

})();