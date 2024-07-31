const getOnCallModel = require ('../schema/onCallSchema');
const Router = require('koa-router');
const WebSocket = require('ws');

module.exports = (wss) => {
        const router = new Router();

        router.post('/initCall',  async (ctx) => {

            try {
                const newOnCalling  = new onCallingInfo({ guiche, senha, info, atendente, callStart });
                await newOnCalling.save();

                wss.clients.forEach(client => {
                    if(client.readyState === WebSocket.OPEN){
                        client.send(JSON.stringify({ type: 'OnCallInit', status: 'success', data: newOnCalling }));
                    }
                })
                ctx.body = { status: 'Data saved sucessfully', data: newOnCalling }
            } catch (erro) {
                ctx.body = {status: 'Server error', erro};
                ctx.status = 500;
                console.log('error', erro);
            }
            const {guiche, senha, info, atendente, callStart} = ctx.request.body;
            const collectionName = "Oncalling";

            const onCallingInfo = getOnCallModel(collectionName);

        });

        return router;
}