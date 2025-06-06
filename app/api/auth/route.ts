import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/db.extended';

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

        let user: user | null = null;


        // first try to fetch user
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();

        if (error) {
            const { data: newUser, error: newUserError } = await supabase
                .from('users')
                .insert({
                    wallet_address: walletAddress,
                    source: source || null
                })
                .single();

            if (newUserError) {
                console.error('Error creating user', newUserError);
                return NextResponse.json({
                    error: 'Error creating user'
                }, { status: 500 });
            }

            user = newUser;
        }

        user = data;


        return NextResponse.json({
            user: user
        }, { status: 200 });

    } catch (error) {
        console.error('Error in GET /api/auth:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}