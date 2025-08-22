import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Back-on-Track Pajama Party Platform',
  description: 'Terms of service and usage conditions for the Back-on-Track Action Group night train advocacy platform.',
  keywords: 'terms of service, Back-on-Track, night trains, advocacy, platform usage',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-bot-green/10 border border-bot-green/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🤝</span>
            <div>
              <h2 className="text-lg font-semibold text-bot-green mb-2">Advocacy Platform Terms</h2>
              <p className="text-gray-700">
                These terms govern your use of the Back-on-Track Pajama Party platform for European 
                night train advocacy. By participating, you help build the case for sustainable transport.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            <strong>Effective Date:</strong> August 22, 2025 | 
            <strong>Platform:</strong> Back-on-Track Action Group | 
            <strong>Version:</strong> 2.0
          </p>
        </div>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Back-on-Track Pajama Party Platform (&quot;Platform&quot;), you agree to be bound by 
          these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Platform.
        </p>

        <h2>2. About the Platform</h2>
        <p>
          This Platform is operated by the Back-on-Track Action Group, a European non-profit advocacy organization 
          promoting sustainable transport through night train development. Our mission is to:
        </p>
        <ul>
          <li>Demonstrate public demand for night train routes to EU policymakers</li>
          <li>Coordinate grassroots advocacy events across Europe</li>
          <li>Connect communities advocating for sustainable transport</li>
          <li>Provide data and research supporting night train policy</li>
        </ul>

        <h2>3. Platform Services</h2>
        <p>The Platform provides the following services:</p>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🌙 Dream Route Submission</h3>
            <p className="text-sm">Submit desired night train connections to demonstrate demand</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🎉 Event Coordination</h3>
            <p className="text-sm">Participate in or organize September 26 Pajama Party events</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📊 Advocacy Dashboard</h3>
            <p className="text-sm">Access public data and statistics for advocacy purposes</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">👥 Community Platform</h3>
            <p className="text-sm">Connect with other night train advocates across Europe</p>
          </div>
        </div>

        <h2>4. User Eligibility and Registration</h2>
        <p>
          <strong>Age Requirement:</strong> You must be at least 16 years old to use this Platform. 
          Users under 16 require parental consent in accordance with GDPR Article 8.
        </p>
        <p>
          <strong>Registration:</strong> No mandatory registration is required. Email provision is entirely 
          optional and requires explicit consent for communications.
        </p>

        <h2>5. Permitted Uses</h2>
        <p>You may use the Platform to:</p>
        <ul>
          <li>Submit dream routes for advocacy purposes</li>
          <li>Access public advocacy data and statistics</li>
          <li>Participate in community events and discussions</li>
          <li>Share Platform content for advocacy and educational purposes</li>
          <li>Export public data for research and policy work</li>
        </ul>

        <h2>6. Prohibited Uses</h2>
        <p>You may NOT use the Platform to:</p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ul className="space-y-2 text-red-800">
            <li><strong>Submit false or misleading information</strong> that undermines advocacy efforts</li>
            <li><strong>Spam or abuse communication systems</strong> including excessive submissions</li>
            <li><strong>Interfere with Platform operations</strong> including attempts to bypass security</li>
            <li><strong>Violate applicable laws</strong> including data protection and privacy regulations</li>
            <li><strong>Impersonate others</strong> or misrepresent your affiliation with organizations</li>
            <li><strong>Use automated systems</strong> without prior written consent</li>
            <li><strong>Commercial exploitation</strong> of Platform data without permission</li>
          </ul>
        </div>

        <h2>7. User Content and Submissions</h2>
        
        <h3>7.1 Your Content</h3>
        <p>
          When you submit dream routes, comments, or other content (&quot;User Content&quot;), you represent that:
        </p>
        <ul>
          <li>You have the right to submit such content</li>
          <li>The content is accurate and not misleading</li>
          <li>The content does not violate any third-party rights</li>
          <li>You consent to the use of your content for advocacy purposes</li>
        </ul>

        <h3>7.2 Content License</h3>
        <p>
          By submitting User Content, you grant Back-on-Track a non-exclusive, royalty-free, worldwide license to:
        </p>
        <ul>
          <li>Use your content for advocacy and policy purposes</li>
          <li>Create anonymous statistics and aggregations</li>
          <li>Share anonymized data with policymakers and researchers</li>
          <li>Include content in reports, presentations, and publications</li>
        </ul>
        <p className="text-sm text-gray-600">
          <em>Personal data remains subject to our Privacy Policy and your consent preferences.</em>
        </p>

        <h2>8. Privacy and Data Protection</h2>
        <p>
          Your privacy is paramount. Our data processing practices are governed by our comprehensive 
          <a href="/privacy" className="text-bot-green hover:underline font-medium">Privacy Policy</a>, 
          which complies with GDPR 2025 requirements and implements Privacy by Design principles.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Key Privacy Principles:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>✅ Minimal data collection (only what's necessary for advocacy)</li>
            <li>✅ EU data storage (AWS eu-west-3, Paris, France)</li>
            <li>✅ No tracking cookies or cross-site monitoring</li>
            <li>✅ Explicit consent for all optional data</li>
            <li>✅ Easy data deletion and export rights</li>
          </ul>
        </div>

        <h2>9. Intellectual Property</h2>
        
        <h3>9.1 Platform Content</h3>
        <p>
          All Platform content, including design, logos, text, and software, is owned by Back-on-Track 
          Action Group or licensed from third parties. The &quot;Back-on-Track&quot; name and logos are trademarks 
          of the organization.
        </p>

        <h3>9.2 Open Data Commitment</h3>
        <p>
          Public advocacy statistics and anonymized route data are made available under 
          <a href="https://creativecommons.org/licenses/by/4.0/" className="text-bot-green hover:underline" target="_blank" rel="noopener noreferrer">
            Creative Commons Attribution 4.0 International License
          </a> 
          to support research and policy development.
        </p>

        <h2>10. Platform Availability and Changes</h2>
        <p>
          <strong>Service Availability:</strong> We strive to maintain Platform availability but cannot guarantee 
          uninterrupted service. Maintenance windows will be announced when possible.
        </p>
        <p>
          <strong>Platform Changes:</strong> We may modify Platform features, content, or functionality to improve 
          advocacy effectiveness or comply with legal requirements. Significant changes will be communicated 
          to users who provided contact information.
        </p>

        <h2>11. Community Guidelines</h2>
        <p>The Platform fosters respectful advocacy. Please:</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ Do</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>Share constructive feedback and ideas</li>
              <li>Respect diverse perspectives on transport</li>
              <li>Provide accurate information</li>
              <li>Support fellow advocates</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">❌ Don't</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>Harass or discriminate against users</li>
              <li>Share misleading transport information</li>
              <li>Spam or abuse communication features</li>
              <li>Violate privacy or safety guidelines</li>
            </ul>
          </div>
        </div>

        <h2>12. Disclaimer of Warranties</h2>
        <p>
          The Platform is provided &quot;as is&quot; without warranties of any kind. Back-on-Track Action Group 
          makes no guarantees regarding:
        </p>
        <ul>
          <li>Continuous Platform availability or performance</li>
          <li>Accuracy of user-submitted content</li>
          <li>Achievement of specific advocacy outcomes</li>
          <li>Compatibility with all devices or browsers</li>
        </ul>

        <h2>13. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Back-on-Track Action Group shall not be liable for any 
          indirect, incidental, special, or consequential damages arising from Platform use, including:
        </p>
        <ul>
          <li>Loss of data or advocacy opportunities</li>
          <li>Technical difficulties or service interruptions</li>
          <li>Actions taken by third parties based on Platform content</li>
          <li>Events or circumstances beyond our reasonable control</li>
        </ul>

        <h2>14. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Back-on-Track Action Group from claims arising from:
        </p>
        <ul>
          <li>Your violation of these Terms</li>
          <li>Your User Content or submissions</li>
          <li>Your violation of applicable laws or regulations</li>
          <li>Your infringement of third-party rights</li>
        </ul>

        <h2>15. Termination</h2>
        <p>
          <strong>Your Right to Terminate:</strong> You may stop using the Platform at any time and request 
          deletion of your personal data through our <a href="/data-rights" className="text-bot-green hover:underline">Data Rights portal</a>.
        </p>
        <p>
          <strong>Our Right to Terminate:</strong> We may restrict or terminate access for violations of these 
          Terms, but will endeavor to provide notice when possible given our advocacy mission.
        </p>

        <h2>16. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of Belgium and the European Union, reflecting Back-on-Track&apos;s 
          legal status as an AISBL (International Non-Profit Association under Belgian Law).
        </p>
        <p>
          Any disputes shall be subject to the jurisdiction of Belgian courts, with GDPR and EU consumer 
          protection laws taking precedence where applicable.
        </p>

        <h2>17. Contact Information</h2>
        <div className="bg-bot-green/10 border border-bot-green/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-bot-green mb-4">📧 Terms and Legal Contact</h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>Legal Questions:</strong> <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a></p>
            <p><strong>Platform Issues:</strong> <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a></p>
            <p><strong>Privacy Matters:</strong> <a href="/privacy" className="text-bot-green hover:underline">Privacy Policy</a> | <a href="/data-rights" className="text-bot-green hover:underline">Data Rights Portal</a></p>
          </div>
        </div>

        <h2>18. Changes to Terms</h2>
        <p>
          We may update these Terms to reflect changes in:
        </p>
        <ul>
          <li>Platform functionality or services</li>
          <li>Legal requirements or regulatory changes</li>
          <li>Advocacy activities or organizational structure</li>
        </ul>
        <p>
          Material changes will be communicated via email (if provided) or prominent Platform notice. 
          Continued use after changes constitutes acceptance of updated Terms.
        </p>

        <h2>19. Severability</h2>
        <p>
          If any provision of these Terms is found unenforceable, the remainder shall remain in full force 
          and effect. Invalid provisions shall be replaced with enforceable terms that most closely reflect 
          the original intent.
        </p>

        <h2>20. Entire Agreement</h2>
        <p>
          These Terms, together with our Privacy Policy, constitute the complete agreement between you and 
          Back-on-Track Action Group regarding Platform use. They supersede all prior communications or 
          agreements on this subject.
        </p>

        <div className="mt-12 text-sm text-gray-500 border-t pt-6">
          <p><strong>Document Version:</strong> 2.0</p>
          <p><strong>Effective Date:</strong> August 22, 2025</p>
          <p><strong>Next Review:</strong> February 22, 2026</p>
          <p><strong>Organization:</strong> Back-on-Track Action Group (AISBL)</p>
          <p><strong>Jurisdiction:</strong> Belgium / European Union</p>
        </div>
      </div>
    </div>
  );
}