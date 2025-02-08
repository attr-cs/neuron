const userRouter = require('./user');
const chatRouter = require('./chat');
const postRouter = require('./post');

const router = require('express').Router();

router.use('/user',userRouter);
router.use('/chat', chatRouter);
router.use('/post', postRouter);

module.exports = router;