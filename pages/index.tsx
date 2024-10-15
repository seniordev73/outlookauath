import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Email {
  from: string;
  subject: string;
  date: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch emails when the component mounts
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/fetchEmails'); // Call the API
        const data = await response.json(); // Parse JSON response
        if (response.ok) {
          setEmails(data.emails); // Set emails in the state
        } else {
          setError(data.error || 'Failed to fetch emails');
        }
      } catch (err) {
        setError('Error fetching emails');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchEmails();
    }
  }, [session]);

  if (status === 'loading') {
    return <div>Loading authentication...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {!session ? (
        <button onClick={() => signIn('azure-ad')} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Sign in with Outlook
        </button>
      ) : (
          <>
            <div className="flex items-center space-x-4">
              <p>Welcome, {session.user?.name || session.user?.email}</p>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Sign out
              </button>
            </div>

            <h2 className="text-xl mt-4">Your Unread Emails</h2>

            {loading ? (
              <p>Loading emails...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : emails.length === 0 ? (
                  <p>No unread emails found.</p>
                ) : (
                    <ul className="mt-4 w-full max-w-lg">
                      {emails.map((email, idx) => (
                        <li key={idx} className="border-b py-4">
                          <p><strong>From:</strong> {email.from}</p>
                          <p><strong>Subject:</strong> {email.subject}</p>
                          <p><strong>Date:</strong> {email.date}</p>
                        </li>
                      ))}
              </ul>
            )}
        </>
      )}
    </div>
  );
}
