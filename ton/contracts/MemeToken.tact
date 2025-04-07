import "@stdlib/deploy";
import "@stdlib/ownable";

message TokenMint {
    amount: Int as coins;
    receiver: Address;
}

message TokenBurn {
    amount: Int as coins;
}

message TokenTransfer {
    amount: Int as coins;
    receiver: Address;
}

message UpdatePrice {
    newPrice: Int as coins;
}

message PoolData {
    liquidityTon: Int as coins;
    liquidityTokens: Int as coins;
}

contract MemeToken with Deployable, Ownable {
    name: String;
    symbol: String;
    totalSupply: Int as coins;
    totalBurned: Int as coins;
    decimals: Int = 9;
    
    // Token price tracking
    currentPrice: Int as coins; // price in nano TON
    lastPriceUpdate: Int as uint32; // unix timestamp
    
    // Pool reserves for DEX
    poolLiquidityTon: Int as coins;
    poolLiquidityTokens: Int as coins;
    
    // Holder balances
    balances: map<Address, Int>;
    
    init(
        name: String,
        symbol: String,
        initialSupply: Int,
        initialPrice: Int,
        owner: Address
    ) {
        self.name = name;
        self.symbol = symbol;
        self.totalSupply = initialSupply;
        self.totalBurned = 0;
        self.currentPrice = initialPrice;
        self.lastPriceUpdate = now();
        self.poolLiquidityTon = 0;
        self.poolLiquidityTokens = 0;
        
        // Mint initial supply to owner
        self.balances.set(owner, initialSupply);
        self.owner = owner;
    }
    
    // Get token info
    get fun name(): String {
        return self.name;
    }
    
    get fun symbol(): String {
        return self.symbol;
    }
    
    get fun decimals(): Int {
        return self.decimals;
    }
    
    get fun totalSupply(): Int {
        return self.totalSupply;
    }
    
    get fun totalBurned(): Int {
        return self.totalBurned;
    }
    
    get fun currentPrice(): Int {
        return self.currentPrice;
    }
    
    get fun lastPriceUpdate(): Int {
        return self.lastPriceUpdate;
    }
    
    get fun balanceOf(address: Address): Int {
        let balance: Int = self.balances.get(address);
        if (balance == null) {
            return 0;
        }
        return balance;
    }
    
    // Mint new tokens (only owner)
    receive(msg: TokenMint) {
        self.requireOwner();
        require(msg.amount > 0, "Amount must be positive");
        
        // Update balance
        let currentBalance: Int = self.balanceOf(msg.receiver);
        self.balances.set(msg.receiver, currentBalance + msg.amount);
        
        // Update total supply
        self.totalSupply = self.totalSupply + msg.amount;
    }
    
    // Burn tokens
    receive(msg: TokenBurn) {
        require(msg.amount > 0, "Amount must be positive");
        let senderBalance: Int = self.balanceOf(sender());
        require(senderBalance >= msg.amount, "Insufficient balance");
        
        // Update balance
        self.balances.set(sender(), senderBalance - msg.amount);
        
        // Update total supply and burned amount
        self.totalSupply = self.totalSupply - msg.amount;
        self.totalBurned = self.totalBurned + msg.amount;
    }
    
    // Transfer tokens
    receive(msg: TokenTransfer) {
        require(msg.amount > 0, "Amount must be positive");
        let senderBalance: Int = self.balanceOf(sender());
        require(senderBalance >= msg.amount, "Insufficient balance");
        
        // Update sender balance
        self.balances.set(sender(), senderBalance - msg.amount);
        
        // Update receiver balance
        let receiverBalance: Int = self.balanceOf(msg.receiver);
        self.balances.set(msg.receiver, receiverBalance + msg.amount);
    }
    
    // Update price (only owner)
    receive(msg: UpdatePrice) {
        self.requireOwner();
        self.currentPrice = msg.newPrice;
        self.lastPriceUpdate = now();
    }
    
    // Add Liquidity to the pool
    receive("Add Liquidity") {
        require(context().value >= ton("0.1"), "Insufficient TON sent");
        
        // Calculate required token amount based on current price
        let tokenAmount: Int = (context().value - ton("0.05")) * 1000000000 / self.currentPrice; // 0.05 TON fees
        let senderBalance: Int = self.balanceOf(sender());
        require(senderBalance >= tokenAmount, "Insufficient token balance");
        
        // Update sender balance
        self.balances.set(sender(), senderBalance - tokenAmount);
        
        // Update pool reserves
        self.poolLiquidityTon = self.poolLiquidityTon + context().value - ton("0.05");
        self.poolLiquidityTokens = self.poolLiquidityTokens + tokenAmount;
    }
    
    // Buy tokens with TON
    receive("Buy Tokens") {
        require(context().value >= ton("0.1"), "Minimum 0.1 TON required");
        
        // Calculate token amount based on current price
        let tonAmount: Int = context().value - ton("0.05"); // 0.05 TON fees
        let tokenAmount: Int = tonAmount * 1000000000 / self.currentPrice;
        
        // Check if there are enough tokens in the pool
        require(self.poolLiquidityTokens >= tokenAmount, "Insufficient liquidity");
        
        // Update pool reserves
        self.poolLiquidityTon = self.poolLiquidityTon + tonAmount;
        self.poolLiquidityTokens = self.poolLiquidityTokens - tokenAmount;
        
        // Update buyer balance
        let buyerBalance: Int = self.balanceOf(sender());
        self.balances.set(sender(), buyerBalance + tokenAmount);
        
        // Adjust price based on liquidity change (simple algorithm)
        let newPrice: Int = self.currentPrice * (1000 + (tonAmount * 10 / self.poolLiquidityTon)) / 1000;
        self.currentPrice = newPrice;
        self.lastPriceUpdate = now();
    }
    
    // Sell tokens for TON
    receive("Sell Tokens") {
        let tokenAmount: Int = context().value - ton("0.05"); // Amount specified in the message
        require(tokenAmount > 0, "Amount must be positive");
        
        let senderBalance: Int = self.balanceOf(sender());
        require(senderBalance >= tokenAmount, "Insufficient token balance");
        
        // Calculate TON amount based on current price
        let tonAmount: Int = tokenAmount * self.currentPrice / 1000000000;
        
        // Check if there is enough TON in the pool
        require(self.poolLiquidityTon >= tonAmount, "Insufficient liquidity");
        
        // Update pool reserves
        self.poolLiquidityTon = self.poolLiquidityTon - tonAmount;
        self.poolLiquidityTokens = self.poolLiquidityTokens + tokenAmount;
        
        // Update seller balance
        self.balances.set(sender(), senderBalance - tokenAmount);
        
        // Send TON to seller
        send(SendParameters{
            to: sender(),
            value: tonAmount,
            mode: SendIgnoreErrors
        });
        
        // Adjust price based on liquidity change (simple algorithm)
        let newPrice: Int = self.currentPrice * (1000 - (tokenAmount * 10 / self.poolLiquidityTokens)) / 1000;
        self.currentPrice = newPrice;
        self.lastPriceUpdate = now();
    }
    
    // Get pool data
    get fun getPoolData(): PoolData {
        return PoolData{
            liquidityTon: self.poolLiquidityTon,
            liquidityTokens: self.poolLiquidityTokens
        };
    }
} 