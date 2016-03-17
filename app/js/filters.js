angular.module('app').filter('currency',function(utils){
	return function(amount,currencyFrom,currencyTo){

		if(amount===undefined) return undefined

		if(currencyTo)
			amount = utils.convertCurrency(amount,{from:currencyFrom,to:currencyTo})
		else
			currencyTo = currencyFrom

		return utils.formatCurrency(amount,currencyTo,true)
	}
});

angular.module('app').filter('perun',function(){
	return function(perun){
		if(!isNaN(perun))
			perun = web3.toBigNumber(perun)

		if(perun === undefined)
			return ''
		else if(!perun.isFinite())
			return 'Infinity%'
		else
			return perun.times(100).toFixed(2).toString()+'%'
	}
});

angular.module('app').filter('fromWei',function(){
	return function(amount,to){
		return web3.fromWei(amount,to).toString()
	}
});

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
});

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

angular.module('app').filter('status',function(){
	return function(status){
		return [
			'Initialized'
			,'Cancelled'
			,'Shipped'
			,'Finalized'
			,'Disputed'
			,'Resolved'
		][status]
	}
});

angular.module('app').filter('disputeSeconds',function(){
	return function(disputeTime){

		if(disputeTime===undefined)
			return ''

		var disputeTime = web3.toBigNumber(disputeTime)

		if(disputeTime.equals(0))
			return "No Disputes Allowed"

		return disputeTime.div(86400).floor().toString()+' Days After Shipping'
	}
});

angular.module('app').filter('alias',function(utils){
	return function(addr){
		return utils.getAlias(addr)
	}
});