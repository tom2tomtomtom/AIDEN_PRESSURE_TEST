import Link from 'next/link'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Terms & Conditions | AIDEN',
  description: 'Terms and Conditions for AIDEN services',
}

export default function TermsPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold text-white-full mb-2">Terms & Conditions</h1>
        <p className="text-white-muted mb-8">Last updated: February 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-white-muted">
              These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of AIDEN services,
              including AIDEN.Test (collectively, the &quot;Services&quot;), provided by Redbaez (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;). Please read these Terms carefully before using our Services.
            </p>
          </section>

          {/* 1. Acceptance & Eligibility */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">1. Acceptance & Eligibility</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Agreement by Use</h3>
            <p className="text-white-muted mb-4">
              By accessing or using our Services, you agree to be bound by these Terms and our Privacy
              Policy. If you do not agree to these Terms, you may not use the Services.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Eligibility Requirements</h3>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>You must be at least 18 years of age to use our Services</li>
              <li>You must have the legal capacity to enter into binding agreements</li>
              <li>The Services are intended for business and professional use</li>
            </ul>
          </section>

          {/* 2. Account Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">2. Account Responsibilities</h2>
            <p className="text-white-muted mb-4">When you create an account, you agree to:</p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security and confidentiality of your login credentials</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Not share your account with others (accounts are single-user)</li>
            </ul>
            <p className="text-white-muted mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          {/* 3. Acceptable Use Policy */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">3. Acceptable Use Policy</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Prohibited Content</h3>
            <p className="text-white-muted mb-2">You may not use the Services to create, process, or distribute:</p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Illegal content or content promoting illegal activities</li>
              <li>Child sexual abuse material (CSAM) or content sexualizing minors</li>
              <li>Harassment, threats, or content promoting violence</li>
              <li>Hate speech or discrimination based on protected characteristics</li>
              <li>Malware, viruses, or malicious code</li>
              <li>Content that infringes intellectual property rights</li>
              <li>Non-consensual intimate images or deepfakes of real individuals</li>
              <li>Spam or deceptive content</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Prohibited Activities</h3>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Attempting to bypass usage limits or rate limiting</li>
              <li>Reverse engineering, decompiling, or disassembling the Services</li>
              <li>Reselling access to the Services without authorization</li>
              <li>Automated abuse, scraping, or excessive API calls</li>
              <li>Interfering with or disrupting the Services</li>
              <li>Impersonating others or misrepresenting your affiliation</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Not Suitable For</h3>
            <p className="text-white-muted mb-2">The Services should NOT be used to generate:</p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Medical, health, or therapeutic advice</li>
              <li>Legal advice or legal document preparation</li>
              <li>Financial, investment, or tax advice</li>
              <li>Safety-critical decisions or emergency guidance</li>
            </ul>
          </section>

          {/* 4. AI Output Disclaimers */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">4. AI Output Disclaimers</h2>

            <div className="bg-black-card border-2 border-red-hot p-4 mb-4">
              <p className="text-white-full font-semibold mb-2">CRITICAL NOTICE:</p>
              <p className="text-white-muted">
                The Services use artificial intelligence to generate synthetic research outputs.
                These outputs are NOT guaranteed to be accurate, complete, or suitable for any
                particular purpose.
              </p>
            </div>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">No Accuracy Guarantee</h3>
            <p className="text-white-muted mb-4">
              AI systems, including those used by our Services, may produce outputs that contain
              errors, inaccuracies, or fabrications (commonly known as &quot;hallucinations&quot;). We make
              NO guarantees regarding the accuracy, reliability, or completeness of any AI-generated
              content.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Not Professional Advice</h3>
            <p className="text-white-muted mb-4">
              AI-generated outputs do NOT constitute professional advice of any kind. The Services
              are tools for ideation and exploration, not authoritative guidance.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">User Verification Responsibility</h3>
            <p className="text-white-muted mb-4">
              <strong>You are solely responsible for verifying</strong> all AI-generated outputs
              before relying on them for any decision or action. You should independently validate
              any information, claims, or suggestions provided by the Services.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Commercial Use</h3>
            <p className="text-white-muted">
              Any commercial use of AI-generated outputs is at your own risk. We disclaim all
              liability for decisions made based on AI outputs.
            </p>
          </section>

          {/* 5. Synthetic Research Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">5. Synthetic Research Disclaimer (AIDEN.Test)</h2>

            <div className="bg-black-card border-2 border-red-hot p-4 mb-4">
              <p className="text-white-full font-semibold mb-2">IMPORTANT - SYNTHETIC RESEARCH LIMITATIONS:</p>
              <p className="text-white-muted">
                AIDEN.Test uses AI-generated &quot;Phantom Personas&quot; to simulate consumer responses.
                These personas are NOT real people and their responses do NOT represent actual
                consumer behavior or opinions.
              </p>
            </div>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Phantom Personas Are NOT Real Consumers</h3>
            <p className="text-white-muted mb-4">
              The synthetic personas created by our Services are AI constructs based on statistical
              patterns and generalizations. They do not represent real individuals and cannot
              accurately predict how real consumers will behave.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Statistical Approximations Only</h3>
            <p className="text-white-muted mb-4">
              Outputs from synthetic research represent statistical approximations and hypothetical
              responses. They should be treated as directional indicators, not definitive findings.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Cannot Predict Actual Behavior</h3>
            <p className="text-white-muted mb-4">
              Synthetic personas cannot accurately predict actual consumer behavior, market outcomes,
              or real-world responses to products, services, or communications.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Intended Use</h3>
            <p className="text-white-muted mb-2">Synthetic research outputs are intended ONLY for:</p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Early-stage ideation and concept exploration</li>
              <li>Preliminary hypothesis generation</li>
              <li>Identifying potential areas for further research</li>
              <li>Internal discussion and brainstorming</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">NOT a Substitute for Human Research</h3>
            <p className="text-white-muted mb-4">
              Synthetic research is NOT a substitute for traditional market research, consumer
              studies, focus groups, surveys, or any methodology involving real human participants.
              Critical business decisions should be validated with real consumer research.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Disclosure Requirements</h3>
            <p className="text-white-muted">
              If you publish, present, or share findings derived from synthetic research, you MUST
              clearly disclose that the research was conducted using AI-generated synthetic personas,
              not real human participants.
            </p>
          </section>

          {/* 6. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">6. Intellectual Property</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Your Content</h3>
            <p className="text-white-muted mb-4">
              You retain ownership of all content you submit to the Services (your &quot;Input&quot;).
              By using the Services, you grant us a limited license to process your Input solely
              for the purpose of providing the Services.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">AI-Generated Outputs</h3>
            <p className="text-white-muted mb-4">
              Subject to your compliance with these Terms, you own the AI-generated outputs created
              through your use of the Services, with the following caveats:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Copyright protection for AI-generated content varies by jurisdiction</li>
              <li>Some jurisdictions may not grant copyright to AI-generated works</li>
              <li>You are responsible for determining the legal status in your jurisdiction</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Platform Rights</h3>
            <p className="text-white-muted mb-4">
              AIDEN, the AIDEN logo, and all related technology, features, and documentation remain
              the exclusive property of Redbaez. Nothing in these Terms grants you rights to our
              trademarks, service marks, or trade dress.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Third-Party Content</h3>
            <p className="text-white-muted">
              AI outputs may inadvertently resemble or incorporate elements from third-party
              copyrighted works. We make no warranty that outputs are free from third-party IP
              claims. You are responsible for ensuring your use of outputs does not infringe
              third-party rights.
            </p>
          </section>

          {/* 7. Third-Party AI Services */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">7. Third-Party AI Services</h2>
            <p className="text-white-muted mb-4">
              The Services utilize third-party AI providers, including:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Anthropic (Claude)</li>
              <li>OpenAI (GPT models)</li>
            </ul>
            <p className="text-white-muted mt-4">
              Your use of the Services is also subject to these providers&apos; terms of service and
              acceptable use policies. We do not control the availability, performance, or policies
              of third-party AI services and may change providers at any time.
            </p>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">8. Limitation of Liability</h2>

            <div className="bg-black-card border-2 border-red-hot p-4 mb-4">
              <p className="text-white-full font-semibold">SERVICES PROVIDED &quot;AS IS&quot;</p>
            </div>

            <p className="text-white-muted mb-4">
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
              KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">No Liability For</h3>
            <p className="text-white-muted mb-2">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Lost profits, revenue, data, or business opportunities</li>
              <li>Costs of procurement of substitute services</li>
              <li>Decisions made based on AI-generated outputs</li>
              <li>Reliance on synthetic research findings</li>
              <li>Any damages arising from service interruptions or errors</li>
            </ul>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Liability Cap</h3>
            <p className="text-white-muted">
              <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF: (A) THE FEES YOU PAID
              TO US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED AUSTRALIAN DOLLARS
              (AUD $100).</strong>
            </p>

            <p className="text-white-muted mt-4">
              Some jurisdictions do not allow limitations on implied warranties or exclusion of
              certain damages. If these laws apply to you, some or all of the above limitations
              may not apply.
            </p>
          </section>

          {/* 9. Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">9. Indemnification</h2>
            <p className="text-white-muted mb-4">
              You agree to indemnify, defend, and hold harmless Redbaez and its officers, directors,
              employees, and agents from and against any claims, damages, losses, liabilities, costs,
              and expenses (including reasonable legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Your use of the Services</li>
              <li>Your content and inputs</li>
              <li>Your violation of these Terms</li>
              <li>Third-party intellectual property claims related to your use of AI outputs</li>
              <li>Misrepresenting synthetic research as research conducted with real human participants</li>
              <li>Any decisions or actions taken based on AI-generated outputs</li>
            </ul>
          </section>

          {/* 10. Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">10. Service Availability</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">No Uptime Guarantee</h3>
            <p className="text-white-muted mb-4">
              We do not guarantee any specific level of service availability or uptime. The Services
              may be unavailable due to maintenance, updates, or circumstances beyond our control.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">No SLA</h3>
            <p className="text-white-muted mb-4">
              Unless you have entered into a separate service level agreement with us, no SLA applies
              to your use of the Services.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">User Backups</h3>
            <p className="text-white-muted mb-4">
              You are responsible for maintaining your own backups of important content. We are not
              responsible for data loss.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Modifications</h3>
            <p className="text-white-muted">
              We may modify, suspend, or discontinue any features of the Services at any time
              without prior notice.
            </p>
          </section>

          {/* 11. Termination */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">11. Termination</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">User Termination</h3>
            <p className="text-white-muted mb-4">
              You may terminate your account at any time by contacting us at{' '}
              <a href="mailto:contact@redbaez.com" className="text-red-hot hover:underline">contact@redbaez.com</a>.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Our Termination Rights</h3>
            <p className="text-white-muted mb-4">
              We may suspend or terminate your access to the Services immediately, without prior
              notice, if you violate these Terms or for any other reason at our sole discretion.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Effect of Termination</h3>
            <ul className="list-disc pl-6 text-white-muted space-y-1">
              <li>Your right to access the Services will cease immediately</li>
              <li>Your data will be deleted within 30 days of termination</li>
              <li>Any fees paid are non-refundable</li>
              <li>Provisions that by their nature should survive will remain in effect</li>
            </ul>
          </section>

          {/* 12. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">12. Governing Law</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Jurisdiction</h3>
            <p className="text-white-muted mb-4">
              These Terms are governed by the laws of New South Wales, Australia, without regard
              to conflict of law principles.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">UK/EU Users</h3>
            <p className="text-white-muted mb-4">
              If you are a consumer in the United Kingdom or European Union, you may also be
              entitled to invoke mandatory consumer protection laws of your country of residence.
              GDPR rights for EEA users apply regardless of governing law.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Dispute Resolution</h3>
            <p className="text-white-muted mb-4">
              Before initiating any formal proceedings, you agree to first attempt to resolve
              disputes informally by contacting us at{' '}
              <a href="mailto:contact@redbaez.com" className="text-red-hot hover:underline">contact@redbaez.com</a>.
              We will attempt to resolve the dispute within 30 days.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Limitation on Claims</h3>
            <p className="text-white-muted">
              Any claim or cause of action arising from or related to these Terms or the Services
              must be filed within one (1) year after such claim or cause of action arose, or be
              forever barred.
            </p>
          </section>

          {/* 13. General Provisions */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">13. General Provisions</h2>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Entire Agreement</h3>
            <p className="text-white-muted mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between
              you and Redbaez regarding the Services and supersede all prior agreements.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Severability</h3>
            <p className="text-white-muted mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions
              will continue in full force and effect.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">No Waiver</h3>
            <p className="text-white-muted mb-4">
              Our failure to enforce any provision of these Terms shall not constitute a waiver of
              that provision or any other provision.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Assignment</h3>
            <p className="text-white-muted mb-4">
              You may not assign or transfer your rights under these Terms without our prior written
              consent. We may assign our rights and obligations without restriction.
            </p>

            <h3 className="text-lg font-medium text-white-full mt-4 mb-2">Contact</h3>
            <p className="text-white-muted">
              For questions about these Terms, please contact us at{' '}
              <a href="mailto:contact@redbaez.com" className="text-red-hot hover:underline">contact@redbaez.com</a>.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-white-full mb-4">Changes to These Terms</h2>
            <p className="text-white-muted">
              We reserve the right to modify these Terms at any time. We will notify you of material
              changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date.
              Your continued use of the Services after changes are posted constitutes acceptance of
              the updated Terms.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
