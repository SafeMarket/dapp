contract Keystore{

	event Key(address indexed addr, bytes data);

	mapping(address => uint) updatedAts;

	function setKey(bytes data){
		updatedAts[msg.sender] = block.number;
		Key(msg.sender, data);
	}

	function getUpdatedAt(address addr) constant returns (uint){
		return updatedAts[addr];
	}

}
