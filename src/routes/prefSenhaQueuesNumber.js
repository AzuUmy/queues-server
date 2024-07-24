const WebSocket = require('ws');
const getPrefModel = require('../schema/preferencialSenha');
const Router = require('koa-router');
const getPreferencialModel = require('../schema/preferencialSenha');


const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};


module.exports = (wss) => {
    const router = new Router();

    router.post('/prefe', async (ctx) =>  {
        const {senha, time, info} = ctx.request.body;
        const collectionName = `preferencial_${getCurrentDate()}`
        const Senha = getPrefModel(collectionName);
    
        if(typeof senha === 'number' && typeof time === 'string'){
            try {
                const newPref = new Senha({senha, time, info});
                await newPref.save();
    
                console.log("Saved to database", newPref);
    
                wss.clients.forEach(client => {
                    if(client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({type: 'Preferencial',  status: 'success', data: newPref }));
                    }
                });
    
                ctx.body = { status: 'success', data: newPref };
    
            }catch (err) {
                console.error('Error saving to MongoDB:', err);
                ctx.status = 500;
                ctx.body = {status: 'error', message: 'invalid format'};
            }
        }
    });
    
    router.get('/prefe', async (ctx) => {
        try {
            const collectionName = `preferencial_${getCurrentDate()}`;
            const Senha = getPrefModel(collectionName);
            const senha = await Senha.find({});
            ctx.body = { status: 'Success', data: senha };
        } catch (err) {
            console.log(err);
            ctx.status = 500;
            ctx.body = {status: 'error', message: 'internal Server Error'};
        }
    });

    router.delete('/pickedPrefSenha/:senha', async (ctx) => {
        const { senha } =  ctx.params;

        try {
          const  collectionName = `preferencial_${getCurrentDate()}`;
          const Senha = getPreferencialModel(collectionName);

          const deleteSenha = await Senha.findOneAndDelete({senha: parseInt(senha) });

          if(deleteSenha){
            
            wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN) {
                    
                    client.send(JSON.stringify({ type: 'DeletePref', status: 'success', data: deleteSenha }));
                }
            });
            console.log('deleting pref senha')
            ctx.body = {status: 'Sucess', data: deleteSenha};
          }
     } catch(error) {
        console.log(error);
        ctx.status = 404
        ctx.body = {status: error};
     }

    });
    
    return router;
}
