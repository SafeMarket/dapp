contract Submarket is forumable,audible{

	event Meta(bytes meta);
	bool constant public isSubmarket = true;

	function Submarket(bytes32 alias, bytes meta, address alasRegAddr){
		AliasReg(alasRegAddr).claimAlias(alias);
		Meta(meta);
	}
	
	function setMeta(bytes meta){
		if(msg.sender!=owner) throw;
		Meta(meta);
	}

}