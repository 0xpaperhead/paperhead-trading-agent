import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT, createRemoteJWKSet, type JWTPayload } from 'jose';

import Config from './config';

const JWKS_ENDPOINT = `https://app.dynamic.xyz/api/v0/sdk/${Config.dynamic.environmentId}/.well-known/jwks`;
const ISSUER = `${Config.dynamic.apiBaseUrl}/${Config.dynamic.environmentId}`;

if (!Config.dynamic.environmentId || !Config.dynamic.apiBaseUrl || !Config.dynamic.bearerToken || !Config.dynamic.authSecret) {
    throw new Error('Missing Dynamic environment variables');
}

const PAPERHEAD_SECRET = new TextEncoder().encode(Config.dynamic.authSecret);

const PAPERHEAD_COOKIE_NAME = 'paperhead_session';
const DYNAMIC_COOKIE_NAME = 'DYNAMIC_JWT_TOKEN';

interface PaperheadSession extends JWTPayload {
    sid: string;
    wallet: string;
    chain: string;
}

interface VerifiedCredentials {
    address: string;
    chain: string;
    id: string;
    nameService: Record<string, unknown>;
    walletName?: string;
    walletProvider?: string;
    format?: string;
    lastSelectedAt?: string;
    publicIdentifier?: string;
    signInEnabled?: boolean;
}

const JWKS = createRemoteJWKSet(new URL(JWKS_ENDPOINT));

async function verifyDynamicJWT(token: string): Promise<JWTPayload & { sessionId?: string, sub?: string }> {
    const { payload } = await jwtVerify(token, JWKS, { issuer: ISSUER });

    return payload;
}

async function parsePaperheadCookie(cookie?: string): Promise<PaperheadSession | null> {
    if (!cookie) return null;
    try {
        const { payload } = await jwtVerify(cookie, PAPERHEAD_SECRET);

        if (typeof payload.sid === 'string' && typeof payload.wallet === 'string' && typeof payload.chain === 'string') {
            return payload as PaperheadSession;
        }
        console.warn('Invalid paperhead cookie - type mismatch: ', payload);
        return null;
    }
    catch (error) {
        console.error('Error parsing paperhead cookie', error);
        return null;
    }
}

async function mintPaperheadSession(sid: string, wallet: string, chain: string, dynExp: number): Promise<{ jwt: string, exp: number }> {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const maxPaperheadLifetime = nowInSeconds + 7200; // 2 hours
    const exp = Math.min(dynExp, maxPaperheadLifetime);

    if (exp <= nowInSeconds) {
        throw new Error('Dynamic JWT expired');
    }

    const jwt = await new SignJWT({ sid, wallet, chain })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(PAPERHEAD_SECRET);

    return { jwt, exp };
}

async function fetchWalletFromDynamic(token: string): Promise<{ wallet: string, chain: string }> {
    const response = await fetch(`https://app.dynamic.xyz/api/v0/sdk/${Config.dynamic.environmentId}/users`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch wallet from dynamic');
    }

    const data = await response.json();

    const credentials = data.verifiedCredentials as VerifiedCredentials[];
    if (!credentials || !Array.isArray(credentials) || credentials.length === 0) {
        throw new Error('No verified credentials found in dynamic response');
    }

    credentials.sort((a, b) => (b.lastSelectedAt ? +new Date(b.lastSelectedAt) : 0) - (a.lastSelectedAt ? +new Date(a.lastSelectedAt) : 0));
    const selectedCredential = credentials[0];

    const { address: wallet, chain } = selectedCredential;

    if (!wallet || !chain) {
        throw new Error('Invalid wallet or chain in dynamic response');
    }

    return { wallet, chain };

}

function stampHeaders(response: NextResponse, wallet: string, chain: string, userId: string) {
    response.headers.set('x-wallet-address', wallet);
    response.headers.set('x-chain', chain);
    response.headers.set('x-user-id', userId);
    response.headers.set('x-auth-validated', 'true');

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

export async function middleware(request: NextRequest) {
    const dynToken = request.cookies.get(DYNAMIC_COOKIE_NAME)?.value;

    if (!dynToken) {
        return unauth(request);
    }

    let dynPayload: JWTPayload & { sessionId?: string, sub?: string };
    try {
        dynPayload = await verifyDynamicJWT(dynToken);
    }
    catch (error) {
        console.error('Error verifying dynamic JWT', error);
        return unauth(request);
    }

    // Dynamic uses 'sub' as the primary user identifier, but 'sessionId' might be specific to sessions
    // prefer 'sub' if available
    const sid = dynPayload.sub ?? dynPayload.sessionId;
    if (!sid) {
        console.error('No session ID found in dynamic JWT');
        return unauth(request);
    }

    const exp = dynPayload.exp;
    if (!exp) {
        console.error('No expiration time found in dynamic JWT');
        return unauth(request);
    }

    const paperheadCookie = request.cookies.get(PAPERHEAD_COOKIE_NAME)?.value;
    const paperheadSession = await parsePaperheadCookie(paperheadCookie);

    let wallet: string | undefined = paperheadSession?.wallet;
    let chain: string | undefined = paperheadSession?.chain;
    const needsRefresh = !paperheadSession || paperheadSession.sid !== sid;


    let response: NextResponse;
    if (needsRefresh) {
        try {
            ({ wallet, chain } = await fetchWalletFromDynamic(dynToken));
        }
        catch (error) {
            console.error('Error fetching wallet from dynamic', error);
            return unauth(request);
        }

        try {
            const { jwt, exp: phExp } = await mintPaperheadSession(sid, wallet, chain, exp);

            response = NextResponse.next({ request: { headers: request.headers } });
            response.cookies.set({
                name: PAPERHEAD_COOKIE_NAME,
                value: jwt,
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'lax',
                path: '/',
                expires: new Date(phExp * 1000)
            });
        }
        catch (error) {
            console.error('Error minting paperhead session', error);
            return unauth(request);
        }
    }
    else {
        response = NextResponse.next({ request: { headers: request.headers } });
    }

    if (wallet && chain) {
        stampHeaders(response, wallet, chain, sid);
    }
    else {
        return NextResponse.json({ error: 'Authentication setup failed' }, { status: 500 });
    }

    return await auth(request, response, wallet);
}


async function auth(request: NextRequest, response: NextResponse, wallet: string) {

    // const { pathname } = request.nextUrl;
    // check for authorization here based on the wallet address. ex: "pathname.startsWith('/user-instance/')"
    // against supabase db
    // pseudo code: const {data, error} = await supabase.from('secret_table').select('*').eq('wallet_address', wallet).single();
    // if error, return 403 call forbidden()
    // if no data, return 401 call forbidden()
    // if data, return 200

    return response;
}

function unauth(req: NextRequest): NextResponse {
    const url = req.nextUrl.clone();
    url.pathname = '/'; // Redirect to home page
    url.search = ''; // Clear query params on redirect
    const res = NextResponse.redirect(url);
    // Important: Clear potentially invalid cookies on unauth redirect
    res.cookies.delete(DYNAMIC_COOKIE_NAME);
    res.cookies.delete(PAPERHEAD_COOKIE_NAME);
    return res;
}

function forbidden(req: NextRequest, message: string = 'Not authorized'): NextResponse {
    const res = NextResponse.json({ error: message }, { status: 403 });
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    return res;
}

export const config = {
    matcher: [
        '/api/:path*'
    ]
};

