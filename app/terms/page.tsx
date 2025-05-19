import { connectToDatabase } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export const metadata: Metadata = {
  title: "Terms and Conditions | Gangio",
  description: "Terms and conditions for using the Gangio platform",
};

interface TermsData {
  content: string;
  lastUpdated: Date;
}

async function getTerms(): Promise<TermsData> {
  try {
    const db = await connectToDatabase();
    
    // Get site settings from database
    const settings = await db.collection("settings").findOne({ type: "site" });
    
    if (settings && settings.termsContent) {
      return {
        content: settings.termsContent,
        lastUpdated: settings.termsLastUpdated || new Date()
      };
    }
    
    // Return default terms if not found in database
    return {
      content: `# Terms and Conditions

Welcome to Gangio!

These terms and conditions outline the rules and regulations for the use of our platform.

## 1. Acceptance of Terms

By accessing this website, you accept these terms and conditions in full. If you disagree with these terms and conditions or any part of them, you must not use this website.

## 2. User Accounts

When you create an account with us, you must provide information that is accurate, complete, and current at all times.

## 3. Content Guidelines

Users are prohibited from posting content that is illegal, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable.

## 4. Termination

We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

## 5. Limitation of Liability

In no event shall Gangio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.

## 6. Governing Law

These Terms shall be governed and construed in accordance with the laws applicable in your jurisdiction, without regard to its conflict of law provisions.

## 7. Changes to Terms

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.

## 8. Contact Us

If you have any questions about these Terms, please contact us.`,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error("Error fetching terms:", error);
    return {
      content: "# Terms and Conditions\n\nUnable to load terms and conditions at this time. Please try again later.",
      lastUpdated: new Date()
    };
  }
}

export default async function TermsPage() {
  // Apply the same timeout pattern we used for server fetching
  const termsTimeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Terms fetch timeout after 5 seconds')), 5000);
  });
  
  const termsDataPromise = getTerms();
  
  // Race the promises to ensure we don't exceed Vercel function timeout
  let terms: TermsData;
  try {
    terms = await Promise.race([termsDataPromise, termsTimeoutPromise]);
  } catch (error) {
    console.error("Error or timeout fetching terms:", error);
    terms = {
      content: "# Terms and Conditions\n\nUnable to load terms and conditions at this time. Please try again later.",
      lastUpdated: new Date()
    };
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-8">
          <div className="mb-6 flex justify-between items-center">
            <Link 
              href="/" 
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to Home
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {terms.lastUpdated ? new Date(terms.lastUpdated).toLocaleDateString() : "N/A"}
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{terms.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
