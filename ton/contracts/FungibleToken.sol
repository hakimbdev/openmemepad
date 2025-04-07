pragma ton-solidity >= 0.57.0;

// Simple TON FungibleToken contract
contract FungibleToken {
    // Token details
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint128 private _totalSupply;
    
    // Owner address
    address private _owner;
    
    // Balances mapping
    mapping(address => uint128) private _balances;
    
    // Token creation events
    event TokenCreated(string name, string symbol, uint128 initialSupply);
    event Transfer(address indexed from, address indexed to, uint128 value);
    
    // Initialize token with parameters
    constructor(
        string name_,
        string symbol_,
        uint8 decimals_,
        uint128 initialSupply
    ) public {
        require(initialSupply > 0, "Initial supply must be positive");
        
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _totalSupply = initialSupply;
        _owner = msg.sender;
        
        // Assign all tokens to creator
        _balances[_owner] = _totalSupply;
        
        emit TokenCreated(_name, _symbol, _totalSupply);
        emit Transfer(address(0), _owner, _totalSupply);
    }
    
    // Token info getters
    function name() public view returns (string) {
        return _name;
    }
    
    function symbol() public view returns (string) {
        return _symbol;
    }
    
    function decimals() public view returns (uint8) {
        return _decimals;
    }
    
    function totalSupply() public view returns (uint128) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint128) {
        return _balances[account];
    }
    
    // Transfer tokens
    function transfer(address to, uint128 amount) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Transfer amount must be positive");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        
        return true;
    }
    
    // Only owner functions
    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner can call this function");
        _;
    }
    
    // Mint new tokens (only owner)
    function mint(address to, uint128 amount) public onlyOwner returns (bool) {
        require(to != address(0), "Mint to zero address");
        require(amount > 0, "Mint amount must be positive");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
        
        return true;
    }
    
    // Burn tokens
    function burn(uint128 amount) public returns (bool) {
        require(amount > 0, "Burn amount must be positive");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
        
        return true;
    }
} 