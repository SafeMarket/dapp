contract Order{

	Ticker ticker;
	
	address public buyer;
	address public storeAddr;
	bytes32 public storeCurrency;
	address public submarketAddr;
	address public affiliate;

	struct Product{	
		uint teraprice;
		bytes32 fileHash;
		uint quantity;
	}
	Product[] products;

	
	uint public transportTeraprice;
	bytes32 public transportFileHash;

	uint public buyerAmountCentiperun;
	uint public escrowFeeCentiperun; 
	uint public affiliateFeeCentiperun;
	uint public bufferCentiperun;

	uint public escrowFeeTeramount;
	uint public bufferTeramount;
	uint public teratotal;
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

	uint public constant initialized = 0;
	uint public constant cancelled = 1;
	uint public constant shipped = 2;
	uint public constant disputed = 3;
	uint public constant resolved = 4;
	uint public constant finalized = 5;

	uint public reviewBlockNumber;
	uint8 public reviewScore;
	bytes32 public reviewFileHash;

	function Order(
		address _buyer
		,address _storeAddr
		,address _submarketAddr
		,address _affiliate
		,uint[] _productIndexes
		,uint[] _productQuantities
		,uint _transportIndex
		,uint _bounty
		,uint _rewardMax
		,address tickerAddr
	){

		blockNumber = block.number;

		buyer = _buyer;
		storeAddr = _storeAddr;
		submarketAddr = _submarketAddr;
		affiliate = _affiliate;
		bounty = _bounty;
		rewardMax = _rewardMax;

		ticker = Ticker(tickerAddr);

		var store = Store(_storeAddr);
		storeCurrency = store.getBytes32('currency');

		uint _teratotal = 0;

		if(_productIndexes.length != _productQuantities.length)
			throw;

		for(uint i = 0; i< _productIndexes.length; i++){
			uint productTeraprice = store.getProductTeraprice(i);
			products.push(Product(
				productTeraprice,
				store.getProductFileHash(i),
				_productQuantities[i]
			));
			_teratotal = _teratotal + productTeraprice;
		}

		transportTeraprice = store.getTransportTeraprice(_transportIndex);
		transportFileHash = store.getTransportFileHash(_transportIndex);

		_teratotal = _teratotal + transportTeraprice;

		bufferCentiperun = store.getUint('bufferCentiperun');

		if(_affiliate != address(0)) {
			affiliateFeeCentiperun = store.getUint('affiliateFeeCentiperun');
		}

		if(submarketAddr != address(0)){
			var submarket = infosphered(_submarketAddr);
			escrowFeeCentiperun = submarket.getUint('escrowFeeCentiperun');
			escrowFeeTeramount = (_teratotal * escrowFeeCentiperun) / 100;
			disputeSeconds = store.getUint('disputeSeconds');

			_teratotal = _teratotal + escrowFeeTeramount;
		}

		teratotal = _teratotal;
		bufferTeramount = (_teratotal * bufferCentiperun) / 100;

		bounty = _bounty;
	}

	function getPermission(address user, address contractAddr, bytes32 action) private returns(bool){
		return permissioned(contractAddr).getPermission(msg.sender,action);
	}

	function getSenderPermission(address contractAddr, bytes32 action) private returns(bool){
		return permissioned(contractAddr).getPermission(msg.sender,action);
	}

	function getProductsLength() constant returns (uint){ return products.length; }
	function getProductTeraprice(uint _index) constant returns (uint){ return products[_index].teraprice; }
	function getProductFileHash(uint _index) constant returns (bytes32){ return products[_index].fileHash; }
	function getProductQuantity(uint _index) constant returns (uint){ return products[_index].quantity; }

	function addMessage(bytes32 fileHash, address user){
		if(tx.origin != user && msg.sender != user)
			throw;

		if(
			user != buyer
			&& !getPermission(user, storeAddr, 'order.addMessage')
			&& !getPermission(user, submarketAddr, 'order.addMessage')
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

		if(msg.sender != buyer && !getSenderPermission(storeAddr,'order.cancel'))
			throw;

		buyerAmount = getReceived();

		addUpdate(cancelled);
	}

	function markAsShipped(){

		if(status !=  initialized)
			throw;

		if(!getSenderPermission(storeAddr,'order.markAsShipped'))
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

		setAmounts();
		
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

		if(!getSenderPermission(submarketAddr,'order.resolve'))
			throw;

		buyerAmountCentiperun = _buyerAmountCentiperun;

		finalize();
	}

	function getAmounts() constant returns(uint[4]){

		uint amountRemaining = getReceived();
		uint[4] memory amounts;

		var escrowAmount = (amountRemaining * escrowFeeCentiperun)/(100 + escrowFeeCentiperun);

		amountRemaining = amountRemaining - escrowAmount;

		var buyerAmount = (amountRemaining * buyerAmountCentiperun)/100;

		amountRemaining = amountRemaining - buyerAmount;

		var affiliateAmount = (amountRemaining * affiliateFeeCentiperun)/100;

		var storeAmount = amountRemaining - affiliateAmount;

		amounts[0] = buyerAmount;
		amounts[1] = storeAmount;
		amounts[2] = escrowAmount;
		amounts[3] = affiliateAmount;

		return (amounts);
	}

	function setAmounts(){
		if(areAmountsSet)
			throw;

		received = this.balance;

		var amounts = getAmounts();
		
		buyerAmount = amounts[0];
		storeAmount = amounts[1];
		escrowAmount = amounts[2];
		affiliateAmount = amounts[3];

		areAmountsSet = true;
	}

	function release(bool isReleased, address addr, uint amount) private{

		var reward = msg.gas + bounty;

		if(!isComplete())
			throw;

		if(isReleased)
			throw;

		if(reward > rewardMax)
			throw;

		if(reward > amount)
			throw;

		if(!msg.sender.send(reward))
			throw;

		if(!addr.send(amount - reward))
			throw;

	}

	function releaseBuyerAmount(){
		release(isBuyerAmountReleased,buyer,buyerAmount);
		isBuyerAmountReleased = true;
	}

	function releaseStoreAmount(){
		release(isStoreAmountReleased,storeAddr,storeAmount);
		isStoreAmountReleased = true;
	}

	function releaseEscrowAmount(){
		release(isEscrowAmountReleased,submarketAddr,escrowAmount);
		isEscrowAmountReleased = true;
	}

	function releaseAffiliateAmount(){
		release(isAffiliateAmountReleased,affiliate,affiliateAmount);
		isAffiliateAmountReleased = true;
	}

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

	function getMinimumBalance() constant returns(uint) {
		return ticker.convert(teratotal + bufferTeramount, bytes4(storeCurrency), bytes4('WEI')) / 1000000000000;
	}

	function setReview(uint8 score, bytes32 fileHash) {
		if(msg.sender != buyer && tx.origin != buyer)
			throw;

		if(score > 5)
			throw;

		reviewBlockNumber = block.number;
		reviewScore = score;
		reviewFileHash = fileHash;
	}

}