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

	address[] addrs;
	mapping(address=>bool) addrsMap;
	mapping(address=>address[]) addrsByStoreAddr;
	mapping(address=>address[]) addrsBySubmarketAddr;

	event Registration(address orderAddr, address indexed storeAddr, address indexed submarketAddr);

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

		var order = new Order();
		var orderAddr = address(order);
		addrs.push(orderAddr);
		addrsMap[orderAddr] = true;

		order.create.value(msg.value)(
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
		
		addrsByStoreAddr[storeAddr].push(orderAddr);

		if(submarketAddr != address(0)){
			addrsBySubmarketAddr[submarketAddr].push(orderAddr);
		}

		Registration(orderAddr, storeAddr, submarketAddr);
	}

	function isRegistered(address addr) constant returns(bool){
		return addrsMap[addr];
	}

	function getAddrsLength() constant returns(uint){
		return addrs.length;
	}

	function getAddr(uint index) constant returns(address){
		return addrs[index];
	}

	function getAddrsByStoreAddrLength(address storeAddr) constant returns(uint){
		return addrsByStoreAddr[storeAddr].length;
	}

	function getAddrByStoreAddr(address storeAddr, uint index) constant returns(address){
		return addrsByStoreAddr[storeAddr][index];
	}

	function getAddrsBySubmarketAddrLength(address storeAddr) constant returns(uint){
		return addrsBySubmarketAddr[storeAddr].length;
	}

	function getAddrBySubmarketAddr(address storeAddr, uint index) constant returns(address){
		return addrsBySubmarketAddr[storeAddr][index];
	}
}