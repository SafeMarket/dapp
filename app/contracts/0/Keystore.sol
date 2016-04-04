contract Keystore{

	mapping(address => Key) keys;

	struct Key{
		uint timestamp;
		uint8[32] byt;
	}

	function setKey(uint8[32] byt){
		keys[msg.sender] = Key(now, byt);
	}

	function getKeyParams(address addr) constant returns (uint, uint8[32]){
		return (keys[addr].timestamp, keys[addr].byt);
	}

}
