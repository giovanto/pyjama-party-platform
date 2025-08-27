'use client';

import { useState } from 'react';
import { Metadata } from 'next';

// Note: This would normally be generated server-side, but adding here for demo
const metadata: Metadata = {
  title: 'Data Rights Portal | Back-on-Track Pajama Party Platform',
  description: 'Exercise your GDPR data rights including access, rectification, erasure, and data portability.',
  keywords: 'GDPR rights, data access, data deletion, data export, privacy rights',
};

export default function DataRightsPage() {
  const [selectedRight, setSelectedRight] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    requestType: '',
    description: '',
    verificationMethod: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const dataRights = [
    {
      id: 'access',
      title: 'Right to Access (Article 15)',
      icon: '🔍',
      description: 'Request a copy of all personal data we hold about you',
      details: 'Receive a complete export of your data including dream routes, email preferences, and processing activities.',
      timeframe: '30 days'
    },
    {
      id: 'rectification',
      title: 'Right to Rectification (Article 16)',
      icon: '✏️',
      description: 'Correct inaccurate or incomplete personal data',
      details: 'Update your name, email address, dream routes, or other information we have on file.',
      timeframe: '30 days'
    },
    {
      id: 'erasure',
      title: 'Right to Erasure (Article 17)',
      icon: '🗑️',
      description: 'Request deletion of your personal data',
      details: 'Permanently delete your email, name, and identifiable data. Anonymous advocacy statistics may be retained.',
      timeframe: '30 days'
    },
    {
      id: 'restriction',
      title: 'Right to Restrict Processing (Article 18)',
      icon: '⏸️',
      description: 'Limit how we process your data',
      details: 'Temporarily restrict processing while we verify accuracy or your objection to processing.',
      timeframe: '30 days'
    },
    {
      id: 'portability',
      title: 'Right to Data Portability (Article 20)',
      icon: '📦',
      description: 'Export your data in machine-readable format',
      details: 'Receive your data in JSON/CSV format to transfer to another service or for personal use.',
      timeframe: '30 days'
    },
    {
      id: 'object',
      title: 'Right to Object (Article 21)',
      icon: '🚫',
      description: 'Object to processing based on legitimate interest',
      details: 'Object to processing for advocacy statistics while maintaining essential platform functions.',
      timeframe: '30 days'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In production, this would submit to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRightSelection = (rightId: string) => {
    setSelectedRight(rightId);
    setFormData(prev => ({ ...prev, requestType: rightId }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Data Rights Portal</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Exercise your rights under GDPR. Choose from the options below to access, correct, or delete your personal data.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h2 className="text-lg font-semibold text-blue-900 mb-2">GDPR Rights Guaranteed</h2>
            <p className="text-blue-800">
              As a European advocacy platform, we fully comply with GDPR Articles 15-22. 
              All requests are processed within 30 days (extendable to 60 days for complex requests).
              Your identity will be verified to protect your privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Data Rights Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {dataRights.map((right) => (
          <div
            key={right.id}
            className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRight === right.id
                ? 'border-bot-green bg-bot-green/5 shadow-md'
                : 'border-gray-200 hover:border-bot-green/50'
            }`}
            onClick={() => handleRightSelection(right.id)}
          >
            <div className="flex items-start space-x-3 mb-4">
              <span className="text-2xl">{right.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{right.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{right.description}</p>
              </div>
              {selectedRight === right.id && (
                <div className="w-6 h-6 bg-bot-green rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 border-t pt-3">
              <p><strong>Details:</strong> {right.details}</p>
              <p className="mt-1"><strong>Response time:</strong> {right.timeframe}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Request Form */}
      {selectedRight && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Submit Your {dataRights.find(r => r.id === selectedRight)?.title} Request
          </h2>

          {submitStatus === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Request Submitted Successfully</h3>
                  <p className="text-green-800 mt-1">
                    We&apos;ll process your request within 30 days and contact you at the provided email address. 
                    Request ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bot-green focus:border-bot-green"
                  placeholder="your.email@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We&apos;ll use this email to verify your identity and send you the response.
                </p>
              </div>

              {/* Request Details */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bot-green focus:border-bot-green"
                  placeholder={
                    selectedRight === 'rectification' 
                      ? "Please specify what information you'd like to correct..."
                      : selectedRight === 'erasure'
                      ? "Please specify what data you'd like deleted..."
                      : "Please provide any additional details about your request..."
                  }
                />
              </div>

              {/* Verification Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Identity Verification Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="verification"
                      value="email"
                      checked={formData.verificationMethod === 'email'}
                      onChange={(e) => setFormData(prev => ({ ...prev, verificationMethod: e.target.value }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Email Verification (Recommended)</div>
                      <div className="text-sm text-gray-600">
                        We&apos;ll send a verification link to your email address
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="verification"
                      value="manual"
                      checked={formData.verificationMethod === 'manual'}
                      onChange={(e) => setFormData(prev => ({ ...prev, verificationMethod: e.target.value }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Manual Verification</div>
                      <div className="text-sm text-gray-600">
                        For complex cases requiring additional verification steps
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">⚖️ Legal Information</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Requests are processed in accordance with GDPR Articles 15-22</li>
                  <li>• Response within 30 days (extendable to 60 days for complex requests)</li>
                  <li>• Identity verification required to protect your privacy</li>
                  <li>• Some data may be retained for legal compliance or legitimate interests</li>
                  <li>• You may lodge a complaint with your local Data Protection Authority</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedRight('')}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  ← Back to Rights Selection
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-bot-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-bot-dark-green disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Contact Information */}
      <div className="mt-12 bg-bot-green/10 border border-bot-green/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-bot-green mb-4">📧 Need Help?</h3>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <h4 className="font-medium mb-2">Privacy Team</h4>
            <p className="text-sm">
              Email: <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a><br />
              Response: Within 48 hours for urgent requests
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Technical Support</h4>
            <p className="text-sm">
              For technical issues with this portal<br />
              Email: <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a>
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-bot-green/20">
          <p className="text-sm text-gray-600">
            <strong>Supervisory Authority:</strong> If unsatisfied with our response, you may lodge a complaint 
            with your local Data Protection Authority or CNIL (France): 
            <a href="https://www.cnil.fr/en/home" className="text-bot-green hover:underline ml-1" target="_blank" rel="noopener noreferrer">
              www.cnil.fr/en/home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}