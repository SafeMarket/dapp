contract OrderReg is owned{

	event Registration(address orderAddr);

	SafitsReg safitsReg;
	StoreReg storeReg;
	SubmarketReg submarketReg;
	Ticker ticker;

	uint public safemarketFeeMilliperun = 30;

	function set(address safitsRegAddr, address storeRegAddr, address submarketRegAddr, address tickerAddr){
		requireOwnership();
		safitsReg = SafitsReg(safitsRegAddr);
		storeReg = StoreReg(storeRegAddr);
		submarketReg = SubmarketReg(submarketRegAddr);
		ticker = Ticker(tickerAddr);
	}

	address[] addrs;
	mapping(address=>bool) addrsMap;
	mapping(address=>address[]) addrsByStoreAddr;
	mapping(address=>address[]) addrsBySubmarketAddr;

	function create(
		address buyer,
		address storeAddr,
		address submarketAddr,
		address affiliate,
		uint[] productIndexes,
		uint[] productQuantities,
		uint transportIndex,
		uint orderTotal
	){

		if(!storeReg.isRegistered(storeAddr))
			throw;

		bool usesSubmarket = (submarketAddr != address(0));

		if(usesSubmarket && !submarketReg.isRegistered(submarketAddr))
			throw;

		Order order = new Order();
		address orderAddr = address(order);
		addrs.push(orderAddr);
		addrsMap[orderAddr] = true;

		uint safemarketFee = msg.value - orderTotal;

		if(safemarketFee <  ((orderTotal * safemarketFeeMilliperun) / 1000)){
			throw;
		}

		safitsReg.depositWei.value(msg.value - orderTotal)();

		uint safitsReward = ticker.convert(safemarketFee, bytes4("WEI"), bytes4('SAF'));
		
		if (usesSubmarket) {
			safitsReward = safitsReward / 3;
			safitsReg.inflate(submarketAddr, safitsReward);
			addrsBySubmarketAddr[submarketAddr].push(orderAddr);
		} else {
			safitsReward = safitsReward / 2;
		}

		addrsByStoreAddr[storeAddr].push(orderAddr);
		safitsReg.inflate(buyer, safitsReward);
		safitsReg.inflate(storeAddr, safitsReward);

		order.create.value(orderTotal)(
			buyer,
			storeAddr,
			submarketAddr,
			affiliate,
			productIndexes,
			productQuantities,
			transportIndex,
			address(ticker)
		);
		
		Registration(orderAddr);

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