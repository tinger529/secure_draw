# securedraw

### Prerequisites

- Node v18.18.0 or higher

- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 1.18.17 or higher

### Installation

#### Clone the repo

```shell
git clone https://github.com/tinger529/secure_draw.git
cd secure_draw
```

#### Install Dependencies

```shell
npm install
```

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Start testing on Localnet

```shell
solana-test-validator
```

#### Deploy the program on Localnet

```shell
cd anchor
anchor build
anchor deploy
```

#### Notes

Please make sure you are deploying to localnet. 
Run the following command to get running info:
```shell
solana config get
```


### Web

This is a React app that uses the Anchor generated client to interact with the Solana program.

Start the web app

```shell
npm run dev
```

### User Guide

Please refer to solana official guide to build the environment.

Link: https://solana.com/docs/intro/installation

Some useful commands are listed below:

```shell
solana config set -um    # For mainnet-beta
solana config set -ud    # For devnet
solana config set -ul    # For localhost
solana config set -ut    # For testnet
solana airdrop 2         # airdrop SOL
solana balance           # check SOL balance
```