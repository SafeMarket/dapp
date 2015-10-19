contract Keystore{

	event Key(address indexed addr, bytes data);

	function setKey(bytes data){
		Key(msg.sender, data);
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
	
	event Comment(address indexed author, bytes32 indexed parentId, bytes data);
	event Vote(bytes indexed comment, uint8 direction);
	event Moderation(bytes indexed comment, uint8 direction);

	function addComment(bytes32 parentId, bytes data){
		Comment(msg.sender, parentId, data);
	}

	function addVote(bytes comment, uint8 direction){
		Vote(comment, direction);
	}

	function addModeration(bytes comment, uint8 direction){
		if(msg.sender != owner) return;
		Moderation(comment, direction);
	}
}

contract Market is forumable{

	address forumAddr;
	event Meta(bytes meta);

	function Market(bytes32 alias, bytes meta){
		AliasReg(0xb68c1931d659e4a058cb4139e981aa8d5c8a6e8b).claimAlias(alias);
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
	address marketAddr;
	uint fee;
	uint disputeSeconds;
	uint status;
	uint received;
	uint timestamp;
	uint shippedAt;

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
		,uint _fee
		,uint _disputeSeconds
	){
		buyer = msg.sender;
		storeAddr = _storeAddr;
		marketAddr = _marketAddr;
		fee = _fee;
		disputeSeconds = _disputeSeconds;
		timestamp = now;
		Meta(_meta);
	}

	function addMessage(bytes text){
		if(msg.sender != buyer && msg.sender != storeAddr && msg.sender != marketAddr)
			return;

		Message(msg.sender, text);
	}

	function(){
		received += msg.value;
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

	function getFee() constant returns(uint){
		return fee;
	}

	function getStatus() constant returns(uint){
		return status;
	}

	function getReceived() constant returns(uint){
		return received;
	}

	function getTimestamp() constant returns(uint){
		return timestamp;
	}

	function addUpdate(uint _status) private{
		status = _status;
		Update(msg.sender,_status);
	}

	function cancel(){

		if(status != initialized)
			return;

		if(msg.sender != buyer && msg.sender != storeAddr)
			return;

		var isSent = buyer.send(this.balance);
		if(!isSent) return;

		addUpdate(cancelled);
	}

	function markAsShipped(){

		if(status !=  initialized)
			return;

		if(msg.sender != storeAddr)
			return;

		shippedAt = now;
		addUpdate(shipped);
	}

	function finalize(){

		if(status !=  shipped)
			return;

		if(msg.sender != buyer && msg.sender != storeAddr)
			return;

		if(msg.sender == storeAddr && now - shippedAt < disputeSeconds)
			return;

		var isSent = storeAddr.send(this.balance);
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

		if(marketAddr==address(0))
			return;

		addUpdate(disputed);
	}

	function resolve(uint buyerAmount){
		if(status!=disputed)
			return;

		if(msg.sender != marketAddr)
			return;

		if(buyerAmount>0)
			buyer.send(buyerAmount);

		var storeAmount = this.balance-buyerAmount;

		if(storeAmount>0)
			storeAddr.send(storeAmount);

		addUpdate(resolved);
	}
}

contract Store is forumable{
    event Meta(bytes meta);

    function Store(bytes32 alias, bytes meta){
        Meta(meta);
        AliasReg(0xb68c1931d659e4a058cb4139e981aa8d5c8a6e8b).claimAlias(alias);
    }
    
    function setMeta(bytes meta){
		if(msg.sender!=owner) return;
		Meta(meta);
	}
}