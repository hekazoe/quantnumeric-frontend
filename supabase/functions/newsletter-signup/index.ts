import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Security headers with CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Input validation
interface NewsletterInput {
  email: string;
  honeypot?: string;
}

// Sanitize input
function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().substring(0, 255);
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Rate limiting check
async function checkRateLimit(
  supabase: any,
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; message?: string }> {
  const windowMinutes = 15;
  const maxRequests = 3; // Stricter for newsletter
  const blockDurationMinutes = 120;

  // Check if blocked
  const { data: blocked } = await supabase
    .from("rate_limits")
    .select("blocked_until")
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .not("blocked_until", "is", null)
    .gte("blocked_until", new Date().toISOString())
    .maybeSingle();

  if (blocked) {
    return {
      allowed: false,
      message: "Too many requests. Please try again later.",
    };
  }

  // Check current window
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("id, request_count")
    .eq("identifier", identifier)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart.toISOString())
    .maybeSingle();

  if (existing) {
    if (existing.request_count >= maxRequests) {
      await supabase
        .from("rate_limits")
        .update({
          blocked_until: new Date(
            Date.now() + blockDurationMinutes * 60 * 1000
          ).toISOString(),
        })
        .eq("id", existing.id);

      return {
        allowed: false,
        message: "Rate limit exceeded. Please try again later.",
      };
    }

    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("rate_limits").insert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
    });
  }

  return { allowed: true };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get client identifier
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const identifier = `${clientIP}-${userAgent.substring(0, 50)}`;

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(
      supabase,
      identifier,
      "newsletter-signup"
    );
    if (!rateLimitCheck.allowed) {
      console.warn(`Rate limit exceeded for ${identifier}`);
      return new Response(
        JSON.stringify({ error: rateLimitCheck.message }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate input
    const body: NewsletterInput = await req.json();

    // Honeypot check
    if (body.honeypot) {
      console.warn("Honeypot triggered - potential spam");
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email
    if (!body.email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const email = sanitizeEmail(body.email);

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscriptions")
      .select("id, is_active")
      .eq("email", email)
      .maybeSingle();

    if (existing && existing.is_active) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "You are already subscribed to our newsletter!",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert or reactivate subscription
    if (existing && !existing.is_active) {
      // Reactivate
      await supabase
        .from("newsletter_subscriptions")
        .update({
          is_active: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq("id", existing.id);
    } else {
      // New subscription
      const { error: dbError } = await supabase
        .from("newsletter_subscriptions")
        .insert({
          email,
          ip_address: clientIP,
          user_agent: userAgent.substring(0, 500),
        });

      if (dbError) {
        // Check if it's a duplicate error
        if (dbError.code === "23505") {
          return new Response(
            JSON.stringify({
              success: true,
              message: "You are already subscribed!",
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        console.error("Database error:", dbError);
        return new Response(
          JSON.stringify({ error: "Failed to subscribe" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Send welcome email
    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
    await resend.emails.send({
      from: "QuantNumeric <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to QuantNumeric Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d41212;">Welcome to QuantNumeric!</h1>
          <p>Thank you for subscribing to our newsletter.</p>
          <p>You'll now receive the latest market insights, analysis, and updates directly to your inbox.</p>
          <p>Stay ahead of the markets with QuantNumeric.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you wish to unsubscribe, please reply to this email with "Unsubscribe" in the subject line.
          </p>
        </div>
      `,
    });

    console.log("Newsletter subscription successful:", email);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully subscribed! Check your email for confirmation.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in newsletter-signup function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
