contract meta is owned{

	event Meta(bytes meta);

	mapping(address=>uint) metaUpdatedAts;

	function setMeta(bytes meta){
		requireOwnership()
		metaUpdatedAts[msg.sender] = block.number;
		Meta(meta);
	}

	function getMetaUpdatedAt(address addr) constant returns uint{
		return metaUpdatedAts[addr];
	}
}