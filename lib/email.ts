import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  orderConfirmation: (data: {
    orderNumber: string;
    customerName: string;
    items: any[];
    total: number;
    shippingAddress: any;
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 20px; font-weight: bold; color: #9333ea; padding-top: 10px; }
        .button { display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Your order has been confirmed and is being processed. Here are your order details:</p>
          
          <div class="order-details">
            <h3>Order #${data.orderNumber}</h3>
            ${data.items
              .map(
                (item) => `
              <div class="item">
                <span>${item.name} x ${item.quantity}</span>
                <span>$${item.total.toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
            <div class="total">
              <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span>Total:</span>
                <span>$${data.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <h3>Shipping Address:</h3>
          <p>
            ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
            ${data.shippingAddress.address1}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
            ${data.shippingAddress.country}
          </p>

          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${data.orderNumber}" class="button">
              Track Your Order
            </a>
          </center>

          <p>We'll send you another email when your order ships!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Retro Gaming. All rights reserved.</p>
          <p>123 Gaming Street, San Francisco, CA 94102</p>
        </div>
      </div>
    </body>
    </html>
  `,

  orderShipped: (data: {
    orderNumber: string;
    customerName: string;
    trackingNumber?: string;
    carrier?: string;
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .tracking-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #10b981; margin: 10px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Order Shipped!</h1>
          <p>Your package is on the way</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Great news! Your order #${data.orderNumber} has been shipped and is on its way to you.</p>
          
          ${
            data.trackingNumber
              ? `
          <div class="tracking-box">
            <p>Tracking Number:</p>
            <div class="tracking-number">${data.trackingNumber}</div>
            ${data.carrier ? `<p>Carrier: ${data.carrier}</p>` : ""}
          </div>
          `
              : ""
          }

          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${data.orderNumber}" class="button">
              Track Your Order
            </a>
          </center>

          <p>You should receive your package within 3-5 business days.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Retro Gaming. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (data: { name: string; resetUrl: string }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <center>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
          </center>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </div>

          <p>For security reasons, this link can only be used once.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Retro Gaming. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  otpVerification: (data: { name: string; otp: string }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #0077b6; }
        .otp-code { font-size: 36px; font-weight: bold; color: #0077b6; letter-spacing: 8px; margin: 10px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Password Reset Code</h1>
          <p>Use this code to verify your identity</p>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>You requested a password reset. Use the verification code below:</p>
          
          <div class="otp-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your verification code:</p>
            <div class="otp-code">${data.otp}</div>
            <p style="margin: 0; color: #999; font-size: 12px;">Expires in 10 minutes</p>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            If you didn't request this code, please ignore this email. Never share this code with anyone.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Retro Gaming. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcomeEmail: (data: { name: string; email: string }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #9333ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .feature { background: white; padding: 15px; border-radius: 8px; text-align: center; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 Welcome to Retro Gaming!</h1>
          <p>Level up your gaming experience</p>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>Welcome to Retro Gaming! We're thrilled to have you join our community of passionate gamers.</p>
          
          <div class="features">
            <div class="feature">
              <h3>🚚 Free Shipping</h3>
              <p>On orders over $50</p>
            </div>
            <div class="feature">
              <h3>⚡ Fast Delivery</h3>
              <p>3-5 business days</p>
            </div>
            <div class="feature">
              <h3>🔄 Easy Returns</h3>
              <p>30-day guarantee</p>
            </div>
            <div class="feature">
              <h3>💯 Quality Products</h3>
              <p>Premium brands only</p>
            </div>
          </div>

          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/categories" class="button">
              Start Shopping
            </a>
          </center>

          <p>If you have any questions, our support team is here to help!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Retro Gaming. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Send email functions
export async function sendOrderConfirmationEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
  items: any[];
  total: number;
  shippingAddress: any;
}) {
  try {
    await transporter.sendMail({
      from: `"Retro Gaming" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.to,
      subject: `Order Confirmation - #${data.orderNumber}`,
      html: emailTemplates.orderConfirmation(data),
    });
    console.log("Order confirmation email sent to:", data.to);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
}

export async function sendOrderShippedEmail(data: {
  to: string;
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  carrier?: string;
}) {
  try {
    await transporter.sendMail({
      from: `"Retro Gaming" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.to,
      subject: `Your Order Has Shipped - #${data.orderNumber}`,
      html: emailTemplates.orderShipped(data),
    });
    console.log("Order shipped email sent to:", data.to);
  } catch (error) {
    console.error("Error sending order shipped email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(data: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  try {
    await transporter.sendMail({
      from: `"Retro Gaming" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.to,
      subject: "Password Reset Request",
      html: emailTemplates.passwordReset(data),
    });
    console.log("Password reset email sent to:", data.to);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export async function sendOtpEmail(data: {
  to: string;
  name: string;
  otp: string;
}) {
  try {
    await transporter.sendMail({
      from: `"Retro Gaming" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.to,
      subject: "Your Password Reset Code",
      html: emailTemplates.otpVerification(data),
    });
    console.log("OTP email sent to:", data.to);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(data: { to: string; name: string; email: string }) {
  try {
    await transporter.sendMail({
      from: `"Retro Gaming" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.to,
      subject: "Welcome to Retro Gaming! 🎮",
      html: emailTemplates.welcomeEmail(data),
    });
    console.log("Welcome email sent to:", data.to);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    await transporter.sendMail({
      from: `"${data.name}" <${data.email}>`,
      replyTo: data.email,
      to: process.env.SMTP_USER,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
      `,
    });
    console.log("Contact email sent from:", data.email);
  } catch (error) {
    console.error("Error sending contact email:", error);
    throw error;
  }
}
