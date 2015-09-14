contract Test{
	bytes meta;

	function Test(bytes _meta){
		meta = _meta;
	}

	function getMeta() constant returns(bytes){
		return meta;
	}
}

contract Market{
	address admin;
	string meta;
	uint feeTenths;
	uint bond;
	bool isOpen;

	address[] storeAddrs;

	function Market(string _meta, uint _feeTenths, uint _bond){
		admin = tx.origin;
		meta = _meta;
		feeTenths = _feeTenths;
		bond = _bond;
	}

	function getAdmin() constant returns(address){
		return admin;
	}
	
	function setMeta(string _meta){
		if(tx.origin!=admin) return;
		meta = meta;
	}

	function getMeta() constant returns(string){
		return meta;
	}

	function setFeeTenths(uint _feeTenths){
		if(tx.origin!=admin) return;
		feeTenths = _feeTenths;
	}

	function getFeeTenths() constant returns(uint){
		return feeTenths;
	}

	function getBond(uint _bond){
		if(tx.origin!=admin) return;
		bond = _bond;
	}

	function setBond() constant returns(uint){
		return bond;
	}

	function setIsOpen(bool _isOpen){
		if(tx.origin!=admin) return;
		isOpen = _isOpen;
	}

	function getIsOpen() constant returns(bool){
	    return isOpen;
	}
}

// contract Order{
// 	address buyer;
// 	address storeAddr;
// 	address marketAddr;
// 	bytes meta;
	
// 	uint status;

// 	uint constant initialized = 0;
// 	uint constant cancelledByBuyer = 1;
// 	uint constant cancelledByMerchant = 2;
// 	uint constant shipped = 3;
// 	uint constant finalized = 4;
// 	uint constant disputed = 5;
// 	uint constant resolvedInBuyersFavor = 6;
// 	uint constant resolvedInMerchantsFavor = 7;

// 	function Order(bytes _meta, address _marketAddr){
// 		meta = meta;
// 		marketAddrs = _marketAddrs;
// 		buyer = tx.origin;
// 		storeAddr = msg.sender;
// 	}

// 	function cancel(){

// 		if(status != initialized)
// 			return;

// 		if(tx.origin == buyer){
// 			status = cancelledByBuyer;
// 			return;
// 		}

// 		store store = store(storeAddr);
// 		if(tx.origin == store.getMerchant()){
// 			status = cancelledByMerchant;
// 			return;
// 		}

// 	}

// 	function dispute(){
// 		if(tx.origin != buyer){
// 			return;
// 		}

// 		if(status != shipped){
// 			return;
// 		}

// 		if(marketAddrs.length==0){
// 			return;
// 		}

// 		status = disputed;
// 	}
// }



contract Store{
    address merchant;
    string meta;
    address[] orderAddrs;
    address[] marketAddr;
    bool isOpen;

    function store(string _meta){
        merchant = tx.origin;
        meta = _meta;
    }
    
    function getMerchant() constant returns(address){
    	return merchant;
    }

    function getMeta() constant returns(string){
		return meta;
	}

	function setMeta(string _meta){
		if(tx.origin!=merchant) return;
		meta = _meta;
	}

	function setIsOpen(bool _isOpen){
		if(tx.origin!=merchant) return;
		isOpen = _isOpen;
	}

	function getIsOpen() constant returns(bool){
	    return isOpen;
	}
}
