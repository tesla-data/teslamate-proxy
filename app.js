const Koa = require('koa');
const KoaRouter = require('koa-router');

const app = new Koa();
const router = new KoaRouter();

router.get('/hello', async (ctx) => {
  ctx.body = 'hello world';
});

router.post('/query', async (ctx) => {
  ctx.body = { foo: 1 };
});

app.use(router.allowedMethods()).use(router.routes());
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
});