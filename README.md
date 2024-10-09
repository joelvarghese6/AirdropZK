# AirdropZK: Token Airdrop & Loyalty Program

This project allows vendors to create and airdrop tokens to their customers using Solana Zero-Knowledge (ZK) compression. Customers who receive these tokens can use them to purchase products at discounted prices. The application supports token creation, airdropping, and loyalty program management, enhancing customer engagement and retention.

## Features

- **Token Airdrop**: Vendors can airdrop tokens to customers in bulk using Solana ZK compression for improved efficiency.
- **Loyalty Program**: Customers can redeem tokens for discounts on products.
- **Minting Compressed Tokens**: Easily mint tokens and send them to customer wallets.
- **Discount Validation**: Customers who hold NFTs or tokens in their wallets can automatically avail discounts on products.
- **Solana ZK Compression**: Leverages ZK compression for gas-efficient transactions, especially useful for bulk token drops.

## Planned Features

- **NFT-Based Discounts**: Tokens minted will serve as NFTs in customer wallets, enabling discounts if the NFT is present.
- **Bulk Token Minting**: Vendors can mint and send compressed tokens to multiple wallets simultaneously.
- **Customizable Loyalty Tiers**: Vendors can introduce tiered discounts based on the number of tokens or specific NFTs customers hold.

## Tech Stack

- **Solana Blockchain**: The backend of the project is built using Solana for fast and secure token transactions.
- **ZK Compression**: To reduce costs, the project uses Zero-Knowledge compression for token airdrops.
- **Frontend**: The user interface is built with React (Hono, shadcn, drizzle, neondb) for ease of use and accessibility.

## Environment Variables

AirdropZK requires certain environment variables to be set for proper configuration. Create a `.env.local` file in the root directory based on the provided `.env.example` files.

| Variable                         | Description                                     | Example                                                          |
| -------------------------------- | ------------------------------------------------| ---------------------------------------------------------------- |
| `NEXT_DEVNET_RPC`                | RPC URL for Solana Devnet                       | `https://devnet.helius-rpc.com?api-key=<YOUR_API_KEY>`           |
| `NEXT_MAINNET_RPC`               | RPC URL for Solana Mainnet                      | `https://mainnet.helius-rpc.com?api-key=<YOUR_API_KEY>`          |

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/yourproject.git
    ```

2. Install dependencies:

    ```bash
    cd yourproject
    npm install
    ```

3. Start the application:

    ```bash
    npm start
    ```

## How It Works

1. **Vendors create tokens**: A vendor can create and mint tokens using the Solana network.
2. **Bulk airdrop**: These tokens are then airdropped to customer wallets using ZK compression.
3. **Customers redeem tokens**: Customers use these tokens at the store to get discounts. The discount is automatically applied when tokens or NFTs are detected in their wallet.

## Contributing

If you want to contribute to this project, please create a pull request or report any issues. 

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**
