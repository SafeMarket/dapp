contract Order is infosphered{
	
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
	
	uint public createdAtBlockNumber;
	uint public receivedAtBlockNumber;

	event Message(address indexed sender, bytes text);
	event Update(address indexed sender, uint indexed status);

	uint public constant initialized = 0;
	uint public constant cancelled = 1;
	uint public constant shipped = 2;
	uint public constant disputed = 3;
	uint public constant resolved = 4;
	uint public constant finalized = 5;

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
	){

		createdAtBlockNumber = block.number;

		buyer = _buyer;
		storeAddr = _storeAddr;
		submarketAddr = _submarketAddr;
		affiliate = _affiliate;
		bounty = _bounty;
		rewardMax = _rewardMax;

		var store = Store(_storeAddr);
		storeCurrency = store.getBytes32('currency');

		if(_productIndexes.length != _productQuantities.length)
			throw;

		for(uint i = 0; i< _productIndexes.length; i++){
			products.push(Product(
				store.getProductTeraprice(i),
				store.getProductFileHash(i),
				_productQuantities[i]
			));
		}

		transportTeraprice = store.getTransportTeraprice(_transportIndex);
		transportFileHash = store.getTransportFileHash(_transportIndex);

		affiliateFeeCentiperun = store.getUint('affiliateFeeCentiperun');

		if(submarketAddr != address(0)){
			var submarket = infosphered(_submarketAddr);
			escrowFeeCentiperun = submarket.getUint('escrowFeeCentiperun');
			disputeSeconds = store.getUint('disputeSeconds');
		}

		bounty = _bounty;
	}

	function getSenderPermission(address contractAddr, bytes32 action) private returns(bool){
		return permissioned(contractAddr).getPermission(msg.sender,action);
	}

	function getProductsLength() constant returns (uint){ return products.length; }
	function getProductTeraprice(uint _index) constant returns (uint){ return products[_index].teraprice; }
	function getProductFileHash(uint _index) constant returns (bytes32){ return products[_index].fileHash; }
	function getProductQuantity(uint _index) constant returns (uint){ return products[_index].quantity; }

	function addMessage(bytes text){
		if(
			msg.sender != buyer
			&& !getSenderPermission(storeAddr,'order.addMessage')
			&& !getSenderPermission(submarketAddr,'order.addMessage')
		)
			throw;

		Message(msg.sender, text);
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
		Update(msg.sender,_status);
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
		if(receivedAtBlockNumber == block.number)
			throw;

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

}