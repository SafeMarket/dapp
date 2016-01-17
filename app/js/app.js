var app = angular.module('app',['ui.bootstrap','ui.router','angular-growl','ngRoute','yaru22.angular-timeago','hc.marked']);

app.config(function(growlProvider,$stateProvider, $urlRouterProvider) {

    web3.setProvider(new web3.providers.HttpProvider('http://'+blockchain.rpcHost+':'+blockchain.rpcPort));
    web3.eth.defaultAccount = web3.eth.accounts[0]
    
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
        .state('submarket',{
            abstract:true
            ,url:'/submarkets/:submarketAddr'
            ,templateUrl:'submarket.html'
            ,controller:'SubmarketController'
        })
            .state('submarket.about',{
                url:'/about'
                ,templateUrl:'submarket.about.html'
            })
            .state('submarket.stores',{
                url:'/stores'
                ,templateUrl:'submarket.stores.html'
            })
            .state('submarket.forum',{
                url:'/forum'
                ,templateUrl:'submarket.forum.html'
            })
            .state('submarket.orders',{
                url:'/orders'
                ,templateUrl:'submarket.orders.html'
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

app.run(function(user,$rootScope,$interval,timeAgo,user){

    //if electron
    //TODO: find better way of determining if electron is available
    if(!window.module){
        user.password = 'password'
        $rootScope.isLoggedIn = true
    }


    if(user.password){
		$rootScope.isLoggedIn = true
		user.init()
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

    $rootScope.user = user
});