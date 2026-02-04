import Link from 'next/link'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Privacy Policy | AIDEN',
  description: 'Privacy Policy for AIDEN services',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black-ink flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-red-hot bg-black-ink">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <Link href="/" className="flex items-center gap-1">
            <span className="aiden-brand text-xl text-red-hot">AIDEN</span>
            <span className="aiden-app-name text-xl text-white-dim">.Test</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white-full mb-2">Privacy Policy</h1>
        <p className="text-white-muted mb-8">Last updated: February 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-white-muted">
              This Privacy Policy describes how Redbaez (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses,
              and shares information about you when you use AIDEN services, including AIDEN.Test
              (collectively, the &quot;Services&quot;). By using our Services, you agree to the collection
              and use of information in accordance with this policy.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">1. Information We Collect</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Account Information</h3>
            <p className="text-white-muted mb-2">
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Organization name (if provided)</li>
              <li>Password (stored securely using industry-standard hashing)</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Content You Provide</h3>
            <p className="text-white-muted mb-2">
              When using our Services, we collect content you create or submit:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Project information and configurations</li>
              <li>Test prompts and stimulus materials</li>
              <li>Uploaded documents and images</li>
              <li>AI-generated outputs and test results</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Automatically Collected Information</h3>
            <p className="text-white-muted mb-2">
              We automatically collect certain information when you use our Services:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Device information (browser type, operating system)</li>
              <li>Log data (IP address, access times, pages viewed)</li>
              <li>Usage patterns and feature interactions</li>
            </ul>
          </section>

          {/* 2. AI Processing Disclosure */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">2. AI Processing Disclosure</h2>
            <p className="text-white-muted mb-4">
              Our Services utilize third-party AI providers to deliver synthetic research capabilities.
              This is a critical aspect of our service that you should understand:
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Third-Party AI Providers</h3>
            <p className="text-white-muted mb-2">
              We use the following AI service providers:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Anthropic (Claude)</li>
              <li>OpenAI (GPT models)</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Data Transmitted for Processing</h3>
            <p className="text-white-muted mb-2">
              When you run tests, the following data may be transmitted to AI providers:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Test prompts and questions</li>
              <li>Stimulus materials and context</li>
              <li>Persona configuration parameters</li>
            </ul>

            <div className="bg-black-card border border-border-subtle p-4 mt-4">
              <p className="text-white-full font-semibold mb-2">Important:</p>
              <p className="text-white-muted">
                <strong>Your data is NOT used to train AI models.</strong> Both Anthropic and OpenAI
                have committed that data processed through their APIs is not used for model training.
                We implement data minimization practices, only sending necessary information for
                processing your requests.
              </p>
            </div>
          </section>

          {/* 3. Data Retention & Deletion */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">3. Data Retention & Deletion</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Retention Periods</h3>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li><strong>Account data:</strong> Retained while your account is active, plus 30 days after deletion request</li>
              <li><strong>Project and test data:</strong> Retained while your account is active</li>
              <li><strong>Server logs:</strong> Retained for 90 days</li>
              <li><strong>Analytics data:</strong> Retained in anonymized form</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Right to Deletion</h3>
            <p className="text-white-muted mb-2">
              You may request deletion of your data at any time by contacting us at{' '}
              <a href="mailto:tomh@redbaez.com" className="text-red-hot hover:underline">tomh@redbaez.com</a>.
              Deletion requests are processed within 30 days.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Third-Party Retention</h3>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li><strong>OpenAI:</strong> API data retained for up to 30 days for abuse monitoring, then deleted</li>
              <li><strong>Anthropic:</strong> API data not retained after processing</li>
            </ul>
          </section>

          {/* 4. International Data Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">4. International Data Transfers</h2>
            <p className="text-white-muted mb-4">
              Our Services are hosted on infrastructure located in the United States. Our AI providers
              also operate primarily from the United States.
            </p>
            <p className="text-white-muted mb-4">
              For users in the European Economic Area (EEA), United Kingdom, or other jurisdictions
              with data transfer restrictions, we rely on:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Our providers&apos; compliance with applicable data protection frameworks</li>
            </ul>
            <p className="text-white-muted mt-4">
              GDPR rights for EEA users are detailed in Section 5 below.
            </p>
          </section>

          {/* 5. User Rights (GDPR/CCPA) */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">5. User Rights (GDPR/CCPA)</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">For All Users</h3>
            <p className="text-white-muted mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">For California Residents (CCPA)</h3>
            <p className="text-white-muted mb-2">California residents have additional rights:</p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li><strong>Right to Know:</strong> What personal information we collect, use, and disclose</li>
              <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
              <li><strong>Right to Correct:</strong> Request correction of inaccurate information</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information</li>
            </ul>

            <div className="bg-black-card border border-border-subtle p-4 mt-4">
              <p className="text-white-full font-semibold">We do NOT sell personal information.</p>
            </div>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">For EEA Users (GDPR)</h3>
            <p className="text-white-muted mb-2">EEA users have additional rights:</p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Complaint:</strong> Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          {/* 6. Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">6. Data Sharing</h2>
            <p className="text-white-muted mb-4">
              We share your information only in the following circumstances:
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Service Providers</h3>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li><strong>Hosting:</strong> Railway (infrastructure)</li>
              <li><strong>AI Processing:</strong> Anthropic, OpenAI</li>
              <li><strong>Database:</strong> Supabase</li>
              <li><strong>Payments:</strong> Stripe (if applicable)</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Legal Requirements</h3>
            <p className="text-white-muted">
              We may disclose your information if required by law, legal process, or government request,
              or to protect the rights, property, or safety of Redbaez, our users, or others.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">No Sale to Third Parties</h3>
            <p className="text-white-muted">
              We do not sell, rent, or trade your personal information to third parties for their
              marketing purposes.
            </p>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">7. Cookies</h2>
            <p className="text-white-muted mb-4">
              We use cookies and similar technologies to operate our Services:
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Essential Cookies</h3>
            <p className="text-white-muted mb-2">
              Required for authentication, security, and basic functionality. Cannot be disabled.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Analytics Cookies</h3>
            <p className="text-white-muted mb-2">
              Help us understand usage patterns and improve our Services.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Managing Cookies</h3>
            <p className="text-white-muted">
              You can control cookies through your browser settings. Note that disabling certain
              cookies may affect the functionality of our Services.
            </p>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-white-muted">
              Our Services are not intended for children under 13 years of age (or 16 in the EEA).
              We do not knowingly collect personal information from children. If you believe we have
              collected information from a child, please contact us immediately at{' '}
              <a href="mailto:tomh@redbaez.com" className="text-red-hot hover:underline">tomh@redbaez.com</a>.
            </p>
          </section>

          {/* 9. Security Measures */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">9. Security Measures</h2>
            <p className="text-white-muted mb-4">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li><strong>Encryption:</strong> Data encrypted in transit (TLS) and at rest</li>
              <li><strong>Access Controls:</strong> Role-based access and authentication requirements</li>
              <li><strong>Monitoring:</strong> Regular security monitoring and vulnerability assessments</li>
              <li><strong>Incident Response:</strong> Procedures for detecting and responding to breaches</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Breach Notification</h3>
            <p className="text-white-muted">
              In the event of a data breach affecting your personal information, we will notify you
              within 72 hours of becoming aware of the breach, as required by applicable law.
            </p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">10. Contact Us</h2>
            <p className="text-white-muted mb-4">
              For any questions about this Privacy Policy or to exercise your rights, contact us at:
            </p>
            <p className="text-white-muted">
              <strong>Email:</strong>{' '}
              <a href="mailto:tomh@redbaez.com" className="text-red-hot hover:underline">tomh@redbaez.com</a>
            </p>
            <p className="text-white-muted mt-4">
              We will respond to your request within 30 days.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">Changes to This Policy</h2>
            <p className="text-white-muted">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              Your continued use of the Services after changes are posted constitutes acceptance of
              the updated policy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
