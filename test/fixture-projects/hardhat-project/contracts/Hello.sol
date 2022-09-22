contract Hello {
    event Hello();
    uint256 public x;
    address public y;
    uint256 public w;

    uint256 public q;

    uint64 public a;
    uint64 public b;
    uint64 public c;
    uint64 public d;

    struct World {
        uint256 a;
        uint256 c;
        uint256 d;
        // Inner inner;
    }

    struct Inner {
        uint256 a;
        uint256 c;
        bytes32 d;
    }

    World[] public worlds;
    mapping(uint256 => World) public worldMap;
    World public world;

    bytes public data;
    string public name;
}
