const express = require('express');
const { createActor, updateActor, removeActor, searchActors, getLatestActors, getSingleActor } = require('../controllers/actor');
const { uploadImage } = require('../middlewares/multer');
const { actorInfoValidator, validate } = require('../middlewares/validator');
const { isAuth, isAdmin } = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/create',
  isAuth,
  isAdmin,
  uploadImage.single('avatar'),
  actorInfoValidator,
  validate,
  createActor,
);

router.post(
  '/update/:actorId',
  isAuth,
  isAdmin,
  uploadImage.single('avatar'),
  actorInfoValidator,
  validate,
  updateActor,
);

router.delete('/:actorId', isAuth, isAdmin, removeActor);

router.get('/search', isAuth, isAdmin, searchActors);

router.get('/latest-uploads', isAuth, isAdmin, getLatestActors);

router.get('/single/:id', getSingleActor);

module.exports = router;