contract Order{
	address public buyer;
	address public storeAddr;
	address public storeOwner;
	address public submarketAddr;
	address public submarketOwner;
	uint public feePercentage;
	uint public disputeSeconds;
	uint public status;
	uint public received;
	uint public timestamp;
	uint public shippedAt;
	uint public disputedAt;
	uint public fee;
	uint public buyerAmount;
	uint public receivedAtBlockNumber;

	event Meta(bytes meta);
	event Message(address indexed sender, bytes text);
	event Update(address indexed sender, uint indexed status);

	uint public constant initialized = 0;
	uint public constant cancelled = 1;
	uint public constant shipped = 2;
	uint public constant finalized = 3;
	uint public constant disputed = 4;
	uint public constant resolved = 5;

	function Order(
		bytes _meta
		,address _storeAddr
		,address _submarketAddr
		,uint _feePercentage
		,uint _disputeSeconds
		,address orderBookAddr
	){
		buyer = msg.sender;
		storeAddr = _storeAddr;
		storeOwner = Store(_storeAddr).owner();
		submarketAddr = _submarketAddr;
		submarketOwner = Submarket(_submarketAddr).owner();
		feePercentage = _feePercentage;
		disputeSeconds = _disputeSeconds;
		timestamp = now;
		Meta(_meta);
		OrderBook(orderBookAddr).addEntry(address(this),_storeAddr,_submarketAddr);
	}

	function addMessage(bytes text){
		if(msg.sender != buyer && msg.sender != storeOwner && msg.sender != submarketOwner)
			throw;

		Message(msg.sender, text);
	}

	function(){
		received += msg.value;
		receivedAtBlockNumber = block.number;
	}

	function withdraw(uint amount){
		
		if(msg.sender != buyer)
			throw;
		
		if(status != initialized)
			throw;
		
		if(amount>received)
			throw;

		var isSent = buyer.send(amount);

		if(isSent){
			receivedAtBlockNumber = block.number;
			received -= amount;
		}
	}

	function addUpdate(uint _status) private{
		status = _status;
		Update(msg.sender,_status);
	}

	function cancel(){

		if(status != initialized)
			throw;

		if(msg.sender != buyer && msg.sender != storeOwner)
			throw;

		var isSent = buyer.send(this.balance);
		if(!isSent) throw;

		addUpdate(cancelled);
	}

	function markAsShipped(){

		if(status !=  initialized)
			throw;

		if(msg.sender != storeOwner)
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

		var isSent = storeOwner.send(this.balance);
		if(!isSent) throw;
		
		addUpdate(finalized);
	}

	function dispute(){
		if(msg.sender != buyer)
			throw;

		if(status != shipped)
			throw;

		if(now - shippedAt > disputeSeconds)
			throw;

		if(submarketOwner==address(0))
			throw;

		addUpdate(disputed);
		disputedAt=now;
	}

	function calculateFee() returns (uint){
		// show your work:
		
		// 1. fee = products(feePercent)
			// products = fee/feePercent
			// products = fee/(feePercentage/100)
			// products = (100*fee)/feePercentage

		// 2. products + fee = received
			// (100*fee)/feePercentage + fee = received
			// fee(100/feePercentage + 1) = received
			// fee(100/feePercentage + feePercentage/feePercentage) = received
			// fee(100+feePercentage)/feePercentage = received
			// fee = received/((100+feePercentage)/feePercentage)
			// fee = (received * feePercentage)/(100 + feePercentage)

		
		return (received * feePercentage)/(100 + feePercentage);
	}

	function resolve(uint buyerPercentage){
		if(status!=disputed)
			throw;

		if(msg.sender != submarketOwner)
			throw;

		fee = calculateFee();
		buyerAmount = ((received-fee)*buyerPercentage)/100;
		var storeOwnerAmount = received - fee - buyerAmount;

		submarketOwner.send(fee);

		if(buyerAmount>0)
			buyer.send(buyerAmount);

		if(storeOwnerAmount>0)
			storeOwner.send(storeOwnerAmount);

		addUpdate(resolved);
	}

}