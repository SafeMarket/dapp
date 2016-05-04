contract OrderReg is owned{

	StoreReg storeReg;
	SubmarketReg submarketReg;
	address tickerAddr;

	function setStoreReg(address storeRegAddr){
		requireOwnership();
		storeReg = StoreReg(storeRegAddr);
	}

	function setSubmarketReg(address submarketRegAddr){
		requireOwnership();
		submarketReg = SubmarketReg(submarketRegAddr);
	}

	function setTickerAddr(address _tickerAddr){
		requireOwnership();
		tickerAddr = _tickerAddr;
	}

	address[] registeredAddrsArray;
	mapping(address=>bool) registeredAddrsMap;

	event Registration(address orderAddr);

	function create(
		address buyer,
		address storeAddr,
		address submarketAddr,
		address affiliate,
		uint[] productIndexes,
		uint[] productQuantities,
		uint transportIndex,
		uint bounty,
		uint rewardMax
	){

		if(!storeReg.isRegistered(storeAddr))
			throw;

		if(submarketAddr != address(0) && !submarketReg.isRegistered(submarketAddr))
			throw;

		var order = new Order(
			buyer,
			storeAddr,
			submarketAddr,
			affiliate,
			productIndexes,
			productQuantities,
			transportIndex,
			bounty,
			rewardMax,
			tickerAddr
		);


		if(msg.value < order.getMinimumBalance())
			throw;

		if(!order.send(msg.value))
			throw;

		var orderAddr = address(order);
				
		registeredAddrsArray.push(orderAddr);
		registeredAddrsMap[orderAddr] = true;

		Registration(orderAddr);
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