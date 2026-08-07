import "server-only";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import { getSettings } from "@/lib/settings";

const EMAIL_CATEGORY: Record<string, "order" | "marketing" | "stock" | "system"> = {
  order_confirmation: "order",
  order_processing: "order",
  order_shipped: "order",
  order_delivered: "order",
  order_cancelled: "order",
  refund_confirmation: "order",
  payment_successful: "order",
  new_product: "marketing",
  flash_sale: "marketing",
  exclusive_offer: "marketing",
  campaign: "marketing",
  price_drop: "marketing",
  welcome: "marketing",
  newsletter_confirmation: "marketing",
  back_in_stock: "stock",
  low_stock: "stock",
  out_of_stock: "stock",
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const fromName = process.env.SMTP_FROM_NAME || "Retro Gaming";
const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "";
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "";

const RETAILER_ADDRESS = process.env.RETAILER_ADDRESS || "123 Gaming Street, San Francisco, CA 94102";

function layout(title: string, accent: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f8; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: ${accent}; color: white; padding: 32px 30px; text-align: center; }
  .header h1 { margin: 0 0 6px; font-size: 24px; }
  .header p { margin: 0; opacity: 0.9; font-size: 14px; }
  .content { padding: 30px; }
  .button { display: inline-block; background: ${accent}; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0; }
  .box { background: #f9f9fc; border: 1px solid #eee; border-radius: 8px; padding: 18px; margin: 16px 0; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .row:last-child { border-bottom: none; }
  .total { font-size: 18px; font-weight: bold; color: #111; }
  .muted { color: #888; font-size: 12px; }
  .code { font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #111; text-align: center; }
  .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; font-size: 13px; margin: 16px 0; }
  .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
  .feature { display: inline-block; background: #f9f9fc; border: 1px solid #eee; border-radius: 8px; padding: 12px 16px; margin: 4px; font-size: 13px; }
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>${title}</h1>
        <p>${fromName}</p>
      </div>
      <div class="content">${body}</div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${fromName}. All rights reserved.</p>
      <p>${RETAILER_ADDRESS} · <a href="${baseUrl}/newsletter/unsubscribe" style="color:#888">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

const gradients: Record<string, string> = {
  purple: "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
  green: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
  blue: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)",
  pink: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
  orange: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  dark: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
};

/* ========================= SEND CORE ========================= */

interface SendInput {
  to: string;
  subject: string;
  html: string;
  type: string;
  metadata?: Record<string, unknown>;
}

async function sendEmail(input: SendInput): Promise<boolean> {
  if (!process.env.SMTP_USER) {
    console.log(`[email:${input.type}] SMTP not configured — skipping send to ${input.to}`);
    return false;
  }

  try {
    // Respect the admin email settings master switches
    const settings = await getSettings();
    if (settings.email?.enabled === false) {
      console.log(`[email:${input.type}] Email system disabled via settings — skipping`);
      return false;
    }
    const category = EMAIL_CATEGORY[input.type] || "system";
    if (category === "order" && settings.email?.sendOrderEmails === false) return false;
    if (category === "marketing" && settings.email?.sendMarketingEmails === false) return false;
    if (category === "stock" && settings.email?.sendStockAlerts === false) return false;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    await logEmail(input.to, input.subject, input.type, "sent", undefined, input.metadata);
    return true;
  } catch (error: any) {
    console.error(`Error sending ${input.type} email:`, error?.message || error);
    await logEmail(input.to, input.subject, input.type, "failed", error?.message, input.metadata);
    return false;
  }
}

async function logEmail(
  to: string,
  subject: string,
  type: string,
  status: "sent" | "failed" | "queued",
  error?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await connectDB();
    await EmailLog.create({ to, subject, type, status, error, metadata });
  } catch {
    // logging must never break email flow
  }
}

/* ========================= TEMPLATES ========================= */

function formatPrice(price: number): string {
  return `$${Number(price || 0).toFixed(2)}`;
}

/* -------------------- Order lifecycle -------------------- */

export async function sendOrderConfirmationEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
  items: any[];
  total: number;
  shippingAddress: any;
}) {
  const itemsHtml = (data.items || [])
    .map(
      (item) => `
      <div class="row">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatPrice(item.total || item.price * item.quantity)}</span>
      </div>`
    )
    .join("");

  const shipping = data.shippingAddress
    ? `<div class="box">
        <p style="margin:0 0 6px;font-weight:bold">Shipping Address</p>
        <p class="muted" style="margin:0">${typeof data.shippingAddress === "string"
          ? data.shippingAddress
          : `${data.shippingAddress.firstName || ""} ${data.shippingAddress.lastName || ""}<br>${data.shippingAddress.address1 || ""}<br>${data.shippingAddress.city || ""}, ${data.shippingAddress.state || ""} ${data.shippingAddress.zipCode || ""}<br>${data.shippingAddress.country || ""}`}</p>
      </div>`
    : "";

  const html = layout(
    "Order Confirmed! 🎮",
    gradients.purple,
    `<p>Hi ${data.customerName},</p>
     <p>Thank you for your purchase! Your order <strong>#${data.orderNumber}</strong> has been received and is being processed.</p>
     <div class="box">${itemsHtml}<div class="row total"><span>Total</span><span>${formatPrice(data.total)}</span></div></div>
     ${shipping}
     <center><a href="${baseUrl}/account/orders/${data.orderNumber}" class="button">Track Your Order</a></center>
     <p class="muted">We'll email you when your order ships.</p>`
  );

  return sendEmail({
    to: data.to,
    subject: `Order Confirmation - #${data.orderNumber}`,
    html,
    type: "order_confirmation",
    metadata: { orderNumber: data.orderNumber },
  });
}

export async function sendOrderShippedEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  carrier?: string;
}) {
  const trackingHtml = data.trackingNumber
    ? `<div class="box"><p style="margin:0 0 6px">Tracking Number:</p><p style="margin:0;font-size:20px;font-weight:bold">${data.trackingNumber}</p>${data.carrier ? `<p class="muted">Carrier: ${data.carrier}</p>` : ""}</div>`
    : "";

  const html = layout(
    "📦 Your Order Has Shipped!",
    gradients.green,
    `<p>Hi ${data.customerName},</p>
     <p>Great news! Your order <strong>#${data.orderNumber}</strong> is on the way.</p>
     ${trackingHtml}
     <center><a href="${baseUrl}/account/orders/${data.orderNumber}" class="button">Track Your Order</a></center>
     <p class="muted">Estimated delivery is 3-5 business days.</p>`
  );

  return sendEmail({
    to: data.to,
    subject: `Your Order Has Shipped - #${data.orderNumber}`,
    html,
    type: "order_shipped",
    metadata: { orderNumber: data.orderNumber, trackingNumber: data.trackingNumber },
  });
}

export async function sendOrderProcessingEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
}) {
  const html = layout(
    "⚙️ Order Processing",
    gradients.blue,
    `<p>Hi ${data.customerName},</p>
     <p>Your order <strong>#${data.orderNumber}</strong> is now being processed and packed. We'll let you know as soon as it ships!</p>
     <center><a href="${baseUrl}/account/orders/${data.orderNumber}" class="button">View Order</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `Order Processing - #${data.orderNumber}`,
    html,
    type: "order_processing",
    metadata: { orderNumber: data.orderNumber },
  });
}

export async function sendOrderDeliveredEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
}) {
  const html = layout(
    "✅ Order Delivered!",
    gradients.green,
    `<p>Hi ${data.customerName},</p>
     <p>Your order <strong>#${data.orderNumber}</strong> has been delivered. We hope you love your new gear!</p>
     <p>Enjoy your purchase and don't forget to leave a review. Happy gaming! 🎮</p>
     <center><a href="${baseUrl}/categories" class="button">Shop More</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `Your Order Was Delivered - #${data.orderNumber}`,
    html,
    type: "order_delivered",
    metadata: { orderNumber: data.orderNumber },
  });
}

export async function sendOrderCancelledEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
}) {
  const html = layout(
    "❌ Order Cancelled",
    gradients.orange,
    `<p>Hi ${data.customerName},</p>
     <p>Your order <strong>#${data.orderNumber}</strong> has been cancelled. If you paid, your refund will be processed within 5-10 business days.</p>
     <p class="muted">If you didn't request this cancellation, please contact our support team.</p>`
  );
  return sendEmail({
    to: data.to,
    subject: `Order Cancelled - #${data.orderNumber}`,
    html,
    type: "order_cancelled",
    metadata: { orderNumber: data.orderNumber },
  });
}

export async function sendRefundConfirmationEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
  amount: number;
}) {
  const html = layout(
    "💸 Refund Processed",
    gradients.blue,
    `<p>Hi ${data.customerName},</p>
     <p>A refund of <strong>${formatPrice(data.amount)}</strong> for order <strong>#${data.orderNumber}</strong> has been processed.</p>
     <p class="muted">Refunds may take 5-10 business days to appear on your statement depending on your bank.</p>`
  );
  return sendEmail({
    to: data.to,
    subject: `Refund Processed - #${data.orderNumber}`,
    html,
    type: "refund_confirmation",
    metadata: { orderNumber: data.orderNumber, amount: data.amount },
  });
}

export async function sendPaymentSuccessfulEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method?: string;
}) {
  const html = layout(
    "💳 Payment Successful",
    gradients.green,
    `<p>Hi ${data.customerName},</p>
     <p>We've received your payment of <strong>${formatPrice(data.amount)}</strong> for order <strong>#${data.orderNumber}</strong>${data.method ? ` via ${data.method}` : ""}.</p>
     <center><a href="${baseUrl}/account/orders/${data.orderNumber}" class="button">View Order</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `Payment Confirmed - #${data.orderNumber}`,
    html,
    type: "payment_success",
    metadata: { orderNumber: data.orderNumber, amount: data.amount },
  });
}

/* -------------------- Account & auth -------------------- */

export async function sendPasswordResetEmail(data: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const html = layout(
    "🔐 Password Reset",
    gradients.blue,
    `<p>Hi ${data.name},</p>
     <p>We received a request to reset your password. Click the button below to create a new one:</p>
     <center><a href="${data.resetUrl}" class="button">Reset Password</a></center>
     <div class="warning"><strong>⚠️ Security Notice:</strong><br>This link expires in 1 hour. If you didn't request this, please ignore this email.</div>`
  );
  return sendEmail({
    to: data.to,
    subject: "Password Reset Request",
    html,
    type: "password_reset",
  });
}

export async function sendVerificationEmail(data: {
  to: string;
  name: string;
  verificationUrl: string;
}) {
  const html = layout(
    "✅ Verify Your Account",
    gradients.purple,
    `<p>Hi ${data.name},</p>
     <p>Please confirm your email address to activate your account:</p>
     <center><a href="${data.verificationUrl}" class="button">Verify Email</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: "Verify Your Email Address",
    html,
    type: "account_verification",
  });
}

export async function sendOtpEmail(data: {
  to: string;
  name: string;
  otp: string;
}) {
  const html = layout(
    "🔑 Your Verification Code",
    gradients.blue,
    `<p>Hi ${data.name},</p>
     <p>Use the code below to verify your identity:</p>
     <div class="box"><div class="code">${data.otp}</div><p class="muted" style="text-align:center">Expires in 10 minutes</p></div>
     <div class="warning">Never share this code with anyone. If you didn't request it, ignore this email.</div>`
  );
  return sendEmail({
    to: data.to,
    subject: "Your Password Reset Code",
    html,
    type: "otp_verification",
  });
}

export async function sendWelcomeEmail(data: { to: string; name: string; email: string }) {
  const html = layout(
    "🎮 Welcome to Retro Gaming!",
    gradients.purple,
    `<p>Hi ${data.name},</p>
     <p>Welcome to Retro Gaming! We're thrilled to have you join our community of passionate gamers.</p>
     <p>
       <span class="feature">🚚 Free Shipping on orders $50+</span>
       <span class="feature">⚡ Fast 3-5 day delivery</span>
       <span class="feature">🔄 30-day easy returns</span>
     </p>
     <center><a href="${baseUrl}/categories" class="button">Start Shopping</a></center>
     <p class="muted">If you have any questions, our support team is here to help.</p>`
  );
  return sendEmail({
    to: data.to,
    subject: "Welcome to Retro Gaming! 🎮",
    html,
    type: "welcome",
  });
}

export async function sendNewsletterConfirmationEmail(data: {
  to: string;
  name?: string;
}) {
  const html = layout(
    "📬 Newsletter Subscription Confirmed",
    gradients.green,
    `<p>Hi ${data.name || "there"},</p>
     <p>You've successfully subscribed to the Retro Gaming newsletter! You'll now receive:</p>
     <p>
       <span class="feature">🔥 Flash sale alerts</span>
       <span class="feature">🎁 Exclusive offers & coupons</span>
       <span class="feature">🆕 New product announcements</span>
     </p>
     <p class="muted">You can unsubscribe at any time using the link in any email.</p>`
  );
  return sendEmail({
    to: data.to,
    subject: "You're Subscribed! 📬",
    html,
    type: "newsletter_confirmation",
  });
}

/* -------------------- Promotional -------------------- */

export async function sendFlashSaleEmail(data: {
  to: string;
  name?: string;
  title: string;
  endsAt: Date;
  url: string;
}) {
  const html = layout(
    "⚡ Flash Sale!",
    gradients.pink,
    `<p>Hi ${data.name || "gamer"},</p>
     <p><strong>${data.title}</strong> is happening right now! Don't miss these limited-time deals.</p>
     <div class="box"><p style="margin:0;text-align:center"><strong>Ends:</strong> ${data.endsAt.toLocaleString()}</p></div>
     <center><a href="${baseUrl}${data.url}" class="button">Shop the Sale</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `⚡ Flash Sale: ${data.title}`,
    html,
    type: "flash_sale",
    metadata: { title: data.title },
  });
}

export async function sendNewProductEmail(data: {
  to: string;
  name?: string;
  productName: string;
  productImage?: string;
  productUrl: string;
}) {
  const imageHtml = data.productImage
    ? `<center><img src="${data.productImage}" alt="${data.productName}" style="max-width:100%;border-radius:8px;max-height:300px;object-fit:cover"/></center>`
    : "";
  const html = layout(
    "🆕 New Arrival!",
    gradients.orange,
    `<p>Hi ${data.name || "gamer"},</p>
     <p>Check out our newest product:</p>
     ${imageHtml}
     <center><h2 style="margin:12px 0">${data.productName}</h2>
     <a href="${baseUrl}${data.productUrl}" class="button">View Product</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `🆕 New Arrival: ${data.productName}`,
    html,
    type: "new_product",
    metadata: { productName: data.productName },
  });
}

export async function sendExclusiveOfferEmail(data: {
  to: string;
  name?: string;
  title: string;
  description: string;
  couponCode?: string;
  url: string;
}) {
  const couponHtml = data.couponCode
    ? `<div class="box"><p class="muted" style="margin:0 0 4px">Use code at checkout:</p><div class="code">${data.couponCode}</div></div>`
    : "";
  const html = layout(
    "🎁 Exclusive Offer",
    gradients.dark,
    `<p>Hi ${data.name || "gamer"},</p>
     <p style="font-size:18px"><strong>${data.title}</strong></p>
     <p>${data.description}</p>
     ${couponHtml}
     <center><a href="${baseUrl}${data.url}" class="button">Claim Offer</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `🎁 ${data.title}`,
    html,
    type: "exclusive_offer",
    metadata: { title: data.title, couponCode: data.couponCode },
  });
}

export async function sendCampaignEmail(data: {
  to: string;
  name?: string;
  subject: string;
  content: string;
  template: string;
}) {
  const html = layout(
    data.subject,
    gradients.dark,
    `<p>Hi ${data.name || "gamer"},</p>${data.content}`
  );
  return sendEmail({
    to: data.to,
    subject: data.subject,
    html,
    type: `campaign_${data.template}`,
  });
}

/* -------------------- Stock & wishlist -------------------- */

export async function sendBackInStockEmail(data: {
  to: string;
  productName: string;
  productUrl: string;
}) {
  const html = layout(
    "✅ Back in Stock!",
    gradients.green,
    `<p>Good news! The product you were waiting for is back in stock:</p>
     <center><h2 style="margin:12px 0">${data.productName}</h2>
     <a href="${baseUrl}${data.productUrl}" class="button">Buy Now</a></center>
     <p class="muted">Hurry — stock is limited!</p>`
  );
  return sendEmail({
    to: data.to,
    subject: `✅ ${data.productName} is Back in Stock!`,
    html,
    type: "back_in_stock",
  });
}

export async function sendPriceDropEmail(data: {
  to: string;
  productName: string;
  productUrl: string;
  oldPrice: number;
  newPrice: number;
}) {
  const html = layout(
    "📉 Price Drop Alert!",
    gradients.pink,
    `<p>Great news! A product on your wishlist just got cheaper:</p>
     <center><h2 style="margin:12px 0">${data.productName}</h2>
     <p style="font-size:18px"><span style="text-decoration:line-through;color:#888">${formatPrice(data.oldPrice)}</span>
     <strong style="color:#16a34a;margin-left:8px">${formatPrice(data.newPrice)}</strong></p>
     <a href="${baseUrl}${data.productUrl}" class="button">Shop Now</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `📉 Price Drop: ${data.productName}`,
    html,
    type: "price_drop",
  });
}

export async function sendLowStockEmail(data: {
  to: string;
  productName: string;
  productSlug: string;
  stock: number;
}) {
  const html = layout(
    "⚠️ Low Stock Alert",
    gradients.orange,
    `<p>This is an automated inventory alert.</p>
     <div class="box">
       <p><strong>Product:</strong> ${data.productName}</p>
       <p><strong>Remaining stock:</strong> ${data.stock} units</p>
       <p><strong>Slug:</strong> /products/${data.productSlug}</p>
     </div>
     <center><a href="${baseUrl}/admin/products" class="button">Open Admin</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `⚠️ Low Stock: ${data.productName}`,
    html,
    type: "low_stock",
  });
}

export async function sendOutOfStockEmail(data: {
  to: string;
  productName: string;
  productSlug: string;
}) {
  const html = layout(
    "🚫 Out of Stock",
    gradients.orange,
    `<p>This is an automated inventory alert.</p>
     <div class="box">
       <p><strong>Product:</strong> ${data.productName}</p>
       <p><strong>Status:</strong> Out of stock</p>
       <p><strong>Slug:</strong> /products/${data.productSlug}</p>
     </div>
     <center><a href="${baseUrl}/admin/products" class="button">Open Admin</a></center>`
  );
  return sendEmail({
    to: data.to,
    subject: `🚫 Out of Stock: ${data.productName}`,
    html,
    type: "out_of_stock",
  });
}

export async function sendAdminAlertEmail(data: {
  subject: string;
  message: string;
}) {
  const html = layout(
    "🔔 Admin Alert",
    gradients.dark,
    `<p>${data.message}</p>`
  );
  return sendEmail({
    to: supportEmail || fromEmail,
    subject: data.subject,
    html,
    type: "admin_alert",
  });
}

/* -------------------- Contact -------------------- */

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!process.env.SMTP_USER) return false;
  try {
    await transporter.sendMail({
      from: `"${data.name}" <${data.email}>`,
      replyTo: data.email,
      to: process.env.SMTP_USER,
      subject: `Contact Form: ${data.subject}`,
      html: `<h2>New Contact Form Submission</h2><p><strong>From:</strong> ${data.name} (${data.email})</p><p><strong>Subject:</strong> ${data.subject}</p><p><strong>Message:</strong></p><p>${data.message.replace(/\n/g, "<br>")}</p>`,
    });
    await logEmail(process.env.SMTP_USER, `Contact Form: ${data.subject}`, "contact_message", "sent");
    return true;
  } catch (error: any) {
    console.error("Error sending contact email:", error?.message || error);
    await logEmail(process.env.SMTP_USER, `Contact Form: ${data.subject}`, "contact_message", "failed", error?.message);
    return false;
  }
}

/* -------------------- Newsletter broadcast -------------------- */

export interface CampaignRecipient {
  email: string;
  name?: string;
}

export async function sendCampaignToRecipients(
  recipients: CampaignRecipient[],
  subject: string,
  content: string,
  template: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const ok = await sendCampaignEmail({
      to: recipient.email,
      name: recipient.name,
      subject,
      content,
      template,
    });
    if (ok) sent += 1;
    else failed += 1;
  }

  return { sent, failed };
}
