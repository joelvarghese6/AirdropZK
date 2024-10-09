import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import { getKeypairFromPrivateKey } from "@/solana/lib/utils"
import { createAccount, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { config } from "dotenv";

import { percentAmount, generateSigner, signerIdentity, createSignerFromKeypair } from "@metaplex-foundation/umi"
import { TokenStandard, createAndMint, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
// export const createToken = async (configUrl: string, data: any) => {

//     //const privateKey = Uint8Array.from([]);
//     if (data && data[0].key) {
//         //console.log(secretKey);
//         // const privateKey = data[0].key;
//         // const keyPair = getKeypairFromPrivateKey(privateKey)
//         // console.log(keyPair.publicKey.toString());

//         // const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
//         // let wallet = keyPair.publicKey
//         // console.log(`${(await connection.getBalance(wallet)) / LAMPORTS_PER_SOL} SOL`)


//         // const tokenMintAddress = await createMint(connection, keyPair, keyPair.publicKey, keyPair.publicKey, 0);
//         // console.log(tokenMintAddress.toBase58());

//         // const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, keyPair, tokenMintAddress, keyPair.publicKey);

//         // console.log(tokenAccount.address.toBase58());

//         // const transcationSignature = await mintTo(connection, keyPair, tokenMintAddress, tokenAccount.address, keyPair.publicKey, 1000);
//         // console.log(transcationSignature)



//     }

// }

config({ path: ".env.local" });

export const createTokenWithUmi = async (configUrl: string, values: any, data: any) => {


    if (!!data && data[0].key) {
        const umi = createUmi(process.env.NEXT_DEVNET_RPC!);
        const keyPair = getKeypairFromPrivateKey(data[0].key);

        const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keyPair.secretKey));
        const userWalletSigner = createSignerFromKeypair(umi, userWallet);

        const metadata = {
            name: values.name,
            symbol: values.symbol,
            uri: configUrl,
        };

        const mint = generateSigner(umi);
        umi.use(signerIdentity(userWalletSigner));
        umi.use(mplTokenMetadata())

        createAndMint(umi, {
            mint,
            authority: umi.identity,
            name: "metadata.name",
            symbol: metadata.symbol,
            uri: metadata.uri,
            sellerFeeBasisPoints: percentAmount(0),
            decimals: 0,
            amount: values.supply,
            tokenOwner: userWallet.publicKey,
            tokenStandard: TokenStandard.Fungible,
        }).sendAndConfirm(umi)
            .then(() => {
                console.log("Successfully minted 1 million tokens (", mint.publicKey, ")");
            })
            .catch((err) => {
                console.error("Error minting tokens:", err);
            });

    } else {
        console.log("here we go again!!")
    }







}