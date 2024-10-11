import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

export default NextAuth({
    providers: [
        AzureADProvider({
            clientId: process.env.OUTLOOK_CLIENT_ID!,
            clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
            tenantId: process.env.OUTLOOK_TENANT_ID!,
            authorization: {
                params: {
                    scope: 'openid email profile offline_access https://outlook.office.com/IMAP.AccessAsUser.All',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            return session;
        },
    },
});
