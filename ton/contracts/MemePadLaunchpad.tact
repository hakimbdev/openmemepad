import "@stdlib/deploy";
import "@stdlib/ownable";

// Store token data
struct TokenInfo {
    address: Address;
    name: String;
    symbol: String;
    creator: Address;
    initialSupply: Int as coins;
    initialPrice: Int as coins;
    launchTime: Int as uint32;
    description: String;
}

// Launch event data
message LaunchToken {
    name: String;
    symbol: String;
    initialSupply: Int as coins;
    initialPrice: Int as coins;
    description: String;
}

// Message to register existing token
message RegisterToken {
    tokenAddress: Address;
    name: String;
    symbol: String;
    initialPrice: Int as coins;
    description: String;
}

// Message to update token price
message UpdateTokenPrice {
    tokenAddress: Address;
    newPrice: Int as coins;
}

// Response message for listing tokens
message TokenList {
    tokens: map<Int, Address>;
}

contract MemePadLaunchpad with Deployable, Ownable {
    // Contract data
    launchFee: Int as coins = ton("0.5"); // Fee to launch a token (0.5 TON)
    platformFee: Int as coins = ton("0.1"); // Fee per transaction (0.1 TON)
    
    // Token registry
    nextTokenId: Int as uint32 = 1;
    tokenRegistry: map<Int, TokenInfo>; // token id -> token info
    tokenAddressMap: map<Address, Int>; // token address -> token id
    
    // Group tokens by creator
    creatorTokens: map<Address, map<Int, Bool>>; // creator -> map of token ids
    
    init(owner: Address) {
        self.owner = owner;
    }
    
    // Launch a new token
    receive(msg: LaunchToken) {
        // Require fee payment
        require(context().value >= self.launchFee, "Insufficient TON for token launch");
        
        // Initialize token deployment
        let tokenId: Int = self.nextTokenId;
        self.nextTokenId = self.nextTokenId + 1;
        
        // Deploy new token contract
        let tokenInit: StateInit = self.calculateTokenInit(
            msg.name,
            msg.symbol,
            msg.initialSupply,
            msg.initialPrice,
            sender()
        );
        
        let tokenAddress: Address = contractAddress(tokenInit);
        
        // Create and store token info
        let tokenInfo: TokenInfo = TokenInfo{
            address: tokenAddress,
            name: msg.name,
            symbol: msg.symbol,
            creator: sender(),
            initialSupply: msg.initialSupply,
            initialPrice: msg.initialPrice,
            launchTime: now(),
            description: msg.description
        };
        
        self.tokenRegistry.set(tokenId, tokenInfo);
        self.tokenAddressMap.set(tokenAddress, tokenId);
        
        // Add to creator's tokens
        let creatorTokenMap: map<Int, Bool> = self.creatorTokens.get(sender());
        if (creatorTokenMap == null) {
            creatorTokenMap = emptyMap();
        }
        creatorTokenMap.set(tokenId, true);
        self.creatorTokens.set(sender(), creatorTokenMap);
        
        // Deploy the token contract
        send(SendParameters{
            to: tokenAddress,
            value: ton("0.3"), // Send 0.3 TON for contract initialization
            mode: SendIgnoreErrors,
            body: "Deploy".asComment(),
            code: tokenInit.code,
            data: tokenInit.data
        });
        
        // Return remaining TON to sender
        let remaining: Int = context().value - self.launchFee;
        if (remaining > ton("0.05")) {
            send(SendParameters{
                to: sender(),
                value: remaining,
                mode: SendIgnoreErrors,
                body: "Token launch fee paid".asComment()
            });
        }
    }
    
    // Register an existing token
    receive(msg: RegisterToken) {
        // Only admin can register external tokens
        self.requireOwner();
        
        let tokenId: Int = self.nextTokenId;
        self.nextTokenId = self.nextTokenId + 1;
        
        // Create and store token info
        let tokenInfo: TokenInfo = TokenInfo{
            address: msg.tokenAddress,
            name: msg.name,
            symbol: msg.symbol,
            creator: sender(),
            initialSupply: 0, // Unknown
            initialPrice: msg.initialPrice,
            launchTime: now(),
            description: msg.description
        };
        
        self.tokenRegistry.set(tokenId, tokenInfo);
        self.tokenAddressMap.set(msg.tokenAddress, tokenId);
    }
    
    // Update token price data
    receive(msg: UpdateTokenPrice) {
        let tokenId: Int = self.tokenAddressMap.get(msg.tokenAddress);
        require(tokenId != null, "Token not found in registry");
        
        let tokenInfo: TokenInfo = self.tokenRegistry.get(tokenId)!!;
        
        // Only owner or token creator can update price
        require(
            sender() == self.owner || sender() == tokenInfo.creator,
            "Not authorized to update token price"
        );
        
        // Update price in registry
        tokenInfo.initialPrice = msg.newPrice;
        self.tokenRegistry.set(tokenId, tokenInfo);
        
        // Send price update to token contract
        send(SendParameters{
            to: msg.tokenAddress,
            value: ton("0.1"),
            mode: SendIgnoreErrors,
            body: beginCell()
                .storeUint(0x7362d09c, 32) // op for UpdatePrice
                .storeCoins(msg.newPrice)
                .endCell()
        });
    }
    
    // Calculate token contract StateInit
    fun calculateTokenInit(
        name: String,
        symbol: String,
        initialSupply: Int,
        initialPrice: Int,
        owner: Address
    ): StateInit {
        // In a real implementation, this would create a StateInit for a MemeToken
        return initOf MemeToken(name, symbol, initialSupply, initialPrice, owner);
    }
    
    // Get token info by ID
    get fun getTokenInfo(tokenId: Int): TokenInfo? {
        return self.tokenRegistry.get(tokenId);
    }
    
    // Get token ID by address
    get fun getTokenId(tokenAddress: Address): Int? {
        return self.tokenAddressMap.get(tokenAddress);
    }
    
    // Get list of all token IDs
    get fun getAllTokenIds(): Int[] {
        let ids: Int[] = [];
        
        // This is a simplified approach
        let i: Int = 1;
        while (i < self.nextTokenId) {
            if (self.tokenRegistry.get(i) != null) {
                ids~push(i);
            }
            i = i + 1;
        }
        
        return ids;
    }
    
    // Get list of tokens created by an address
    get fun getCreatorTokens(creator: Address): Int[] {
        let creatorTokenMap: map<Int, Bool> = self.creatorTokens.get(creator);
        if (creatorTokenMap == null) {
            return [];
        }
        
        let ids: Int[] = [];
        let keys: Int[] = creatorTokenMap.keys();
        
        let i: Int = 0;
        while (i < keys.length()) {
            ids~push(keys[i]);
            i = i + 1;
        }
        
        return ids;
    }
    
    // Get platform fees
    get fun getLaunchFee(): Int {
        return self.launchFee;
    }
    
    // Change platform fees (admin only)
    receive("Change Launch Fee: " + amount) {
        self.requireOwner();
        let amount: Int = ton(amount);
        self.launchFee = amount;
    }
    
    // Withdraw fees (admin only)
    receive("Withdraw Fees") {
        self.requireOwner();
        send(SendParameters{
            to: sender(),
            value: myBalance() - ton("0.1"), // Leave 0.1 TON for gas
            mode: SendIgnoreErrors
        });
    }
} 