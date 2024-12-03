const userRouter = require('./user');
const chatRouter = require('./chat');
const router = require('express').Router();

router.use('/user',userRouter);
router.use('/chat', chatRouter);

module.exports = router;