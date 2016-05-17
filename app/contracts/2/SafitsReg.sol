contract SafitsReg is permissioned{

	uint bump;

	uint public period0;
	uint public totalSupply;
	mapping(address => Holder) holders;
	mapping(uint => RegLog) regLogs;

	struct RegLog {
		bool isFinalized;
		uint weiReceived;
		uint safitsInc;
		uint safitsSupply;
	}

	struct Holder {
		uint period0;
		uint safitsBalance;
		uint weiUnpaid;
		mapping(uint => HolderLog) logs;
	}

	struct HolderLog {
		bool isFinalized;
		uint safitsInc;
		uint safitsDec;
		uint safitsBalance;
	}

	function SafitsReg(address _owner) {
		owner = msg.sender;
		period0 = getPeriod();
	}

	function finalizeRegLog(uint period) {
		
		if(period >= getPeriod())
			throw;

		if(regLogs[period].isFinalized)
			throw;

		if(period != period0 && !regLogs[period - 1].isFinalized)
			throw;

		regLogs[period].safitsSupply = regLogs[period-1].safitsSupply + regLogs[period].safitsInc;
		regLogs[period].isFinalized = true;

	}

	function finalizeHolderLog(address addr, uint period) {
		
		if(!regLogs[period].isFinalized)
			throw;

		Holder holder = holders[addr];

		if(holder.logs[period].isFinalized)
			throw;

		if(period != holder.period0 && !holder.logs[period - 1].isFinalized)
			throw;

		holder.logs[period].safitsBalance =
			holder.logs[period-1].safitsBalance
			+ holder.logs[period].safitsInc
			- holder.logs[period].safitsDec;

		if (holder.logs[period].safitsBalance > 0) {
			holder.weiUnpaid += ((holder.logs[period].safitsBalance * regLogs[period].weiReceived) / regLogs[period].safitsSupply);
		}

		holder.logs[period].isFinalized = true;

	}

	function getPeriod() constant returns (uint){
		return now / (7 days);
	}

	function inflate(address addr, uint count) {
		requireSenderPermission('inflate');
		totalSupply += count;
		regLogs[getPeriod()].safitsInc += count;
		holders[addr].safitsBalance += count;
		holders[addr].logs[getPeriod()].safitsInc += count;

		if(holders[addr].period0 == 0){
			holders[addr].period0 = getPeriod();
		}
	}

	function depositWei() {
		regLogs[getPeriod()].weiReceived += msg.value;
	}

	function withdrawWei() {
		if(!msg.sender.send(holders[msg.sender].weiUnpaid))
			throw;

		holders[msg.sender].weiUnpaid = 0;
	}

	function getHolderParams(address addr) constant returns(uint, uint, uint) {
		Holder holder = holders[addr];
		return (holder.period0, holder.safitsBalance, holder.weiUnpaid);
	}

	function getRegLogParams(uint period) constant returns(bool, uint, uint, uint) {
		RegLog regLog = regLogs[period];
		return (regLog.isFinalized, regLog.weiReceived, regLog.safitsInc, regLog.safitsSupply);
	}

	function getHolderLogParams(address addr, uint period) constant returns(bool, uint, uint, uint) {
		HolderLog holderLog = holders[addr].logs[period];
		return (holderLog.isFinalized, holderLog.safitsInc, holderLog.safitsDec, holderLog.safitsBalance);
	}

	function bootstrapHolder(address addr) {
		if(holders[addr].period0 == 0){
			holders[addr].period0 = getPeriod();
		}
	}

}