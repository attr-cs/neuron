const userRouter = require('./user');
const router = require('express').Router();

router.use('/user',userRouter);

module.exports = router;