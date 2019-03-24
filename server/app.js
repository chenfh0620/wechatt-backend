const path = require('path');
const Koa = require('koa');
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const KoaLogger = require('koa-logger');
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const WebSocket = require('koa-websocket');

const config = require('../config');
const router = require('./routers/index');

// 实例化websocket
const app = WebSocket(new Koa());

app.ws.use((ctx, next) => {
  ctxs.push(ctx);
  console.log(ctxs);
  ctx.websocket.on('message', (message) => {
    console.log('message', message);
    const len = ctxs.length;
    for (let i = 0; i < len; i++) {
      if (ctx === ctxs[i]) continue;
      ctxs[i].websocket.send(message);
    }
  });
  ctx.websocket.on('close', (message) => {
    let index = ctxs.indexOf(ctx);
    ctxs.splice(index, 1);
  });
});

// session存储配置
const sessionMysqlConfig = {
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  host: config.database.HOST
};

// 配置session中间件
app.use(session({
  key: 'CHENFH',
  store: new MysqlStore(sessionMysqlConfig)
}));

// 配置控制台日志中间件
app.use(KoaLogger());

// 配置body解析中间件
app.use(bodyParser());

// 配置静态资源加载中间件
app.use(koaStatic(
  path.join(__dirname, './../static')
));

// 设置跨域
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "http://localhost:8080");
  ctx.set("Access-Control-Allow-Credentials", "true");
  ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
  ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type");
  console.log(ctx.session);
  await next();
});

// 初始化路由中间件
app.use(router.routes()).use(router.allowedMethods());

// 监听启动端口
app.listen(config.port, () => {
  console.log(`项目已在${config.port}端口启动`);
});