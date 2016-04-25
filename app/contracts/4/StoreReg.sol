contract StoreReg is owned{

	uint version1;
	uint version2;

	address[] registeredAddrsArray;
	mapping(address=>bool) registeredAddrsMap;

	address public infosphereAddr;
	address public aliasRegAddr;

	function setInfosphereAddr(address _infosphereAddr){
		requireOwnership();
		infosphereAddr = _infosphereAddr;
	}

	function setAliasRegAddr(address _aliasRegAddr){
		requireOwnership();
		aliasRegAddr = _aliasRegAddr;
	}

	event Registration(address storeAddr);

	function create(address owner, bool isOpen, bytes32 currency, uint bufferCentiperun, uint disputeSeconds, uint minTotal, uint affiliateFeeCentiperun, bytes32 fileHash, bytes32 alias){

		var store = new Store();
		var storeAddr = address(store);
		
		store.setInfosphere(infosphereAddr);
		store.setAliasReg(aliasRegAddr);

		store.setBool('isOpen',isOpen);
		store.setBytes32('currency',currency);
		store.setUint('bufferCentiperun',bufferCentiperun);
		store.setUint('disputeSeconds',disputeSeconds);
		store.setUint('minTotal',minTotal);
		store.setUint('affiliateFeeCentiperun',affiliateFeeCentiperun);
		store.setBytes32('fileHash', fileHash);

		if(alias!='')
			store.setAlias(alias);

		store.setOwner(owner);

		registeredAddrsArray.push(storeAddr);
		registeredAddrsMap[storeAddr] = true;

		Registration(storeAddr);

	}

	function isRegistered(address addr) constant returns(bool){
		return registeredAddrsMap[addr];
	}

	function count() constant returns(uint){
		return registeredAddrsArray.length;
	}

	function getStoreAddr(uint index) constant returns(address){
		return registeredAddrsArray[index];
	}
}