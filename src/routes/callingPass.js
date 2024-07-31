const getCallingModel = require('../schema/onCall');
const Router = require('koa-router');
const WebSocket = require('ws');

module.exports = (wss) => {
    const router = new Router();

    router.post('/calling', async (ctx) => {

        const { guiche, senha, info, atendente, callStart } = ctx.request.body;
        const collectionName = "currentCalling";
        const callingInfo = getCallingModel(collectionName);

        try{
            const newCalling = new callingInfo({ guiche, senha, info, atendente, callStart });
            await newCalling.save();
            ctx.body = {status: 'succes', data: newCalling };

            wss.clients.forEach( clients => {
                    if(clients.readyState === WebSocket.OPEN) {
                        clients.send(JSON.stringify({ type: 'Call', status: 'success', data: newCalling }));
                    }
            });
        } catch (err){
            console.log("erro", err);
            ctx.status = 500;
            ctx.body = { status: 'error', message: 'Server error' };
        }
    });

    router.get('/calling', async (ctx) => {
        try {
            const { atendente, guiche } = ctx.query;
            const collectionName = 'currentCalling';
            const currentCallingS = getCallingModel(collectionName);
            const currentCSenha = await currentCallingS.find({ atendente, guiche });
            ctx.body = { status: 'success', data: currentCSenha };
        } catch (err){
            ctx.status = 500;
            ctx.body = {status: 'error', message: 'internal Server Error'};
        }
    });



    router.get('/currentCalling', async (ctx) => {
        try {
            const collectionName = 'currentCalling';
            const curretnCallingAll = getCallingModel(collectionName);
            const currentCallFromAll = await curretnCallingAll.find({});
            ctx.body = {status: 'success', data:  currentCallFromAll };
        } catch (error){
            ctx.status = 500;
            ctx.body = {status: 'error', message: 'internal Server Error'};
        }
    });

    router.delete('/deleteCall/:senha/:guiche/:atendente', async (ctx) => {
        const { senha, guiche, atendente } = ctx.params;

        try {
            const collectionName = 'currentCalling';
            const calledSenha = getCallingModel(collectionName);

            const deleteCalledSenha = await calledSenha.findOneAndDelete({senha: parseInt(senha), guiche, atendente });

         if(deleteCalledSenha) {
            console.log("Deleting current",  senha,  "call from", atendente, guiche);
            wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({ type: 'Delete', status: 'success', data: deleteCalledSenha}));
                }
            });
            ctx.body = { status: 'success', data: deleteCalledSenha };
         }   else{
            ctx.body = { status: 'error', message: 'senha not founded'}
         }

        } catch (err){
            ctx.status = 500;
            ctx.body = {status: 'error', message: 'error', err}

        }
    });

    return router;

}