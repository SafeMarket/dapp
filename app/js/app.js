(function(){

var app = angular.module('app',['safemarket','ui.bootstrap','ui.router','angular-growl','ngRoute','yaru22.angular-timeago','hc.marked'])

app.config(function(growlProvider,$stateProvider, $urlRouterProvider) {
    
    growlProvider.globalTimeToLive(3000);

    $stateProvider
    	.state('home',{
    		url:'/'
    		,templateUrl:'home.html'
    	})
    	.state('login',{
    		url:'/login'
    		,templateUrl:'login.html'
    		,controller:'LoginController'
    	})
    	.state('stores',{
    		url:'/stores/:storeAddr/:tabSlug'
    		,templateUrl:'store.html'
    		,controller:'StoreController'
    	})

    $urlRouterProvider.otherwise("/")

    	/*
    	.state('stores',
    		url:'/stores/:storeAddr/:tabSlug'
    		,templateUrl:'store.html'
    		,controller:'StoreController'
    	})
    	.state('stores',
    		url:'/stores/:storeAddr/:tabSlug'
    		,templateUrl:'store.html'
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
		*/

});

app.run(function(user,$rootScope,$interval,timeAgo){
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
	},30000)

	timeAgo.settings.allowFuture = true
})

})();