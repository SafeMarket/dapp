(function(){

var splash = angular.module('splash',[]);

splash.run(function($timeout,$rootScope,$interval){

	var isAppBootstrapped = false
		,firstBlock

	function checkConnection(){
        $rootScope.isConnected = web3.isConnected()

        if(!$rootScope.isConnected) return

        $rootScope.syncing = web3.eth.syncing || blockchain.env == 'development'

        $rootScope.isSynced = 
        	($rootScope.syncing && $rootScope.syncing.currentBlock === $rootScope.syncing.highestBlock)
        	|| (!$rootScope.syncing && web3.eth.blockNumber>firstBlock);

        if(!firstBlock) firstBlock = web3.eth.blockNumber

        if(!isAppBootstrapped && $rootScope.isSynced){
        	isAppBootstrapped = true
        	angular.bootstrap(document.getElementById('app'),['app'])
        }

    }

	function startup(){
	    try{
	    	window.web3 = new Web3
	        web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:'+blockchain.rpcport));
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