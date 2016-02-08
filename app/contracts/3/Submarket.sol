contract Submarket is forumable,audible,infosphered,meta{

	function Submarket(bytes32 alias, bytes meta, address alasRegAddr, address infosphereAddr){
		infosphere = Infosphere(infosphereAddr);
		AliasReg(alasRegAddr).claimAlias(alias);
		setMeta(meta);
	}
	
}