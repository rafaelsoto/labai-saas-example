const { Router } = require('express');
const projectsController = require('./projects.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { createProjectSchema, updateProjectSchema } = require('./projects.validation');

const router = Router();

router.use(authMiddleware);

router.get('/', projectsController.list);
router.post('/', validate(createProjectSchema), projectsController.create);
router.get('/:id', projectsController.getById);
router.put('/:id', validate(updateProjectSchema), projectsController.update);
router.delete('/:id', projectsController.del);
router.post('/:id/regenerate-key', projectsController.regenerateApiKey);

module.exports = router;
