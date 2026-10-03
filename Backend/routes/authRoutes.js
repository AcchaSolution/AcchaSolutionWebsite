
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const adminAuth = require('../middleware/adminAuth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const router = express.Router();
console.log('AUTH ROUTES LOADED');

// =====================================================
// FORGOT PASSWORD — EMAIL TRANSPORTER
// =====================================================

const forgotPasswordTransporter =
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.CONTACT_EMAIL_USER,
      pass: process.env.CONTACT_EMAIL_APP_PASSWORD
    }
  });

console.log('FORGOT PASSWORD MAILER READY');


// =====================================================
// FORGOT PASSWORD — TEMP OTP STORAGE
// =====================================================

const forgotPasswordOtps = new Map();


// =====================================================
// FORGOT PASSWORD — SEND OTP
// =====================================================

router.post('/send-otp', async (req, res) => {

  console.log('FORGOT PASSWORD SEND OTP API HIT');

  try {

    const { email } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !email.trim()) {

      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });

    }

    const lowerEmail =
      email.trim().toLowerCase();

    // -------------------------------------------------
    // CHECK USER IN MONGODB
    // -------------------------------------------------

    const user =
      await User.findOne({
        email: lowerEmail
      });

    if (!user) {

      return res.status(404).json({
        success: false,
        message:
          'This email is not registered.'
      });

    }

    // -------------------------------------------------
    // GENERATE 6-DIGIT OTP
    // -------------------------------------------------

    const otp =
      crypto.randomInt(
        100000,
        1000000
      ).toString();

    // -------------------------------------------------
    // OTP EXPIRY — 10 MINUTES
    // -------------------------------------------------

    const expiresAt =
      Date.now() +
      10 * 60 * 1000;

    // -------------------------------------------------
    // SAVE OTP TEMPORARILY
    // -------------------------------------------------

    forgotPasswordOtps.set(
      lowerEmail,
      {
        otp,
        expiresAt,
        attempts: 0,
        verified: false
      }
    );

    // -------------------------------------------------
    // SEND OTP EMAIL
    // -------------------------------------------------

    await forgotPasswordTransporter.sendMail({

      from:
        process.env.CONTACT_EMAIL_USER,

      to:
        lowerEmail,

      subject:
        'AcchaSolution Password Reset OTP',

      text:
        `Your AcchaSolution password reset OTP is ${otp}. This OTP is valid for 10 minutes.`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          background: #f8f8f8;
          padding: 30px;
        ">

          <div style="
            max-width: 520px;
            margin: auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 30px;
            border: 1px solid #eeeeee;
          ">

            <h2 style="
              color: #b71c1c;
              margin-bottom: 10px;
            ">
              AcchaSolution
            </h2>

            <p style="
              color: #333333;
              font-size: 16px;
            ">
              You requested to reset your password.
            </p>

            <p style="
              color: #555555;
            ">
              Your One-Time Password (OTP) is:
            </p>

            <div style="
              background: #fff1f1;
              border: 1px solid #b71c1c;
              border-radius: 10px;
              padding: 18px;
              text-align: center;
              margin: 20px 0;
            ">

              <span style="
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #b71c1c;
              ">
                ${otp}
              </span>

            </div>

            <p style="
              color: #666666;
              font-size: 14px;
            ">
              This OTP is valid for <strong>10 minutes</strong>.
            </p>

            <p style="
              color: #888888;
              font-size: 13px;
              margin-top: 25px;
            ">
              If you did not request a password reset,
              please ignore this email.
            </p>

            <hr style="
              border: none;
              border-top: 1px solid #eeeeee;
              margin: 25px 0;
            ">

            <p style="
              color: #999999;
              font-size: 12px;
              text-align: center;
            ">
              © AcchaSolution
            </p>

          </div>

        </div>
      `

    });

    console.log(
      'FORGOT PASSWORD OTP SENT TO:',
      lowerEmail
    );

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(200).json({

      success: true,

      message:
        'OTP has been sent to your registered email.'

    });

  } catch (error) {

    console.error(
      'Forgot Password Send OTP Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        'Unable to send OTP. Please try again later.'

    });

  }

});



// =====================================================
// FORGOT PASSWORD — VERIFY OTP
// =====================================================

router.post('/verify-forgot-password-otp', async (req, res) => {

  console.log('FORGOT PASSWORD VERIFY OTP API HIT');

  try {

    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    if (!otp || !otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required.'
      });
    }

    const lowerEmail =
      email.trim().toLowerCase();

    const storedData =
      forgotPasswordOtps.get(lowerEmail);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message:
          'OTP expired or not found. Please request a new OTP.'
      });
    }

    // =================================================
    // OTP EXPIRY CHECK
    // =================================================

    if (Date.now() > storedData.expiresAt) {

      forgotPasswordOtps.delete(lowerEmail);

      return res.status(400).json({
        success: false,
        message:
          'OTP has expired. Please request a new OTP.'
      });
    }

    // =================================================
    // MAX ATTEMPTS
    // =================================================

    if (storedData.attempts >= 5) {

      forgotPasswordOtps.delete(lowerEmail);

      return res.status(429).json({
        success: false,
        message:
          'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    // =================================================
    // OTP CHECK
    // =================================================

    if (storedData.otp !== otp.trim()) {

      storedData.attempts += 1;

      return res.status(400).json({
        success: false,
        message:
          'Incorrect OTP. Please check your email and try again.'
      });
    }

    // =================================================
    // OTP VERIFIED
    // =================================================

    storedData.verified = true;

    forgotPasswordOtps.set(
      lowerEmail,
      storedData
    );

    console.log(
      'FORGOT PASSWORD OTP VERIFIED:',
      lowerEmail
    );

    return res.status(200).json({

      success: true,

      message:
        'OTP verified successfully.'

    });

  } catch (error) {

    console.error(
      'Forgot Password Verify OTP Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        'Unable to verify OTP. Please try again later.'

    });

  }

});


router.post('/reset-password', async (req, res) => {

  console.log('FORGOT PASSWORD RESET API HIT');

  try {

    const {
      email,
      newPassword
    } = req.body;

    // Email validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // Password validation
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: 'New password is required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 6 characters.'
      });
    }

    const lowerEmail =
      email.trim().toLowerCase();

    // Check OTP verification
    const storedData =
      forgotPasswordOtps.get(lowerEmail);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message:
          'Password reset session expired. Please request a new OTP.'
      });
    }

    if (!storedData.verified) {
      return res.status(400).json({
        success: false,
        message:
          'Please verify the OTP first.'
      });
    }

    // Find user
    const user =
      await User.findOne({
        email: lowerEmail
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'User account not found.'
      });
    }

    // Hash new password
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // Update password
    user.password =
      hashedPassword;

    await user.save();

    // Remove OTP after successful reset
    forgotPasswordOtps.delete(
      lowerEmail
    );

    console.log(
      'FORGOT PASSWORD UPDATED:',
      lowerEmail
    );

    return res.status(200).json({
      success: true,
      message:
        'Password updated successfully.'
    });

  } catch (error) {

    console.error(
      'Forgot Password Reset Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to update password. Please try again later.'
    });
  }

});

// const GOOGLE_CLIENT_ID =
//   process.env.GOOGLE_CLIENT_ID ||
//   '109325296562-runu0ib2cf6oofmanaa799kja67jg1os.apps.googleusercontent.com';

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const ADMIN_EMAIL = 'tanubanglore35@gmail.com';

// =====================================================
// USER SIGNUP
// =====================================================
console.log('SIGNUP ROUTE REGISTERED');

router.post('/signup', async (req, res) => {
      console.log('SIGNUP API HIT');


  try {

    const {
      name,
      email,
      password,
      phone,
      experience,
      role
    } = req.body;


    // Basic validation
    if (!name || !email || !password) {

      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      });

    }


    const lowerEmail =
      email.trim().toLowerCase();


    // Check existing user
    const existingUser =
      await User.findOne({
        email: lowerEmail
      });


    if (existingUser) {

      return res.status(400).json({
        success: false,
        message: 'This email is already registered.'
      });

    }


    // Password hash
    const hashedPassword =
      await bcrypt.hash(password, 10);


    // Create user
    const user =
      await User.create({

        name: name.trim(),

        email: lowerEmail,

        password: hashedPassword,

        phone: phone || '',

        experience:
          experience || 0,

        role:
          role || 'owner',

        status: 'pending'

      });


    return res.status(201).json({

      success: true,

      message:
        'Registration successful! Please wait for Admin approval.',

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        status: user.status

      }

    });


  } catch (error) {

    console.error(
      'Signup Error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Server error during registration.'

    });

  }

});



// =====================================================
// GET ALL USERS - ADMIN DASHBOARD
// =====================================================

router.get('/users', adminAuth, async (req, res) => {
  console.log('GET USERS API HIT');

  try {

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({

      success: true,

      users

    });

  } catch (error) {

    console.error(
      'Fetch Users Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: 'Failed to fetch users.'

    });

  }

});





// // =====================================================
// GET ALL APPROVED AGENTS - PUBLIC AGENT VIEW
// =====================================================

router.get('/approved-agents', async (req, res) => {

  console.log('GET APPROVED AGENTS API HIT');

  try {

    const agents = await User.find({
      status: 'approved'
    })
    .select('-password')
    .sort({ createdAt: -1 });

    return res.status(200).json({

      success: true,

      agents

    });

  } catch (error) {

    console.error(
      'Approved Agents Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: 'Failed to fetch approved agents.'

    });

  }

});


// =====================================================
// GET SINGLE APPROVED AGENT - PUBLIC PROFILE
// =====================================================

router.get('/approved-agents/:id', async (req, res) => {

  console.log(
    'GET APPROVED AGENT API HIT:',
    req.params.id
  );

  try {

    const agent = await User.findOne({

      _id: req.params.id,

      status: 'approved'

    })
    .select('-password');

    if (!agent) {

      return res.status(404).json({

        success: false,

        message: 'Approved agent not found.'

      });

    }

    return res.status(200).json({

      success: true,

      agent

    });

  } catch (error) {

    console.error(
      'Get Approved Agent Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: 'Failed to fetch agent profile.'

    });

  }

});



// =====================================================
// APPROVE USER / AGENT - ADMIN DASHBOARD
// =====================================================

router.put('/approve/:id', adminAuth, async (req, res) => {
  console.log(
    'APPROVE USER API HIT:',
    req.params.id
  );

  try {

    const user = await User.findById(
      req.params.id
    );

    if (!user) {

      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });

    }

    // APPROVE USER
    user.status = 'approved';

    await user.save();

    console.log(
      'USER STATUS AFTER APPROVAL:',
      user.status
    );

    return res.status(200).json({

      success: true,

      message:
        'Agent approved successfully.',

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        experience: user.experience,

        role: user.role,

        status: user.status

      }

    });

  } catch (error) {

    console.error(
      'Approve User Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        'Failed to approve agent.'

    });

  }

});


// =====================================================
// APPROVE USER / AGENT - ADMIN DASHBOARD
// =====================================================

router.put('/revoke/:id', adminAuth, async (req, res) => {
  console.log('REVOKE USER API HIT:', req.params.id);

  try {

    const user = await User.findById(req.params.id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });

    }

    user.status = 'pending';

    await user.save();

    console.log(
      'USER STATUS AFTER REVOKE:',
      user.status
    );

    return res.status(200).json({

      success: true,

      message: 'Agent approval revoked successfully.',

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }

    });

  } catch (error) {

    console.error(
      'Revoke User Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: 'Failed to revoke agent approval.'

    });

  }

});


// =====================================================
// DELETE USER / AGENT - ADMIN DASHBOARD
// =====================================================

router.delete('/delete/:id', adminAuth, async (req, res) => {
  console.log('DELETE USER API HIT:', req.params.id);

  try {

    const user = await User.findById(req.params.id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });

    }

    await User.findByIdAndDelete(req.params.id);

    console.log(
      'USER DELETED:',
      req.params.id
    );

    return res.status(200).json({

      success: true,

      message: 'Agent deleted successfully.',

      userId: req.params.id

    });

  } catch (error) {

    console.error(
      'Delete User Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: 'Failed to delete agent.'

    });

  }

});

// =====================================================
// CHECK USER STATUS - POST PROPERTY
// =====================================================

router.post('/check-status', async (req, res) => {

  console.log('CHECK USER STATUS API HIT');

  try {

    const { email } = req.body;

    if (!email) {

      return res.status(400).json({
        success: false,
        status: 'not_found',
        message: 'Email is required.'
      });

    }

    const lowerEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: lowerEmail
      });

    // USER NOT FOUND
    if (!user) {

      return res.status(200).json({

        success: true,

        status: 'not_found',

        message: 'User is not registered.'

      });

    }

    // USER PENDING
    if (user.status !== 'approved') {

      return res.status(200).json({

        success: true,

        status: 'pending',

        message: 'Your account is pending Admin approval.'

      });

    }

    // USER APPROVED
    const token =
      jwt.sign(

        {
          userId: user._id,
          email: user.email,
          role: user.role
        },

        process.env.JWT_SECRET,

        {
          expiresIn: '7d'
        }

      );

    return res.status(200).json({

      success: true,

      status: 'approved',

      token,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        role: user.role,

        status: user.status

      }

    });

  } catch (error) {

    console.error(
      'Check User Status Error:',
      error
    );

    return res.status(500).json({

      success: false,

      message: 'Server error while checking user status.'

    });

  }

});


// =====================================================
// USER LOGIN
// =====================================================

router.post('/login', async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message:
          'Email and password are required.'

      });

    }


    const lowerEmail =
      email.trim().toLowerCase();


    // Find user
    const user =
      await User.findOne({
        email: lowerEmail
      });


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          'User profile not found. Please register first.'

      });

    }


    // Check password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid email or password.'

      });

    }


    // Check approval
    if (
      user.status !== 'approved'
      &&
      user.role !== 'admin'
    ) {

      return res.status(403).json({

        success: false,

        message:
          'Your account is pending Admin approval.'

      });

    }


    // JWT
    const token =
      jwt.sign(

        {
          userId: user._id,
          email: user.email,
          role: user.role
        },

        process.env.JWT_SECRET,

        {
          expiresIn: '7d'
        }

      );


    return res.status(200).json({

      success: true,

      message: 'Login successful.',

      token,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        role: user.role,

        status: user.status

      }

    });


  } catch (error) {

    console.error(
      'Login Error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Server error during login.'

    });

  }

});


// =====================================================
// GOOGLE LOGIN - ADMIN
// =====================================================

router.get('/test-google-route', (req, res) => {
  res.json({
    success: true,
    message: 'Google route is working'
  });
});
console.log('GOOGLE LOGIN ROUTE REGISTERED');

router.post('/google-login', async (req, res) => {
  console.log('GOOGLE LOGIN API HIT');

  try {

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required.'
      });
    }

    // Google ID Token verify
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const googleEmail =
      payload.email.toLowerCase().trim();

    const googleName =
      payload.name || 'Admin';

    // =================================================
    // ONLY ADMIN GOOGLE ACCOUNT
    // =================================================

    if (googleEmail !== ADMIN_EMAIL) {

      return res.status(403).json({
        success: false,
        message: 'This Google account is not authorized as Admin.'
      });

    }

    // =================================================
    // FIND ADMIN IN MONGODB
    // =================================================

    let adminUser = await User.findOne({
      email: ADMIN_EMAIL
    });

    // Agar admin MongoDB me nahi hai to create karo
    if (!adminUser) {

adminUser = await User.create({

  name: googleName,

  email: ADMIN_EMAIL,

  password: await bcrypt.hash(
    `google_${Date.now()}_${Math.random()}`,
    10
  ),

  phone: '',

  experience: 0,

  role: 'admin',

  status: 'approved'

});



    } else {

      // Existing user ko admin ensure karo
      adminUser.role = 'admin';
      adminUser.status = 'approved';

      await adminUser.save();

    }

    // =================================================
    // CREATE JWT
    // =================================================

    const jwtToken = jwt.sign(

      {
        userId: adminUser._id,
        email: adminUser.email,
        role: 'admin'
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '7d'
      }

    );

    return res.status(200).json({

      success: true,

      message: 'Admin Google Login successful.',

      token: jwtToken,

      user: {

        id: adminUser._id,

        name: adminUser.name,

        email: adminUser.email,

        role: 'admin',

        status: 'approved'

      }

    });

  } catch (error) {

console.error('Google Login Error:', error);

  return res.status(401).json({
    success: false,
    message: 'Google login failed.',
    error: error.message
  });

  }

});


router.get('/verify-admin', adminAuth, async (req, res) => {
  return res.status(200).json({
    success: true,
    isAdmin: true,
    user: req.admin
  });
});

module.exports = router;