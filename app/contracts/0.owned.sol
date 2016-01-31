contract owned{
	address public owner;

	function owned(){
		owner = msg.sender;
	}

	function setOwner(address _owner){
		if(msg.sender!=owner) throw;
		owner=_owner;
	}
}