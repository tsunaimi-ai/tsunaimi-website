export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  role?: string;
  interest?: string;
  message: string;
  phone_number?: string;
}

export interface ContactResponse {
  status: string;
  message: string;
  submission_id: number;
}

export class ContactApiClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  async submitContactForm(data: ContactFormData): Promise<ContactResponse> {
    try {
      const response = await fetch(`${this.baseURL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }
} 