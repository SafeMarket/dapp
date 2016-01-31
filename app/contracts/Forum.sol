contract Forum is owned{
	
	uint public fee;

	event Comment(address indexed author, bytes32 indexed parentId, bytes data);
	event Moderation(bytes indexed comment, uint8 direction);

	function addComment(bytes32 parentId, bytes data){
		Comment(msg.sender, parentId, data);
	}

	function setFee(uint _fee){
		if(msg.sender != owner) throw;
		fee = _fee;
	}
	
}
