// Client-side validation utilities
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone number formatting utilities
export const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters except + and spaces
    return value.replace(/[^\d+\s]/g, '').replace(/\s+/g, ' ').trim();
};

export const validatePhoneNumber = (phone: string): boolean => {
    // Basic international phone number validation
    // Allows for country codes and common separators
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
};

interface ContactFormData {
    name: string;
    email: string;
    company: string;
    role: string;
    interest: string;
    message: string;
    phone_number?: string;
}

interface ValidationResult {
    isValid: boolean;
    message: string;
}

export function validateRequiredFields(data: ContactFormData): ValidationResult {
    const requiredFields = ['name', 'email', 'company', 'role', 'interest', 'message'];
    
    for (const field of requiredFields) {
        if (!data[field as keyof ContactFormData]?.trim()) {
            return {
                isValid: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
            };
        }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return {
            isValid: false,
            message: 'Please enter a valid email address'
        };
    }

    // Validate phone number if provided
    if (data.phone_number) {
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (!phoneRegex.test(data.phone_number)) {
            return {
                isValid: false,
                message: 'Please enter a valid phone number'
            };
        }
    }

    return { isValid: true, message: '' };
} 