(function(){

angular.module('app').filter('currency',function(safemarket){
	return function(amount,currency){
		if(amount===undefined) return undefined

		return safemarket.utils.formatCurrency(amount,currency)
	}
})

angular.module('app').filter('percentage',function(safemarket){
	return function(percent){
		if(percent === undefined)
			return ''
		else if(!percent.isFinite())
			return 'Infinity%'
		else
			return percent.times(100).toFixed(2).toString()+'%'
	}
})

angular.module('app').filter('fromWei',function(){
	return function(amount,to){
		return web3.fromWei(amount,to).toString()
	}
})

angular.module('app').filter('capitalize', function() {
 	return function(input) {
    	if (input!=null)
    	input = input.toLowerCase();
    	return input.substring(0,1).toUpperCase()+input.substring(1);
  	}
});

})();