contract aliasable is owned{

	AliasReg aliasReg;
	
	function setAliasReg(address aliasRegAddr){
		requireOwnership();
		aliasReg = AliasReg(aliasRegAddr);
	}

	function setAlias(bytes32 alias){
		requireOwnership();
		aliasReg.claimAlias(alias);
	}

}