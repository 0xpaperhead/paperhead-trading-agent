"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Wallet, Loader2, CircleCheck, CircleX, Maximize } from "lucide-react"
import { useDynamicContext } from "@/lib/dynamic"
import { isSolanaWallet } from "@/lib/dynamic"
import { PublicKey, SystemProgram, TransactionMessage, VersionedTransaction, Connection } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction, getAccount, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { toast } from "sonner"
import Config from "@/config"
import { truncateAddress } from "@/lib/utils"
import { useUser } from "@/user-context"

// Types
type TransactionStatus = "idle" | "confirming" | "confirmed" | "error"

type Step = {
  emoji: string
  label: string
  completed: boolean
}

// PAPERHEAD token mint address
const PAPERHEAD_MINT = new PublicKey(Config.appSettings.paperheadMint)

// Transaction steps component
function TransactionSteps({ steps, progress }: { steps: Step[]; progress: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg relative
              ${step.completed
                  ? "bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 border border-green-500/50"
                  : "bg-gray-900/50 text-gray-500 border border-gray-800"
                }
              backdrop-blur-sm transition-all duration-300`}
            >
              {step.completed && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 rounded-lg bg-green-500/10 animate-pulse"></div>
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 opacity-30 blur-sm"></div>
                </motion.div>
              )}
              {step.emoji}
            </div>
            <span className={`text-xs mt-2 ${step.completed ? "text-green-400" : "text-gray-500"}`}>{step.label}</span>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-800">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-50 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

// Status message component
function StatusMessage({
  status,
  error,
  onCancel,
}: {
  status: TransactionStatus
  error: string | null
  onCancel: () => void
}) {
  if (status === "idle") return null

  const messages = {
    confirming: {
      icon: <Loader2 className="h-5 w-5 text-green-400 animate-spin" />,
      title: "Confirming transaction...",
      description: "Please confirm the transaction in your wallet",
      color: "bg-gray-900/60 border-green-500/30",
    },
    confirmed: {
      icon: <CircleCheck className="h-5 w-5 text-green-400" />,
      title: "Transaction confirmed!",
      description: "Your $PAPERHEAD has been deposited successfully",
      color: "bg-gray-900/60 border-green-500/30",
    },
    error: {
      icon: <CircleX className="h-5 w-5 text-red-400" />,
      title: "Transaction failed",
      description: error || "An error occurred during the transaction",
      color: "bg-gray-900/60 border-red-500/30",
    },
  }

  const currentMessage = messages[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg border p-4 mt-4 ${currentMessage.color} backdrop-blur-sm`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">{currentMessage.icon}</div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-white">{currentMessage.title}</h4>
          <p className="text-xs mt-1 text-gray-400">{currentMessage.description}</p>
        </div>
        {status === "confirming" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs h-7 px-2 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export function DepositInterface() {
  // Get network and wallet information from Dynamic context
  const { network, primaryWallet } = useDynamicContext()
  const [networkType, setNetworkType] = useState<string>("Mainnet")
  const { userData } = useUser();

  // State
  const [balance, setBalance] = useState<string>("")
  const [paperheadAmount, setPaperheadAmount] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle")
  const [isBalanceLoading, setIsBalanceLoading] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const [steps, setSteps] = useState<Step[]>([
    { emoji: "🌑", label: "Create", completed: false },
    { emoji: "🌓", label: "Sign", completed: false },
    { emoji: "🌕", label: "Confirm", completed: false },
  ])
  const [progress, setProgress] = useState<number>(0)

  // Update network type when context changes
  useEffect(() => {
    if (network) {
      const networkName = network.toString().toLowerCase()
      if (networkName.includes("devnet")) {
        setNetworkType("Devnet")
      } else if (networkName.includes("testnet")) {
        setNetworkType("Testnet")
      } else {
        setNetworkType("Mainnet")
      }
    }
  }, [network])

  // Fetch PAPERHEAD token balance
  const fetchBalance = useCallback(async () => {
    if (primaryWallet && isSolanaWallet(primaryWallet)) {
      setIsBalanceLoading(true)
      try {
        const connection = new Connection(Config.solana.connectionUrl)
        const publicKey = new PublicKey(primaryWallet.address)

        // Get the associated token account for PAPERHEAD
        const tokenAccount = await getAssociatedTokenAddress(
          PAPERHEAD_MINT,
          publicKey
        )

        try {
          const account = await getAccount(connection, tokenAccount)
          const balance = Number(account.amount) / Math.pow(10, 6) // Assuming 6 decimals for PAPERHEAD
          setBalance(balance.toString())
        } catch (err) {
          // Token account doesn't exist yet
          setBalance("0")
        }
      } catch (err) {
        console.error("Failed to fetch PAPERHEAD balance:", err)
        setBalance("0")
      } finally {
        setIsBalanceLoading(false)
      }
    }
  }, [primaryWallet])

  useEffect(() => {
    fetchBalance()
    const interval = setInterval(fetchBalance, 10000) // Update balance every 10 seconds
    return () => clearInterval(interval)
  }, [fetchBalance])

  // Input validation
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(",", ".")
    if (/^\d*\.?\d*$/.test(value)) {
      setPaperheadAmount(value)
      validateAmount(value)
    }
  }

  const validateAmount = (amount: string) => {
    if (!amount || Number.parseFloat(amount) === 0) {
      setError("Please enter an amount")
      return false
    }

    if (Number.parseFloat(amount) < 0.000001) {
      setError("Minimum deposit is 0.000001 $PAPERHEAD")
      return false
    }

    if (balance && Number.parseFloat(amount) > Number.parseFloat(balance)) {
      setError("Insufficient balance")
      return false
    }

    setError(null)
    return true
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Transaction steps management
  const completeStep = (index: number) => {
    setSteps((prevSteps) => prevSteps.map((step, i) => (i === index ? { ...step, completed: true } : step)))
    setProgress(((index + 1) / steps.length) * 100)
  }

  const resetTransaction = () => {
    setTransactionStatus("idle")
    setSteps(steps.map((step) => ({ ...step, completed: false })))
    setProgress(0)
    setIsDepositing(false)
    setIsWithdrawing(false)
  }

  // Handle deposit
  const handleDeposit = async () => {

    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError("Please connect a Solana wallet")
      return
    }

    if (!validateAmount(paperheadAmount)) {
      console.log("validateAmount", paperheadAmount)
      return
    }

    setIsDepositing(true)
    setTransactionStatus("confirming")
    completeStep(0)

    try {
      const connection = new Connection(Config.solana.connectionUrl)
      const fromPublicKey = new PublicKey(primaryWallet.address)

      // For demo purposes, we'll use a placeholder destination address
      // In production, this should be your actual agent pool address

      const toPublicKey = new PublicKey(userData?.wallet_public_key || "");

      const fromTokenAccount = await getAssociatedTokenAddress(
        PAPERHEAD_MINT,
        fromPublicKey
      )

      const toTokenAccount = await getAssociatedTokenAddress(
        PAPERHEAD_MINT,
        toPublicKey
      )

      const amountInSmallestUnit = Math.floor(Number.parseFloat(paperheadAmount) * Math.pow(10, 6)) // Assuming 6 decimals

      const instructions = []

      // Add SOL transfer instruction (0.05 SOL)
      const solTransferInstruction = SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: 50000000, // 0.05 SOL in lamports
      })
      instructions.push(solTransferInstruction)

      // Check if recipient's token account exists, if not create it
      try {
        await getAccount(connection, toTokenAccount)
        // Account exists, no need to create
      } catch (error) {
        // Account doesn't exist, create it
        const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
          fromPublicKey, // payer
          toTokenAccount, // associatedToken
          toPublicKey, // owner
          PAPERHEAD_MINT // mint
        )
        instructions.push(createTokenAccountInstruction)
      }

      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPublicKey,
        amountInSmallestUnit,
        [],
        TOKEN_PROGRAM_ID
      )
      instructions.push(transferInstruction)

      const blockhash = await connection.getLatestBlockhash()
      const messageV0 = new TransactionMessage({
        instructions,
        payerKey: fromPublicKey,
        recentBlockhash: blockhash.blockhash,
      }).compileToV0Message()

      const transaction = new VersionedTransaction(messageV0)
      const signer = await primaryWallet.getSigner()

      completeStep(1)

      const signature = await signer.signAndSendTransaction(transaction)

      completeStep(2)
      setTransactionStatus("confirmed")

      toast.success(`Successfully deposited ${paperheadAmount} $PAPERHEAD to agent!`, {
        description: () => (
          <span className="text-green-400">Transaction ID: <a href={`https://explorer.solana.com/tx/${signature.signature}`} target="_blank" rel="noopener noreferrer" className="text-green-300">{truncateAddress(signature.signature)}</a></span>
        ),
      })

      setPaperheadAmount("")
      await fetchBalance()

      setTimeout(() => {
        resetTransaction()
      }, 3000)

    } catch (error) {
      console.error("Deposit error:", error)
      setTransactionStatus("error")
      setError(error instanceof Error ? error.message : "Deposit failed")

      toast.error(`Deposit failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setTimeout(() => {
        resetTransaction()
      }, 5000)
    }
  }

  // Handle withdrawal (placeholder for now)
  const handleWithdraw = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError("Please connect a Solana wallet")
      return
    }

    if (!validateAmount(paperheadAmount)) {
      return
    }

    setIsWithdrawing(true)
    try {
      // Placeholder for withdrawal logic
      console.log("Withdraw from agent:", parseFloat(paperheadAmount))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success(`Withdrawal request for ${paperheadAmount} $PAPERHEAD submitted!`)
      setPaperheadAmount("")

    } catch (error) {
      console.error("Withdrawal error:", error)
      toast.error("Withdrawal failed")
    } finally {
      setIsWithdrawing(false)
    }
  }

  // Helper functions
  const formatBalance = (): React.ReactNode => {
    if (isBalanceLoading) return "Loading..."
    if (!balance) return "0 $PAPERHEAD"

    const balanceInPaperhead = Number.parseFloat(balance)
    if (balanceInPaperhead > 0 && balanceInPaperhead < 0.000001) return "<0.000001 $PAPERHEAD"
    return `${balanceInPaperhead.toFixed(6)} $PAPERHEAD`
  }

  const handleMaxClick = (): void => {
    if (balance) {
      setPaperheadAmount(balance)
      validateAmount(balance)
    }
  }

  return (
    <Card className="bg-black/80 border-green-500 border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-300 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            DEPOSIT INTERFACE
          </div>
          <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-transparent border border-green-500/30 text-green-500">
            {networkType}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-green-500 text-sm mb-2 block">Amount ($PAPERHEAD)</label>
          <div className="flex items-center bg-gray-900/40 backdrop-blur-sm rounded-lg p-3 border border-green-500 relative">
            <input
              className="w-full bg-transparent text-xl font-medium border-none outline-none text-green-300 placeholder-green-600"
              inputMode="decimal"
              autoComplete="off"
              type="text"
              placeholder="0.000000"
              value={paperheadAmount}
              onChange={handleInputChange}
              disabled={isDepositing || isWithdrawing}
              aria-label="PAPERHEAD amount"
            />
            <div className="flex items-center gap-2 bg-green-900/50 p-2 rounded-md border border-green-500">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="font-medium text-green-300 text-sm">$PAPERHEAD</span>
            </div>
          </div>

          <div className="flex flex-col justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-green-400">Balance: {formatBalance()}</span>
              <button
                onClick={handleMaxClick}
                className="h-6 px-2 text-xs font-medium text-green-400 hover:text-green-300 hover:bg-green-900/20 flex items-center gap-1 rounded"
                disabled={isDepositing || isWithdrawing}
              >
                <Maximize height={12} width={12} />
                MAX
              </button>
            </div>
            <div>
              {error && <p className="text-red-400 text-xs p-1">{error}</p>}
            </div>
          </div>
        </div>

        {/* Transaction Steps - Only show when transaction is in process */}
        {transactionStatus !== "idle" && (
          <div className="mt-6">
            <TransactionSteps steps={steps} progress={progress} />
          </div>
        )}

        {/* Status Messages */}
        <AnimatePresence>
          <StatusMessage
            status={transactionStatus}
            error={error}
            onCancel={resetTransaction}
          />
        </AnimatePresence>

        {/* Action Buttons */}
        <Button
          className="w-full bg-green-900 hover:bg-green-800 text-green-300 border border-green-500"
          onClick={handleDeposit}
          disabled={isDepositing || isWithdrawing || !paperheadAmount || !!error || transactionStatus !== "idle"}
          // disabled={true}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isDepositing || transactionStatus === "confirming" ? "DEPOSITING..." : "DEPOSIT TO AGENT"}
        </Button>

        <Button
          variant="outline"
          className="w-full bg-orange-900/50 border-green-500 text-green-300 hover:bg-green-900 hover:text-green-300"
          onClick={handleWithdraw}
          disabled={isDepositing || isWithdrawing || !paperheadAmount || !!error}
        >
          {isWithdrawing ? "WITHDRAWING..." : "WITHDRAW FUNDS"}
        </Button>

        {/* Warning Text */}
        <p className="text-xs text-left text-green-600/70 mt-2">
          Trading with AI agents involves risk. Ensure you understand the risks before depositing funds.
        </p>
      </CardContent>
    </Card>
  )
} 