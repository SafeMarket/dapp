contract Store is forumable,audible,infosphered,meta,permissioned{

    function Store(bytes32 alias, bytes meta, address alasRegAddr,address infosphereAddr){
    	infosphere = Infosphere(infosphereAddr);
        setMeta(meta);
        AliasReg(alasRegAddr).claimAlias(alias);
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
		
		if(infosphere.getUint(orderAddr,'status') < 3)
			throw;

		if(infosphere.getAddress(orderAddr,'storeAddr') != address(this))
			throw;

		if(infosphere.getAddress(orderAddr,'buyer') != msg.sender)
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