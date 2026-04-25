const express = require('express');
const router = express.Router();
const controller = require('../controllers/alertController');
const { auth } = require('../middlewares/auth');

router.use(auth);

// Messages
router.get('/messages/stats', controller.getStats);
router.get('/messages/unread-count', controller.getUnreadCount);
router.put('/messages/:id/handle', controller.handle);
router.put('/messages/:id/read', controller.markRead);
router.get('/messages', controller.getMessages);

// Rules
router.get('/rules', controller.getRules);
router.post('/rules', controller.createRule);
router.put('/rules/:id', controller.updateRule);
router.delete('/rules/:id', controller.deleteRule);

module.exports = router;
