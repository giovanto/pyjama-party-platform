import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Back-on-Track Pajama Party Platform',
  description: 'Comprehensive privacy policy compliant with GDPR 2025 requirements for the Back-on-Track Action Group night train advocacy platform.',
  keywords: 'privacy policy, GDPR, data protection, Back-on-Track, night trains, advocacy, non-profit',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-bot-green/10 border border-bot-green/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h2 className="text-lg font-semibold text-bot-green mb-2">Privacy by Design</h2>
              <p className="text-gray-700">
                This platform implements Privacy by Design principles mandated by GDPR Article 25. 
                We collect minimal data, use privacy-first analytics with no cookies, and store 
                personal data exclusively in the EU with appropriate safeguards.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            <strong>Last Updated:</strong> August 22, 2025 | 
            <strong>Next Review:</strong> February 22, 2026 | 
            <strong>GDPR Compliance Version:</strong> 2025
          </p>
        </div>

        <h2>1. Data Controller Information</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p>
            <strong>Data Controller:</strong> Back-on-Track Action Group<br />
            <strong>Legal Status:</strong> European non-profit advocacy organization<br />
            <strong>Registration:</strong> AISBL (International Non-Profit Association under Belgian Law)<br />
            <strong>Primary Contact:</strong> <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a><br />
            <strong>Data Protection Officer:</strong> Available upon request for high-risk processing activities
          </p>
        </div>

        <h2>2. Scope and Territorial Application</h2>
        <p>
          This privacy policy applies to the processing of personal data of individuals within the European Union (EU) 
          and European Economic Area (EEA) in connection with our night train advocacy platform. As a non-profit advocacy 
          organization, we process personal data under the same legal obligations as commercial entities per GDPR Article 2.
        </p>

        <h2>3. Legal Basis for Processing (GDPR Article 6)</h2>
        <p>We process personal data based on the following legal grounds:</p>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 Consent (Article 6(1)(a))</h3>
            <ul>
              <li><strong>Email communications:</strong> Explicit opt-in consent for advocacy updates</li>
              <li><strong>Event participation:</strong> Consent for September 26 Pajama Party coordination</li>
              <li><strong>Marketing:</strong> Separate granular consent for non-essential communications</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              <em>Consent is freely given, specific, informed, and unambiguous per GDPR Article 7. 
              You may withdraw consent at any time with equal ease.</em>
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2 Legitimate Interest (Article 6(1)(f))</h3>
            <ul>
              <li><strong>Advocacy statistics:</strong> Anonymous aggregation for EU policy demonstration</li>
              <li><strong>Platform security:</strong> Technical logs for fraud prevention and security</li>
              <li><strong>Research:</strong> Anonymous route demand analysis for transport planning</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              <em>Legitimate Interest Assessment (LIA) available upon request. Balancing test conducted 
              considering your fundamental rights and freedoms.</em>
            </p>
          </div>
        </div>

        <h2>4. Categories of Personal Data Processed</h2>
        
        <h3>4.1 Data Collected with Explicit Consent</h3>
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden mb-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Data Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Purpose</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Legal Basis</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Retention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm">Dream Routes (stations)</td>
              <td className="px-4 py-3 text-sm">EU advocacy demonstration</td>
              <td className="px-4 py-3 text-sm">Legitimate Interest</td>
              <td className="px-4 py-3 text-sm">Anonymized after 30 days</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm">Motivation text</td>
              <td className="px-4 py-3 text-sm">Policy argumentation</td>
              <td className="px-4 py-3 text-sm">Legitimate Interest</td>
              <td className="px-4 py-3 text-sm">Anonymized after 30 days</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm">Email address (optional)</td>
              <td className="px-4 py-3 text-sm">Communications</td>
              <td className="px-4 py-3 text-sm">Explicit Consent</td>
              <td className="px-4 py-3 text-sm">Until withdrawal</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm">Name (optional)</td>
              <td className="px-4 py-3 text-sm">Personalization</td>
              <td className="px-4 py-3 text-sm">Explicit Consent</td>
              <td className="px-4 py-3 text-sm">Until withdrawal</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm">Event participation preference</td>
              <td className="px-4 py-3 text-sm">Event coordination</td>
              <td className="px-4 py-3 text-sm">Explicit Consent</td>
              <td className="px-4 py-3 text-sm">30 days post-event</td>
            </tr>
          </tbody>
        </table>

        <h3>4.2 Technical Data (No Personal Data)</h3>
        <ul>
          <li><strong>Analytics:</strong> Page views via Plausible (EU-based, no cookies, no IP tracking)</li>
          <li><strong>Performance:</strong> Anonymous web vitals for platform optimization</li>
          <li><strong>Security logs:</strong> Server access logs (IP addresses hashed, 7-day retention)</li>
        </ul>

        <h2>5. Data Processing Principles (GDPR Article 5)</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Lawfulness & Transparency</h3>
            <p className="text-sm text-blue-800">Clear legal basis, plain language privacy information</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Purpose Limitation</h3>
            <p className="text-sm text-green-800">Data used only for stated advocacy and event purposes</p>
          </div>
          <div className="bg-bot-green/10 rounded-lg p-4">
            <h3 className="font-semibold text-bot-dark-green mb-2">Data Minimization</h3>
            <p className="text-sm text-bot-dark-green">Only essential data collected, optional fields clearly marked</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">Accuracy & Storage Limitation</h3>
            <p className="text-sm text-orange-800">Regular data reviews, automatic retention management</p>
          </div>
        </div>

        <h2>6. Data Transfers and International Processing</h2>
        
        <h3>6.1 EU Data Residency</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800">
            <strong>✅ Primary Data Storage:</strong> All personal data is stored in the EU (AWS eu-west-3, Paris, France) 
            via Supabase with full GDPR compliance and EU data residency.
          </p>
        </div>

        <h3>6.2 Third Country Processing</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Website Hosting (Vercel - US)</h4>
          <ul className="text-sm space-y-1">
            <li><strong>Data Processed:</strong> No personal data stored on Vercel servers</li>
            <li><strong>Function:</strong> Website delivery only (static content, API routing)</li>
            <li><strong>Safeguards:</strong> Standard Contractual Clauses (SCCs 2021) + Technical Measures</li>
            <li><strong>Assessment:</strong> Transfer Impact Assessment (TIA) completed January 2025</li>
            <li><strong>Alternative:</strong> EU-US Data Privacy Framework (when applicable)</li>
          </ul>
        </div>

        <h3>6.3 Analytics (EU-Based)</h3>
        <p className="text-sm text-gray-600">
          Plausible Analytics (EU infrastructure) - No personal data, no IP tracking, no cross-site tracking, GDPR Article 6(1)(f) legitimate interest.
        </p>

        <h2>7. Data Subject Rights (GDPR Articles 15-22)</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🛡️ Your Rights Under GDPR</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-medium text-gray-900">🔍 Right to Access (Article 15)</h4>
              <p className="text-sm text-gray-600">Request a copy of all personal data we hold</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">✏️ Right to Rectification (Article 16)</h4>
              <p className="text-sm text-gray-600">Correct inaccurate or incomplete data</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">🗑️ Right to Erasure (Article 17)</h4>
              <p className="text-sm text-gray-600">Request deletion of your personal data</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">⏸️ Right to Restrict Processing (Article 18)</h4>
              <p className="text-sm text-gray-600">Limit how we process your data</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">📦 Right to Data Portability (Article 20)</h4>
              <p className="text-sm text-gray-600">Export your data in machine-readable format</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">🚫 Right to Object (Article 21)</h4>
              <p className="text-sm text-gray-600">Object to legitimate interest processing</p>
            </div>
          </div>
          <div className="text-center">
            <a 
              href="/data-rights" 
              className="inline-flex items-center bg-bot-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-bot-dark-green transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Exercise Your Data Rights →
            </a>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Response within 30 days (extendable to 60 days for complex requests per Article 12(3))
          </p>
        </div>

        <h2>8. Data Security and Technical Measures</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔐 Encryption & Transport Security</h3>
            <ul className="text-sm space-y-1">
              <li>TLS 1.3 encryption for all data transmission</li>
              <li>AES-256 encryption at rest for database storage</li>
              <li>Perfect Forward Secrecy (PFS) for all connections</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🏛️ Infrastructure Security</h3>
            <ul className="text-sm space-y-1">
              <li>SOC 2 Type II compliant hosting (AWS/Supabase)</li>
              <li>ISO 27001 certified data processing facilities</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">👥 Access Controls</h3>
            <ul className="text-sm space-y-1">
              <li>Role-based access control (RBAC) with minimum necessary access</li>
              <li>Multi-factor authentication (MFA) for administrative access</li>
              <li>Audit logging of all data access activities</li>
            </ul>
          </div>
        </div>

        <h2>9. Cookies and Electronic Communications</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🍪 Cookie-Free Analytics</h3>
          <p className="text-blue-800 mb-4">
            <strong>We do not use tracking cookies.</strong> Our platform is designed with privacy by design:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">✅ Essential Only</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>Session management (login state)</li>
                <li>Consent preferences storage</li>
                <li>CSRF protection tokens</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">❌ No Tracking</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>No analytics cookies</li>
                <li>No advertising cookies</li>
                <li>No third-party trackers</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-4">
            Per ePrivacy Directive (2002/58/EC) and GDPR Article 7, consent for essential cookies is not required.
          </p>
        </div>

        <h2>10. Data Breach Notification</h2>
        <p>
          In accordance with GDPR Articles 33 and 34, we will notify the relevant supervisory authority within 72 hours 
          of becoming aware of a personal data breach. Affected individuals will be notified without undue delay when 
          the breach is likely to result in high risk to rights and freedoms.
        </p>

        <h2>11. Automated Decision-Making and Profiling</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <strong>✅ No Automated Decision-Making:</strong> This platform does not engage in automated decision-making 
            or profiling activities as defined in GDPR Article 22. All processing is for advocacy statistics and human review.
          </p>
        </div>

        <h2>12. Children's Data Protection</h2>
        <p>
          This platform is not directed at children under 16 years of age. In accordance with GDPR Article 8, 
          we do not knowingly collect personal data from children. If you are under 16, please obtain parental 
          consent before using this platform.
        </p>

        <h2>13. Supervisory Authority</h2>
        <p>
          You have the right to lodge a complaint with a supervisory authority, in particular in the Member State of 
          your habitual residence, place of work, or place of the alleged infringement. As we operate across the EU, 
          you may contact your local Data Protection Authority or:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <p>
            <strong>Lead Supervisory Authority:</strong><br />
            Commission Nationale de l'Informatique et des Libertés (CNIL) - France<br />
            <a href="https://www.cnil.fr/en/home" className="text-bot-green hover:underline">www.cnil.fr/en/home</a>
          </p>
        </div>

        <h2>14. Policy Updates and Notification</h2>
        <p>
          This privacy policy may be updated to reflect changes in legal requirements, processing activities, 
          or organizational practices. Material changes will be communicated via:
        </p>
        <ul>
          <li>Email notification (if you provided consent)</li>
          <li>Prominent website notice for 30 days</li>
          <li>Updated "Last Modified" date</li>
        </ul>

        <h2>15. Contact and Complaints</h2>
        <div className="bg-bot-green/10 border border-bot-green/20 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-bot-green mb-4">📧 Privacy Contact Information</h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>Privacy Team:</strong> <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a></p>
            <p><strong>Data Protection Requests:</strong> <a href="/data-rights" className="text-bot-green hover:underline">Self-service portal</a></p>
            <p><strong>General Contact:</strong> <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a></p>
            <p><strong>Response Time:</strong> Within 30 days (up to 60 days for complex requests)</p>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 border-t pt-6">
          <p><strong>Document Version:</strong> 2.0 (GDPR 2025 Compliance)</p>
          <p><strong>Last Updated:</strong> August 22, 2025</p>
          <p><strong>Next Scheduled Review:</strong> February 22, 2026</p>
          <p><strong>Legal Framework:</strong> GDPR, ePrivacy Directive, EU-US DPF, SCCs 2021</p>
        </div>
      </div>
    </div>
  );
}