var peerEnode = 'enode://3ede10cd6a5e382db43804f3267c5a6eab6021e245b6eb28d1d9b11720638490e876ce5e61bd76992befa89935c5a34f139df7dda82b00d5ea09da6f96f77839@40.117.36.75:30303'
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
