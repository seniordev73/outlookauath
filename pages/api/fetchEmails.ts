import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import imaps from 'imap-simple';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    // Check if the session or accessToken exists
    if (!session || !session.accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const config = {
        imap: {
            user: session.user?.email || '',
            xoauth2: session.accessToken || '',
            host: 'outlook.office365.com',
            port: 993,
            tls: true,
            authTimeout: 3000,
        },
    };

    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };

        const results = await connection.search(searchCriteria, fetchOptions);

        const emails = results.map((result: any) => {
            const headerPart = result.parts.find((part: any) => part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)');
            const header = headerPart?.body;

            return {
                from: header?.from[0] || 'Unknown Sender',
                subject: header?.subject[0] || 'No Subject',
                date: header?.date[0] || 'No Date',
            };
        });

        res.status(200).json({ emails });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
}
