const axios = require('axios');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new KoaRouter();

router.get('/hello', async (ctx) => {
  ctx.body = 'hello world';
});

router.post('/query', async (ctx) => {
  const { header: { authorization }, query: { url }, request: { body: payload } } = ctx;
  const { data } = await axios.post(url + '/api/ds/query', payload, { headers: { Authorization: authorization } });
  ctx.body = data;
});

app.use(bodyParser()).use(router.allowedMethods()).use(router.routes());
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
});