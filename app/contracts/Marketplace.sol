contract Test{
	bytes meta;

	function Test(bytes _meta){
		meta = _meta;
	}

	function getMeta() constant returns(bytes){
		return meta;
	}
}

contract Court{
	address magistrate;
	bytes meta;
	uint fee;
	bool isOpen;

	function Court(bytes _meta, uint _fee){
		magistrate = tx.origin;
		meta = _meta;
		fee = _fee;
	}
	
	function getIsOpen() constant returns(bool){
	    return isOpen;
	}
}

contract Order{
	address buyer;
	address storefrontAddr;
	bytes meta;
	address[] courtAddrs;
	uint status;

	uint constant initialized = 0;
	uint constant cancelledByBuyer = 1;
	uint constant cancelledByMerchant = 2;
	uint constant shipped = 3;
	uint constant finalized = 4;
	uint constant disputed = 5;
	uint constant resolvedInBuyersFavor = 6;
	uint constant resolvedInMerchantsFavor = 7;

	function Order(bytes _meta, address[] _courtAddrs){
		meta = meta;
		courtAddrs = _courtAddrs;
		buyer = tx.origin;
		storefrontAddr = msg.sender;
	}

	function cancel(){

		if(status != initialized)
			return;

		if(tx.origin == buyer){
			status = cancelledByBuyer;
			return;
		}

		Storefront storefront = Storefront(storefrontAddr);
		if(tx.origin == storefront.getMerchant()){
			status = cancelledByMerchant;
			return;
		}

	}

	function dispute(){
		if(tx.origin != buyer){
			return;
		}

		if(status != shipped){
			return;
		}

		if(courtAddrs.length==0){
			return;
		}

		status = disputed;
	}
}



contract Storefront{
    address merchant;
    string meta;
    address[] orderAddrs;
    address[] courtAddr;
    uint v = 519;

    function Storefront(string _meta){
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
		if(tx.origin != merchant) return;
		meta = _meta;
	}    
}

contract Marketplace{

	address[] storefrontAddrs;
	address[] courtAddrs;

	function getStorefrontAddrs() constant returns(address[]){
    	return storefrontAddrs;
    }

    function getCourtAddrs() constant returns(address[]){
    	return courtAddrs;
    }

	function registerStorefront(address addr){
        storefrontAddrs[storefrontAddrs.length++] = addr;
	}

	function registerCourt(address addr){
		storefrontAddrs[storefrontAddrs.length++] = addr;
	}

}