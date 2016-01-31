contract audible is owned{

	function addComment(address forumAddr, bytes32 parentId, bytes data){
		if(msg.sender!=owner) throw;
		Forum(forumAddr).addComment(parentId,data);
	}

}