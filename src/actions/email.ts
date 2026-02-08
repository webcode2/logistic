'use server';

import { Resend } from 'resend';
import type { Waybill } from '@prisma/client';
import { formatError } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Gets the formatted 'from' email string using the domain from env
 * and a context-specific prefix (info, zeno, customs, etc.)
 */
function getFromAddress(prefix: string, agentName?: string) {
  const domain = process.env.FROM_DOMAIN || 'resend.dev';

  // Allow overriding the prefix from env, e.g. FROM_EMAIL_ALIAS_INFO=newsletter
  const envKey = `FROM_EMAIL_ALIAS_${prefix.toUpperCase()}`;
  const finalPrefix = process.env[envKey] || prefix;

  const email = `${finalPrefix}@${domain}`;

  if (agentName) {
    return `${agentName} From Rhine Route <${email}>`;
  }
  return `Rhine Route <${email}>`;
}

function getRandomLogisticsAgent(): string {
  const agents = [
    "Sarah", // American Female
    "Lukas"  // European Male
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

interface ShipmentEmailData {
  waybill: Waybill;
  trackingUrl: string;
}

export async function sendShipmentConfirmationEmail(data: ShipmentEmailData) {
  const { waybill, trackingUrl } = data;

  try {
    const agentName = getRandomLogisticsAgent();
    const formattedFrom = getFromAddress('info', agentName);

    // Parallelize sends
    const [shipperResult, receiverResult] = await Promise.all([
      resend.emails.send({
        from: formattedFrom,
        to: waybill.shipper_email,
        subject: `Shipment Confirmed - Tracking #${waybill.tracking_code}`,
        html: generateShipperEmail(waybill, trackingUrl),
      }),
      resend.emails.send({
        from: formattedFrom,
        to: waybill.receiver_email,
        subject: `Package Coming Your Way - Tracking #${waybill.tracking_code}`,
        html: generateReceiverEmail(waybill, trackingUrl),
      })
    ]);

    return {
      success: true,
      shipperEmailSent: !shipperResult.error,
      receiverEmailSent: !receiverResult.error,
    };
  } catch (error) {
    console.error('Failed to send shipment confirmation emails:', error);
    return {
      success: false,
      error: formatError(error, 'Failed to send confirmation emails'),
    };
  }
}

export async function sendShipmentStatusUpdateEmail(waybill: Waybill, trackingUrl: string) {
  try {
    const agentName = getRandomLogisticsAgent();
    const formattedFrom = getFromAddress('tracking', agentName);

    // Parallelize sends
    const [shipperResult, receiverResult] = await Promise.all([
      resend.emails.send({
        from: formattedFrom,
        to: waybill.shipper_email,
        subject: `Shipment Update - ${waybill.tracking_code}`,
        html: generateStatusUpdateEmail(waybill, trackingUrl, true),
      }),
      resend.emails.send({
        from: formattedFrom,
        to: waybill.receiver_email,
        subject: `Your Package Status - ${waybill.tracking_code}`,
        html: generateStatusUpdateEmail(waybill, trackingUrl, false),
      })
    ]);

    return {
      success: true,
      shipperEmailSent: !shipperResult.error,
      receiverEmailSent: !receiverResult.error,
    };
  } catch (error) {
    console.error('Failed to send status update emails:', error);
    return {
      success: false,
      error: formatError(error, 'Failed to send status update emails'),
    };
  }
}

export async function sendCustomsClearanceEmail(waybill: Waybill, trackingUrl: string) {
  try {
    const agentName = getRandomLogisticsAgent();
    const formattedFrom = getFromAddress('customs', `${agentName} (Customs Dept)`);

    // Parallelize sends
    await Promise.all([
      // Send to shipper
      resend.emails.send({
        from: formattedFrom,
        to: waybill.shipper_email,
        subject: `Customs Hold - Action Required: ${waybill.tracking_code}`,
        html: generateCustomsClearanceEmail(waybill, trackingUrl, true),
      }),
      // Send to receiver
      resend.emails.send({
        from: formattedFrom,
        to: waybill.receiver_email,
        subject: `Important Update Regarding Your Shipment: ${waybill.tracking_code}`,
        html: generateCustomsClearanceEmail(waybill, trackingUrl, false),
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error('Failed to send customs clearance email:', error);
    return { success: false, error: formatError(error, 'Failed to send customs clearance email') };
  }
}

export async function sendGenericAdminEmail(to: string, subject: string, body: string, waybillCode?: string) {
  try {
    const formattedFrom = getFromAddress('zeno', 'Zeno');

    await resend.emails.send({
      from: formattedFrom,
      to: to,
      subject: waybillCode ? `${subject} - ${waybillCode}` : subject,
      html: generateGenericAdminEmail(body, waybillCode),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send generic admin email:', error);
    return { success: false, error: formatError(error, 'Failed to send custom email') };
  }
}

export async function sendContactEmail(name: string, email: string, message: string) {
  try {
    const formattedFrom = getFromAddress('support');

    // Parallelize sending for speed
    await Promise.all([
      // 1. Send notification to admin
      resend.emails.send({
        from: formattedFrom,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Form Inquiry from ${name}`,
        html: generateContactNotificationEmail(name, email, message),
      }),
      // 2. Send automated receipt to the user
      resend.emails.send({
        from: formattedFrom,
        to: email,
        subject: 'We received your message - Rhine Route',
        html: generateContactReceiptEmail(name, message),
      })
    ]);

    return { success: true };
  } catch (error) {
    console.error('Failed to send contact emails:', error);
    return {
      success: false,
      error: formatError(error, 'Failed to process your request. Our mail servers are currently busy.')
    };
  }
}

// Branding Helpers
const BRAND_PRIMARY = '#DC2626'; // Crimson
const BRAND_DARK = '#0F172A'; // Slate 900

function generateLogoHtml() {
  const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png`;
  return `
    <div style="text-align: center; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; gap: 15px;">
      <img src="${logoUrl}" alt="Rhine Route Icon" style="height: 50px; width: auto; vertical-align: middle;">
      <div style="display: inline-block; vertical-align: middle; text-align: left;">
        <div style="font-size: 28px; font-weight: 900; color: ${BRAND_DARK}; text-transform: uppercase; letter-spacing: -1px; line-height: 1; font-family: sans-serif;">
          Rhine <span style="color: ${BRAND_PRIMARY};">Route</span>
        </div>
      </div>
    </div>
  `;
}

function generateShipperEmail(waybill: Waybill, trackingUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { background: ${BRAND_DARK}; color: white; padding: 40px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .content { padding: 30px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; }
          .details { background: #f8fafc; padding: 25px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9; }
          .detail-row { margin: 12px 0; font-size: 14px; }
          .detail-label { font-weight: bold; color: ${BRAND_PRIMARY}; width: 140px; display: inline-block; }
          .cta-button { display: inline-block; background: ${BRAND_PRIMARY}; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; transition: background 0.2s; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 25px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${generateLogoHtml()}
          
          <div class="header">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.5px;">Shipment Confirmed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Your package #${waybill.tracking_code} is ready for transit</p>
          </div>
          
          <div class="content">
            <p>Dear ${waybill.shipper_name},</p>
            <p>Thank you for choosing <strong>Rhine Route</strong>. Your shipment has been successfully registered and is now in our secure processing queue.</p>
            
            <div class="details">
              <div class="detail-row"><span class="detail-label">Tracking Number:</span> <strong>${waybill.tracking_code}</strong></div>
              <div class="detail-row"><span class="detail-label">Origin:</span> ${waybill.origin}</div>
              <div class="detail-row"><span class="detail-label">Destination:</span> ${waybill.destination}</div>
              <div class="detail-row"><span class="detail-label">Weight:</span> ${waybill.weight}</div>
              <div class="detail-row"><span class="detail-label">Estimated Delivery:</span> ${new Date(waybill.estimated_delivery_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
            </div>
            
            <p>Monitor your cargo in real-time with our live tracking system:</p>
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="cta-button">Open Live Tracker</a>
            </div>
            
            <p style="margin-top: 20px;">If you have any questions about your shipment, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>Rhine Route - Professional Logistics Management</p>
            <p>© 2026 Rhine Route. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateReceiverEmail(waybill: Waybill, trackingUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { background: ${BRAND_PRIMARY}; color: white; padding: 40px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .content { padding: 30px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; }
          .details { background: #f8fafc; padding: 25px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9; }
          .detail-row { margin: 12px 0; font-size: 14px; }
          .detail-label { font-weight: bold; color: ${BRAND_PRIMARY}; width: 140px; display: inline-block; }
          .cta-button { display: inline-block; background: ${BRAND_DARK}; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 25px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${generateLogoHtml()}
          
          <div class="header">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.5px;">Package Incoming!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Rhine Route is delivering a package to you</p>
          </div>
          
          <div class="content">
            <p>Hello ${waybill.receiver_name},</p>
            <p>Exciting news! A shipment from <strong>${waybill.shipper_name}</strong> is on its way to your address.</p>
            
            <div class="details">
              <div class="detail-row"><span class="detail-label">Tracking Number:</span> <strong>${waybill.tracking_code}</strong></div>
              <div class="detail-row"><span class="detail-label">Shipping From:</span> ${waybill.origin}</div>
              <div class="detail-row"><span class="detail-label">Expected Arrival:</span> ${new Date(waybill.estimated_delivery_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
            </div>
            
            <p>Track your package every step of the way:</p>
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="cta-button">Open Live Tracker</a>
            </div>
            
            <p style="margin-top: 20px;">
              <strong>Contact Information:</strong><br>
              If there are any changes needed or if you have questions about your delivery, please contact the sender or our support team with your tracking number.
            </p>
          </div>
          
          <div class="footer">
            <p>Rhine Route - Professional Logistics Management</p>
            <p>© 2026 Rhine Route. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateStatusUpdateEmail(waybill: Waybill, trackingUrl: string, isSender: boolean): string {
  const recipientName = isSender ? waybill.shipper_name : waybill.receiver_name;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { background: ${BRAND_DARK}; color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .content { padding: 30px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; }
          .status-badge { display: inline-block; padding: 10px 20px; border-radius: 30px; font-weight: bold; margin: 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .status-processing { background: #f1f5f9; color: #475569; }
          .status-in-transit { background: #eff6ff; color: #2563eb; }
          .status-arrived { background: #fffbeb; color: #d97706; }
          .status-delivered { background: #ecfdf5; color: #059669; }
          .cta-button { display: inline-block; background: ${BRAND_PRIMARY}; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 25px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${generateLogoHtml()}
          
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Shipment Milestone Reached</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">Status update for ${waybill.tracking_code}</p>
          </div>
          
          <div class="content">
            <p>Hello ${recipientName},</p>
            <p>The status of your shipment has been updated.</p>
            
            <div style="text-align: center;">
              <div class="status-badge status-${waybill.status.toLowerCase().replace('_', '-')}">
                ${waybill.status.replace('_', ' ')}
              </div>
            </div>
            
            <p style="text-align: center;">
              <strong>Current Status:</strong> Your shipment is currently categorized as ${waybill.status.toLowerCase().replace('_', ' ')}.<br>
              <strong>Estimated Delivery:</strong> ${new Date(waybill.estimated_delivery_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </p>
            
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="cta-button">Open Live Tracker</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Rhine Route - Professional Logistics Management</p>
            <p>© 2026 Rhine Route. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateCustomsClearanceEmail(waybill: Waybill, trackingUrl: string, isSender: boolean): string {
  const recipientName = isSender ? waybill.shipper_name : waybill.receiver_name;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { background: #e11d48; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 20px; background: white; }
          .alert { background: #fff1f2; border: 1px solid #fda4af; color: #9f1239; padding: 15px; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .cta-button { display: inline-block; background: #e11d48; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${generateLogoHtml()}
          <div class="header">
            <h1>Customs Hold Notification</h1>
            <p>Tracking #${waybill.tracking_code}</p>
          </div>
          <div class="content">
            <p>Hello ${recipientName},</p>
            <div class="alert">
              Important: Your shipment is currently being held by customs for further inspection or documentation.
            </div>
            <p>This is a standard procedure and typically requires additional information or verification to proceed.</p>
            <p><strong>Next Steps:</strong> Our customs brokerage team is currently working on this. We will contact you if any specific documents are required from your side.</p>
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="cta-button">Open Live Tracker</a>
            </div>
          </div>
          <div class="footer">
            <p>Rhine Route - Professional Logistics Management</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateGenericAdminEmail(body: string, waybillCode?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { background: ${BRAND_DARK}; color: white; padding: 30px; border-radius: 12px; text-align: center; }
          .content { padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 20px; white-space: pre-wrap; background: white; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${generateLogoHtml()}
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Notification from Rhine Route</h1>
            ${waybillCode ? `<p style="margin: 5px 0 0 0; opacity: 0.8;">Regarding Shipment #${waybillCode}</p>` : ''}
          </div>
          <div class="content">
            ${body}
          </div>
          <div class="footer">
            <p>Rhine Route - Professional Logistics Management</p>
            <p>This email was sent by an administrator.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateContactNotificationEmail(name: string, email: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
          .field { font-weight: bold; color: ${BRAND_PRIMARY}; margin-top: 15px; }
          .value { background: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          ${generateLogoHtml()}
          <h2>New Website Inquiry</h2>
          <div class="field">Name:</div>
          <div class="value">${name}</div>
          <div class="field">Email:</div>
          <div class="value">${email}</div>
          <div class="field">Message:</div>
          <div class="value" style="white-space: pre-wrap;">${message}</div>
        </div>
      </body>
    </html>
  `;
}

function generateContactReceiptEmail(name: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { background: ${BRAND_DARK}; color: white; padding: 30px; border-radius: 12px; text-align: center; }
          .content { padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 20px; background: white; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
          .quote { border-left: 4px solid ${BRAND_PRIMARY}; padding-left: 15px; font-style: italic; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          ${generateLogoHtml()}
          <div class="header">
            <h1>Message Received</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for reaching out to <strong>Rhine Route</strong>. This is an automated confirmation that we have received your inquiry.</p>
            <p>Our logistics specialists will review your message and get back to you within 24 hours.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
            <p><strong>Your Message:</strong></p>
            <div class="quote">${message}</div>
          </div>
          <div class="footer">
            <p>Rhine Route - Professional Logistics Management</p>
            <p>Managed by Rhine Group Global</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
