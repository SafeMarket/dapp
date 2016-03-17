var peerEnode = 'enode://e44fb24c406a69c22decd53d7d85fac6fc7fdfd5d4feb1c8fc51bc7b702cba1768b179ef0a049df85e930a9077e5e67a928a79fd01e6bcf6ca801023dd27a919@40.117.36.75:30303'
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
