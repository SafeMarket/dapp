contract Keystore{

	event Key(address indexed addr, uint timestamp, bytes data);

	function setKey(bytes data){
		Key(tx.origin, now, data);
	}

}

contract Market{
	address admin;
	event Meta(uint timestamp, bytes meta);

	function Market(bytes meta){
		admin = tx.origin;
		Meta(now,meta);
	}

	function getAdmin() constant returns(address){
		return admin;
	}
	
	function setMeta(bytes meta){
		if(tx.origin!=admin) return;
		Meta(now,meta);
	}

}

contract Order{
	address buyer;
	address merchant;
	address admin;
	uint fee;
	uint disputeSeconds;
	string meta;
	uint status;
	uint received;
	uint timestamp;
	uint shippedAt;

	uint constant initialized = 0;
	uint constant cancelled = 1;
	uint constant shipped = 2;
	uint constant finalized = 3;
	uint constant disputed = 4;
	uint constant resolved = 5;

	Message[] messages;
	struct Message{
		address sender;
		string ciphertext;
		uint timestamp;
	}

	Update[] updates;
	struct Update{
		address sender;
		uint status;
		uint timestamp;
	}

	function Order(
		string _meta
		,address _merchant
		,address _admin
		,uint _fee
		,uint _disputeSeconds
	){
		buyer = tx.origin;
		meta = _meta;
		merchant = _merchant;
		admin = _admin;
		fee = _fee;
		disputeSeconds = _disputeSeconds;
		timestamp = now;
	}

	function addMessage(string text){
		if(tx.origin != buyer && tx.origin != merchant && tx.origin != admin)
			return;

		messages[messages.length++] = Message(tx.origin,text,now);
	}

	function getMessagesCount() constant returns(uint){
		return messages.length;
	}

	function getMessageSender(uint index) constant returns(address){
		return messages[index].sender;
	}

	function getMessageCyphertext(uint index) constant returns(string){
		return messages[index].ciphertext;
	}

	function getMessageTimestamp(uint index) constant returns(uint){
		return messages[index].timestamp;
	}

	function(){
		received += msg.value;
	}

	function getMeta() constant returns(string){
		return meta;
	}

	function getBuyer() constant returns(address){
		return buyer;
	}

	function getMerchant() constant returns(address){
		return merchant;
	}

	function getAdmin() constant returns(address){
		return admin;
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

	function addUpdate(uint _status){
		status = _status;
		updates[updates.length++] = Update(tx.origin,_status,now);
	}

	function cancel(){

		if(status != initialized)
			return;

		if(tx.origin != buyer && tx.origin != merchant)
			return;

		var isSent = buyer.send(this.balance);
		if(!isSent) return;

		addUpdate(cancelled);
	}

	function markAsShipped(){

		if(status !=  initialized)
			return;

		if(tx.origin != merchant)
			return;

		shippedAt = now;
		addUpdate(shipped);
	}

	function finalize(){

		if(status !=  shipped)
			return;

		if(tx.origin != buyer && tx.origin != merchant)
			return;

		if(tx.origin == merchant && now - shippedAt < disputeSeconds)
			return;

		var isSent = merchant.send(this.balance);
		if(!isSent) return;
		
		addUpdate(finalized);
	}

	function dispute(){
		if(tx.origin != buyer)
			return;

		if(status != shipped)
			return;

		if(now - shippedAt > disputeSeconds)
			return;

		if(admin==0)
			return;

		addUpdate(disputed);
	}

	function resolve(uint buyerAmount){
		if(status!=disputed)
			return;

		if(tx.origin != admin)
			return;

		if(buyerAmount>0)
			buyer.send(buyerAmount);

		var merchantAmount = this.balance-buyerAmount;

		if(merchantAmount>0)
			merchant.send(merchantAmount);

		addUpdate(resolved);
	}
}



contract Store{
    address merchant;
    event Meta(uint timestamp, bytes meta);

    function Store(bytes meta){
        merchant = tx.origin;
        Meta(now,meta);
    }
    
    function getMerchant() constant returns(address){
    	return merchant;
    }

    function setMeta(bytes meta){
		if(tx.origin!=merchant) return;
		Meta(now,meta);
	}
}