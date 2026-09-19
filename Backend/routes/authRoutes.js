
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();
console.log('AUTH ROUTES LOADED');

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