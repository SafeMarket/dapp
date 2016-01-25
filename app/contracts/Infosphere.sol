contract Infosphere{

    // ================ bool ================

    mapping(address=>mapping(bytes=>bool)) bool_store;

    function get_bool_value(address addr, bytes key) constant returns(bool){
        return bool_store[addr][key];
    }

    function set_bool_value(bytes key, bool value){
        bool_store[msg.sender][key] = value;
    }

    // ================ address ================

    mapping(address=>mapping(bytes=>address)) address_store;

    function get_address_value(address addr, bytes key) constant returns(address){
        return address_store[addr][key];
    }

    function set_address_value(bytes key, address value){
        address_store[msg.sender][key] = value;
    }

    // ================ bytes ================

    mapping(address=>mapping(bytes=>bytes)) bytes_store;

    function get_bytes_value(address addr, bytes key) constant returns(bytes){
        return bytes_store[addr][key];
    }

    function set_bytes_value(bytes key, bytes value){
        bytes_store[msg.sender][key] = value;
    }

    // ================ string ================

    mapping(address=>mapping(bytes=>string)) string_store;

    function get_string_value(address addr, bytes key) constant returns(string){
        return string_store[addr][key];
    }

    function set_string_value(bytes key, string value){
        string_store[msg.sender][key] = value;
    }

    // ================ int ================

    mapping(address=>mapping(bytes=>int)) int_store;

    function get_int_value(address addr, bytes key) constant returns(int){
        return int_store[addr][key];
    }

    function set_int_value(bytes key, int value){
        int_store[msg.sender][key] = value;
    }

    // ================ uint ================

    mapping(address=>mapping(bytes=>uint)) uint_store;

    function get_uint_value(address addr, bytes key) constant returns(uint){
        return uint_store[addr][key];
    }

    function set_uint_value(bytes key, uint value){
        uint_store[msg.sender][key] = value;
    }

    // ================ bytes1 ================

    mapping(address=>mapping(bytes=>bytes1)) bytes1_store;

    function get_bytes1_value(address addr, bytes key) constant returns(bytes1){
        return bytes1_store[addr][key];
    }

    function set_bytes1_value(bytes key, bytes1 value){
        bytes1_store[msg.sender][key] = value;
    }

    // ================ bytes2 ================

    mapping(address=>mapping(bytes=>bytes2)) bytes2_store;

    function get_bytes2_value(address addr, bytes key) constant returns(bytes2){
        return bytes2_store[addr][key];
    }

    function set_bytes2_value(bytes key, bytes2 value){
        bytes2_store[msg.sender][key] = value;
    }

    // ================ bytes3 ================

    mapping(address=>mapping(bytes=>bytes3)) bytes3_store;

    function get_bytes3_value(address addr, bytes key) constant returns(bytes3){
        return bytes3_store[addr][key];
    }

    function set_bytes3_value(bytes key, bytes3 value){
        bytes3_store[msg.sender][key] = value;
    }

    // ================ bytes4 ================

    mapping(address=>mapping(bytes=>bytes4)) bytes4_store;

    function get_bytes4_value(address addr, bytes key) constant returns(bytes4){
        return bytes4_store[addr][key];
    }

    function set_bytes4_value(bytes key, bytes4 value){
        bytes4_store[msg.sender][key] = value;
    }

    // ================ bytes5 ================

    mapping(address=>mapping(bytes=>bytes5)) bytes5_store;

    function get_bytes5_value(address addr, bytes key) constant returns(bytes5){
        return bytes5_store[addr][key];
    }

    function set_bytes5_value(bytes key, bytes5 value){
        bytes5_store[msg.sender][key] = value;
    }

    // ================ bytes6 ================

    mapping(address=>mapping(bytes=>bytes6)) bytes6_store;

    function get_bytes6_value(address addr, bytes key) constant returns(bytes6){
        return bytes6_store[addr][key];
    }

    function set_bytes6_value(bytes key, bytes6 value){
        bytes6_store[msg.sender][key] = value;
    }

    // ================ bytes7 ================

    mapping(address=>mapping(bytes=>bytes7)) bytes7_store;

    function get_bytes7_value(address addr, bytes key) constant returns(bytes7){
        return bytes7_store[addr][key];
    }

    function set_bytes7_value(bytes key, bytes7 value){
        bytes7_store[msg.sender][key] = value;
    }

    // ================ bytes8 ================

    mapping(address=>mapping(bytes=>bytes8)) bytes8_store;

    function get_bytes8_value(address addr, bytes key) constant returns(bytes8){
        return bytes8_store[addr][key];
    }

    function set_bytes8_value(bytes key, bytes8 value){
        bytes8_store[msg.sender][key] = value;
    }

    // ================ bytes9 ================

    mapping(address=>mapping(bytes=>bytes9)) bytes9_store;

    function get_bytes9_value(address addr, bytes key) constant returns(bytes9){
        return bytes9_store[addr][key];
    }

    function set_bytes9_value(bytes key, bytes9 value){
        bytes9_store[msg.sender][key] = value;
    }

    // ================ bytes10 ================

    mapping(address=>mapping(bytes=>bytes10)) bytes10_store;

    function get_bytes10_value(address addr, bytes key) constant returns(bytes10){
        return bytes10_store[addr][key];
    }

    function set_bytes10_value(bytes key, bytes10 value){
        bytes10_store[msg.sender][key] = value;
    }

    // ================ bytes11 ================

    mapping(address=>mapping(bytes=>bytes11)) bytes11_store;

    function get_bytes11_value(address addr, bytes key) constant returns(bytes11){
        return bytes11_store[addr][key];
    }

    function set_bytes11_value(bytes key, bytes11 value){
        bytes11_store[msg.sender][key] = value;
    }

    // ================ bytes12 ================

    mapping(address=>mapping(bytes=>bytes12)) bytes12_store;

    function get_bytes12_value(address addr, bytes key) constant returns(bytes12){
        return bytes12_store[addr][key];
    }

    function set_bytes12_value(bytes key, bytes12 value){
        bytes12_store[msg.sender][key] = value;
    }

    // ================ bytes13 ================

    mapping(address=>mapping(bytes=>bytes13)) bytes13_store;

    function get_bytes13_value(address addr, bytes key) constant returns(bytes13){
        return bytes13_store[addr][key];
    }

    function set_bytes13_value(bytes key, bytes13 value){
        bytes13_store[msg.sender][key] = value;
    }

    // ================ bytes14 ================

    mapping(address=>mapping(bytes=>bytes14)) bytes14_store;

    function get_bytes14_value(address addr, bytes key) constant returns(bytes14){
        return bytes14_store[addr][key];
    }

    function set_bytes14_value(bytes key, bytes14 value){
        bytes14_store[msg.sender][key] = value;
    }

    // ================ bytes15 ================

    mapping(address=>mapping(bytes=>bytes15)) bytes15_store;

    function get_bytes15_value(address addr, bytes key) constant returns(bytes15){
        return bytes15_store[addr][key];
    }

    function set_bytes15_value(bytes key, bytes15 value){
        bytes15_store[msg.sender][key] = value;
    }

    // ================ bytes16 ================

    mapping(address=>mapping(bytes=>bytes16)) bytes16_store;

    function get_bytes16_value(address addr, bytes key) constant returns(bytes16){
        return bytes16_store[addr][key];
    }

    function set_bytes16_value(bytes key, bytes16 value){
        bytes16_store[msg.sender][key] = value;
    }

    // ================ bytes17 ================

    mapping(address=>mapping(bytes=>bytes17)) bytes17_store;

    function get_bytes17_value(address addr, bytes key) constant returns(bytes17){
        return bytes17_store[addr][key];
    }

    function set_bytes17_value(bytes key, bytes17 value){
        bytes17_store[msg.sender][key] = value;
    }

    // ================ bytes18 ================

    mapping(address=>mapping(bytes=>bytes18)) bytes18_store;

    function get_bytes18_value(address addr, bytes key) constant returns(bytes18){
        return bytes18_store[addr][key];
    }

    function set_bytes18_value(bytes key, bytes18 value){
        bytes18_store[msg.sender][key] = value;
    }

    // ================ bytes19 ================

    mapping(address=>mapping(bytes=>bytes19)) bytes19_store;

    function get_bytes19_value(address addr, bytes key) constant returns(bytes19){
        return bytes19_store[addr][key];
    }

    function set_bytes19_value(bytes key, bytes19 value){
        bytes19_store[msg.sender][key] = value;
    }

    // ================ bytes20 ================

    mapping(address=>mapping(bytes=>bytes20)) bytes20_store;

    function get_bytes20_value(address addr, bytes key) constant returns(bytes20){
        return bytes20_store[addr][key];
    }

    function set_bytes20_value(bytes key, bytes20 value){
        bytes20_store[msg.sender][key] = value;
    }

    // ================ bytes21 ================

    mapping(address=>mapping(bytes=>bytes21)) bytes21_store;

    function get_bytes21_value(address addr, bytes key) constant returns(bytes21){
        return bytes21_store[addr][key];
    }

    function set_bytes21_value(bytes key, bytes21 value){
        bytes21_store[msg.sender][key] = value;
    }

    // ================ bytes22 ================

    mapping(address=>mapping(bytes=>bytes22)) bytes22_store;

    function get_bytes22_value(address addr, bytes key) constant returns(bytes22){
        return bytes22_store[addr][key];
    }

    function set_bytes22_value(bytes key, bytes22 value){
        bytes22_store[msg.sender][key] = value;
    }

    // ================ bytes23 ================

    mapping(address=>mapping(bytes=>bytes23)) bytes23_store;

    function get_bytes23_value(address addr, bytes key) constant returns(bytes23){
        return bytes23_store[addr][key];
    }

    function set_bytes23_value(bytes key, bytes23 value){
        bytes23_store[msg.sender][key] = value;
    }

    // ================ bytes24 ================

    mapping(address=>mapping(bytes=>bytes24)) bytes24_store;

    function get_bytes24_value(address addr, bytes key) constant returns(bytes24){
        return bytes24_store[addr][key];
    }

    function set_bytes24_value(bytes key, bytes24 value){
        bytes24_store[msg.sender][key] = value;
    }

    // ================ bytes25 ================

    mapping(address=>mapping(bytes=>bytes25)) bytes25_store;

    function get_bytes25_value(address addr, bytes key) constant returns(bytes25){
        return bytes25_store[addr][key];
    }

    function set_bytes25_value(bytes key, bytes25 value){
        bytes25_store[msg.sender][key] = value;
    }

    // ================ bytes26 ================

    mapping(address=>mapping(bytes=>bytes26)) bytes26_store;

    function get_bytes26_value(address addr, bytes key) constant returns(bytes26){
        return bytes26_store[addr][key];
    }

    function set_bytes26_value(bytes key, bytes26 value){
        bytes26_store[msg.sender][key] = value;
    }

    // ================ bytes27 ================

    mapping(address=>mapping(bytes=>bytes27)) bytes27_store;

    function get_bytes27_value(address addr, bytes key) constant returns(bytes27){
        return bytes27_store[addr][key];
    }

    function set_bytes27_value(bytes key, bytes27 value){
        bytes27_store[msg.sender][key] = value;
    }

    // ================ bytes28 ================

    mapping(address=>mapping(bytes=>bytes28)) bytes28_store;

    function get_bytes28_value(address addr, bytes key) constant returns(bytes28){
        return bytes28_store[addr][key];
    }

    function set_bytes28_value(bytes key, bytes28 value){
        bytes28_store[msg.sender][key] = value;
    }

    // ================ bytes29 ================

    mapping(address=>mapping(bytes=>bytes29)) bytes29_store;

    function get_bytes29_value(address addr, bytes key) constant returns(bytes29){
        return bytes29_store[addr][key];
    }

    function set_bytes29_value(bytes key, bytes29 value){
        bytes29_store[msg.sender][key] = value;
    }

    // ================ bytes30 ================

    mapping(address=>mapping(bytes=>bytes30)) bytes30_store;

    function get_bytes30_value(address addr, bytes key) constant returns(bytes30){
        return bytes30_store[addr][key];
    }

    function set_bytes30_value(bytes key, bytes30 value){
        bytes30_store[msg.sender][key] = value;
    }

    // ================ bytes31 ================

    mapping(address=>mapping(bytes=>bytes31)) bytes31_store;

    function get_bytes31_value(address addr, bytes key) constant returns(bytes31){
        return bytes31_store[addr][key];
    }

    function set_bytes31_value(bytes key, bytes31 value){
        bytes31_store[msg.sender][key] = value;
    }

    // ================ bytes32 ================

    mapping(address=>mapping(bytes=>bytes32)) bytes32_store;

    function get_bytes32_value(address addr, bytes key) constant returns(bytes32){
        return bytes32_store[addr][key];
    }

    function set_bytes32_value(bytes key, bytes32 value){
        bytes32_store[msg.sender][key] = value;
    }
}