contract Order{
	address public buyer;
	address public storeAddr;
	address public submarketAddr;
	uint public feeCentiperun; 
	uint public disputeSeconds;
	uint public status;
	uint public received;
	uint public timestamp;
	uint public shippedAt;
	uint public disputedAt;
	uint public fee;
	uint public buyerAmount;
	uint public storeAmount;
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
		,uint _feeCentiperun
		,uint _disputeSeconds
		,address orderBookAddr
	){
		buyer = msg.sender;
		storeAddr = _storeAddr;
		submarketAddr = _submarketAddr;
		feeCentiperun = _feeCentiperun;
		disputeSeconds = _disputeSeconds;
		timestamp = now;
		Meta(_meta);
		OrderBook(orderBookAddr).addEntry(_storeAddr,_submarketAddr);
	}

	function getSenderPermission(address contractAddr, bytes32 action) private returns(bool){
		return permissioned(contractAddr).getPermission(msg.sender,action);
	}

	function addMessage(bytes text){
		if(
			msg.sender != buyer
			&& !getSenderPermission(storeAddr,'order.addMessage')
			&& !getSenderPermission(submarketAddr,'order.addMessage')
		)
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

		if(msg.sender != buyer && !getSenderPermission(storeAddr,'order.cancel'))
			throw;

		var isSent = buyer.send(this.balance);
		if(!isSent) throw;

		addUpdate(cancelled);
	}

	function markAsShipped(){

		if(status !=  initialized)
			throw;

		if(!getSenderPermission(storeAddr,'order.cancel'))
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

		var isSent = storeAddr.send(this.balance);
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

		if(submarketAddr==address(0))
			throw;

		addUpdate(disputed);
		disputedAt=now;
	}

	function calculateFee() returns (uint){
		
		// 1. fee = products * feePerun
			// fee = products * feeCentiperun/100
			// products = fee * 100/feeCentiperun

		// 2. products + fee = received
			// (fee * 100/feeCentiperun) + fee = receieved
			// fee(100/feeCentiperun + 1) = received
			// fee(100/feeCentiperun + feeCentiperun/feeCentiperun) = received
			// fee(100+feeCentiperun)/feeCentiperun = received
			// fee = received/((100+feeCentiperun)/feeCentiperun)
			// fee = (received * feeCentiperun)/(100 + feeCentiperun)

		
		return (received * feeCentiperun)/(100 + feeCentiperun);
	}

	function resolve(uint buyerAmountCentiperun){
		if(status!=disputed)
			throw;

		if(!getSenderPermission(submarketAddr,'order.resolve'))
			throw;

		fee = calculateFee();

		var amountRemaining = received-fee;

		buyerAmount = (amountRemaining*buyerAmountCentiperun)/100;
		storeAmount = amountRemaining - buyerAmount;

		submarketAddr.send(fee);

		if(buyerAmount>0)
			buyer.send(buyerAmount);

		if(storeAmount>0)
			storeAddr.send(storeAmount);

		addUpdate(resolved);
	}

}