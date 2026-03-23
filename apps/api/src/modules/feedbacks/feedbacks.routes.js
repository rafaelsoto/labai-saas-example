const { Router } = require('express');
const feedbacksController = require('./feedbacks.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/', feedbacksController.list);
router.patch('/read-all', feedbacksController.markAllAsRead);
router.get('/:id', feedbacksController.getById);
router.patch('/:id/read', feedbacksController.markAsRead);
router.delete('/:id', feedbacksController.del);

module.exports = router;
