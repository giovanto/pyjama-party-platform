/**
 * DreamForm Component
 * Main form for submitting pajama party dreams
 */

import React, { useState, useCallback } from 'react';
import { useForm } from '../../hooks';
import { api } from '../../services/api';
import { StationSearch } from './StationSearch';
import type { 
  DreamFormProps, 
  DreamSubmission, 
  Station,
  DreamSubmissionResponse,
} from '../../types';
import { VALIDATION_RULES } from '../../types';

export function DreamForm({
  onSubmitSuccess,
  onSubmitError,
  onFieldChange,
  initialData = {},
  disabled = false,
}: DreamFormProps) {
  const [selectedOrigin, setSelectedOrigin] = useState<Station | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Station | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [communityMessage, setCommunityMessage] = useState<string | null>(null);

  // Form validation rules
  const validationRules = {
    dreamer_name: {
      required: true,
      minLength: VALIDATION_RULES.dreamer_name.minLength,
      maxLength: VALIDATION_RULES.dreamer_name.maxLength,
      pattern: VALIDATION_RULES.dreamer_name.pattern,
      custom: (value: string) => {
        if (value && !VALIDATION_RULES.dreamer_name.pattern.test(value)) {
          return 'Name can only contain letters, spaces, hyphens, apostrophes, and dots';
        }
        return null;
      },
    },
    origin_station: {
      required: true,
      minLength: VALIDATION_RULES.origin_station.minLength,
      maxLength: VALIDATION_RULES.origin_station.maxLength,
    },
    destination_city: {
      required: true,
      minLength: VALIDATION_RULES.destination_city.minLength,
      maxLength: VALIDATION_RULES.destination_city.maxLength,
    },
    email: {
      required: false,
      maxLength: VALIDATION_RULES.email.maxLength,
      pattern: VALIDATION_RULES.email.pattern,
      custom: (value: string) => {
        if (value && !VALIDATION_RULES.email.pattern.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      },
    },
  };

  // Initialize form
  const form = useForm<DreamSubmission>({
    initialData: {
      dreamer_name: '',
      origin_station: '',
      destination_city: '',
      email: '',
      ...initialData,
    },
    validationRules,
    validateOnChange: false,
    validateOnBlur: true,
  });

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled || form.isSubmitting) return;

    try {
      await form.submit(async (data) => {
        // Add station coordinates if available
        const submissionData: DreamSubmission = {
          ...data,
          origin_country: selectedOrigin?.country,
          origin_lat: selectedOrigin?.lat,
          origin_lng: selectedOrigin?.lng,
          destination_country: selectedDestination?.country,
          destination_lat: selectedDestination?.lat,
          destination_lng: selectedDestination?.lng,
        };

        const response = await api.dreams.submitDream(submissionData);
        
        // Show success state
        setShowSuccessMessage(true);
        setCommunityMessage(response.community_message || null);
        
        // Clear selected stations
        setSelectedOrigin(null);
        setSelectedDestination(null);
        
        // Call success callback
        onSubmitSuccess?.(response);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          setCommunityMessage(null);
        }, 5000);
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Submission failed');
      onSubmitError?.(err);
    }
  }, [form, selectedOrigin, selectedDestination, disabled, onSubmitSuccess, onSubmitError]);

  // Handle field changes with callback
  const handleFieldChange = useCallback((field: keyof DreamSubmission, value: string) => {
    form.updateField(field, value);
    onFieldChange?.(field, value);
  }, [form, onFieldChange]);

  // Handle station selection
  const handleOriginStationSelect = useCallback((station: Station | null) => {
    setSelectedOrigin(station);
    if (station) {
      handleFieldChange('origin_station', station.name);
    }
  }, [handleFieldChange]);

  const handleDestinationCityChange = useCallback((value: string) => {
    handleFieldChange('destination_city', value);
    // Clear destination station if user types manually
    setSelectedDestination(null);
  }, [handleFieldChange]);

  // Success message component
  const SuccessMessage = () => (
    <div className="success-message mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-600 text-xl">🎉</span>
        <h3 className="text-green-800 font-semibold">Dream Added Successfully!</h3>
      </div>
      <p className="text-green-700 text-sm mb-2">
        Your pajama party adventure has been added to the map! 🚂✨
      </p>
      {communityMessage && (
        <div className="mt-3 p-3 bg-green-100 rounded-md">
          <p className="text-green-800 text-sm font-medium">
            {communityMessage}
          </p>
        </div>
      )}
    </div>
  );

  const formClasses = `
    max-w-2xl mx-auto p-6
    ${disabled ? 'opacity-60 pointer-events-none' : ''}
  `;

  const fieldClasses = 'mb-6';
  const labelClasses = 'block text-sm font-medium text-gray-700 mb-2';
  const inputClasses = `
    w-full px-4 py-3 border rounded-lg 
    text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-colors duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
  `;
  const errorClasses = 'mt-1 text-sm text-red-600';
  const helpTextClasses = 'mt-1 text-xs text-gray-500';

  return (
    <form onSubmit={handleSubmit} className={`dream-form ${formClasses}`} noValidate>
      {/* Success Message */}
      {showSuccessMessage && <SuccessMessage />}

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Share Your Pajama Party Dream 🚂
        </h2>
        <p className="text-gray-600">
          Tell us where you'd like to wake up after a magical train journey
        </p>
      </div>

      {/* Dreamer Name Field */}
      <div className={fieldClasses}>
        <label htmlFor="dreamerName" className={labelClasses}>
          What's your name? <span className="text-red-500">*</span>
          <span className="font-normal text-gray-500">(First name is enough)</span>
        </label>
        <input
          id="dreamerName"
          type="text"
          {...form.getFieldProps('dreamer_name')}
          className={`${inputClasses} ${form.hasFieldError('dreamer_name') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
          placeholder="Maria, João, Emma, Lars..."
          disabled={disabled || form.isSubmitting}
        />
        {form.getFieldError('dreamer_name') && (
          <div className={errorClasses}>{form.getFieldError('dreamer_name')}</div>
        )}
        <div className={helpTextClasses}>
          This will be displayed publicly on the map
        </div>
      </div>

      {/* Origin Station Field */}
      <div className={fieldClasses}>
        <label htmlFor="originStation" className={labelClasses}>
          Which train station represents you? <span className="text-red-500">*</span>
        </label>
        <StationSearch
          id="originStation"
          placeholder="Amsterdam Central, Milano Centrale, Berlin Hbf..."
          value={form.data.origin_station}
          onValueChange={(value) => handleFieldChange('origin_station', value)}
          onStationSelect={handleOriginStationSelect}
          error={form.getFieldError('origin_station')}
          disabled={disabled || form.isSubmitting}
        />
        <div className={helpTextClasses}>
          Choose the European train station closest to you or that you identify with
        </div>
      </div>

      {/* Destination Field */}
      <div className={fieldClasses}>
        <label htmlFor="destinationCity" className={labelClasses}>
          Where would you like to wake up? <span className="text-red-500">*</span>
        </label>
        <input
          id="destinationCity"
          type="text"
          value={form.data.destination_city}
          onChange={(e) => handleDestinationCityChange(e.target.value)}
          onBlur={() => form.handleFieldBlur('destination_city')}
          className={`${inputClasses} ${form.hasFieldError('destination_city') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
          placeholder="Barcelona beach sunrise, Prague castle view, Paris café morning..."
          disabled={disabled || form.isSubmitting}
        />
        {form.getFieldError('destination_city') && (
          <div className={errorClasses}>{form.getFieldError('destination_city')}</div>
        )}
        <div className={helpTextClasses}>
          Describe your dream destination - be creative and poetic!
        </div>
      </div>

      {/* Email Field (Optional) */}
      <div className={fieldClasses}>
        <label htmlFor="email" className={labelClasses}>
          Email <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          {...form.getFieldProps('email')}
          className={`${inputClasses} ${form.hasFieldError('email') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
          placeholder="your.email@example.com"
          disabled={disabled || form.isSubmitting}
        />
        {form.getFieldError('email') && (
          <div className={errorClasses}>{form.getFieldError('email')}</div>
        )}
        <div className={helpTextClasses}>
          <span className="font-medium">Only if you want to join pajama parties!</span> We'll use this for local organizing only - never spam
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={disabled || form.isSubmitting || !form.isValid}
          className={`
            btn px-8 py-4 rounded-lg font-semibold text-white text-lg
            transition-all duration-200 transform
            ${(disabled || form.isSubmitting || !form.isValid)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {form.isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Adding to map...
            </span>
          ) : (
            'Add my dream to the map ✨'
          )}
        </button>
      </div>

      {/* Privacy Note */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <span className="font-medium text-blue-600">Privacy-first:</span> your data is automatically deleted after 30 days.{' '}
        <button
          type="button"
          className="text-blue-600 hover:text-blue-700 underline"
          onClick={() => {/* Handle privacy info modal */}}
        >
          Learn more
        </button>
      </div>

      {/* Form Debug Info (Development Only) */}
      {import.meta.env.DEV && (
        <details className="mt-8 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm text-gray-600 font-medium">
            Debug Info (Dev Only)
          </summary>
          <pre className="mt-2 text-xs text-gray-600 overflow-auto">
            {JSON.stringify(
              {
                formData: form.data,
                errors: form.errors,
                isValid: form.isValid,
                isDirty: form.isDirty,
                selectedOrigin,
                selectedDestination,
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </form>
  );
}

export default DreamForm;