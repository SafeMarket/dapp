contract forumable is owned{
	address public forumAddr;

	function forumable(){
		var forum = new Forum();
		forumAddr = address(forum);
	}

	function setForumAddr(address _forumAddr){
		if(msg.sender != owner) throw;
		forumAddr = _forumAddr;
	}
}