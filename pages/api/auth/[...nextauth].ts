import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

export default NextAuth({
    providers: [
        AzureADProvider({
            clientId: "e4d04abc-7db4-4949-9f8a-e40becb4f698",
            clientSecret: "22d0c48d-a9ec-4183-9767-34d8cbcacbfc",
            tenantId: "common", // This allows both personal and work/school accounts to sign in
            authorization: {
                params: {
                    scope: 'https://outlook.office.com/IMAP.AccessAsUser.All openid email profile offline_access',
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
