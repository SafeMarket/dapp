contract owned{

	address public owner;

	function owned(){
		owner = msg.sender;
	}

	function requireOwnership(){
		if(msg.sender!=owner) throw;
	}

	function setOwner(address _owner){
		this.requireOwnership();
		owner = _owner;
	}
}