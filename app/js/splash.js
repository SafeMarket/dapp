(function(){

var splash = angular.module('splash',[]);

splash.run(function($timeout,$rootScope,$interval){

	var isAppBootstrapped = false
		,firstBlock

	function checkConnection(){
		console.log('Check Connection')
        $rootScope.isConnected = web3.isConnected()

        if(!$rootScope.isConnected) return

        $rootScope.syncing = web3.eth.syncing || blockchain.env == 'development'

        $rootScope.isSynced = 
        	($rootScope.syncing && $rootScope.syncing.currentBlock === $rootScope.syncing.highestBlock)
        	|| (!$rootScope.syncing && web3.eth.blockNumber>firstBlock);

        if(!firstBlock) firstBlock = web3.eth.blockNumber

        if(!isAppBootstrapped && $rootScope.isSynced){
        	console.log('Bootstrapping app...')
        	isAppBootstrapped = true
        	angular.bootstrap(document.getElementById('app'),['app'])
        }

    }

	function startup(){
	    console.log('Starting Web3...')
	    try{
	        web3.setProvider(new web3.providers.HttpProvider('http://'+blockchain.rpcHost+':'+blockchain.rpcPort));
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

})();