'use server';

import { Resend } from 'resend';
import type { Waybill } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ShipmentEmailData {
  waybill: Waybill;
  trackingUrl: string;
}

export async function sendShipmentConfirmationEmail(data: ShipmentEmailData) {
  const { waybill, trackingUrl } = data;

  try {
    // Send email to shipper
    const shipperEmail = await resend.emails.send({
      from: 'shipment@logitrack.pro',
      to: waybill.shipper_email,
      subject: `Shipment Confirmed - Tracking #${waybill.tracking_code}`,
      html: generateShipperEmail(waybill, trackingUrl),
    });

    // Send email to receiver
    const receiverEmail = await resend.emails.send({
      from: 'shipment@logitrack.pro',
      to: waybill.receiver_email,
      subject: `Package Coming Your Way - Tracking #${waybill.tracking_code}`,
      html: generateReceiverEmail(waybill, trackingUrl),
    });

    return {
      success: true,
      shipperEmailSent: !shipperEmail.error,
      receiverEmailSent: !receiverEmail.error,
    };
  } catch (error) {
    console.error('Failed to send shipment confirmation emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send emails',
    };
  }
}

export async function sendShipmentStatusUpdateEmail(waybill: Waybill, trackingUrl: string) {
  try {
    // Send status update to shipper
    const shipperEmail = await resend.emails.send({
      from: 'updates@logitrack.pro',
      to: waybill.shipper_email,
      subject: `Shipment Update - ${waybill.tracking_code}`,
      html: generateStatusUpdateEmail(waybill, trackingUrl, true),
    });

    // Send status update to receiver
    const receiverEmail = await resend.emails.send({
      from: 'updates@logitrack.pro',
      to: waybill.receiver_email,
      subject: `Your Package Status - ${waybill.tracking_code}`,
      html: generateStatusUpdateEmail(waybill, trackingUrl, false),
    });

    return {
      success: true,
      shipperEmailSent: !shipperEmail.error,
      receiverEmailSent: !receiverEmail.error,
    };
  } catch (error) {
    console.error('Failed to send status update emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send status update emails',
    };
  }
}

function generateShipperEmail(waybill: Waybill, trackingUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; }
          .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .detail-row { margin: 8px 0; }
          .detail-label { font-weight: bold; color: #667eea; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Shipment Confirmed</h1>
            <p>Your package has been registered and is ready to ship</p>
          </div>
          
          <div class="content">
            <h2>Shipment Details</h2>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Tracking Number:</span> ${waybill.tracking_code}
              </div>
              <div class="detail-row">
                <span class="detail-label">From:</span> ${waybill.origin}
              </div>
              <div class="detail-row">
                <span class="detail-label">To:</span> ${waybill.destination}
              </div>
              <div class="detail-row">
                <span class="detail-label">Weight:</span> ${waybill.weight}
              </div>
              <div class="detail-row">
                <span class="detail-label">Dimensions:</span> ${waybill.dimensions}
              </div>
              <div class="detail-row">
                <span class="detail-label">Estimated Delivery:</span> ${new Date(waybill.estimated_delivery_date).toLocaleDateString()}
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span> ${waybill.status}
              </div>
            </div>
            
            <p>Dear ${waybill.shipper_name},</p>
            <p>Thank you for using LogiTrack Pro! Your shipment has been successfully registered in our system and is ready for processing.</p>
            <p>You can track your shipment in real-time using the link below:</p>
            
            <a href="${trackingUrl}" class="cta-button">Track Your Shipment</a>
            
            <p style="margin-top: 20px;">If you have any questions about your shipment, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>LogiTrack Pro - Professional Logistics Management</p>
            <p>© 2026 LogiTrack Pro. All rights reserved.</p>
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
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; }
          .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .detail-row { margin: 8px 0; }
          .detail-label { font-weight: bold; color: #667eea; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>A Package is Coming Your Way!</h1>
            <p>Get ready to receive your shipment</p>
          </div>
          
          <div class="content">
            <h2>Shipment Details</h2>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Tracking Number:</span> ${waybill.tracking_code}
              </div>
              <div class="detail-row">
                <span class="detail-label">Shipping From:</span> ${waybill.origin}
              </div>
              <div class="detail-row">
                <span class="detail-label">Shipping To:</span> ${waybill.destination}
              </div>
              <div class="detail-row">
                <span class="detail-label">Package Weight:</span> ${waybill.weight}
              </div>
              <div class="detail-row">
                <span class="detail-label">Expected Delivery:</span> ${new Date(waybill.estimated_delivery_date).toLocaleDateString()}
              </div>
            </div>
            
            <p>Hello ${waybill.receiver_name},</p>
            <p>Great news! A package is on its way to you. You can track its progress in real-time using the tracking link below.</p>
            
            <a href="${trackingUrl}" class="cta-button">Track Your Package</a>
            
            <p style="margin-top: 20px;">
              <strong>Contact Information:</strong><br>
              If there are any changes needed or if you have questions about your delivery, please contact the sender or our support team with your tracking number.
            </p>
          </div>
          
          <div class="footer">
            <p>LogiTrack Pro - Professional Logistics Management</p>
            <p>© 2026 LogiTrack Pro. All rights reserved.</p>
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
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; }
          .status-badge { display: inline-block; padding: 8px 15px; border-radius: 5px; font-weight: bold; margin: 10px 0; }
          .status-processing { background: #e3e8ef; color: #667eea; }
          .status-in-transit { background: #e3f2fd; color: #1976d2; }
          .status-arrived { background: #fff3e0; color: #f57c00; }
          .status-delivered { background: #e8f5e9; color: #388e3c; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Shipment Status Update</h1>
            <p>Tracking #${waybill.tracking_code}</p>
          </div>
          
          <div class="content">
            <p>Hello ${recipientName},</p>
            
            <p>Your shipment has been updated. Here's the current status:</p>
            
            <div class="status-badge status-${waybill.status.toLowerCase().replace('_', '-')}">
              ${waybill.status}
            </div>
            
            <p>
              <strong>Tracking Number:</strong> ${waybill.tracking_code}<br>
              <strong>From:</strong> ${waybill.origin}<br>
              <strong>To:</strong> ${waybill.destination}<br>
              <strong>Expected Delivery:</strong> ${new Date(waybill.estimated_delivery_date).toLocaleDateString()}
            </p>
            
            <a href="${trackingUrl}" class="cta-button">View Full Tracking Details</a>
            
            <p style="margin-top: 20px;">Thank you for your business!</p>
          </div>
          
          <div class="footer">
            <p>LogiTrack Pro - Professional Logistics Management</p>
            <p>© 2026 LogiTrack Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
