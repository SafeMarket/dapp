(function(){

var app = angular.module('app',['safemarket','ui.bootstrap','angular-growl','ngRoute','yaru22.angular-timeago','hc.marked'])

app.config(function(growlProvider,$routeProvider) {
    
    growlProvider.globalTimeToLive(3000);

    $routeProvider
    	.when('/',{
    		templateUrl:'home.html'
    	})
    	.when('/login',{
    		templateUrl:'login.html'
    		,controller:'LoginController'
    	})
    	.when('/stores/:storeAddr',{
	    	templateUrl:'store.html'
	    	,controller:'StoreController'
	    })
	    .when('/markets/:marketAddr',{
	    	templateUrl:'market.html'
	    	,controller:'MarketController'
	    }).when('/orders/:orderAddr',{
	    	templateUrl:'order.html'
	    	,controller:'OrderController'
	    }).when('/404/:alias',{
	    	templateUrl:'404.html'
	    	,controller:'404Controller'
	    })

});

app.run(function(user,$rootScope,$interval){
	user.password = 'password'
	if(user.password){
		$rootScope.isLoggedIn = true
		user.loadData()
	}else{
		$rootScope.isLoggedIn = false
		window.location.hash='/login'
	}

	$rootScope.isConnected = web3.isConnected()
	$interval(function(){
		$rootScope.isConnected = web3.isConnected()
	},1000)
})

})();