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

    // ================ uint8 ================

    mapping(address=>mapping(bytes=>uint8)) uint8_store;

    function get_uint8_value(address addr, bytes key) constant returns(uint8){
        return uint8_store[addr][key];
    }

    function set_uint8_value(bytes key, uint8 value){
        uint8_store[msg.sender][key] = value;
    }

    // ================ int8 ================

    mapping(address=>mapping(bytes=>int8)) int8_store;

    function get_int8_value(address addr, bytes key) constant returns(int8){
        return int8_store[addr][key];
    }

    function set_int8_value(bytes key, int8 value){
        int8_store[msg.sender][key] = value;
    }

    // ================ uint16 ================

    mapping(address=>mapping(bytes=>uint16)) uint16_store;

    function get_uint16_value(address addr, bytes key) constant returns(uint16){
        return uint16_store[addr][key];
    }

    function set_uint16_value(bytes key, uint16 value){
        uint16_store[msg.sender][key] = value;
    }

    // ================ int16 ================

    mapping(address=>mapping(bytes=>int16)) int16_store;

    function get_int16_value(address addr, bytes key) constant returns(int16){
        return int16_store[addr][key];
    }

    function set_int16_value(bytes key, int16 value){
        int16_store[msg.sender][key] = value;
    }

    // ================ uint24 ================

    mapping(address=>mapping(bytes=>uint24)) uint24_store;

    function get_uint24_value(address addr, bytes key) constant returns(uint24){
        return uint24_store[addr][key];
    }

    function set_uint24_value(bytes key, uint24 value){
        uint24_store[msg.sender][key] = value;
    }

    // ================ int24 ================

    mapping(address=>mapping(bytes=>int24)) int24_store;

    function get_int24_value(address addr, bytes key) constant returns(int24){
        return int24_store[addr][key];
    }

    function set_int24_value(bytes key, int24 value){
        int24_store[msg.sender][key] = value;
    }

    // ================ uint32 ================

    mapping(address=>mapping(bytes=>uint32)) uint32_store;

    function get_uint32_value(address addr, bytes key) constant returns(uint32){
        return uint32_store[addr][key];
    }

    function set_uint32_value(bytes key, uint32 value){
        uint32_store[msg.sender][key] = value;
    }

    // ================ int32 ================

    mapping(address=>mapping(bytes=>int32)) int32_store;

    function get_int32_value(address addr, bytes key) constant returns(int32){
        return int32_store[addr][key];
    }

    function set_int32_value(bytes key, int32 value){
        int32_store[msg.sender][key] = value;
    }

    // ================ uint40 ================

    mapping(address=>mapping(bytes=>uint40)) uint40_store;

    function get_uint40_value(address addr, bytes key) constant returns(uint40){
        return uint40_store[addr][key];
    }

    function set_uint40_value(bytes key, uint40 value){
        uint40_store[msg.sender][key] = value;
    }

    // ================ int40 ================

    mapping(address=>mapping(bytes=>int40)) int40_store;

    function get_int40_value(address addr, bytes key) constant returns(int40){
        return int40_store[addr][key];
    }

    function set_int40_value(bytes key, int40 value){
        int40_store[msg.sender][key] = value;
    }

    // ================ uint48 ================

    mapping(address=>mapping(bytes=>uint48)) uint48_store;

    function get_uint48_value(address addr, bytes key) constant returns(uint48){
        return uint48_store[addr][key];
    }

    function set_uint48_value(bytes key, uint48 value){
        uint48_store[msg.sender][key] = value;
    }

    // ================ int48 ================

    mapping(address=>mapping(bytes=>int48)) int48_store;

    function get_int48_value(address addr, bytes key) constant returns(int48){
        return int48_store[addr][key];
    }

    function set_int48_value(bytes key, int48 value){
        int48_store[msg.sender][key] = value;
    }

    // ================ uint56 ================

    mapping(address=>mapping(bytes=>uint56)) uint56_store;

    function get_uint56_value(address addr, bytes key) constant returns(uint56){
        return uint56_store[addr][key];
    }

    function set_uint56_value(bytes key, uint56 value){
        uint56_store[msg.sender][key] = value;
    }

    // ================ int56 ================

    mapping(address=>mapping(bytes=>int56)) int56_store;

    function get_int56_value(address addr, bytes key) constant returns(int56){
        return int56_store[addr][key];
    }

    function set_int56_value(bytes key, int56 value){
        int56_store[msg.sender][key] = value;
    }

    // ================ uint64 ================

    mapping(address=>mapping(bytes=>uint64)) uint64_store;

    function get_uint64_value(address addr, bytes key) constant returns(uint64){
        return uint64_store[addr][key];
    }

    function set_uint64_value(bytes key, uint64 value){
        uint64_store[msg.sender][key] = value;
    }

    // ================ int64 ================

    mapping(address=>mapping(bytes=>int64)) int64_store;

    function get_int64_value(address addr, bytes key) constant returns(int64){
        return int64_store[addr][key];
    }

    function set_int64_value(bytes key, int64 value){
        int64_store[msg.sender][key] = value;
    }

    // ================ uint72 ================

    mapping(address=>mapping(bytes=>uint72)) uint72_store;

    function get_uint72_value(address addr, bytes key) constant returns(uint72){
        return uint72_store[addr][key];
    }

    function set_uint72_value(bytes key, uint72 value){
        uint72_store[msg.sender][key] = value;
    }

    // ================ int72 ================

    mapping(address=>mapping(bytes=>int72)) int72_store;

    function get_int72_value(address addr, bytes key) constant returns(int72){
        return int72_store[addr][key];
    }

    function set_int72_value(bytes key, int72 value){
        int72_store[msg.sender][key] = value;
    }

    // ================ uint80 ================

    mapping(address=>mapping(bytes=>uint80)) uint80_store;

    function get_uint80_value(address addr, bytes key) constant returns(uint80){
        return uint80_store[addr][key];
    }

    function set_uint80_value(bytes key, uint80 value){
        uint80_store[msg.sender][key] = value;
    }

    // ================ int80 ================

    mapping(address=>mapping(bytes=>int80)) int80_store;

    function get_int80_value(address addr, bytes key) constant returns(int80){
        return int80_store[addr][key];
    }

    function set_int80_value(bytes key, int80 value){
        int80_store[msg.sender][key] = value;
    }

    // ================ uint88 ================

    mapping(address=>mapping(bytes=>uint88)) uint88_store;

    function get_uint88_value(address addr, bytes key) constant returns(uint88){
        return uint88_store[addr][key];
    }

    function set_uint88_value(bytes key, uint88 value){
        uint88_store[msg.sender][key] = value;
    }

    // ================ int88 ================

    mapping(address=>mapping(bytes=>int88)) int88_store;

    function get_int88_value(address addr, bytes key) constant returns(int88){
        return int88_store[addr][key];
    }

    function set_int88_value(bytes key, int88 value){
        int88_store[msg.sender][key] = value;
    }

    // ================ uint96 ================

    mapping(address=>mapping(bytes=>uint96)) uint96_store;

    function get_uint96_value(address addr, bytes key) constant returns(uint96){
        return uint96_store[addr][key];
    }

    function set_uint96_value(bytes key, uint96 value){
        uint96_store[msg.sender][key] = value;
    }

    // ================ int96 ================

    mapping(address=>mapping(bytes=>int96)) int96_store;

    function get_int96_value(address addr, bytes key) constant returns(int96){
        return int96_store[addr][key];
    }

    function set_int96_value(bytes key, int96 value){
        int96_store[msg.sender][key] = value;
    }

    // ================ uint104 ================

    mapping(address=>mapping(bytes=>uint104)) uint104_store;

    function get_uint104_value(address addr, bytes key) constant returns(uint104){
        return uint104_store[addr][key];
    }

    function set_uint104_value(bytes key, uint104 value){
        uint104_store[msg.sender][key] = value;
    }

    // ================ int104 ================

    mapping(address=>mapping(bytes=>int104)) int104_store;

    function get_int104_value(address addr, bytes key) constant returns(int104){
        return int104_store[addr][key];
    }

    function set_int104_value(bytes key, int104 value){
        int104_store[msg.sender][key] = value;
    }

    // ================ uint112 ================

    mapping(address=>mapping(bytes=>uint112)) uint112_store;

    function get_uint112_value(address addr, bytes key) constant returns(uint112){
        return uint112_store[addr][key];
    }

    function set_uint112_value(bytes key, uint112 value){
        uint112_store[msg.sender][key] = value;
    }

    // ================ int112 ================

    mapping(address=>mapping(bytes=>int112)) int112_store;

    function get_int112_value(address addr, bytes key) constant returns(int112){
        return int112_store[addr][key];
    }

    function set_int112_value(bytes key, int112 value){
        int112_store[msg.sender][key] = value;
    }

    // ================ uint120 ================

    mapping(address=>mapping(bytes=>uint120)) uint120_store;

    function get_uint120_value(address addr, bytes key) constant returns(uint120){
        return uint120_store[addr][key];
    }

    function set_uint120_value(bytes key, uint120 value){
        uint120_store[msg.sender][key] = value;
    }

    // ================ int120 ================

    mapping(address=>mapping(bytes=>int120)) int120_store;

    function get_int120_value(address addr, bytes key) constant returns(int120){
        return int120_store[addr][key];
    }

    function set_int120_value(bytes key, int120 value){
        int120_store[msg.sender][key] = value;
    }

    // ================ uint128 ================

    mapping(address=>mapping(bytes=>uint128)) uint128_store;

    function get_uint128_value(address addr, bytes key) constant returns(uint128){
        return uint128_store[addr][key];
    }

    function set_uint128_value(bytes key, uint128 value){
        uint128_store[msg.sender][key] = value;
    }

    // ================ int128 ================

    mapping(address=>mapping(bytes=>int128)) int128_store;

    function get_int128_value(address addr, bytes key) constant returns(int128){
        return int128_store[addr][key];
    }

    function set_int128_value(bytes key, int128 value){
        int128_store[msg.sender][key] = value;
    }

    // ================ uint136 ================

    mapping(address=>mapping(bytes=>uint136)) uint136_store;

    function get_uint136_value(address addr, bytes key) constant returns(uint136){
        return uint136_store[addr][key];
    }

    function set_uint136_value(bytes key, uint136 value){
        uint136_store[msg.sender][key] = value;
    }

    // ================ int136 ================

    mapping(address=>mapping(bytes=>int136)) int136_store;

    function get_int136_value(address addr, bytes key) constant returns(int136){
        return int136_store[addr][key];
    }

    function set_int136_value(bytes key, int136 value){
        int136_store[msg.sender][key] = value;
    }

    // ================ uint144 ================

    mapping(address=>mapping(bytes=>uint144)) uint144_store;

    function get_uint144_value(address addr, bytes key) constant returns(uint144){
        return uint144_store[addr][key];
    }

    function set_uint144_value(bytes key, uint144 value){
        uint144_store[msg.sender][key] = value;
    }

    // ================ int144 ================

    mapping(address=>mapping(bytes=>int144)) int144_store;

    function get_int144_value(address addr, bytes key) constant returns(int144){
        return int144_store[addr][key];
    }

    function set_int144_value(bytes key, int144 value){
        int144_store[msg.sender][key] = value;
    }

    // ================ uint152 ================

    mapping(address=>mapping(bytes=>uint152)) uint152_store;

    function get_uint152_value(address addr, bytes key) constant returns(uint152){
        return uint152_store[addr][key];
    }

    function set_uint152_value(bytes key, uint152 value){
        uint152_store[msg.sender][key] = value;
    }

    // ================ int152 ================

    mapping(address=>mapping(bytes=>int152)) int152_store;

    function get_int152_value(address addr, bytes key) constant returns(int152){
        return int152_store[addr][key];
    }

    function set_int152_value(bytes key, int152 value){
        int152_store[msg.sender][key] = value;
    }

    // ================ uint160 ================

    mapping(address=>mapping(bytes=>uint160)) uint160_store;

    function get_uint160_value(address addr, bytes key) constant returns(uint160){
        return uint160_store[addr][key];
    }

    function set_uint160_value(bytes key, uint160 value){
        uint160_store[msg.sender][key] = value;
    }

    // ================ int160 ================

    mapping(address=>mapping(bytes=>int160)) int160_store;

    function get_int160_value(address addr, bytes key) constant returns(int160){
        return int160_store[addr][key];
    }

    function set_int160_value(bytes key, int160 value){
        int160_store[msg.sender][key] = value;
    }

    // ================ uint168 ================

    mapping(address=>mapping(bytes=>uint168)) uint168_store;

    function get_uint168_value(address addr, bytes key) constant returns(uint168){
        return uint168_store[addr][key];
    }

    function set_uint168_value(bytes key, uint168 value){
        uint168_store[msg.sender][key] = value;
    }

    // ================ int168 ================

    mapping(address=>mapping(bytes=>int168)) int168_store;

    function get_int168_value(address addr, bytes key) constant returns(int168){
        return int168_store[addr][key];
    }

    function set_int168_value(bytes key, int168 value){
        int168_store[msg.sender][key] = value;
    }

    // ================ uint176 ================

    mapping(address=>mapping(bytes=>uint176)) uint176_store;

    function get_uint176_value(address addr, bytes key) constant returns(uint176){
        return uint176_store[addr][key];
    }

    function set_uint176_value(bytes key, uint176 value){
        uint176_store[msg.sender][key] = value;
    }

    // ================ int176 ================

    mapping(address=>mapping(bytes=>int176)) int176_store;

    function get_int176_value(address addr, bytes key) constant returns(int176){
        return int176_store[addr][key];
    }

    function set_int176_value(bytes key, int176 value){
        int176_store[msg.sender][key] = value;
    }

    // ================ uint184 ================

    mapping(address=>mapping(bytes=>uint184)) uint184_store;

    function get_uint184_value(address addr, bytes key) constant returns(uint184){
        return uint184_store[addr][key];
    }

    function set_uint184_value(bytes key, uint184 value){
        uint184_store[msg.sender][key] = value;
    }

    // ================ int184 ================

    mapping(address=>mapping(bytes=>int184)) int184_store;

    function get_int184_value(address addr, bytes key) constant returns(int184){
        return int184_store[addr][key];
    }

    function set_int184_value(bytes key, int184 value){
        int184_store[msg.sender][key] = value;
    }

    // ================ uint192 ================

    mapping(address=>mapping(bytes=>uint192)) uint192_store;

    function get_uint192_value(address addr, bytes key) constant returns(uint192){
        return uint192_store[addr][key];
    }

    function set_uint192_value(bytes key, uint192 value){
        uint192_store[msg.sender][key] = value;
    }

    // ================ int192 ================

    mapping(address=>mapping(bytes=>int192)) int192_store;

    function get_int192_value(address addr, bytes key) constant returns(int192){
        return int192_store[addr][key];
    }

    function set_int192_value(bytes key, int192 value){
        int192_store[msg.sender][key] = value;
    }

    // ================ uint200 ================

    mapping(address=>mapping(bytes=>uint200)) uint200_store;

    function get_uint200_value(address addr, bytes key) constant returns(uint200){
        return uint200_store[addr][key];
    }

    function set_uint200_value(bytes key, uint200 value){
        uint200_store[msg.sender][key] = value;
    }

    // ================ int200 ================

    mapping(address=>mapping(bytes=>int200)) int200_store;

    function get_int200_value(address addr, bytes key) constant returns(int200){
        return int200_store[addr][key];
    }

    function set_int200_value(bytes key, int200 value){
        int200_store[msg.sender][key] = value;
    }

    // ================ uint208 ================

    mapping(address=>mapping(bytes=>uint208)) uint208_store;

    function get_uint208_value(address addr, bytes key) constant returns(uint208){
        return uint208_store[addr][key];
    }

    function set_uint208_value(bytes key, uint208 value){
        uint208_store[msg.sender][key] = value;
    }

    // ================ int208 ================

    mapping(address=>mapping(bytes=>int208)) int208_store;

    function get_int208_value(address addr, bytes key) constant returns(int208){
        return int208_store[addr][key];
    }

    function set_int208_value(bytes key, int208 value){
        int208_store[msg.sender][key] = value;
    }

    // ================ uint216 ================

    mapping(address=>mapping(bytes=>uint216)) uint216_store;

    function get_uint216_value(address addr, bytes key) constant returns(uint216){
        return uint216_store[addr][key];
    }

    function set_uint216_value(bytes key, uint216 value){
        uint216_store[msg.sender][key] = value;
    }

    // ================ int216 ================

    mapping(address=>mapping(bytes=>int216)) int216_store;

    function get_int216_value(address addr, bytes key) constant returns(int216){
        return int216_store[addr][key];
    }

    function set_int216_value(bytes key, int216 value){
        int216_store[msg.sender][key] = value;
    }

    // ================ uint224 ================

    mapping(address=>mapping(bytes=>uint224)) uint224_store;

    function get_uint224_value(address addr, bytes key) constant returns(uint224){
        return uint224_store[addr][key];
    }

    function set_uint224_value(bytes key, uint224 value){
        uint224_store[msg.sender][key] = value;
    }

    // ================ int224 ================

    mapping(address=>mapping(bytes=>int224)) int224_store;

    function get_int224_value(address addr, bytes key) constant returns(int224){
        return int224_store[addr][key];
    }

    function set_int224_value(bytes key, int224 value){
        int224_store[msg.sender][key] = value;
    }

    // ================ uint232 ================

    mapping(address=>mapping(bytes=>uint232)) uint232_store;

    function get_uint232_value(address addr, bytes key) constant returns(uint232){
        return uint232_store[addr][key];
    }

    function set_uint232_value(bytes key, uint232 value){
        uint232_store[msg.sender][key] = value;
    }

    // ================ int232 ================

    mapping(address=>mapping(bytes=>int232)) int232_store;

    function get_int232_value(address addr, bytes key) constant returns(int232){
        return int232_store[addr][key];
    }

    function set_int232_value(bytes key, int232 value){
        int232_store[msg.sender][key] = value;
    }

    // ================ uint240 ================

    mapping(address=>mapping(bytes=>uint240)) uint240_store;

    function get_uint240_value(address addr, bytes key) constant returns(uint240){
        return uint240_store[addr][key];
    }

    function set_uint240_value(bytes key, uint240 value){
        uint240_store[msg.sender][key] = value;
    }

    // ================ int240 ================

    mapping(address=>mapping(bytes=>int240)) int240_store;

    function get_int240_value(address addr, bytes key) constant returns(int240){
        return int240_store[addr][key];
    }

    function set_int240_value(bytes key, int240 value){
        int240_store[msg.sender][key] = value;
    }

    // ================ uint248 ================

    mapping(address=>mapping(bytes=>uint248)) uint248_store;

    function get_uint248_value(address addr, bytes key) constant returns(uint248){
        return uint248_store[addr][key];
    }

    function set_uint248_value(bytes key, uint248 value){
        uint248_store[msg.sender][key] = value;
    }

    // ================ int248 ================

    mapping(address=>mapping(bytes=>int248)) int248_store;

    function get_int248_value(address addr, bytes key) constant returns(int248){
        return int248_store[addr][key];
    }

    function set_int248_value(bytes key, int248 value){
        int248_store[msg.sender][key] = value;
    }

    // ================ uint256 ================

    mapping(address=>mapping(bytes=>uint256)) uint256_store;

    function get_uint256_value(address addr, bytes key) constant returns(uint256){
        return uint256_store[addr][key];
    }

    function set_uint256_value(bytes key, uint256 value){
        uint256_store[msg.sender][key] = value;
    }

    // ================ int256 ================

    mapping(address=>mapping(bytes=>int256)) int256_store;

    function get_int256_value(address addr, bytes key) constant returns(int256){
        return int256_store[addr][key];
    }

    function set_int256_value(bytes key, int256 value){
        int256_store[msg.sender][key] = value;
    }
}