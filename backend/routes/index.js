const userRouter = require('./user');
const chatRouter = require('./chat');
const postRouter = require('./post');
const reportRouter = require('./report');
const testRouter = require('./test');
const notificationRouter = require('./notification');

const router = require('express').Router();

router.use('/user',userRouter);
router.use('/chat', chatRouter);
router.use('/post', postRouter);
router.use('/report', reportRouter);
router.use('/test', testRouter);
router.use('/notification', notificationRouter);

module.exports = router;