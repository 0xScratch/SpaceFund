"use client"

import { useEffect, useState } from "react"
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
import { Rocket, Wallet, Target, Users, Zap, Star, Clock, Hourglass, RotateCcw, Trash2 } from "lucide-react"
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
    endDate: "",
    endTime: "",
  })
  const [donationAmount, setDonationAmount] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState<PublicKey | null>(null)
  // Track donation state per campaign and per donor
  const [userDonations, setUserDonations] = useState<{ [campaignPk: string]: boolean }>({})

  // Create campaign handler
  const handleCreateCampaign = async () => {
    if (!newCampaign.title || !newCampaign.description || !newCampaign.goal || !publicKey || !newCampaign.endDate || !newCampaign.endTime) return

    const localEnd = `${newCampaign.endDate}T${newCampaign.endTime}` + (newCampaign.endTime.length === 5 ? ":00" : "")

    const endAtISO = new Date(localEnd).toISOString()
    if (Date.parse(endAtISO) <= Date.now()) return

    const endAtISO_number = Date.parse(endAtISO)
    try {
      await createCampaign.mutateAsync({
        title: newCampaign.title,
        description: newCampaign.description,
        goal: new BN(Number(newCampaign.goal) * LAMPORTS_PER_SOL), // <-- convert to lamports
        creator: publicKey,
        end_time: new BN(Math.floor(endAtISO_number / 1000)), // <-- convert to unix timestamp
      })
      setNewCampaign({ title: "", description: "", goal: "", endDate: "", endTime: "" })
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-foreground">
                    Campaign End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                    className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-foreground">
                    Campaign End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    // allow seconds for precise countdown
                    step={1}
                    value={newCampaign.endTime}
                    onChange={(e) => setNewCampaign({ ...newCampaign, endTime: e.target.value })}
                    className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Funding closes at your selected date and time. You can only withdraw funds when the goal is met, as well as the campaign has ended.
              </p>

              <Button
                onClick={handleCreateCampaign}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg border border-primary/30 shadow-lg hover:shadow-primary/25 transition-all duration-300 cursor-pointer"
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
              {accounts.data.map((account) => {
                const campaignPk = account.publicKey.toString();
                return (
                  <CampaignCard
                    key={campaignPk}
                    account={account.publicKey}
                    publicKey={publicKey}
                    setSelectedCampaign={setSelectedCampaign}
                    setDonationAmount={setDonationAmount}
                    hasUserDonated={userDonations[campaignPk] || false}
                    setHasUserDonated={(val: boolean) => setUserDonations(prev => ({
                      ...prev,
                      [campaignPk]: val
                    }))}
                  />
                );
              })}
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
          onDonateSuccess={() => {
            if (selectedCampaign) {
              setUserDonations(prev => ({
                ...prev,
                [selectedCampaign.toString()]: true
              }))
            }
          }}
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
  hasUserDonated,
  setHasUserDonated,
}: {
  account: PublicKey
  publicKey: PublicKey | null
  setSelectedCampaign: (pk: PublicKey) => void
  setDonationAmount: (amt: string) => void
  hasUserDonated: boolean
  setHasUserDonated: (val: boolean) => void
}) {
  const { accountQuery, donationAccountQuery, refundDonation, withdrawCampaign, closeCampaign } = useSpaceProgramAccount({ account })
  const [donateLoading, setDonateLoading] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [reclaimLoading, setReclaimLoading] = useState(false)
  const [closeLoading, setCloseLoading] = useState(false)
  const [now, setNow] = useState<number>(Date.now())
  const [localRaised, setLocalRaised] = useState<number | null>(null);
  const data = accountQuery.data;

  useEffect(() => {
    setLocalRaised(null);
  }, [data?.raised]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!data) return null

  function formatRemaining(ms: number) {
    if (ms <= 0) return "Ended"
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / (24 * 3600))
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const parts = []
    if (days > 0) parts.push(`${days}d`)
    parts.push(`${hours}h`, `${minutes}m`, `${seconds}s`)
    return parts.join(" ")
  }

  if (accountQuery.isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl flex items-center justify-center min-h-[200px]">
        <span className="loading loading-spinner loading-lg"></span>
      </Card>
    )
  }


  const raisedAmount = localRaised !== null ? localRaised : Number(data.raised);
  const progressPercentage = raisedAmount / Number(data.goal) * 100;
  const isGoalReached = Number(data.raised) >= Number(data.goal)
  const isCreator = publicKey && data.creator.toString() === publicKey.toString()
  const endMs = new Date(data.endTime.toNumber() * 1000).getTime()
  const remainingMs = endMs - now
  const isEnded = remainingMs <= 0
  const timeLabel = formatRemaining(remainingMs)

  const endedNotFunded = isEnded && !isGoalReached
  const endedFunded = isEnded && isGoalReached

  const canRefund = !(isEnded && isGoalReached)

  return (
    <Card className={`bg-card/80 backdrop-blur-sm border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
      endedNotFunded ? "opacity-90 border-destructive/40" : ""
    } ${endedFunded ? "ring-1 ring-accent/40": ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-foreground text-balance">{data.title}</CardTitle>
          <div className="flex items-center gap-2">
            {!isEnded && (
              <Badge
                variant="secondary"
                className="bg-secondary/80 text-secondary-foreground"
              >
                <Clock className="mr-1 h-3 w-3" />
                {timeLabel}
              </Badge>
            )}
            {endedFunded && (
              <Badge className="bg-accent text-accent-foreground">
                <Zap className="mr-1 h-3 w-3" />
                Funded • Ended
              </Badge>
            )}
            {endedNotFunded && (
              <Badge variant="destructive">
                <Hourglass className="mr-1 h-3 w-3" />
                Ended • Unfunded
              </Badge>
            )}
            {isCreator && (
              <Badge variant="outline" className="border-accent text-accent">
                <Users className="mr-1 h-3 w-3" />
                Creator
              </Badge>
            )}
          </div>
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
          {isGoalReached && !isEnded && (
            <Badge className="bg-accent text-accent-foreground">
              <Zap className="mr-1 h-3 w-3" />
              Goal Reached!
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {!isCreator && publicKey && !isEnded &&(
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
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

          {publicKey && !isCreator && hasUserDonated && (
            <Button
              onClick={async () => {
                setReclaimLoading(true)
                try {
                  const refundAmount = donationAccountQuery.data?.amount?.toNumber() || 0;
                  await refundDonation.mutateAsync();
                  setHasUserDonated(false); // Immediately update state for this campaign
                  setLocalRaised(raisedAmount - refundAmount); // Optimistic update
                  await donationAccountQuery.refetch();
                  await accountQuery.refetch();
                  setLocalRaised(null); // Reset after refetch
                } catch (e) {
                  console.log("Error during reclaim: ", e)
                }
                setReclaimLoading(false);
              }}
              disabled={!canRefund}
              className={`flex-1 ${
                canRefund
                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <RotateCcw className="mr-2 h-4 w-4"/>
              {reclaimLoading ? "Reclaiming..." : "Reclaim Donation"}
            </Button>
          )}

          {isCreator && isGoalReached && isEnded && (
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
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground cursor-pointer"
              disabled={withdrawLoading}
            >
              <Wallet className="mr-2 h-4 w-4" />
              {withdrawLoading ? "Withdrawing..." : "Withdraw Funds"}
            </Button>
          )}

          {isCreator && isGoalReached && !isEnded && (
            <Button
              disabled
              className="flex-1 bg-muted text-muted-foreground" 
            >
              <Hourglass className="mr-2 h-4 w-4"/>
              Withdraw after {timeLabel}
            </Button>
          )}

          {isCreator && isEnded && !isGoalReached && Number(data.raised) === 0 && (
            <Button
              onClick={async () => {
                setCloseLoading(true)
                try {
                  await closeCampaign.mutateAsync()
                } catch (e) {
                  console.log("Error during close: ", e)
                }
                setCloseLoading(false)
              }} 
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4"/>
              {closeLoading ? "Closing..." : "Close Campaign"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Donation Dialog Component
type DonationDialogProps = {
  account: PublicKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donationAmount: string;
  setDonationAmount: (amt: string) => void;
  onDonateSuccess?: () => void;
}

function DonationDialog({
  account,
  open,
  onOpenChange,
  donationAmount,
  setDonationAmount,
  onDonateSuccess,
}: DonationDialogProps) {
  const { donateCampaign, accountQuery } = useSpaceProgramAccount({ account })
  const [loading, setLoading] = useState(false)

  const handleDonate = async () => {
    if (!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) return
    setLoading(true)
    try {
      await donateCampaign.mutateAsync({ amount: new BN(Number(donationAmount) * LAMPORTS_PER_SOL) })
      await accountQuery.refetch() // <-- Refetch campaign data after donation
      onDonateSuccess?.() // <-- update hasUserDonated in parent
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
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
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
