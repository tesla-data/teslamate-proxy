const Koa = require('koa');
const gzip = require('koa-gzip');
const cors = require('@koa/cors');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new KoaRouter();

function setRoute(method, path) {
  router[method](path, require(`./routes${path}`));
}

router.get('/j/:id', require('./routes/short_url'));

setRoute('get', '/list_vehicles');
setRoute('post', '/query');
setRoute('get', '/home_data');
setRoute('get', '/projected_range');
setRoute('get', '/updates');
setRoute('get', '/charges');
setRoute('get', '/charge_detail');
setRoute('get', '/teslafi');
setRoute('get', '/positions');
setRoute('get', '/drives');
setRoute('get', '/drive_detail');
setRoute('get', '/stats');
setRoute('get', '/stats_detail');

setRoute('get', '/share/get');
setRoute('get', '/share/trip');
setRoute('get', '/share/drive');
setRoute('get', '/share/charge');

app.use(gzip()).use(cors()).use(bodyParser()).use(router.allowedMethods()).use(router.routes());
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
});