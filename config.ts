const Config = {
    appSettings: {
        name: "Paperhead",
        description: "Paperhead AI Trading Agent on Solana",
        image: "https://avo.so/icon1.png",
        url: "https://agent.paperhead.io",
    },
    dynamic: {
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        apiBaseUrl: process.env.NEXT_PUBLIC_DYNAMIC_API_BASE_URL!,
        bearerToken: process.env.DYNAMIC_BEARER_TOKEN!,
        authSecret: process.env.DYNAMIC_AUTH_SECRET!,
    },
}

export default Config;
