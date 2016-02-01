contract OpenStore{

  mapping (address => mapping(bytes32 => Datum)) data;

  struct Datum {
    bytes value;
    uint timestamp;
  }

  function set(bytes32 key, bytes value){
    data[tx.origin][key].value = value;
    data[tx.origin][key].timestamp = now;
  }

  function setFromContract(bytes32 key, bytes value){
    data[msg.sender][key].value = value;
    data[msg.sender][key].timestamp = now;
  }

  function getValue(address addr, bytes32 key) constant returns(bytes){
    return data[addr][key].value;
  }

  function getTimestamp(address addr, bytes32 key) constant returns(uint){
    return data[addr][key].timestamp;
  }
}
