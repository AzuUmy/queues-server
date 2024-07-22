const Router = require('koa-router');
const WebSocket = require('ws');
const getOnlineUserSchema = require('../schema/onlineUser');


module.exports = (wss) => {

    const router = new Router();

    router.post('/userStatus', async (ctx) => {
        const { guiche, atendente, status } = ctx.request.body;
        const collectionName = 'user-status';
        const userStatus = getOnlineUserSchema(collectionName);

            try {
                const onlineUserInfo = new userStatus({ guiche, atendente, status});
                await onlineUserInfo.save();
                wss.clients.forEach(client => {
                    if(client.readyState === WebSocket.OPEN){
                        client.send(JSON.stringify({ type: 'user-status', status: 'success', data: onlineUserInfo }));
                    }
                });
                ctx.body = { status: 'sucess', data: onlineUserInfo };
            } catch (err) {
                console.log("error setting status", err);
                ctx.status = 500;
                ctx.body = {status: err};
            }
             
       
    });

    router.get('/getOnlineUsers', async (ctx) => {
        try {
            const collectionName = 'user-status';
            const activeUsers = getOnlineUserSchema(collectionName);
            const onlineUsers = await activeUsers.find({});
            ctx.body = {status: 'sucess', data: onlineUsers }
        } catch (err){
            ctx.status = 500;
            ctx.body = { status: err };
        }
       
    });

    return router;
};



