(function(){

angular.module('app').filter('currency',function(safemarket){
	return function(amount,currencyFrom,currencyTo){

		if(amount===undefined) return undefined

		if(currencyTo)
			amount = safemarket.utils.convertCurrency(amount,{from:currencyFrom,to:currencyTo})
		else
			currencyTo = currencyFrom

		return safemarket.utils.formatCurrency(amount,currencyTo)
	}
})

angular.module('app').filter('percentage',function(safemarket){
	return function(percent){
		if(!isNaN(percent))
			percent = new BigNumber(percent)

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

angular.module('app').filter('shortAddr',function(){
	return function(addr){
		if(!addr)
			return ''
		else
			return addr.substr(0,8)+'...'
	}
})

angular.module('app').filter('url',function(helpers){
	return function(addr,type){
		return helpers.getUrl(type,addr)
	}
})

angular.module('app').filter('orderObjectBy', function() {
  	return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
    	filtered.push(item);
    });
    filtered.sort(function (a, b) {
    	return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    	return filtered;
  	};
});

angular.module('app').filter('reverse', function() {
	return function(items) {
    	return items.slice().reverse();
  	};
});


})();