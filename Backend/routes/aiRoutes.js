const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// 🟢 Dono dynamic validation endpoints safely mount ho rahe hain
router.post('/generate-description', aiController.generatePropertyDescription);
router.post('/smart-search', aiController.smartSearchParser);

module.exports = router;
