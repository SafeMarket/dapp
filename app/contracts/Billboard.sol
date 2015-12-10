contract Billboard{

	address owner;

	function Billboard(address _owner){
		owner = _owner;
	}

	function setOwner(address _owner){
		if(msg.sender!=owner) throw;
		owner = _owner;
	}

	event Win(uint indexed slotIndex, bytes data); //event fired when a slot has a new winner
	
	Slot[] slots; //an array of slots. Each slot is one period of time (for example one day)

	struct Slot{
		address winner; // winner of the slot
		uint bid;		// amount of wei the winner bid
	}

	function bidOnSlot(uint _slotIndex,bytes _data){
		
		var slot = slots[_slotIndex];

		if(msg.value<=slot.bid) //require the current bid to be greater than the previous bid
			throw;

		if(slot.bid>0) //if someonne has already placed a bid
			if(!slot.winner.send(slot.bid)) //send them their bid
				throw;

		slot.winner = msg.sender;
		slot.bid = msg.value;
		Win(_slotIndex,_data);

		owner.send(msg.value-slot.bid); //send the owner the delta between the bids
	}

	function getSlot(uint _slotIndex) constant returns(address, uint){
		return (slots[_slotIndex].winner, slots[_slotIndex].bid);
	}
}