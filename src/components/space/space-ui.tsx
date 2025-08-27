'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useSpaceProgram, useSpaceProgramAccount } from './space-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { ellipsify } from '@/lib/utils'
import { BN } from '@coral-xyz/anchor'

export function SpaceCreate() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goal, setGoal] = useState(0);
    const { createCampaign } = useSpaceProgram();
    const { publicKey } = useWallet();

    const isFormValid = title.trim() !== '' && description.trim() !== '' && goal > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid || !publicKey) return;

        try {
            await createCampaign.mutateAsync({
                title,
                description,
                goal: new BN(goal),
                creator: publicKey,
            });
        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };

    if (!publicKey) {
        return <p>Connect Your Wallet.</p>
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <input
                type="number"
                placeholder="Goal"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
            />
            <button type="submit" disabled={!isFormValid}>
                Create Campaign
            </button>
        </form>
    );
}

export function SpaceList() {
    const { accounts, getProgramAccount } = useSpaceProgram();

    if (getProgramAccount.isLoading) {
        return <span className='loading loading-spinner loading-lg'></span>
    }

    if (!getProgramAccount.data?.value) {
        return (
            <div>No campaigns found.</div>
        )
    }

    return (
        <div>
            {accounts.isLoading? (
                <span className='loading loading-spinner loading-lg'></span>
            ): accounts.data?.length ? (
                <div>
                    {accounts.data?.map((account) => (
                        <SpaceCard key={account.publicKey.toString()} account={account.publicKey} />
                    ))}
                </div>
            ): (
                <div>
                    <h2>No Campaigns Found</h2>
                </div>
            )}
        </div>
    )
}

function SpaceCard({ account }: { account: PublicKey }) {
    const { accountQuery, donateCampaign, withdrawCampaign } = useSpaceProgramAccount({ account });

    const { publicKey } = useWallet();

    const [amount, setAmount] = useState(0);

    const isFormValid = amount > 0;

    const handleSubmit = () => {
        if (publicKey && isFormValid) {
            donateCampaign.mutateAsync({ amount: new BN(amount) });
        }
    }

    if (!publicKey) {
        return <p>Connect Your Wallet!</p>
    }

    return accountQuery.isLoading ? (
        <span className='loading loading-spinner loading-lg'></span>
    ) : (
        <div>
            <div className='space-y-6'>
                <h2
                    onClick={() => accountQuery.refetch()}
                >
                    {accountQuery.data?.title}
                </h2>
                <p>{accountQuery.data?.description}</p>
                <p>Goal: {accountQuery.data?.goal.toString()}</p>
                <p>Total Raised: {accountQuery.data?.raised.toString()}</p>
                <p>Creator: {ellipsify(accountQuery.data?.creator.toString())}</p>
            </div>
            <div>
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button onClick={handleSubmit} disabled={!isFormValid}>
                    Donate
                </button>
            </div>
            <div>
                <button onClick={() => withdrawCampaign.mutateAsync()}>
                    Withdraw
                </button>
            </div>
        </div>
    )
}