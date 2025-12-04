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

// Input validation schemas
interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
  honeypot?: string;
}

// Sanitize input to prevent XSS
function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/[&]/g, "&amp;")
    .replace(/['"]/g, "")
    .trim()
    .substring(0, 5000); // Max length limit
}

// Email validation (strict RFC-compliant)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Phone validation (optional, international format)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s()+-]{7,20}$/;
  return phoneRegex.test(phone);
}

// Rate limiting check
async function checkRateLimit(
  supabase: any,
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; message?: string }> {
  const windowMinutes = 15;
  const maxRequests = 5;
  const blockDurationMinutes = 60;

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
      // Block this identifier
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
        message: "Rate limit exceeded. You are temporarily blocked.",
      };
    }

    // Increment counter
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("id", existing.id);
  } else {
    // Create new window
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
    // Get client identifier for rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const identifier = `${clientIP}-${userAgent.substring(0, 50)}`;

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(
      supabase,
      identifier,
      "contact-form"
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
    const body: ContactFormInput = await req.json();

    // Honeypot check (anti-spam)
    if (body.honeypot) {
      console.warn("Honeypot triggered - potential spam");
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize inputs
    const name = sanitizeString(body.name);
    const email = sanitizeString(body.email);
    const phone = body.phone ? sanitizeString(body.phone) : undefined;
    const message = sanitizeString(body.message);

    // Validate field lengths
    if (name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be between 2-100 characters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message must be between 10-5000 characters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store in database
    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        phone,
        message,
        ip_address: clientIP,
        user_agent: userAgent.substring(0, 500),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save submission" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send email notification
    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
    const emailResponse = await resend.emails.send({
      from: "QuantNumeric <onboarding@resend.dev>",
      to: ["hekazodenver@gmail.com"],
      reply_to: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Submitted at: ${new Date().toISOString()}</p>
      `,
    });

    console.log("Contact form submitted successfully:", { name, email });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you for your message. We'll be in touch soon!",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in contact-form function:", error);
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
