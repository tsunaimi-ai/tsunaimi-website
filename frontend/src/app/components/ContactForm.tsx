'use client';

import { useState, useEffect, useRef } from 'react';
import { validateEmail, validatePhoneNumber, formatPhoneNumber } from '@/lib/contact-validation';
import { useTranslations } from 'next-intl';
import { ContactApiClient } from '@/lib/api/contact-api-client';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

const initialFormData = {
  name: '',
  email: '',
  company: '',
  role: '',
  interest: '',
  message: '',
  phone_number: ''
};

// Field validation states
interface FieldValidation {
  [key: string]: {
    isValid: boolean;
    message: string;
  };
}

export default function ContactForm({ isOpen, onClose, locale }: ContactFormProps) {
  // All hooks must be called at the top level
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [fieldValidation, setFieldValidation] = useState<FieldValidation>({});
  const errorRef = useRef<HTMLDivElement>(null);
  const firstInvalidFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const t = useTranslations('contact');
  const tf = useTranslations('contact.field');
  const tv = useTranslations('contact.form.validation');

  // Debug logging
  useEffect(() => {
    console.log('ContactForm mount state:', {
      isOpen,
      mounted,
      locale,
      timestamp: new Date().toISOString()
    });
  }, [isOpen, mounted, locale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setSubmitStatus('idle');
      setErrorMessage('');
      setWarningMessage('');
      setFieldValidation({});
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (submitStatus === 'error') {
      if (firstInvalidFieldRef.current) {
        firstInvalidFieldRef.current.focus();
      } else if (errorRef.current) {
        errorRef.current.focus();
      }
    }
  }, [submitStatus]);

  // Don't render anything until mounted
  if (!mounted) {
    console.log('ContactForm server render:', {
      isOpen,
      mounted,
      locale,
      timestamp: new Date().toISOString()
    });
    return null;
  }

  // Don't render anything if not open
  if (!isOpen) {
    console.log('ContactForm closed:', {
      isOpen,
      mounted,
      locale,
      timestamp: new Date().toISOString()
    });
    return null;
  }

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        return {
          isValid: validateEmail(value),
          message: tv('email')
        };
      case 'phone_number':
        return value ? {
          isValid: validatePhoneNumber(value),
          message: tv('phone')
        } : { isValid: true, message: '' };
      default:
        return {
          isValid: value.trim().length > 0,
          message: tv('required', { 
            [locale === 'fr' ? 'champ' : 'field']: name 
          })
        };
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format phone number as user types
    if (name === 'phone_number') {
      const formattedValue = formatPhoneNumber(value);
      // Only update if the formatting actually changed something
      // This prevents cursor jumping when user is typing
      if (formattedValue !== value) {
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      
      // Show validation state only if user has entered something
      if (value.trim()) {
        setFieldValidation(prev => ({
          ...prev,
          [name]: validateField(name, value)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Validate on change for other fields
    if (name !== 'phone_number' && value.trim() !== '') {
      setFieldValidation(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    } else if (value.trim() === '') {
      // Clear validation state when field is empty
      setFieldValidation(prev => {
        const newState = { ...prev };
        delete newState[name];
        return newState;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFieldValidation(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setWarningMessage('');

    // Validate all required fields
    const validations: FieldValidation = {};
    let isValid = true;
    let firstInvalidField: string | null = null;

    ['name', 'email', 'company', 'role', 'interest', 'message'].forEach(field => {
      const validation = validateField(field, formData[field as keyof typeof formData]);
      validations[field] = validation;
      if (!validation.isValid && !firstInvalidField) {
        firstInvalidField = field;
        isValid = false;
      }
    });

    // Validate phone number if provided
    if (formData.phone_number) {
      const phoneValidation = validateField('phone_number', formData.phone_number);
      validations.phone_number = phoneValidation;
      if (!phoneValidation.isValid && !firstInvalidField) {
        firstInvalidField = 'phone_number';
        isValid = false;
      }
    }

    setFieldValidation(validations);

    if (!isValid) {
      setIsSubmitting(false);
      setSubmitStatus('error');
      setErrorMessage(t('form.error_validation'));
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('form.error_submission'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close handler that resets form
  const handleClose = () => {
    setFormData(initialFormData);
    setSubmitStatus('idle');
    setErrorMessage('');
    setWarningMessage('');
    setFieldValidation({});
    onClose();
  };

  const renderField = (
    name: string,
    label: string,
    type: string = 'text',
    options?: { required?: boolean; placeholder?: string; component?: 'input' | 'textarea' | 'select'; rows?: number }
  ) => {
    const { required = true, placeholder, component = 'input', rows = 4 } = options || {};
    const validation = fieldValidation[name];
    const isInvalid = validation && !validation.isValid;
    const fieldId = `${name}-field`;
    const errorId = `${name}-error`;

    return (
      <div>
        <label htmlFor={fieldId} className="block text-sm font-medium text-[#251C6B] mb-1">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          {!required && <span className="text-[#7057A0] ml-1">({t('required_note')})</span>}
          {name === 'phone_number' && (
            <span className="ml-2 text-xs text-[#7057A0]">
              {tf('phone_help')}
            </span>
          )}
        </label>
        {component === 'select' ? (
          <select
            id={fieldId}
            name={name}
            required={required}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border ${isInvalid ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]`}
            aria-required={required}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : undefined}
          >
            <option value="">{tf('primary_interest_placeholder')}</option>
            <option value="Just curious">{tf('interest_curious')}</option>
            <option value="Want to exchange ideas">{tf('interest_conversation')}</option>
            <option value="Need rapid prototyping">{tf('interest_prototype')}</option>
            <option value="Looking to scale">{tf('interest_scale')}</option>
            <option value="Not sure yet">{tf('interest_unsure')}</option>
          </select>
        ) : component === 'textarea' ? (
          <textarea
            id={fieldId}
            name={name}
            required={required}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={rows}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border ${isInvalid ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]`}
            aria-required={required}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : undefined}
          />
        ) : (
          <input
            type={type}
            id={fieldId}
            name={name}
            required={required}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border ${isInvalid ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7057A0]`}
            aria-required={required}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : undefined}
          />
        )}
        {isInvalid && (
          <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
            {validation.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[998]"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-[999] overflow-y-auto"
        role="dialog"
        aria-labelledby="contact-form-title"
        aria-modal="true"
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Close button */}
            <button 
              onClick={handleClose}
              className="absolute right-4 top-4 text-[#251C6B] hover:text-[#7057A0] transition-colors"
              aria-label="Close contact form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Form content */}
            <div className="p-6">
              <h2 id="contact-form-title" className="text-2xl font-bold text-[#251C6B] mb-4">
                {t('title')}
              </h2>
              <p className="text-[#7057A0] mb-6">{t('subtitle')}</p>

              {submitStatus === 'success' ? (
                <div 
                  className="text-center py-8"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#251C6B] mb-2">{t('form.success')}</h3>
                  <p className="text-[#7057A0]">{t('form.success_message')}</p>
                  
                  {warningMessage && (
                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                      <p>{warningMessage}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <p className="text-sm text-[#7057A0] mb-4">
                    {t('required_note')}
                  </p>

                  {renderField('name', tf('name'))}
                  {renderField('email', tf('email'), 'email')}
                  {renderField('phone_number', tf('phone'), 'tel', { required: false, placeholder: '+33 1 23 45 67 89' })}
                  {renderField('company', tf('company'))}
                  {renderField('role', tf('role'))}
                  {renderField('interest', tf('primary_interest'), 'text', { component: 'select' })}
                  {renderField('message', tf('project_description'), 'text', {
                    component: 'textarea',
                    placeholder: tf('project_placeholder')
                  })}

                  {submitStatus === 'error' && errorMessage && (
                    <div 
                      ref={errorRef}
                      className="text-red-500 text-sm p-3 bg-red-50 rounded-lg"
                      role="alert"
                      aria-live="assertive"
                      tabIndex={-1}
                    >
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-[#7057A0] hover:bg-[#251C6B] text-white font-bold py-3 px-6 rounded-lg transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? t('form.sending') : t('submit_button')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 