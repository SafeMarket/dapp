contract AliasReg {
	mapping(address=>bytes32) addrToAliasMap;
	mapping(bytes32=>address) aliasToAddrMap;

	function claimAlias(bytes32 alias){
		if(aliasToAddrMap[alias] != address(0)) throw;

		addrToAliasMap[msg.sender]=alias;
		aliasToAddrMap[alias]=msg.sender;
	}

	function getAlias(address addr) constant returns(bytes32){
		return addrToAliasMap[addr];
	}

	function getAddr(bytes32 alias) constant returns(address){
		return aliasToAddrMap[alias];
	}

}