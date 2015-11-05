(function(){

angular.module('app').factory('PgpMessageWrapper',function(){
	return function PgpMessageWrapper(ciphertext){
		var pgpMessageWrapper = this
			,packetlist = new openpgp.packet.List

		packetlist.read(ciphertext)

		this.pgpMessage = openpgp.message.Message(packetlist)
		this.pgpMessageArmored = this.pgpMessage.armor()
		this.keyIds = []

		this.pgpMessage.packets.forEach(function(packet){
			if(!packet.publicKeyId) return true
			if(pgpMessageWrapper.keyIds.indexOf(packet.publicKeyId.bytes)>-1) return true


			pgpMessageWrapper.keyIds.push(packet.publicKeyId.bytes)
		})
	}
})

})();