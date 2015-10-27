contract Keystore{

	event Key(address indexed addr, bytes data);

	function setKey(bytes data){
		Key(msg.sender, data);
	}

}

contract OrderBook{

	event Entry(
		address indexed orderAddr
		,address indexed storeAddr
		,address indexed marketAddr
	);

	function addEntry(address orderAddr, address storeAddr, address marketAddr){
		Entry(orderAddr, storeAddr, marketAddr);
	}
}

contract AliasReg {
	mapping(address=>bytes32) addrToAliasMap;
	mapping(bytes32=>address) aliasToAddrMap;

	function claimAlias(bytes32 alias){
		if(aliasToAddrMap[alias] != address(0)) return;

		addrToAliasMap[msg.sender]=alias;
		aliasToAddrMap[alias]=msg.sender;
	}

	function getAlias(address addr) constant returns(bytes32){
		return addrToAliasMap[addr];
	}

	function getAddr(bytes32 alias) constant returns(address){
		return aliasToAddrMap[alias];
	}

}

contract owned{
	address owner;

	function owned(){
		owner = msg.sender;
	}

	function getOwner() constant returns (address){
		return owner;
	}

	function setOwner(address _owner){
		if(msg.sender!=owner) return;
		owner=_owner;
	}
}

contract forumable is owned{
	address forumAddr;

	function forumable(){
		var forum = new Forum();
		forumAddr = address(forum);
	}

	function getForumAddr() constant returns(address){
		return forumAddr;
	}

	function setForumAddr(address _forumAddr){
		if(msg.sender != owner) return;
		forumAddr = _forumAddr;
	}
}

contract Forum is owned{
	
	uint fee;

	event Comment(address indexed author, bytes32 indexed parentId, bytes data);
	event Moderation(bytes indexed comment, uint8 direction);

	function addComment(bytes32 parentId, bytes data){
		Comment(msg.sender, parentId, data);
	}

	function setFee(uint _fee){
		if(msg.sender != owner) return;
		fee = _fee;
	}

	function getFee() constant returns(uint){
		return fee;
	}
	
}

contract audible is owned{

	function addComment(address forumAddr, bytes32 parentId, bytes data){
		if(msg.sender!=owner) return;
		Forum(forumAddr).addComment(parentId,data);
	}

}

contract Market is forumable,audible{

	event Meta(bytes meta);
	bool constant public isMarket = true;

	function Market(bytes32 alias, bytes meta, address alasRegAddr){
		AliasReg(alasRegAddr).claimAlias(alias);
		Meta(meta);
	}
	
	function setMeta(bytes meta){
		if(msg.sender!=owner) return;
		Meta(meta);
	}

}

contract Order{
	address buyer;
	address storeAddr;
	address storeOwner;
	address marketAddr;
	address marketOwner;
	uint feePercentage;
	uint disputeSeconds;
	uint status;
	uint received;
	uint timestamp;
	uint shippedAt;
	uint disputedAt;
	uint fee;
	uint buyerAmount;
	uint receivedAtBlockNumber;

	event Meta(bytes meta);
	event Message(address indexed sender, bytes text);
	event Update(address indexed sender, uint indexed status);

	uint constant initialized = 0;
	uint constant cancelled = 1;
	uint constant shipped = 2;
	uint constant finalized = 3;
	uint constant disputed = 4;
	uint constant resolved = 5;

	function Order(
		bytes _meta
		,address _storeAddr
		,address _marketAddr
		,uint _feePercentage
		,uint _disputeSeconds
		,address orderBookAddr
	){
		buyer = msg.sender;
		storeAddr = _storeAddr;
		storeOwner = Store(_storeAddr).getOwner();
		marketAddr = _marketAddr;
		marketOwner = Market(_marketAddr).getOwner();
		feePercentage = _feePercentage;
		disputeSeconds = _disputeSeconds;
		timestamp = now;
		Meta(_meta);
		OrderBook(orderBookAddr).addEntry(address(this),_storeAddr,_marketAddr);
	}

	function addMessage(bytes text){
		if(msg.sender != buyer && msg.sender != storeOwner && msg.sender != marketOwner)
			return;

		Message(msg.sender, text);
	}

	function(){
		received += msg.value;
		receivedAtBlockNumber = block.number;
	}

	function withdraw(uint amount){
		
		if(msg.sender != buyer)
			return;
		
		if(status != initialized)
			return;
		
		if(amount>received)
			return;

		var isSent = buyer.send(amount);

		if(isSent){
			receivedAtBlockNumber = block.number;
			received -= amount;
		}
	}

	function getBuyer() constant returns(address){
		return buyer;
	}

	function getStoreAddr() constant returns(address){
		return storeAddr;
	}

	function getMarketAddr() constant returns(address){
		return marketAddr;
	}

	function getFeePercentage() constant returns(uint){
		return feePercentage;
	}

	function getStatus() constant returns(uint){
		return status;
	}

	function getReceived() constant returns(uint){
		return received;
	}

	function getDisputeSeconds() constant returns(uint){
		return disputeSeconds;
	}

	function getTimestamp() constant returns(uint){
		return timestamp;
	}

	function getShippedAt() constant returns(uint){
		return shippedAt;
	}

	function getFee() constant returns(uint){
		return fee;
	}

	function getBuyerAmount() constant returns(uint){
		return buyerAmount;
	}

	function getReceivedAtBlockNumber() constant returns(uint){
		return receivedAtBlockNumber;
	}

	function addUpdate(uint _status) private{
		status = _status;
		Update(msg.sender,_status);
	}

	function cancel(){

		if(status != initialized)
			return;

		if(msg.sender != buyer && msg.sender != storeOwner)
			return;

		var isSent = buyer.send(this.balance);
		if(!isSent) return;

		addUpdate(cancelled);
	}

	function markAsShipped(){

		if(status !=  initialized)
			return;

		if(msg.sender != storeOwner)
			return;

		//don't allow to mark as shipped on same block that a withdrawl is made
		if(receivedAtBlockNumber == block.number)
			return;

		shippedAt = now;
		addUpdate(shipped);
	}

	function finalize(){

		if(status !=  shipped)
			return;

		if(msg.sender != buyer && msg.sender != storeOwner)
			return;

		if(msg.sender == storeOwner && now - shippedAt < disputeSeconds)
			return;

		var isSent = storeOwner.send(this.balance);
		if(!isSent) return;
		
		addUpdate(finalized);
	}

	function dispute(){
		if(msg.sender != buyer)
			return;

		if(status != shipped)
			return;

		if(now - shippedAt > disputeSeconds)
			return;

		if(marketOwner==address(0))
			return;

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
			return;

		if(msg.sender != marketOwner)
			return;

		fee = calculateFee();
		buyerAmount = ((received-fee)*buyerPercentage)/100;
		var storeOwnerAmount = received - fee - buyerAmount;

		marketOwner.send(fee);

		if(buyerAmount>0)
			buyer.send(buyerAmount);

		if(storeOwnerAmount>0)
			storeOwner.send(storeOwnerAmount);

		addUpdate(resolved);
	}
}

contract Store is forumable,audible{
    event Meta(bytes meta);
    bool constant public isStore = true;

    function Store(bytes32 alias, bytes meta, address alasRegAddr){
        Meta(meta);
        AliasReg(alasRegAddr).claimAlias(alias);
    }
    
    function setMeta(bytes meta){
		if(msg.sender!=owner) return;
		Meta(meta);
	}

}