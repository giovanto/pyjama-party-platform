/**
 * useForm Hook
 * Generic form management hook with validation and state management
 */

import { useState, useCallback, useMemo } from 'react';
import type { UseFormReturn, FormErrors, ValidationResult } from '../types';

type ValidationRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, data: T) => string | null;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>;
};

interface UseFormOptions<T> {
  initialData?: Partial<T>;
  validationRules?: ValidationRules<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (data: T) => Promise<void>;
  onValidationError?: (errors: FormErrors) => void;
}

/**
 * Generic form management hook
 */
export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T> = {}
): UseFormReturn<T> {
  const {
    initialData = {} as Partial<T>,
    validationRules = {},
    validateOnChange = false,
    validateOnBlur = true,
    onSubmit,
    onValidationError,
  } = options;

  const [data, setData] = useState<T>(initialData as T);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: keyof T): boolean => {
    const value = data[field];
    const rules = validationRules[field];
    
    if (!rules) return true;

    let error: string | null = null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      error = `${String(field)} is required`;
    }

    // String-specific validations
    if (!error && typeof value === 'string') {
      const stringValue = value.trim();

      // Min length validation
      if (rules.minLength && stringValue.length < rules.minLength) {
        error = `${String(field)} must be at least ${rules.minLength} characters`;
      }

      // Max length validation
      if (!error && rules.maxLength && stringValue.length > rules.maxLength) {
        error = `${String(field)} must be less than ${rules.maxLength} characters`;
      }

      // Pattern validation
      if (!error && rules.pattern && stringValue && !rules.pattern.test(stringValue)) {
        error = `${String(field)} format is invalid`;
      }
    }

    // Custom validation
    if (!error && rules.custom) {
      error = rules.custom(value, data);
    }

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));

    return !error;
  }, [data, validationRules]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const fieldErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const fieldKey = field as keyof T;
      const fieldIsValid = validateField(fieldKey);
      
      if (!fieldIsValid) {
        isValid = false;
        fieldErrors[field] = errors[field] || 'Validation failed';
      }
    });

    if (!isValid && onValidationError) {
      onValidationError(fieldErrors);
    }

    return isValid;
  }, [validationRules, validateField, errors, onValidationError]);

  /**
   * Update a single field
   */
  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));

    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }

    // Validate on change if enabled
    if (validateOnChange) {
      // Use setTimeout to ensure state is updated
      setTimeout(() => {
        validateField(field);
      }, 0);
    }
  }, [errors, validateOnChange, validateField]);

  /**
   * Update multiple fields at once
   */
  const updateData = useCallback((newData: Partial<T>) => {
    setData(prev => ({
      ...prev,
      ...newData,
    }));

    // Mark updated fields as touched
    const updatedFields = Object.keys(newData);
    setTouched(prev => ({
      ...prev,
      ...Object.fromEntries(updatedFields.map(field => [field, true])),
    }));

    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        if (newErrors[field]) {
          newErrors[field] = '';
        }
      });
      return newErrors;
    });
  }, []);

  /**
   * Handle field blur (for validation)
   */
  const handleFieldBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));

    if (validateOnBlur) {
      validateField(field);
    }
  }, [validateOnBlur, validateField]);

  /**
   * Reset form to initial state
   */
  const reset = useCallback((newData?: Partial<T>) => {
    const resetData = newData || initialData;
    setData(resetData as T);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  /**
   * Submit form with validation
   */
  const submit = useCallback(async (submitFn?: (data: T) => Promise<void>) => {
    setIsSubmitting(true);

    try {
      // Validate form
      const isValid = validateForm();
      
      if (!isValid) {
        setIsSubmitting(false);
        throw new Error('Form validation failed');
      }

      // Use provided submit function or fallback to options
      const submitFunction = submitFn || onSubmit;
      
      if (submitFunction) {
        await submitFunction(data);
      }

      // Reset form after successful submission
      reset();

    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }, [validateForm, onSubmit, data, reset]);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  /**
   * Check if form has been modified
   */
  const isDirty = useMemo(() => {
    return Object.keys(touched).some(field => touched[field]);
  }, [touched]);

  /**
   * Get field props for easy integration with inputs
   */
  const getFieldProps = useCallback((field: keyof T) => {
    return {
      value: data[field] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateField(field, e.target.value);
      },
      onBlur: () => handleFieldBlur(field),
      error: touched[field as string] ? errors[field as string] : undefined,
      'aria-invalid': touched[field as string] && !!errors[field as string],
      'aria-describedby': errors[field as string] ? `${String(field)}-error` : undefined,
    };
  }, [data, errors, touched, updateField, handleFieldBlur]);

  /**
   * Get specific field error (only if touched)
   */
  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return touched[field as string] ? errors[field as string] : undefined;
  }, [errors, touched]);

  /**
   * Check if specific field has error
   */
  const hasFieldError = useCallback((field: keyof T): boolean => {
    return touched[field as string] && !!errors[field as string];
  }, [errors, touched]);

  return {
    data,
    errors,
    isSubmitting,
    isValid,
    isDirty,
    updateField,
    updateData,
    validateField,
    validateForm,
    reset,
    submit,
    
    // Additional utilities
    getFieldProps,
    getFieldError,
    hasFieldError,
    handleFieldBlur,
    touched,
  };
}

export default useForm;