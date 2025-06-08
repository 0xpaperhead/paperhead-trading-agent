import { Keypair } from "@solana/web3.js"
import bs58 from "bs58"

export function generateSolanaWallet() {
  const wallet = Keypair.generate()
  return {
    publicKey: wallet.publicKey.toBase58(),
    privateKey: bs58.encode(wallet.secretKey),
  }
}

