const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
user: process.env.CONTACT_EMAIL_USER,
pass: process.env.CONTACT_EMAIL_APP_PASSWORD
  }
});

// =====================================================
// CONTACT ENQUIRY
// POST /api/contact/enquiry
// =====================================================

router.post('/enquiry', async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      location,
      propertyType,
      message,
      userType,
      intent
    } = req.body;

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!name || !phone || !message) {

      return res.status(400).json({
        success: false,
        message: 'Name, phone and message are required.'
      });

    }

    // =================================================
    // EMAIL CONTENT
    // =================================================

    const mailOptions = {

      // Your company email
      from: process.env.CONTACT_EMAIL_USER,

      // Fixed company recipient
      to: 'achasolution@gmail.com',

      // Email subject
      subject: `New Property Enquiry - ${name}`,

      // Plain text email
      text: `
NEW ACCHASOLUTION CONTACT ENQUIRY
=================================

Name:
${name}

Email:
${email || 'Not provided'}

Phone:
${phone}

User Type:
${userType || 'Not provided'}

Requirement:
${intent || 'Not provided'}

Preferred Location:
${location || 'Not provided'}

Property Type:
${propertyType || 'Not provided'}

Message:
${message}

=================================
This enquiry was submitted from AcchaSolution website.
`,

      // HTML email
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">

          <div style="
            background:#b71c1c;
            color:#ffffff;
            padding:20px;
            text-align:center;
          ">
            <h2 style="margin:0;">
              New AcchaSolution Contact Enquiry
            </h2>
          </div>

          <div style="
            padding:25px;
            background:#ffffff;
            border:1px solid #eeeeee;
          ">

            <h3 style="color:#b71c1c;">
              Customer Details
            </h3>

            <p>
              <strong>Name:</strong>
              ${name}
            </p>

            <p>
              <strong>Email:</strong>
              ${email || 'Not provided'}
            </p>

            <p>
              <strong>Phone:</strong>
              ${phone}
            </p>

            <p>
              <strong>User Type:</strong>
              ${userType || 'Not provided'}
            </p>

            <p>
              <strong>Requirement:</strong>
              ${intent || 'Not provided'}
            </p>

            <p>
              <strong>Preferred Location:</strong>
              ${location || 'Not provided'}
            </p>

            <p>
              <strong>Property Type:</strong>
              ${propertyType || 'Not provided'}
            </p>

            <hr>

            <h3 style="color:#b71c1c;">
              Customer Message
            </h3>

            <div style="
              background:#f9f9f9;
              padding:15px;
              border-left:4px solid #b71c1c;
            ">
              ${message}
            </div>

          </div>

          <div style="
            background:#f5f5f5;
            padding:15px;
            text-align:center;
            font-size:12px;
            color:#666666;
          ">
            AcchaSolution – Real Estate, PropTech & Property Services
          </div>

        </div>
      `
    };

    // =================================================
    // SEND EMAIL
    // =================================================

    await transporter.sendMail(mailOptions);

    console.log(
      `CONTACT ENQUIRY EMAIL SENT: ${name}`
    );

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      message:
        'Your enquiry has been sent successfully.'
    });

  } catch (error) {

    // =================================================
    // ERROR
    // =================================================

    console.error(
      'CONTACT ENQUIRY EMAIL ERROR:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        'Unable to send enquiry. Please try again later.'
    });

  }

});

module.exports = router;    