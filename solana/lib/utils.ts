import { Keypair, Connection, PublicKey, VersionedTransaction, TransactionMessage, SystemProgram, ComputeBudgetProgram, TransactionInstruction, Signer, sendAndConfirmTransaction } from "@solana/web3.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import bs58 from "bs58";
import { createRpc as createLightRpc, bn } from "@lightprotocol/stateless.js";
import { selectMinCompressedTokenAccountsForTransfer, CompressedTokenProgram, IDL } from "@lightprotocol/compressed-token";
import { struct, u32, u8 } from '@solana/buffer-layout';
// @ts-ignore
import { publicKey, u64 } from '@solana/buffer-layout-utils';
import {
  TokenAccountNotFoundError,
  TokenInvalidAccountError,
  TokenInvalidAccountOwnerError,
  TokenInvalidAccountSizeError,
} from './errors';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, COMPRESSED_TOKEN_PROGRAM_ID } from './constants';
import { MULTISIG_SIZE } from './multisig';
import { ACCOUNT_TYPE_SIZE, AccountType } from "./extensions/accountType"
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import type { AccountInfo } from '@solana/web3.js';
import { config } from "dotenv";

config({ path: ".env.local" });

export const getRpcUrl = () => {
  return process.env.NEXT_DEVNET_RPC!
}

// export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// export const COMPRESSED_TOKEN_PROGRAM_ID = new PublicKey(
//   "cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m"
// );

export enum AccountState {
  Uninitialized = 0,
  Initialized = 1,
  Frozen = 2,
}

export const CPI_AUTHORITY_SEED = Buffer.from("cpi_authority");

export const ZK_NETWORK_RPC_TESTNET = getRpcUrl();
export const PHOTON_RPC_ENDPOINT_TESTNET = getRpcUrl();

export const DEFAULT_PRIORITY_FEE = 1_000_000;

export interface RawAccount {
  mint: PublicKey;
  owner: PublicKey;
  amount: bigint;
  delegateOption: 1 | 0;
  delegate: PublicKey;
  state: AccountState;
  isNativeOption: 1 | 0;
  isNative: bigint;
  delegatedAmount: bigint;
  closeAuthorityOption: 1 | 0;
  closeAuthority: PublicKey;
}

type Commitment = 'processed' | 'confirmed' | 'finalized' | 'recent' | 'single' | 'singleGossip' | 'root' | 'max';

export const AccountLayout = struct<RawAccount>([
  publicKey('mint'),
  publicKey('owner'),
  u64('amount'),
  u32('delegateOption'),
  publicKey('delegate'),
  u8('state'),
  u32('isNativeOption'),
  u64('isNative'),
  u64('delegatedAmount'),
  u32('closeAuthorityOption'),
  publicKey('closeAuthority'),
]);

export const ACCOUNT_SIZE = AccountLayout.span;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getKeypairFromPrivateKey(key: string): Keypair {
  let secretKey: Uint8Array;

  if (
    key.startsWith("[") &&
    key.endsWith("]") &&
    Array.isArray(JSON.parse(key))
  ) {
    secretKey = Uint8Array.from(JSON.parse(key));
  } else {
    secretKey = bs58.decode(key);
  }

  return Keypair.fromSecretKey(secretKey);
}

export function isValidPrivateKey(key: string): boolean {
  try {
    getKeypairFromPrivateKey(key);
    return true;
  } catch (error) {
    return false;
  }
}

export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function isValidRpcUrl(url: string): Promise<boolean> {
  try {
    new URL(url);

    const connection = new Connection(url);
    const blockHeight = await connection.getBlockHeight();

    if (blockHeight === 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export type TokenAccount = {
  address: string;
  amount: number;
  delegated_amount: number;
  frozen: boolean;
  mint: string;
  owner: string;
};

export const fetchSplTokenAccounts = async (
  walletAddress: PublicKey
): Promise<TokenAccount[]> => {
  const response = await fetch(getRpcUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getTokenAccounts",
      id: "token-accounts",
      params: {
        page: 1,
        limit: 100,
        displayOptions: {
          showZeroBalance: true,
        },
        owner: walletAddress.toBase58(),
      },
    }),
  });
  if (response.status === 429) {
    throw new Error("Too many requests. Try again in a few seconds.");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch compressed token balances");
  }
  const { result } = await response.json();
  return result?.token_accounts || [];
};


export const getLightRpc = () => {
  return createLightRpc(ZK_NETWORK_RPC_TESTNET, PHOTON_RPC_ENDPOINT_TESTNET);
};

export const getAssociatedTokenAddress = ({
  owner,
  mint,
}: {
  owner: PublicKey;
  mint: PublicKey;
}) => {
  // Check if the ATA already exists
  const existingATA = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
  if (existingATA) {
    return existingATA;
  }
};

export const deriveTokenPoolPda = (mint: PublicKey): PublicKey => {
  const POOL_SEED = Buffer.from("pool");
  const seeds = [POOL_SEED, mint.toBuffer()];
  const [address, _] = PublicKey.findProgramAddressSync(
    seeds,
    COMPRESSED_TOKEN_PROGRAM_ID
  );
  return address;
};

export interface Account {
  /** Address of the account */
  address: PublicKey;
  /** Mint associated with the account */
  mint: PublicKey;
  /** Owner of the account */
  owner: PublicKey;
  /** Number of tokens the account holds */
  amount: bigint;
  /** Authority that can transfer tokens from the account */
  delegate: PublicKey | null;
  /** Number of tokens the delegate is authorized to transfer */
  delegatedAmount: bigint;
  /** True if the account is initialized */
  isInitialized: boolean;
  /** True if the account is frozen */
  isFrozen: boolean;
  /** True if the account is a native token account */
  isNative: boolean;
  /**
   * If the account is a native token account, it must be rent-exempt. The rent-exempt reserve is the amount that must
   * remain in the balance until the account is closed.
   */
  rentExemptReserve: bigint | null;
  /** Optional authority to close the account */
  closeAuthority: PublicKey | null;
  tlvData: Buffer;
}

export function unpackAccount(
  address: PublicKey,
  info: AccountInfo<Buffer> | null,
  programId = TOKEN_PROGRAM_ID
): Account {
  if (!info) throw new TokenAccountNotFoundError();
  if (!info.owner.equals(programId)) throw new TokenInvalidAccountOwnerError();
  if (info.data.length < ACCOUNT_SIZE) throw new TokenInvalidAccountSizeError();

  const rawAccount = AccountLayout.decode(info.data.slice(0, ACCOUNT_SIZE));
  let tlvData = Buffer.alloc(0);
  if (info.data.length > ACCOUNT_SIZE) {
    if (info.data.length === MULTISIG_SIZE) throw new TokenInvalidAccountSizeError();
    if (info.data[ACCOUNT_SIZE] != AccountType.Account) throw new TokenInvalidAccountError();
    tlvData = info.data.slice(ACCOUNT_SIZE + ACCOUNT_TYPE_SIZE);
  }

  return {
    address,
    mint: rawAccount.mint,
    owner: rawAccount.owner,
    amount: rawAccount.amount,
    delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
    delegatedAmount: rawAccount.delegatedAmount,
    isInitialized: rawAccount.state !== AccountState.Uninitialized,
    isFrozen: rawAccount.state === AccountState.Frozen,
    isNative: !!rawAccount.isNativeOption,
    rentExemptReserve: rawAccount.isNativeOption ? rawAccount.isNative : null,
    closeAuthority: rawAccount.closeAuthorityOption ? rawAccount.closeAuthority : null,
    tlvData,
  };
}

export async function getAccount(
  connection: Connection,
  address: PublicKey,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID
): Promise<Account> {
  const info = await connection.getAccountInfo(address, commitment);
  return unpackAccount(address, info, programId);
}

export const checkIfAccountExist = async (account: PublicKey) => {
  const lightRpc = getLightRpc();

  let accountExist = false;
  if (account) {
    try {
      await getAccount(lightRpc, account);
      accountExist = true;
    } catch (error: any) {
      // we assume the ata is not valid if we get an error
      // create the ata here
      console.log(`Error getting account ${account.toBase58()}:`, error);
    }
  }
  return accountExist;
};

export const getCompressedMintProgam = (connectedWallet: PublicKey) => {
  const lightRpc = getLightRpc();
  // @ts-ignore
  const provider = new AnchorProvider(lightRpc, connectedWallet, {
    commitment: "confirmed",
  });
  // @ts-ignore
  return new Program(IDL, COMPRESSED_TOKEN_PROGRAM_ID, provider);
};

export const deriveCpiAuthorityPda = (): PublicKey => {
  const [address, _] = PublicKey.findProgramAddressSync(
    [CPI_AUTHORITY_SEED],
    COMPRESSED_TOKEN_PROGRAM_ID
  );
  return address;
};

export type CreateZKCompressIxArgs = {
  receiver: PublicKey;
  mint: PublicKey;
  amount: number;
  payer?: PublicKey;
};

export type BaseIxResponse = {
  instructions: TransactionInstruction[];
};

export const createCompressTokenIx = async ({
  receiver,
  mint,
  amount,
  payer = receiver,
}: CreateZKCompressIxArgs): Promise<BaseIxResponse & { ata: PublicKey }> => {
  const originalAta = getAssociatedTokenAddress({
    owner: receiver,
    mint,
  });

  const tokenPoolPda = deriveTokenPoolPda(mint);
  const doesPoolPDAExist = await checkIfAccountExist(tokenPoolPda);

  const instructions: TransactionInstruction[] = [];

  // if the pool pda does not exist, create it
  if (!doesPoolPDAExist) {
    // create token pool info to enable compressiong
    const compressedMintProgram = getCompressedMintProgam(receiver);
    // create token pool instructions
    console.log("Creating token pool instructions...");
    const createTokenPoolIx = await compressedMintProgram.methods
      .createTokenPool()
      .accounts({
        mint,
        feePayer: payer,
        tokenPoolPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        cpiAuthorityPda: deriveCpiAuthorityPda(),
      })
      .instruction();
    instructions.push(createTokenPoolIx);
  }

  if (!originalAta) {
    throw new Error("Original ATA not found - create it?");
  }

  const compressIx = await CompressedTokenProgram.compress({
    payer,
    owner: receiver,
    source: originalAta,
    toAddress: receiver,
    amount,
    mint,
  });
  instructions.push(compressIx);

  return { instructions, ata: originalAta };
};

export const getTxnForSigning = (
  txnInstructions: TransactionInstruction | TransactionInstruction[],
  signer: PublicKey,
  blockhash: string,
  additionalSigners?: Signer[]
  // lookupTableAccounts?: AddressLookupTableAccount[]
): VersionedTransaction => {
  const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: DEFAULT_PRIORITY_FEE,
  });
  const instructions = [computeUnitLimitIx];
  if (Array.isArray(txnInstructions)) {
    instructions.push(...txnInstructions);
  } else {
    instructions.push(txnInstructions);
  }
  const messageV0 = new TransactionMessage({
    payerKey: signer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  if (additionalSigners && additionalSigners.length > 0) {
    transaction.sign(additionalSigners);
  }
  return transaction;
};

export type CreateZKTransferIxArgs = {
  owner: PublicKey;
  mint: PublicKey;
  amount: number;
  to: PublicKey;
};

export const createZKTransferIx = async ({
  owner,
  mint,
  amount,
  to,
}: CreateZKTransferIxArgs): Promise<BaseIxResponse> => {
  const lightRpc = getLightRpc();

  const tokAmount = bn(amount);

  console.log("getting compressed token accounts...");
  const compressedTokenAccounts =
    await lightRpc.getCompressedTokenAccountsByOwner(owner, {
      mint,
    });
  const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
    compressedTokenAccounts.items,
    tokAmount,
  );

  console.log("getting validity proof...");
  const proof = await lightRpc.getValidityProof(
    inputAccounts.map((account) => bn(account.compressedAccount.hash)),
  );

  console.log("transferring compressed tokens...");
  const ix = await CompressedTokenProgram.transfer({
    payer: owner,
    inputCompressedTokenAccounts: inputAccounts,
    toAddress: to,
    amount: tokAmount,
    recentInputStateRootIndices: proof.rootIndices,
    recentValidityProof: proof.compressedProof,
    //   outputStateTrees: merkleTree,
  });

  return { instructions: [ix] };
};

type TransferTokensArgs = {
  to: PublicKey;
  amount: number;
  mint: PublicKey;
  wallet: Keypair;
};

export const transferTokens = async ({ to, amount, mint, wallet }: TransferTokensArgs) => {
  if (!wallet) {
    throw new Error("No connected wallet");
  }
  const lightRpc = getLightRpc();

  console.log("getting blockhash...");
  const {
    context: { slot: minContextSlot },
    value: blockhashCtx,
  } = await lightRpc.getLatestBlockhashAndContext();

  const { instructions } = await createZKTransferIx({
    owner: wallet.publicKey,
    mint,
    amount,
    to,
  });

  console.log("building txn...");
  const transaction = getTxnForSigning(
    instructions,
    wallet.publicKey,
    blockhashCtx.blockhash,
  );

  console.log("sending tx for signing...");
  // const signature = await lightRpc.sendTransaction(transaction, lightRpc, {
  //   minContextSlot,
  // });

  // sign transaction

  transaction.sign([wallet]);

  const signature = await lightRpc.sendTransaction(transaction, { maxRetries: 5 })

  console.log("confirming tx...");
  await lightRpc.confirmTransaction({
    blockhash: blockhashCtx.blockhash,
    lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
    signature,
  });

  console.log("tx confirmed", signature);
  return {
    txnSignature: signature,
  };
};

type CompressTokenArgs = {
  mint: PublicKey;
  amount: number;
  wallet: Keypair;
};

export const compressToken = async ({ mint, amount, wallet }: CompressTokenArgs) => {
  if (!wallet) {
    throw new Error("No connected wallet");
  }

  const lightRpc = getLightRpc();

  console.log("getting blockhash...");
  const {
    context: { slot: minContextSlot },
    value: blockhashCtx,
  } = await lightRpc.getLatestBlockhashAndContext();

  console.log("creating compress token instructions...");
  const { instructions } = await createCompressTokenIx({
    receiver: wallet.publicKey,
    mint,
    amount,
  });

  console.log("building txn...");
  const transaction = getTxnForSigning(
    instructions,
    wallet.publicKey,
    blockhashCtx.blockhash,
  );

  console.log("sending tx for signing...");
  // const signature = await sendTransaction(transaction, lightRpc, {
  //   // skipPreflight: true,
  //   minContextSlot,
  // });

  // sign transaction

  transaction.sign([wallet])

  const signature = await lightRpc.sendTransaction(transaction, { maxRetries: 5 })

  console.log("confirming tx...");
  await lightRpc.confirmTransaction({
    blockhash: blockhashCtx.blockhash,
    lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
    signature,
  });

  console.log("tx confirmed", signature);
  return {
    txnSignature: signature,
  };
};