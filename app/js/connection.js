var isConnected = false
	,syncing = {}

while(!isConnected || syncing){
	isConnected = web3.isConnected()
    syncing = web3.eth.syncing

	if(!isConnected)
		alert('Could not connect to Ethereum node. Make sure (1) the node is running and (2) your account is unlocked.')
	

	if(syncing)
		alert('Still syncing your Ethereum node. On block '+syncing.currentBlock+' of '+syncing.highestBlock+'.')
	
}
