contract owned{

	address public owner;

	function owned(){
		owner = msg.sender;
	}

	function requireOwnership(){
		if(msg.sender!=owner && tx.origin!=owner) throw;
	}

	function setOwner(address _owner){
		requireOwnership();
		owner = _owner;
	}
}