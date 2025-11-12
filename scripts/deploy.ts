const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FlappyBirdNFT contract to Base Network...\n");

  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  console.log("Deploying FlappyBirdNFT...");
  const FlappyBirdNFT = await hre.ethers.getContractFactory("FlappyBirdNFT");
  const flappyBirdNFT = await FlappyBirdNFT.deploy(deployer.address);

  await flappyBirdNFT.waitForDeployment();
  const contractAddress = await flappyBirdNFT.getAddress();

  console.log("✅ FlappyBirdNFT deployed to:", contractAddress);
  console.log("\n📝 Contract Details:");
  console.log("- Name: Flappy Bird NFT");
  console.log("- Symbol: FBIRD");
  console.log("- Owner:", deployer.address);
  console.log("- Network:", hre.network.name);
  
  // Get tier requirements
  const tiers = await flappyBirdNFT.getTierRequirements();
  console.log("\n🏆 NFT Tier Requirements:");
  console.log("- Bronze:", tiers[0].toString(), "points");
  console.log("- Silver:", tiers[1].toString(), "points");
  console.log("- Gold:", tiers[2].toString(), "points");
  console.log("- Legendary:", tiers[3].toString(), "points");
  
  const mintPrice = await flappyBirdNFT.mintPrice();
  console.log("\n💰 Mint Price:", hre.ethers.formatEther(mintPrice), "ETH");

  console.log("\n🔍 Verify contract on Basescan:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} ${deployer.address}`);
  
  console.log("\n📋 Update your .env file with:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}`);
  
  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
