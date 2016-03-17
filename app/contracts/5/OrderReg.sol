contract OrderReg is owned{

	StoreReg storeReg;
	SubmarketReg submarketReg;

	function setStoreReg(address storeRegAddr){
		requireOwnership();
		storeReg = StoreReg(storeRegAddr);
	}

	function setSubmarketReg(address submarketRegAddr){
		requireOwnership();
		submarketReg = SubmarketReg(submarketRegAddr);
	}

	address[] registeredAddrsArray;
	mapping(address=>bool) registeredAddrsMap;

	event Registration(address orderAddr);

	function create(address buyer, address storeAddr, address submarketAddr, address affiliate, uint bounty, uint rewardMax, bytes meta){

		if(!storeReg.isRegistered(storeAddr))
			throw;

		if(submarketAddr != address(0) && !submarketReg.isRegistered(submarketAddr))
			throw;

		var order = new Order(buyer, storeAddr, submarketAddr, affiliate, bounty, rewardMax, meta);
		var orderAddr = address(order);
				
		registeredAddrsArray.push(orderAddr);
		registeredAddrsMap[orderAddr] = true;

		Registration(orderAddr);

		if(!orderAddr.send(msg.value))
			throw;

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