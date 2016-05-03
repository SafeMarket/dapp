contract Ticker{
	address owner;
	mapping(bytes4 => uint) prices;

	function Ticker() {
		owner = msg.sender;
	}

	function setPrice(bytes4 currency, uint price) {
		if(msg.sender != owner && tx.origin != owner)
			throw;

		prices[currency] = price;
	}

	function getPrice(bytes4 currency) constant returns (uint){
		return prices[currency];
	}

	function convert(uint amount, bytes4 currencyFrom, bytes4 currencyTo) constant returns(uint){
		return ((amount*prices[currencyFrom])/prices[currencyTo]);
	}
}