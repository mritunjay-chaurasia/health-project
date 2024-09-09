const { Router } = require("express");
const userRouter = Router();
const {login, register,getUserById} = require('../controller/user.controller.js');


userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/getUserById', getUserById);



module.exports = userRouter;