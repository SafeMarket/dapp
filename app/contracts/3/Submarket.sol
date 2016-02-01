contract Submarket is forumable,audible,infosphered{

	event Meta(bytes meta);

	function Submarket(bytes32 alias, bytes meta, address alasRegAddr, address infosphereAddr){
		infosphere = Infosphere(infosphereAddr);
		AliasReg(alasRegAddr).claimAlias(alias);
		Meta(meta);
	}
	
	function setMeta(bytes meta){
		if(msg.sender!=owner) throw;
		Meta(meta);
	}

}