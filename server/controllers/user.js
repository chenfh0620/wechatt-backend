const userInfoService = require('../services/user');
const userCode = require('../codes/user');

module.exports = {

  /**
   *
   * 登录
   * @param {object} ctx
   */
  async signIn(ctx) {
    let fromData = ctx.request.body;
    let result = {
      message: '',
      data: null,
      code: ''
    };
    let userResult = await userInfoService.signIn(fromData);
    if (userResult) {
      if (fromData.password === userResult.password) {
        result.code = 0;
        result.data = userResult;
      } else {
        result.message = userCode.FAIL_USER_NAME_OR_PASSWORD_ERROR;
        result.code = -1;
      }
    } else {
      result.code = -1;
      result.message = userCode.FAIL_USER_NO_EXIST;
    }
    if (result.code === 0) {
      let session = ctx.session;
      session.isLogin = true;
      session.userName = userResult.name;
      session.userId = userResult.id;
    }
    ctx.body = result;
  },

  /**
   *
   * 注册
   * @param {object} ctx
   * @returns
   */
  async signUp(ctx) {
    let fromData = ctx.request.body;
    let result = {
      message: '',
      data: null,
      code: -1
    };
    let validateResult = userInfoService.validatorSignUp(fromData);

    if (validateResult.success === false) {
      result = validateResult;
      ctx.body = result;
      return;
    }

    let existOne = await userInfoService.getExistOne(fromData);
    if (existOne) {
      if (existOne.name === fromData.userName) {
        result.message = userCode.FAIL_EMAIL_IS_EXIST;
        ctx.body = result;
        return;
      }
      if (existOne.email === fromData.email) {
        result.message = userCode.FAIL_EMAIL_IS_EXIST;
        ctx.body = result;
      }
    }

    let userResult = await userInfoService.create({
      email: fromData.email,
      password: fromData.password,
      name: fromData.userName,
      create_time: new Date().getTime(),
      level: 1
    });

    if (userResult && userResult.insertId * 1 > 0) {
      result.code = 0;
    } else {
      result.message = userCode.ERROR_SYS;
    }
    ctx.body = result;
  },
  

  /**
   * 获取用户信息
   *
   * @param {*} ctx
   */
  async getUserInfo(ctx) {
    let session = ctx.session;
    let isLogin = session.isLogin;
    let userName = session.userName;

    let result = {
      code: -1,
      message: '',
      data: null
    };

    if (isLogin === true && userName) {
      let userInfo = await userInfoService.getUserInfoByUserName(userName);
      if (userInfo) {
        result.data = userInfo;
        result.code = 0;
      } else {
        result.message = userCode.FAIL_USER_NO_LOGIN;
      }
    } else {
      // TODO
    }
    ctx.body = result;
  },


  /**
   * 检查用户是否登录
   *
   * @param {*} ctx
   * @returns
   */
  validateLogin(ctx) {
    let result = {
      code: -1,
      data: null,
      message: ''
    };
    let session = ctx.session;
    if (session && session.isLogin === true) {
      result.code = 0;
      result.message = '';
    }
    return result;
  }
}