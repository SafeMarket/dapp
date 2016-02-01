contract audible is owned{

	function addComment(address forumAddr, bytes32 parentId, bytes data){
		this.requireOwnership();
		Forum(forumAddr).addComment(parentId,data);
	}

}