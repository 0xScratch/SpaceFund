"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Rocket, Wallet, Target, Users, Zap, Star } from "lucide-react"
import { useSpaceProgram, useSpaceProgramAccount } from "./space-data-access"
import { useWallet } from "@solana/wallet-adapter-react"
import { BN } from "@coral-xyz/anchor"
import { ellipsify } from "@/lib/utils"
import { PublicKey } from "@solana/web3.js"

const LAMPORTS_PER_SOL = 1_000_000_000

export default function SpaceCrowdfundingDapp() {
  const { publicKey } = useWallet()
  const { createCampaign, accounts, getProgramAccount } = useSpaceProgram()
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    goal: "",
  })
  const [donationAmount, setDonationAmount] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState<PublicKey | null>(null)

  // Create campaign handler
  const handleCreateCampaign = async () => {
    if (!newCampaign.title || !newCampaign.description || !newCampaign.goal || !publicKey) return
    try {
      await createCampaign.mutateAsync({
        title: newCampaign.title,
        description: newCampaign.description,
        goal: new BN(Number(newCampaign.goal) * LAMPORTS_PER_SOL), // <-- convert to lamports
        creator: publicKey,
      })
      setNewCampaign({ title: "", description: "", goal: "" })
    } catch (error) {
      console.error("Error creating campaign:", error)
    }
  }

  // Campaigns loading state
  const isLoadingCampaigns = accounts.isLoading || getProgramAccount.isLoading

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background - covers entire viewport */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-background to-card opacity-50">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)`,
          }}
        />
        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-foreground rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content - sits above background */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Create Campaign Section */}
        {publicKey && (
          <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Target className="mr-2 h-5 w-5 text-primary" />
                Launch New Mission
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create a crowdfunding campaign for your space mission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">
                    Mission Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter mission title..."
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                    className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-foreground">
                    Funding Goal (SOL)
                  </Label>
                  <Input
                    id="goal"
                    type="number"
                    placeholder="0.00"
                    value={newCampaign.goal}
                    onChange={(e) => setNewCampaign({ ...newCampaign, goal: e.target.value })}
                    className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Mission Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your space mission..."
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleCreateCampaign}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg border border-primary/30 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                disabled={createCampaign.isPending}
              >
                <Rocket className="mr-2 h-4 w-4" />
                {createCampaign.isPending ? "Launching..." : "Launch Mission"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Campaigns Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Active Missions</h2>
            <Badge variant="secondary" className="bg-secondary/80 text-secondary-foreground">
              <Star className="mr-1 h-3 w-3" />
              {accounts.data?.length ?? 0} Missions
            </Badge>
          </div>

          {isLoadingCampaigns ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : accounts.data?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.data.map((account) => (
                <CampaignCard
                  key={account.publicKey.toString()}
                  account={account.publicKey}
                  publicKey={publicKey}
                  setSelectedCampaign={setSelectedCampaign}
                  setDonationAmount={setDonationAmount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <h2>No Campaigns Found</h2>
            </div>
          )}
        </div>
      </main>

      {/* Donation Dialog */}
      {selectedCampaign && (
        <DonationDialog
          account={selectedCampaign}
          open={!!selectedCampaign}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCampaign(null)
              setDonationAmount("")
            }
          }}
          donationAmount={donationAmount}
          setDonationAmount={setDonationAmount}
        />
      )}
    </div>
  )
}

// Campaign Card Component
function CampaignCard({
  account,
  publicKey,
  setSelectedCampaign,
  setDonationAmount,
}: {
  account: PublicKey
  publicKey: PublicKey | null
  setSelectedCampaign: (pk: PublicKey) => void
  setDonationAmount: (amt: string) => void
}) {
  const { accountQuery, withdrawCampaign } = useSpaceProgramAccount({ account })
  const [donateLoading, setDonateLoading] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  if (accountQuery.isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl flex items-center justify-center min-h-[200px]">
        <span className="loading loading-spinner loading-lg"></span>
      </Card>
    )
  }

  const data = accountQuery.data
  if (!data) return null

  const progressPercentage = Number(data.raised) / Number(data.goal) * 100
  const isGoalReached = Number(data.raised) >= Number(data.goal)
  const isCreator = publicKey && data.creator.toString() === publicKey.toString()

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-foreground text-balance">{data.title}</CardTitle>
          {isCreator && (
            <Badge variant="outline" className="border-accent text-accent">
              <Users className="mr-1 h-3 w-3" />
              Creator
            </Badge>
          )}
        </div>
        <CardDescription className="text-muted-foreground text-pretty">
          {data.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-semibold">
              {Number(data.raised) / LAMPORTS_PER_SOL} / {Number(data.goal) / LAMPORTS_PER_SOL} SOL
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-muted/50" />
          <div className="text-xs text-muted-foreground text-center">
            {progressPercentage.toFixed(1)}% funded
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Creator: {ellipsify(data.creator.toString())}
          </span>
          {isGoalReached && (
            <Badge className="bg-accent text-accent-foreground">
              <Zap className="mr-1 h-3 w-3" />
              Goal Reached!
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {!isCreator && publicKey && (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                setSelectedCampaign(account)
                setDonationAmount("")
                setDonateLoading(false)
              }}
              disabled={donateLoading}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Fund Mission
            </Button>
          )}

          {isCreator && isGoalReached && (
            <Button
              onClick={async () => {
                setWithdrawLoading(true)
                try {
                  await withdrawCampaign.mutateAsync()
                } catch (e) {
                  console.log("Error during withdraw: ", e)
                }
                setWithdrawLoading(false)
              }}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={withdrawLoading}
            >
              <Wallet className="mr-2 h-4 w-4" />
              {withdrawLoading ? "Withdrawing..." : "Withdraw Funds"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Donation Dialog Component
function DonationDialog({
  account,
  open,
  onOpenChange,
  donationAmount,
  setDonationAmount,
}: {
  account: PublicKey
  open: boolean
  onOpenChange: (open: boolean) => void
  donationAmount: string
  setDonationAmount: (amt: string) => void
}) {
  const { donateCampaign, accountQuery } = useSpaceProgramAccount({ account })
  const [loading, setLoading] = useState(false)

  const handleDonate = async () => {
    if (!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) return
    setLoading(true)
    try {
      await donateCampaign.mutateAsync({ amount: new BN(Number(donationAmount) * LAMPORTS_PER_SOL) })
      await accountQuery.refetch() // <-- Refetch campaign data after donation
      onOpenChange(false)
    } catch (e) {
      console.log("Error while donating: ", e);
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Fund Mission</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Support {accountQuery.data?.title} by contributing SOL
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="donation" className="text-foreground">
              Donation Amount (SOL)
            </Label>
            <Input
              id="donation"
              type="number"
              placeholder="0.00"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="bg-input border-border/50 text-foreground"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleDonate}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading || !donationAmount || Number(donationAmount) <= 0}
          >
            <Zap className="mr-2 h-4 w-4" />
            {loading ? "Contributing..." : "Contribute Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
