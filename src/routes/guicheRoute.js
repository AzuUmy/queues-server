const Router = require('koa-router');
const getGuicheModel = require('../schema/guiche');
const router = new Router();

router.get('/guiche', async (ctx) => {
    try {
        const collectionName = 'Guiche';
        const G = getGuicheModel(collectionName);
        const g = await G.find({});
        ctx.body = { status: 'Success', data: g};
    }catch (err) {
        ctx.status = 500;
        ctx.body = {status: 'error', message: 'internal Server Error'};
    }
});

module.exports = router;


