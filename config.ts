const Config = {
    appSettings: {
        name: "Paperhead",
        description: "Paperhead AI Trading Agent on Solana",
        image: "https://avo.so/icon1.png",
        url: "https://agent.paperhead.io",
        paperheadMint: "2AtFgHT5LDuZ2AUqGUNBGQh2XiKJQTEyiG2w2BqLpump",
    },
    dynamic: {
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        apiBaseUrl: process.env.NEXT_PUBLIC_DYNAMIC_API_BASE_URL!,
        bearerToken: process.env.DYNAMIC_BEARER_TOKEN!,
        authSecret: process.env.DYNAMIC_AUTH_SECRET!,
    },
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    solana: {
        connectionUrl: process.env.NEXT_PUBLIC_SOLANA_CONNECTION_URL!,
    },
    encryption: {
        salt: process.env.WALLET_ENCRYPTION_SALT!,
        password: process.env.WALLET_ENCRYPTION_KEY!,
        rounds: parseInt(process.env.WALLET_ENCRYPTION_ROUNDS!),
    },
}

export default Config;
