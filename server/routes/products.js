const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Products landing page' });
});

module.exports = router;