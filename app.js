const Koa = require('koa');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new KoaRouter();

function setRoute(method, path) {
  router[method](path, require(`./routes${path}`));
}

setRoute('post', '/query');
setRoute('get', '/teslafi');

app.use(bodyParser()).use(router.allowedMethods()).use(router.routes());
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
});