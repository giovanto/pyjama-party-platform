'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  preferred_station: string;
  participation_level: 'attend' | 'volunteer' | 'coordinator' | '';
  message: string;
  newsletter_consent: boolean;
  privacy_consent: boolean;
  email_verification_required: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function PyjamaPartySignupForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    preferred_station: '',
    participation_level: '',
    message: '',
    newsletter_consent: false,
    privacy_consent: false,
    email_verification_required: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Derived readiness state to guide submit affordance
  const isFormReady = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '');
    return (
      formData.name.trim() &&
      formData.preferred_station.trim() &&
      !!formData.participation_level &&
      formData.privacy_consent === true &&
      emailOk
    );
  };

  const participationLevels = [
    {
      id: 'attend' as const,
      title: '🎉 Attend the Party',
      description: 'Show up in pajamas and celebrate',
      commitment: 'Just show up on September 26th'
    },
    {
      id: 'volunteer' as const,
      title: '🤝 Volunteer Helper',
      description: 'Help organize and coordinate',
      commitment: '2-4 hours helping with event setup and coordination'
    },
    {
      id: 'coordinator' as const,
      title: '⭐ Station Coordinator',
      description: 'Lead organization for your station',
      commitment: 'Lead responsibility for station organization and safety'
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.preferred_station.trim()) {
      newErrors.preferred_station = 'Preferred station is required';
    }

    if (!formData.participation_level) {
      newErrors.participation_level = 'Please select a participation level';
    }

    // GDPR consent requirements
    if (!formData.privacy_consent) {
      newErrors.privacy_consent = 'You must accept the privacy policy to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/pajama-party/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submitted_at: new Date().toISOString(),
          gdpr_consent_timestamp: new Date().toISOString(),
          ip_address: '', // Will be captured server-side
          user_agent: navigator.userAgent,
          consent_version: '1.0',
          legal_basis: 'consent', // GDPR Article 6(1)(a)
          data_retention_period: '2_years',
          source_page: window.location.href
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Thank you for joining the European Pajama Party!');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          preferred_station: '',
          participation_level: '',
          message: '',
          newsletter_consent: false,
          privacy_consent: false,
          email_verification_required: true
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Failed to submit signup. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center" role="alert" aria-live="polite">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Movement!</h3>
        <p className="text-gray-600 mb-6">{submitMessage}</p>
        
        <div className="bg-bot-green/10 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-bot-dark-green mb-2">What happens next?</h4>
          <ul className="text-left text-bot-dark-green text-sm space-y-1">
            <li>• You'll receive a verification email within a few minutes</li>
            <li>• After verification, get updates about your local station</li>
            <li>• Join our Discord community for real-time coordination</li>
            <li>• Receive your digital event participation badge</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/community"
            className="px-6 py-3 bg-bot-green text-white rounded-lg hover:bg-bot-dark-green transition-colors font-medium"
          >
            Join Community
          </Link>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Register Another Person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Participation Level Selection */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Participation Level</h3>
          <div className="space-y-3">
            {participationLevels.map((level) => (
              <div
                key={level.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.participation_level === level.id
                    ? 'border-bot-green bg-bot-green/10'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleInputChange('participation_level', level.id)}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="participation_level"
                    value={level.id}
                    checked={formData.participation_level === level.id}
                    onChange={() => handleInputChange('participation_level', level.id)}
                    className="mr-3"
                    aria-label={level.title.replace(/^[^\w]*/,'')} 
                    aria-describedby={errors.participation_level ? 'participation_level-error' : undefined}
                  />
                  <div className="font-medium">{level.title}</div>
                </div>
                <div className="text-sm text-gray-600 ml-6">{level.description}</div>
                <div className="text-xs text-gray-500 ml-6 mt-1">{level.commitment}</div>
              </div>
            ))}
          </div>
          {errors.participation_level && (
            <p id="participation_level-error" className="text-red-600 text-sm mt-2" role="alert">{errors.participation_level}</p>
          )}
        </div>

        {/* Personal Information Form */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="party-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="party-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bot-green focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your full name"
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <p id="name-error" className="text-red-600 text-sm mt-1" role="alert">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="party-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="party-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bot-green focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">{errors.email}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Required for verification and event updates
              </p>
            </div>

            {/* Preferred Station */}
            <div>
              <label htmlFor="party-station" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Station <span className="text-red-500">*</span>
              </label>
              <input
                id="party-station"
                type="text"
                value={formData.preferred_station}
                onChange={(e) => handleInputChange('preferred_station', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bot-green focus:border-transparent ${
                  errors.preferred_station ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Search for your local train station"
                disabled={isSubmitting}
                aria-invalid={!!errors.preferred_station}
                aria-describedby={errors.preferred_station ? 'preferred_station-error' : undefined}
              />
              {errors.preferred_station && <p id="preferred_station-error" className="text-red-600 text-sm mt-1" role="alert">{errors.preferred_station}</p>}
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="party-message" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Message (Optional)
              </label>
              <textarea
                id="party-message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bot-green focus:border-transparent"
                placeholder="Tell us why you're joining, any special skills, or questions..."
                disabled={isSubmitting}
              />
            </div>

            {/* GDPR Consent Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900">Communication Preferences</h4>
              
              {/* Newsletter Consent (Optional) */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newsletter_consent}
                  onChange={(e) => handleInputChange('newsletter_consent', e.target.checked)}
                  className="mt-1 h-4 w-4 text-bot-green focus:ring-bot-green border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <div className="flex-1 text-sm">
                  <div className="font-medium text-gray-900">Newsletter & Event Updates</div>
                  <div className="text-gray-600">
                    Receive updates about the pajama party, your local station, and the Back-on-Track movement. 
                    You can unsubscribe at any time.
                  </div>
                </div>
              </label>

              {/* Privacy Consent (Required) */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacy_consent}
                  onChange={(e) => handleInputChange('privacy_consent', e.target.checked)}
                  className={`mt-1 h-4 w-4 text-bot-green focus:ring-bot-green border-gray-300 rounded ${
                    errors.privacy_consent ? 'border-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                  required
                  aria-invalid={!!errors.privacy_consent}
                  aria-describedby={errors.privacy_consent ? 'privacy-error' : undefined}
                />
                <div className="flex-1 text-sm">
                  <div className="font-medium text-gray-900">
                    Privacy Policy & Terms <span className="text-red-500">*</span>
                  </div>
                  <div className="text-gray-600">
                    I agree to the{' '}
                    <Link href="/privacy" className="text-bot-green hover:text-bot-dark-green underline">
                      privacy policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" className="text-bot-green hover:text-bot-dark-green underline">
                      terms of service
                    </Link>
                    . I understand my data will be processed according to GDPR.
                  </div>
                </div>
              </label>
              
              {errors.privacy_consent && (
                <p id="privacy-error" className="text-red-600 text-sm" role="alert">{errors.privacy_consent}</p>
              )}
            </div>

            {/* GDPR Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">Your Data Rights</div>
                  <div>
                    Your personal data is processed according to GDPR. You have the right to access, 
                    rectify, or delete your data. Visit our{' '}
                    <Link href="/data-rights" className="underline hover:no-underline">
                      data rights portal
                    </Link>{' '}
                    to exercise these rights.
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3" role="alert" aria-live="polite">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{submitMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormReady()}
              className="w-full bg-gradient-to-r from-bot-green to-bot-dark-green text-white py-3 rounded-lg hover:from-bot-dark-green hover:to-bot-green transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Joining the Movement...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Join the European Pajama Party</span>
                </div>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By joining, you become part of a Europe-wide movement for sustainable travel
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
