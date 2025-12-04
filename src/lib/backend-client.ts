// Backend API client with comprehensive security
import { supabase } from "@/integrations/supabase/client";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  honeypot?: string;
}

export interface NewsletterSignupData {
  email: string;
  honeypot?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Submit contact form with security validations
 */
export async function submitContactForm(
  data: ContactFormData
): Promise<ApiResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke(
      "contact-form",
      {
        body: data,
      }
    );

    if (error) {
      console.error("Contact form error:", error);
      return {
        success: false,
        error: error.message || "Failed to submit form",
      };
    }

    return response;
  } catch (error: any) {
    console.error("Contact form submission error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Subscribe to newsletter with security validations
 */
export async function subscribeNewsletter(
  data: NewsletterSignupData
): Promise<ApiResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke(
      "newsletter-signup",
      {
        body: data,
      }
    );

    if (error) {
      console.error("Newsletter signup error:", error);
      return {
        success: false,
        error: error.message || "Failed to subscribe",
      };
    }

    return response;
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Client-side validation utilities
 */
export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  name: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  phone: (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\d\s()+-]{7,20}$/;
    return phoneRegex.test(phone);
  },

  message: (message: string): boolean => {
    return message.trim().length >= 10 && message.trim().length <= 5000;
  },
};

/**
 * Sanitize user input (basic client-side sanitization)
 * Note: Server does comprehensive sanitization
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .trim()
    .substring(0, 5000);
}
