contract meta is owned{

	event Meta(bytes meta);

	uint public metaUpdatedAt;

	function setMeta(bytes meta){
		requireOwnership();
		metaUpdatedAt = block.number;
		Meta(meta);
	}

}