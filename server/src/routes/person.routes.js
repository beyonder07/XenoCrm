const express = require('express');
const router = express.Router();
const personController = require('../controllers/customer.controller');

router.post('/', personController.createPerson);

module.exports = router;