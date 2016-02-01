contract Forum is owned{
	
	event Comment(address indexed author, bytes32 indexed parentId, bytes data);
	event Moderation(bytes indexed comment, uint8 direction);

	function addComment(bytes32 parentId, bytes data){
		Comment(msg.sender, parentId, data);
	}
	
}
