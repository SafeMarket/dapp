contract AliasReg {
	
	mapping(bytes32=>address) aliasToAddrMap;

	function claimAlias(bytes32 alias){
		if(aliasToAddrMap[alias] != address(0))
			throw;

		if(alias == '')
			throw;

		aliasToAddrMap[alias]=msg.sender;
	}

	function getAddr(bytes32 alias) constant returns(address){
		return aliasToAddrMap[alias];
	}

}