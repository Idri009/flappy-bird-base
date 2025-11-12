// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FlappyBirdNFT
 * @dev NFT collection for Flappy Bird game on Base Network
 * Players can mint NFTs after completing games with qualifying scores
 */
contract FlappyBirdNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    uint256 private _tokenIdCounter = 1; // Start at 1
    
    // Game score thresholds for different NFT tiers
    uint256 public constant BRONZE_THRESHOLD = 10;
    uint256 public constant SILVER_THRESHOLD = 25;
    uint256 public constant GOLD_THRESHOLD = 50;
    uint256 public constant LEGENDARY_THRESHOLD = 100;
    
    // Minting limits per address
    mapping(address => uint256) public mintedCount;
    uint256 public constant MAX_MINTS_PER_ADDRESS = 10;
    
    // Minting cost in wei (0.0001 ETH on Base - affordable!)
    uint256 public mintPrice = 0.0001 ether;
    
    // NFT metadata URIs for different tiers
    string public bronzeURI = "https://flappy-bird-base.vercel.app/metadata/bronze.json";
    string public silverURI = "https://flappy-bird-base.vercel.app/metadata/silver.json";
    string public goldURI = "https://flappy-bird-base.vercel.app/metadata/gold.json";
    string public legendaryURI = "https://flappy-bird-base.vercel.app/metadata/legendary.json";
    
    // Game verification - tracks valid game sessions
    mapping(bytes32 => bool) public validGameSessions;
    
    // Events
    event BirdMinted(address indexed player, uint256 indexed tokenId, string tier, uint256 score);
    event GameSessionVerified(bytes32 indexed sessionId, address indexed player, uint256 score);
    event MetadataUpdated(string tier, string newURI);
    event MintPriceUpdated(uint256 newPrice);
    
    // Custom errors
    error InsufficientScore(uint256 required, uint256 provided);
    error InvalidGameSession();
    error MintLimitExceeded();
    error InsufficientPayment(uint256 required, uint256 provided);
    error WithdrawalFailed();
    
    constructor(address initialOwner) 
        ERC721("Flappy Bird NFT", "FBIRD") 
        Ownable(initialOwner) 
    {
        // Token IDs start at 1
    }
    
    /**
     * @dev Mint a Flappy Bird NFT based on game score
     * @param sessionId Unique game session identifier
     * @param score Final game score (pipes passed)
     * @param gameTime Time survived in seconds
     * @param jumps Total jumps made during session
     */
    function mintFlappyBirdNFT(
        bytes32 sessionId,
        uint256 score,
        uint256 gameTime,
        uint256 jumps
    ) external payable nonReentrant {
        // Verify game session hasn't been used
        if (validGameSessions[sessionId]) {
            revert InvalidGameSession();
        }
        
        // Check minting limits
        if (mintedCount[msg.sender] >= MAX_MINTS_PER_ADDRESS) {
            revert MintLimitExceeded();
        }
        
        // Verify minimum score threshold
        if (score < BRONZE_THRESHOLD) {
            revert InsufficientScore(BRONZE_THRESHOLD, score);
        }
        
        // Check payment
        if (msg.value < mintPrice) {
            revert InsufficientPayment(mintPrice, msg.value);
        }
        
        // Mark session as used
        validGameSessions[sessionId] = true;
        
        // Determine NFT tier based on score
        string memory tier;
        string memory tokenURIString;
        
        if (score >= LEGENDARY_THRESHOLD) {
            tier = "Legendary";
            tokenURIString = legendaryURI;
        } else if (score >= GOLD_THRESHOLD) {
            tier = "Gold";
            tokenURIString = goldURI;
        } else if (score >= SILVER_THRESHOLD) {
            tier = "Silver";
            tokenURIString = silverURI;
        } else {
            tier = "Bronze";
            tokenURIString = bronzeURI;
        }
        
        // Mint the NFT
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        mintedCount[msg.sender]++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURIString);
        
        emit BirdMinted(msg.sender, tokenId, tier, score);
        emit GameSessionVerified(sessionId, msg.sender, score);
    }
    
    /**
     * @dev Batch mint multiple NFTs (owner only, for special events)
     */
    function batchMint(address[] calldata recipients, string[] calldata tiers) 
        external 
        onlyOwner 
    {
        require(recipients.length == tiers.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            string memory tokenURIString = _getTierURI(tiers[i]);
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, tokenURIString);
            
            emit BirdMinted(recipients[i], tokenId, tiers[i], 0);
        }
    }
    
    /**
     * @dev Update metadata URI for a specific tier
     */
    function updateMetadataURI(string calldata tier, string calldata newURI) 
        external 
        onlyOwner 
    {
        bytes32 tierHash = keccak256(abi.encodePacked(tier));
        
        if (tierHash == keccak256(abi.encodePacked("Bronze"))) {
            bronzeURI = newURI;
        } else if (tierHash == keccak256(abi.encodePacked("Silver"))) {
            silverURI = newURI;
        } else if (tierHash == keccak256(abi.encodePacked("Gold"))) {
            goldURI = newURI;
        } else if (tierHash == keccak256(abi.encodePacked("Legendary"))) {
            legendaryURI = newURI;
        } else {
            revert("Invalid tier");
        }
        
        emit MetadataUpdated(tier, newURI);
    }
    
    /**
     * @dev Update mint price
     */
    function updateMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }
    
    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert WithdrawalFailed();
        }
    }
    
    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * @dev Get NFT tier requirements
     */
    function getTierRequirements() external pure returns (
        uint256 bronze,
        uint256 silver, 
        uint256 gold,
        uint256 legendary
    ) {
        return (BRONZE_THRESHOLD, SILVER_THRESHOLD, GOLD_THRESHOLD, LEGENDARY_THRESHOLD);
    }
    
    /**
     * @dev Get tier for a given score
     */
    function getTierForScore(uint256 score) external pure returns (string memory) {
        if (score >= LEGENDARY_THRESHOLD) return "Legendary";
        if (score >= GOLD_THRESHOLD) return "Gold";
        if (score >= SILVER_THRESHOLD) return "Silver";
        if (score >= BRONZE_THRESHOLD) return "Bronze";
        return "Ineligible";
    }
    
    /**
     * @dev Internal function to get URI for tier
     */
    function _getTierURI(string memory tier) internal view returns (string memory) {
        bytes32 tierHash = keccak256(abi.encodePacked(tier));
        
        if (tierHash == keccak256(abi.encodePacked("Bronze"))) {
            return bronzeURI;
        } else if (tierHash == keccak256(abi.encodePacked("Silver"))) {
            return silverURI;
        } else if (tierHash == keccak256(abi.encodePacked("Gold"))) {
            return goldURI;
        } else if (tierHash == keccak256(abi.encodePacked("Legendary"))) {
            return legendaryURI;
        }
        
        return bronzeURI; // fallback
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
