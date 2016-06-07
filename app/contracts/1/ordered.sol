contract ordered is owned{

	OrderReg orderReg;
	address public orderRegAddr;
	address[] orderAddrs;

	function setOrderReg(address _orderRegAddr){
		requireOwnership();
		orderReg = OrderReg(_orderRegAddr);
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