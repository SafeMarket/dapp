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
		if(aliasToAddrMap[alias] != address(0)) throw;

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
	address public owner;

	function owned(){
		owner = msg.sender;
	}

	function setOwner(address _owner){
		if(msg.sender!=owner) throw;
		owner=_owner;
	}
}

contract forumable is owned{
	address public forumAddr;

	function forumable(){
		var forum = new Forum();
		forumAddr = address(forum);
	}

	function setForumAddr(address _forumAddr){
		if(msg.sender != owner) throw;
		forumAddr = _forumAddr;
	}
}

contract Forum is owned{
	
	uint public fee;

	event Comment(address indexed author, bytes32 indexed parentId, bytes data);
	event Moderation(bytes indexed comment, uint8 direction);

	function addComment(bytes32 parentId, bytes data){
		Comment(msg.sender, parentId, data);
	}

	function setFee(uint _fee){
		if(msg.sender != owner) throw;
		fee = _fee;
	}
	
}

contract audible is owned{

	function addComment(address forumAddr, bytes32 parentId, bytes data){
		if(msg.sender!=owner) throw;
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
		if(msg.sender!=owner) throw;
		Meta(meta);
	}

}

contract Order{
	address public buyer;
	address public storeAddr;
	address public storeOwner;
	address public marketAddr;
	address public marketOwner;
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
		,address _marketAddr
		,uint _feePercentage
		,uint _disputeSeconds
		,address orderBookAddr
	){
		buyer = msg.sender;
		storeAddr = _storeAddr;
		storeOwner = Store(_storeAddr).owner();
		marketAddr = _marketAddr;
		marketOwner = Market(_marketAddr).owner();
		feePercentage = _feePercentage;
		disputeSeconds = _disputeSeconds;
		timestamp = now;
		Meta(_meta);
		OrderBook(orderBookAddr).addEntry(address(this),_storeAddr,_marketAddr);
	}

	function addMessage(bytes text){
		if(msg.sender != buyer && msg.sender != storeOwner && msg.sender != marketOwner)
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

		if(marketOwner==address(0))
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

		if(msg.sender != marketOwner)
			throw;

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
		if(msg.sender!=owner) throw;
		Meta(meta);
	}

	mapping(address=>Review) reviews;

	struct Review{
		uint score;
		uint timestamp;
	}

	uint[6] scoreCounts;

	event ReviewData(address indexed orderAddr, bytes data);

	function getReview(address orderAddr) constant returns (uint, uint){
		var review = reviews[orderAddr];
		return (review.score,review.timestamp);
	}

	function getScoreCounts() constant returns (uint, uint, uint, uint, uint, uint){
		return (scoreCounts[0],scoreCounts[1],scoreCounts[2],scoreCounts[3],scoreCounts[4],scoreCounts[5]);
	}

	function leaveReview(address orderAddr, uint score, bytes data){
		
		var order = Order(orderAddr);

		if(order.status() < 3)
			throw;

		if(order.storeAddr() != address(this))
			throw;

		if(order.buyer() != msg.sender)
			throw;

		if(score>5)
			throw;

		var review = reviews[orderAddr];

		if(review.timestamp != 0)
			scoreCounts[review.score]--;
		
		review.timestamp = now;
		review.score = score;
		scoreCounts[score]++;

		ReviewData(orderAddr, data);
		
	}

}