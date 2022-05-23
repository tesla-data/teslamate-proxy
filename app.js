const Koa = require('koa');
const cors = require('@koa/cors');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new KoaRouter();

function setRoute(method, path) {
  router[method](path, require(`./routes${path}`));
}

setRoute('post', '/query');
setRoute('get', '/home_data');
setRoute('get', '/projected_range');
setRoute('get', '/updates');
setRoute('get', '/charges');
setRoute('get', '/teslafi');

app.use(cors()).use(bodyParser()).use(router.allowedMethods()).use(router.routes());
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
});