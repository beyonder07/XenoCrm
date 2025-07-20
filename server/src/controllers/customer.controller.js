const Person = require('../models/Person');
const { publishMessage } = require('../services/queue.service');
const { body, validationResult } = require('express-validator');

exports.createPerson = async (req, res) => {
  try {
    console.log('[x] Received request to create person with data:', req.body);

    // Validation rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[x] Validation error:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, contactEmail } = req.body;

    // Check for fullName and contactEmail fields
    if (!fullName || !contactEmail) {
      return res.status(400).json({ error: 'Full name and contact email are required' });
    }

    // Check for valid email format
    if (!/^\S+@\S+\.\S+$/.test(contactEmail)) {
      return res.status(400).json({ error: 'Contact email must be a valid email address' });
    }

    const person = new Person({ fullName, contactEmail });
    console.log('[x] Person object created:', person);

    await publishMessage({ type: 'CREATE_PERSON', payload: person });
    console.log('[x] Message published to queue:', { type: 'CREATE_PERSON', payload: person });

    res.status(201).json(person);
    console.log('[x] Response sent to client with status 201:', person);
  } catch (err) {
    console.error('[x] Error creating person:', err);
    res.status(400).json({ error: err.message });
  }
};

// Validation middleware
exports.validateCreatePerson = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('contactEmail').notEmpty().withMessage('Contact email is required').isEmail().withMessage('Contact email must be a valid email address'),
];
