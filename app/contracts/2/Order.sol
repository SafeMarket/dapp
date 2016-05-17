contract Order{

	Ticker ticker;

	bool isCreated;
	
	address public buyer;
	address public storeAddr;
	bytes4 public storeCurrency;
	address public submarketAddr;
	bytes4 public submarketCurrency;
	address public affiliate;

	struct Product{
		uint index;
		uint teraprice;
		bytes32 fileHash;
		uint quantity;
	}
	Product[] products;

	
	uint public transportTeraprice;
	bytes32 public transportFileHash;

	uint public buyerAmountCentiperun;
	uint public escrowFeeTerabase;
	uint public escrowFeeCentiperun; 
	uint public affiliateFeeCentiperun;
	uint public bufferCentiperun;
	uint public safemarketFee;

	uint public escrowFeeTeramount;
	uint public bufferTeramount;
	uint public productsTeratotal;
	uint public storeTeratotal;
	uint public total;

	uint public bounty;
	uint public rewardMax;
	bool public areAmountsSet;

	uint public buyerAmount;
	uint public storeAmount;
	uint public escrowAmount;
	uint public affiliateAmount;

	bool public isBuyerAmountReleased;
	bool public isStoreAmountReleased;
	bool public isEscrowAmountReleased;
	bool public isAffiliateAmountReleased;

	uint public disputeSeconds;
	uint public status;
	uint public received;
	uint public shippedAt;
	uint public disputedAt;
	
	uint public blockNumber;

	struct Message{
		uint blockNumber;
		address sender;
		bytes32 fileHash;
	}

	struct Update{
		uint blockNumber;
		address sender;
		uint status;
	}

	Message[] messages;
	Update[] updates;

	uint constant initialized = 0;
	uint constant cancelled = 1;
	uint constant shipped = 2;
	uint constant disputed = 3;
	uint constant resolved = 4;
	uint constant finalized = 5;

	uint public reviewBlockNumber;
	uint8 public reviewStoreScore;
	uint8 public reviewSubmarketScore;
	bytes32 public reviewFileHash;

	function create(
		address _buyer
		,address _storeAddr
		,address _submarketAddr
		,address _affiliate
		,uint[] _productIndexes
		,uint[] _productQuantities
		,uint _transportIndex
		,address tickerAddr
	){

		if(isCreated)
			throw;

		isCreated = true;

		blockNumber = block.number;

		buyer = _buyer;
		storeAddr = _storeAddr;
		submarketAddr = _submarketAddr;
		affiliate = _affiliate;

		ticker = Ticker(tickerAddr);

		var store = Store(_storeAddr);

		if(!store.getBool('isOpen'))
			throw;

		storeCurrency = bytes4(store.getBytes32('currency'));

		for(uint i = 0; i< _productIndexes.length; i++){

			uint[3] memory productParams = [
				_productIndexes[i],									//productIndex
				store.getProductTeraprice(_productIndexes[i]),		//productTeraprice
				_productQuantities[i]								//productQuantity
			];

			if(!store.getProductIsActive(productParams[0]))
				throw;

			store.depleteProductUnits(productParams[0], productParams[2]);

			products.push(Product(
				productParams[0],
				productParams[1],
				store.getProductFileHash(productParams[0]),
				productParams[2]
			));
			productsTeratotal = productsTeratotal + (productParams[1] * productParams[2]);
		}

		if(productsTeratotal < store.getUint('minProductsTeratotal'))
			throw;

		if(!store.getTransportIsActive(_transportIndex))
			throw;

		transportTeraprice = store.getTransportTeraprice(_transportIndex);
		transportFileHash = store.getTransportFileHash(_transportIndex);

		bufferCentiperun = store.getUint('bufferCentiperun');

		if(_affiliate != address(0)) {
			affiliateFeeCentiperun = store.getUint('affiliateFeeCentiperun');
		}

		if(submarketAddr != address(0)){
			var submarket = infosphered(_submarketAddr);
			if(!submarket.getBool('isOpen'))
				throw;
			submarketCurrency = bytes4(submarket.getBytes32('currency'));
			escrowFeeTerabase = submarket.getUint('escrowFeeTerabase');
			escrowFeeCentiperun = submarket.getUint('escrowFeeCentiperun');
			disputeSeconds = store.getUint('disputeSeconds');
		}

		storeTeratotal = productsTeratotal + transportTeraprice;

		uint[5] memory totals = [
			ticker.convert(storeTeratotal, storeCurrency, bytes4('WEI')) / 1000000000000, 	//Store total in wei
			0,																				//Escrow base in wei
			0,																				//Escrow percent fee in wei
			0,																				//Total before buffer
			0																				//Buffer
		];

		if (escrowFeeTerabase > 0) {
			totals[1] = (ticker.convert(escrowFeeTerabase, submarketCurrency, bytes4('WEI')) / 1000000000000);
		}

		if (escrowFeeCentiperun > 0) {
			totals[2] = (totals[0] * escrowFeeCentiperun / 100);
		}

		totals[3] = totals[0] + totals[1] + totals[2];

		if (bufferCentiperun > 0) {
			totals[4] = ((totals[3] + bufferCentiperun) / 100);
		}

		// if (msg.value < (totals[3] + totals[4]))
		// 	throw;

	}

	function getProductsLength() constant returns (uint){ return products.length; }
	function getProductIndex(uint _index) constant returns (uint){ return products[_index].index; }
	function getProductTeraprice(uint _index) constant returns (uint){ return products[_index].teraprice; }
	function getProductFileHash(uint _index) constant returns (bytes32){ return products[_index].fileHash; }
	function getProductQuantity(uint _index) constant returns (uint){ return products[_index].quantity; }

	function addMessage(bytes32 fileHash, address user){
		if(tx.origin != user && msg.sender != user)
			throw;

		if(
			user != buyer
			&& user != storeAddr
			&& user != submarketAddr
		)
			throw;

		messages.push(Message(block.number, user, fileHash));
	}

	function isComplete() constant returns(bool){
		return (status == cancelled || status == resolved || status == finalized);
	}

	function(){

		if(isComplete())
			throw;
	
	}

	function addUpdate(uint _status) private{
		status = _status;
		updates.push(Update(block.number, msg.sender, _status));
	}

	function cancel(){

		if(status != initialized)
			throw;

		if(msg.sender != buyer && msg.sender != storeAddr)
			throw;

		Store store = Store(storeAddr);
		for(uint i = 0; i< products.length; i++){
			store.restoreProductUnits(products[i].index, products[i].quantity);
		}

		buyerAmount = getReceived();

		addUpdate(cancelled);
	}

	function markAsShipped(){

		if(status !=  initialized)
			throw;

		if(msg.sender != storeAddr)
			throw;

		//don't allow to mark as shipped on same block that a withdrawl is made
		//if(receivedAtBlockNumber == block.number)
		//	throw;

		shippedAt = now;
		addUpdate(shipped);
	}

	function finalize(){

		if(status !=  shipped)
			throw;

		if(msg.sender != buyer)
			throw;

		//setAmounts();
		
		addUpdate(finalized);
	}

	function dispute(){

		if(msg.sender != buyer)
			throw;

		if(status != shipped)
			throw;

		if(submarketAddr==address(0))
			throw;

		if(now - shippedAt > disputeSeconds)
			throw;

		addUpdate(disputed);
		disputedAt=now;

	}

	function resolve(uint _buyerAmountCentiperun){

		if(status!=disputed)
			throw;

		if(msg.sender != submarketAddr)
			throw;

		buyerAmountCentiperun = _buyerAmountCentiperun;

		finalize();
	}

	function getAmounts() constant returns(uint, uint, uint, uint){

		uint amountRemaining = getReceived();
		uint[5] memory amounts = [
			getReceived(), 	//remaining
			0,				//buyer 
			0,				//store
			0,				//submarket
			0				//affiliate
		];

		amounts[2] = (amounts[0] * escrowFeeCentiperun)/(100 + escrowFeeCentiperun);

		amounts[0] -= escrowAmount;

		amounts[1] = (amounts[0] * buyerAmountCentiperun)/100;

		amounts[0] -= buyerAmount;

		amounts[4] = (amounts[0] * affiliateFeeCentiperun)/100;

		amounts[3] = amounts[0] - amounts[4];

		return (amounts[1], amounts[2], amounts[3], amounts[4]);
	}

	// function setAmounts(){
	// 	if(areAmountsSet)
	// 		throw;

	// 	received = this.balance;

	// 	var amounts = getAmounts();
		
	// 	buyerAmount = amounts[0];
	// 	storeAmount = amounts[1];
	// 	escrowAmount = amounts[2];
	// 	affiliateAmount = amounts[3];

	// 	areAmountsSet = true;
	// }

	// function release(bool isReleased, address addr, uint amount) private{

	// 	var reward = msg.gas + bounty;

	// 	if(!isComplete())
	// 		throw;

	// 	if(isReleased)
	// 		throw;

	// 	if(reward > rewardMax)
	// 		throw;

	// 	if(reward > amount)
	// 		throw;

	// 	if(!msg.sender.send(reward))
	// 		throw;

	// 	if(!addr.send(amount - reward))
	// 		throw;

	// }

	// function releaseBuyerAmount(){
	// 	release(isBuyerAmountReleased,buyer,buyerAmount);
	// 	isBuyerAmountReleased = true;
	// }

	// function releaseStoreAmount(){
	// 	release(isStoreAmountReleased,storeAddr,storeAmount);
	// 	isStoreAmountReleased = true;
	// }

	// function releaseEscrowAmount(){
	// 	release(isEscrowAmountReleased,submarketAddr,escrowAmount);
	// 	isEscrowAmountReleased = true;
	// }

	// function releaseAffiliateAmount(){
	// 	release(isAffiliateAmountReleased,affiliate,affiliateAmount);
	// 	isAffiliateAmountReleased = true;
	// }

	function getReceived() constant returns (uint){
		if(areAmountsSet)
			return received;
		else
			return this.balance;
	}

	function getMessagesLength() constant returns(uint) {
		return messages.length;
	}

	function getMessageBlockNumber(uint index) constant returns(uint){
		return messages[index].blockNumber;
	}

	function getMessageSender(uint index) constant returns(address){
		return messages[index].sender;
	}

	function getMessageFileHash(uint index) constant returns(bytes32){
		return messages[index].fileHash;
	}

	function getUpdatesLength() constant returns(uint) {
		return updates.length;
	}

	function getUpdateBlockNumber(uint index) constant returns(uint){
		return updates[index].blockNumber;
	}

	function getUpdateSender(uint index) constant returns(address){
		return updates[index].sender;
	}

	function getUpdateStatus(uint index) constant returns(uint){
		return updates[index].status;
	}

	function setReview(uint8 storeScore, uint8 submarketScore, bytes32 fileHash) {
		if(msg.sender != buyer && tx.origin != buyer)
			throw;

		if(storeScore > 5 || submarketScore > 5)
			throw;

		if(submarketAddr == address(0) && submarketScore != 0)
			throw;

		reviewBlockNumber = block.number;
		reviewStoreScore = storeScore;
		reviewSubmarketScore = submarketScore;
		reviewFileHash = fileHash;
	}

}