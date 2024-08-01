const getOnCallModel = require ('../schema/onCallSchema');
const Router = require('koa-router');
const WebSocket = require('ws');

module.exports = (wss) => {
        const router = new Router();

        router.post('/initCall',  async (ctx) => {
            const {guiche, senha, info, atendente, callStart} = ctx.request.body;
            const collectionName = "Oncalling";
            const onCallingInfo = getOnCallModel(collectionName);

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



        });


        router.get('/ongoingCall', async (ctx) => {
                try {
                        const {atendente, senha, guiche} = ctx.query;
                        const collectionName = 'Oncalling';
                        const curretOngoingCall = getOnCallModel(collectionName);
                        const ongoingCall = await curretOngoingCall.findOne({atendente, guiche, senha});
                        ctx.body = { status: 'success', data: ongoingCall };
                        console.log(ongoingCall);
                } catch (error){
                    console.log("error featching data", error);
                    ctx.status = 400;
                    ctx.body = {status: 'error', message: 'internal Server Error', error};
                }
        })

        return router;
}