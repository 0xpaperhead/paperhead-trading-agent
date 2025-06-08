import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/db.extended';
import { generateSolanaWallet } from '@/lib/web3';
import { Encryptor } from '@/lib/encryptor';
import Config from '@/config';

type user = Database['public']['Tables']['users']['Row'];

export async function GET(request: NextRequest) {
    try {

        const walletAddress = request.headers.get('x-wallet-address');
        const source = request.headers.get('x-source');

        if (!walletAddress) {
            return NextResponse.json({
                error: 'Wallet address is required'
            }, { status: 400 });
        }

        let user: user;


        // first try to fetch user
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();


        user = data;

        if (error) {
            // generate safe shared custodial wallet
            const encryptor = new Encryptor(Config.encryption.salt, Config.encryption.rounds);
            let { publicKey, privateKey } = generateSolanaWallet();
            const encrypted_pkey = encryptor.encrypt(privateKey, Config.encryption.password);
            const { data: newUser, error: newUserError } = await supabase
                .from('users')
                .insert({
                    wallet_address: walletAddress,
                    source: source || null,
                    wallet_public_key: publicKey,
                    encrypted_pkey: encrypted_pkey
                })
                .single();
            privateKey = ""
            publicKey = ""

            if (newUserError) {
                console.error('Error creating user', newUserError);
                return NextResponse.json({
                    error: 'Error creating user'
                }, { status: 500 });
            }

            user = newUser;
        }

        const { encrypted_pkey, ...cleanUser } = user;

        return NextResponse.json({
            user: cleanUser
        }, { status: 200 });

    } catch (error) {
        console.error('Error in GET /api/auth:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}