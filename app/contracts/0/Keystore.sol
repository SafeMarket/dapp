contract Keystore{

	event Key(address indexed addr, bytes data);

	function setKey(bytes data){
		Key(msg.sender, data);
	}

}
