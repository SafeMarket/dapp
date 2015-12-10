angular.module('safemarket').service('billboard',function(utils){
	
	this.slotIndexNow = utils.getBillboardSlotIndex()

	this.slots = []

	for(var i = -2; i<30; i++){
		this.slots.push(new Slot(this.slotIndexNow + i))
	}

	function Slot(slotIndex){
		var slotData = Billboard.getSlot(slotIndex)

		this.index = slotIndex
		this.timestamp = utils.getBillboardSlotTimestamp(slotIndex)
		this.winner = slotData[0] === '0x' ? null : slotData[0]
		this.bid = slotData[1]
	}
});