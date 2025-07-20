const { consumeMessages } = require('../services/queue.service');
const Person = require('../models/Person');
const Order = require('../models/Order');
const connectDB = require('../config/db.config');

const handleMessage = async (message) => {
  try {
    console.log(`[x] Received message: ${JSON.stringify(message)}`);
    switch (message.type) {
      case 'CREATE_PERSON':
        console.log(`[x] Handling CREATE_PERSON with payload: ${JSON.stringify(message.payload)}`);
        try {
          const person = new Person(message.payload);
          await person.save();
          console.log(`[x] Person created: ${JSON.stringify(person)}`);
        } catch (err) {
          console.error(`[x] Error creating person: ${err.message}`);
        }
        break;
        
      case 'CREATE_ORDER':
        console.log(`[x] Handling CREATE_ORDER with payload: ${JSON.stringify(message.payload)}`);
        try {
          const order = new Order(message.payload);
          console.log(order)
          await order.save();
          console.log(`[x] Order created: ${JSON.stringify(order)}`);
        } catch (err) {
          console.error(`[x] Error creating order: ${err.message}`);
          break;
        }

        // Update person's totalSpent and visitCount
        try {
          const order = new Order(message.payload);
          const personId = order.personId;
    
          console.log(`[x] Fetching person with ID: ${personId}`);
          const personObj = await Person.findById(personId);
          if (personObj) {
            console.log(`[x] Person found: ${JSON.stringify(personObj)}`);
            personObj.totalSpent += order.amount;
            personObj.visitCount += 1;
            personObj.lastVisit = new Date();
            await personObj.save();
            console.log(`[x] Person updated: ${JSON.stringify(personObj)}`);
          } else {
            console.error(`[x] Person with ID ${personId} not found`);
          }
        } catch (err) {
          console.error(`[x] Error updating person: ${err.message}`);
        }
        break;
        
      case 'UPDATE_COMMUNICATION_LOG':
        // No operation for this case
        break;
        
      default:
        console.log(`[x] Unhandled message type: ${message.type}`);
    }
  } catch (err) {
    console.error(`[x] Error handling message: ${err.message}`);
  }
};

const startConsumer = async () => {
  try {
    console.log('[x] Connecting to database...');
    await connectDB();
    console.log('[x] Connected to database');
    console.log('[x] Starting to consume messages...');
    consumeMessages(handleMessage);
  } catch (err) {
    console.error(`[x] Error starting consumer: ${err.message}`);
  }
};

startConsumer();
