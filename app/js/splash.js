var splash = angular.module('splash',[]);

splash.run(function($timeout,$rootScope,$interval){

	var isAppBootstrapped = false

	function checkConnection(){
        $rootScope.isConnected = web3.isConnected()
        $rootScope.syncing = web3.eth.syncing || blockchain.env == 'development'

        if(!isAppBootstrapped && $rootScope.syncing && $rootScope.syncing.currentBlock === $rootScope.syncing.highestBlock){
        	console.log('Bootstrapping app...')
        	isAppBootstrapped = true
        	angular.bootstrap(document.getElementById('app'),['app'])
        }
        	
    }

	function startup(){
	    console.log('Starting Web3...')
	    try{
	        web3.setProvider(new web3.providers.HttpProvider('http://'+blockchain.rpcHost+':'+blockchain.rpcPort));
	        web3.eth.defaultAccount = web3.eth.accounts[0]
	        console.log('Web3 started.')
	    }catch(e){
	        setTimeout(startup,1000)
	        return
	    };

	    checkConnection()
	    $interval(checkConnection,1000)
	}

	startup()
})