contract AffiliateReg {
    
    struct Affiliate{
      address owner;
      address coinbase;
    }

    mapping(bytes32=>Affiliate) affiliateMap;
    mapping(bytes32=>bool) isCodeTakenMap;

    function getAffiliateParams(bytes32 code) constant returns(address, address){
      var affiliate = affiliateMap[code];
      return (affiliate.owner, affiliate.coinbase);
    }

    function getIsCodeTaken(bytes32 code) constant returns(bool){
      return isCodeTakenMap[code];
    }

    function requireCodeIsNotTaken(bytes32 code){
      if(isCodeTakenMap[code]) throw;
    }

    function requireAffiliateOwnership(bytes32 code){
      if(msg.sender!=affiliateMap[code].owner) throw;
    }
    
    function addAffiliate(bytes32 code, address owner, address coinbase){
      requireCodeIsNotTaken(code);
      affiliateMap[code] = Affiliate(owner, coinbase);
      isCodeTakenMap[code] = true;
    }

    function abandonAffiliate(bytes32 code){
      requireAffiliateOwnership(code);
      isCodeTakenMap[code] = false;
    }

    function setAffilliate(bytes32 code, address owner, address coinbase){

      requireAffiliateOwnership(code);

      affiliateMap[code].owner = owner;
      affiliateMap[code].coinbase = coinbase;

    }

  }
