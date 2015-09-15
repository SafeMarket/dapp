contract Market{
	address admin;
	string meta;

	function Market(string _meta){
		admin = tx.origin;
		meta = _meta;
	}

	function getAdmin() constant returns(address){
		return admin;
	}
	
	function setMeta(string _meta){
		if(tx.origin!=admin) return;
		meta = _meta;
	}

	function getMeta() constant returns(string){
		return meta;
	}

}

contract Order{
	address buyer;
	address merchant;
	address admin;
	uint fee;
	string meta;
	
	uint status;

	uint constant initialized = 0;
	uint constant cancelledByBuyer = 1;
	uint constant cancelledByMerchant = 2;
	uint constant shipped = 3;
	uint constant finalized = 4;
	uint constant disputed = 5;
	uint constant resolved = 6;

	function Order(string _meta, address _merchant, address _admin, uint _fee){
		buyer = tx.origin;
		meta = _meta;
		merchant = _merchant;
		admin = _admin;
		fee = _fee;
	}

	function cancel(){

		if(status != initialized)
			return;

		if(tx.origin == buyer){
			status = cancelledByBuyer;
			return;
		}

		
		if(tx.origin == merchant){
			status = cancelledByMerchant;
			return;
		}

	}

	function markAsShipped(){
		if(status !=  initialized)
			return;

		if(tx.origin != merchant)
			return;
		
		status = shipped;
	}

	function finalize(){
		if(status !=  shipped)
			return;

		if(tx.origin != buyer)
			return;

		merchant.send(this.balance);
		
		status = finalized;
	}

	function dispute(){
		if(tx.origin != buyer){
			return;
		}

		if(status != shipped){
			return;
		}

		if(admin==0){
			return;
		}

		status = disputed;
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

		status = resolved;

	}
}



contract Store{
    address merchant;
    string meta;

    function Store(string _meta){
        merchant = tx.origin;
        meta = _meta;
    }
    
    function getMerchant() constant returns(address){
    	return merchant;
    }

    function setMeta(string _meta){
		if(tx.origin!=merchant) return;
		meta = _meta;
	}

    function getMeta() constant returns(string){
		return meta;
	}
}

contract Registrar{
	address[] storeAddrs;
	address[] marketAddrs;
	address[] orderAddrs;

	function createStore(string meta){
		Store store = new Store(meta);
	}

	function createMarket(string meta){
		Market market = new Market(meta);
	}

	function createOrder(string meta, address merchant, address admin, uint fee){
		Order order = new Order(meta, merchant, admin, fee);
	}

	function getStoreAddrs() constant returns(address[]){
		return storeAddrs;
	}

	function getMarketAddrs() constant returns(address[]){
		return storeAddrs;
	}

	function getOrderAddrs() constant returns(address[]){
		return storeAddrs;
	}

}
