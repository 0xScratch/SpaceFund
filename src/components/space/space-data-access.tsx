/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { getSpaceProgram, getSpaceProgramId } from '@/lib'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { BN } from '@coral-xyz/anchor'

interface CreateCampaignArgs {
    title: string,
    description: string,
    goal: BN,
    end_time: BN,
    creator: PublicKey
}

interface DonateCampaignArgs {
    amount: BN,
}

export function useSpaceProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getSpaceProgramId(cluster.name as Cluster), [cluster])
    const program = getSpaceProgram(provider);

    const accounts = useQuery({
        queryKey: ['space', 'all', { cluster }],
        queryFn: () => program.account.spaceCampaign.all(),
    })

    const getProgramAccount = useQuery({
        queryKey: ['get-program-account', { cluster }],
        queryFn: () => connection.getParsedAccountInfo(programId),
    })

    const createCampaign = useMutation<string, Error, CreateCampaignArgs>({
        mutationKey: [`campaignEntry`, `create`, { cluster }],
        mutationFn: async ({ title, description, goal, end_time, creator }) => {
            const [campaignEntryAddress] = await PublicKey.findProgramAddressSync(
                [Buffer.from("space_mission"), creator.toBuffer(), Buffer.from(title)],
                programId
            );

            console.log(campaignEntryAddress);

            return program.methods.createCampaign(title, description, goal, end_time).rpc();
        },
        onSuccess: (signature) => {
            transactionToast(signature);
            accounts.refetch();
        },
        onError: (error) => {
            toast.error(`Error creating campaign: ${error.message}`);
        },
    });

    return {
        program,
        accounts,
        getProgramAccount,
        createCampaign,
        programId
    }

}

export function useSpaceProgramAccount({ account }: { account: PublicKey }) {
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const { program, accounts } = useSpaceProgram()
    const provider = useAnchorProvider()

    const accountQuery = useQuery({
        queryKey: ['space', 'fetch', { cluster, account }],
        queryFn: () => program.account.spaceCampaign.fetch(account),
    })

    const donateCampaign = useMutation<string, Error, DonateCampaignArgs>({
        mutationKey: [`campaignEntry`, `donate`, { cluster }],
        mutationFn: async ({ amount }) => {
            const donor = provider.wallet.publicKey; 
            const spaceCampaign = account;
            const systemProgram = SystemProgram.programId;
            return program.methods.donate(amount).accounts({
                donor: donor,
                spaceCampaign: spaceCampaign,
                systemProgram: systemProgram
            } as any).rpc();
        },
        onSuccess: (signature) => {
            transactionToast(signature);
            accounts.refetch();
        },
        onError: (error) => {
            toast.error(`Error donating to campaign: ${error.message}`);
        },
    });

    const withdrawCampaign = useMutation({
        mutationKey: [`campaignEntry`, `withdraw`, { cluster }],
        mutationFn: async () => {
            const creator = provider.wallet.publicKey;
            const spaceCampaign = account;
            const systemProgram = SystemProgram.programId;
            return program.methods.withdraw().accounts({
                creator: creator,
                spaceCampaign: spaceCampaign,
                systemProgram: systemProgram
            } as any).rpc();
        },
        onSuccess: (tx) => {
            transactionToast(tx);
            return accounts.refetch();
        },
    });

    return {
        accountQuery,
        donateCampaign,
        withdrawCampaign
    }
}