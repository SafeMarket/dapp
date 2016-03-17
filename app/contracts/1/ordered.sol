contract ordered is owned{

	address orderRegAddr;
	address[] orderAddrs;

	function setOrderRegAddr(address _orderRegAddr){
		requireOwnership();
		orderRegAddr = _orderRegAddr;
	}

	function addOrderAddr(address orderAddr){
		if(msg.sender != orderRegAddr)
			throw;

		orderAddrs.push(orderAddr);
	}

	function getOrderAddrsCount() constant returns (uint){
		return orderAddrs.length;
	}

	function getOrderAddr(uint index) constant returns (address){
		return orderAddrs[index];
	}
	
}