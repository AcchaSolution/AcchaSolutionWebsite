const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();



const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
// ➕ 1. Import your newly written promotion endpoints file here
const aiRoutes = require('./routes/aiRoutes'); // <-- AI Route Imported Safely
const propertyRoutes =
  require('./routes/propertyRoutes');

  const cloudinaryRoutes =
  require('./config/cloudinary');

const app = express();

// =====================================================
// MONGODB CONNECTION
// =====================================================
connectDB(); 

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(
  cors({
    origin:
      'http://localhost:4200',
      'https://acchasolution.com',
      'https://www.acchasolution.com',
    credentials: true
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



// =====================================================
// AUTH ROUTES & NEW PROMOTION ROUTES
// =====================================================
app.use('/api/auth', authRoutes);
console.log('AUTH ROUTES MOUNTED');

app.use('/api/ai', aiRoutes); // <-- AI Routes Mount ho gaye hain path: /api/ai/generate-description
console.log('AI SMART MODULE ROUTES MOUNTED');

// =====================================================
// PROPERTY ROUTES
// =====================================================
app.use(
  '/api/properties',
  propertyRoutes
);

console.log(
  'PROPERTY ROUTES MOUNTED'
);


// =====================================================
// CLOUDINARY IMAGE UPLOAD ROUTES
// =====================================================

app.use(
  '/api/upload',
  cloudinaryRoutes
);

console.log(
  'CLOUDINARY UPLOAD ROUTES MOUNTED'
);

// =====================================================
// TEST API
// =====================================================
app.get('/api/auth-test', (req, res) => {
  res.json({
    success: true,
    message: 'AUTH TEST WORKING'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AcchaSolution Backend is Running'
  });
});

// =====================================================
// SERVER
// =====================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
