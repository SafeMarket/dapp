angular.module('safemarket').service('billboard',function(utils){
	
	var billboard = this
		,slot0Timestamp = this.slot0Timestamp = utils.timestamp0


	this.refresh = function(){

		billboard.slotIndexNow = (new BigNumber((new Date).getTime())).div(1000).div(86400).floor().toNumber()
		billboard.slots = []

		for(var i = -2; i<30; i++){
			this.slots.push(new Slot(this.slotIndexNow + i))
		}

		function Slot(slotIndex){
			var slotData = Billboard.getSlot(slotIndex)

			this.index = slotIndex
			this.timestamp = Billboard.getTimestampForSlot(slotIndex)
			this.timestampEnd = this.timestamp.plus(86400)
			this.winner = slotData[0] === utils.nullAddr ? null : slotData[0]
			this.bid = slotData[1]
			this.minimumBid = Billboard.getMinimumBidForSlot(slotIndex)
		}
	}

	this.refresh()
});