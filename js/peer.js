var peerEnode = 'enode://475fe94bef9111e5002308722033ef6906e4ef865f53668c19712342bd666aa4d673c57ee59acfab01945e95c3013673f23dda774fff21eec60cc8b95a235421@40.117.36.75:30303'
console.log('Adding peer with enode',peerEnode)

admin.addPeer(peerEnode)

var interval = setInterval(function(){

	if(!admin.peers || admin.peers.length === 0){
		console.log('Waiting to connect...')
		return
	}

	console.log('Connected to peer',admin.peers[0].id)
	clearInterval(interval)

},1000)
