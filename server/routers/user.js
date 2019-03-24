const router = require('koa-router')();
const userController = require('../controllers/user');

const routers = router
  .post('/user/signin', userController.signIn)
  .get('/user/info', userController.getUserInfo)
  .post('/user/signup', userController.signUp)

module.exports = routers;