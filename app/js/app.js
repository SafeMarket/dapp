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
    	.state('store',{
            abstract:true
    		,url:'/stores/:storeAddr'
    		,templateUrl:'store.html'
    		,controller:'StoreController'
    	})
            .state('store.about',{
                url:'/about'
                ,templateUrl:'store.about.html'
            })
            .state('store.products',{
                url:'/products'
                ,templateUrl:'store.products.html'
            })
            .state('store.orders',{
                url:'/orders'
                ,templateUrl:'store.orders.html'
            })
            .state('store.reviews',{
                url:'/reviews'
                ,templateUrl:'store.reviews.html'
            })
        .state('market',{
            abstract:true
            ,url:'/markets/:marketAddr'
            ,templateUrl:'market.html'
            ,controller:'MarketController'
        })
            .state('market.about',{
                url:'/about'
                ,templateUrl:'market.about.html'
            })
            .state('market.stores',{
                url:'/stores'
                ,templateUrl:'market.stores.html'
            })
            .state('market.forum',{
                url:'/forum'
                ,templateUrl:'market.forum.html'
            })
            .state('market.orders',{
                url:'/orders'
                ,templateUrl:'market.orders.html'
            })
        .state('order',{
            url:'/orders/:orderAddr'
            ,templateUrl:'order.html'
            ,controller:'OrderController'
        })
        .state('404',{
            url:'/404/:alias'
            ,templateUrl:'404.html'
            ,controller:'404Controller'
        })

    $urlRouterProvider.otherwise('/')
});

app.run(function(user,$rootScope,$interval,timeAgo){

    //if electron
    //TODO: find better way of determining if electron is available
    if(!window.module){
        user.password = 'password'
        $rootScope.isLoggedIn = true
    }

	
    if(user.password){
		$rootScope.isLoggedIn = true
		user.loadData()
	}else{
		$rootScope.isLoggedIn = false
		window.location.hash='/login'
	}

    function checkConnection(){
        $rootScope.isConnected = web3.isConnected()
        $rootScope.syncing = web3.eth.syncing
    }

    checkConnection()

	$interval(checkConnection,1000)

	timeAgo.settings.allowFuture = true
})

})();