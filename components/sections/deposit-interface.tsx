import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Wallet } from "lucide-react"

export function DepositInterface() {
  const [depositAmount, setDepositAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || isDepositing) return

    setIsDepositing(true)
    try {
      // const result = await depositToAgent(parseFloat(depositAmount))
      console.log("Deposit to agent:", parseFloat(depositAmount))
      const result = { success: true }

      if (result.success) {
        setDepositAmount("")
      }
    } catch (error) {
      console.error("Deposit error:", error)
    } finally {
      setIsDepositing(false)
    }
  }

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!depositAmount || isWithdrawing) return

    setIsWithdrawing(true)
    try {
      // const result = await withdrawFromAgent(parseFloat(depositAmount))
      console.log("Withdraw from agent:", parseFloat(depositAmount))
      const result = { success: true }

      if (result.success) {
        setDepositAmount("")
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <Card className="bg-black/80 border-green-500 border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-300 flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5" />
          DEPOSIT INTERFACE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-green-500 text-sm mb-2 block">Amount ($PAPERHEAD)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="bg-gray-900/90 border-green-500 text-green-300 placeholder-green-600"
            disabled={isDepositing || isWithdrawing}
          />
        </div>
        <Button
          className="w-full bg-green-900 hover:bg-green-800 text-green-300 border border-green-500"
          onClick={handleDeposit}
          disabled={isDepositing || isWithdrawing || !depositAmount}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isDepositing ? "DEPOSITING..." : "DEPOSIT TO AGENT"}
        </Button>
        <Button
          variant="outline"
          className="w-full bg-orange-300 border-green-500 text-green-700 hover:bg-green-900 hover:text-green-300"
          onClick={handleWithdraw}
          disabled={isDepositing || isWithdrawing || !depositAmount}
        >
          {isWithdrawing ? "WITHDRAWING..." : "WITHDRAW FUNDS"}
        </Button>
      </CardContent>
    </Card>
  )
} 