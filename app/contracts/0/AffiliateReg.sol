contract AffiliateReg {
    
    struct Affiliate{
      address owner;
      address coinbase;
    }

    mapping(bytes32=>Affiliate) affiliates;

    function getAffiliateOwner(bytes32 code) constant returns(address){
      return affiliates[code].owner;
    }

    function getAffiliateCoinbase(bytes32 code) constant returns(address){
      return affiliates[code].coinbase;
    }
    

    function setAffiliate(bytes32 code, address owner, address coinbase){
      if(
        affiliates[code].owner != msg.sender
        && affiliates[code].owner != address(0)
      ) throw;
      affiliates[code].owner = owner;
      affiliates[code].coinbase = coinbase;
    }

  }
