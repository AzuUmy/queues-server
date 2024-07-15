const getSenhaModel = require('../schema/senha');
const Router = require('koa-router');
const WebSocket = require('ws');

const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

module.exports = (wss) => {
    const router = new Router();

    router.post('/senha', async (ctx) => {
        const { senha, time, info } = ctx.request.body;
        const collectionName = `senhas_${getCurrentDate()}`;
        const Senha = getSenhaModel(collectionName);

        if (typeof senha === 'number' && typeof time === 'string') {
            try {
                const newSenha = new Senha({ senha, time, info });
                await newSenha.save();
                console.log('Saved to MongoDB:', newSenha);
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'Regular', status: 'success', data: newSenha }));
                    }
                });

                ctx.body = { status: 'success', data: newSenha };
            } catch (err) {
                console.error('Error saving to MongoDB:', err);
                ctx.status = 500;
                ctx.body = { status: 'error', message: 'Server error' };
            }
        } else {
            ctx.status = 400;
            ctx.body = { status: 'error', message: 'Invalid data format' };
        }
    });

    router.get('/senhas', async (ctx) => {
        try {
            const collectionName = `senhas_${getCurrentDate()}`;
            const Senha = getSenhaModel(collectionName);
            const senhas = await Senha.find({});
            ctx.body = { status: 'success', data: senhas };
        } catch (err) {
            console.error('Error fetching senhas:', err);
            ctx.status = 500;
            ctx.body = { status: 'error', message: 'Server error' };
        }
    });

    router.delete('/Pickedsenha/:senha', async (ctx) => {
        const { senha } = ctx.params;
    
        try {
            const collectionName = `senhas_${getCurrentDate()}`;
            const Senha = getSenhaModel(collectionName);
    
            const deletedSenha = await Senha.findOneAndDelete({ senha: parseInt(senha) });
    
            if (deletedSenha) {
                console.log('Deleted from MongoDB:', deletedSenha);
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'Regular', status: 'success', data: deletedSenha }));
                    }
                });
                ctx.body = { status: 'success', data: deletedSenha };
            } else {
                ctx.status = 404;
                ctx.body = { status: 'error', message: 'Senha not found' };
            }
        } catch (err) {
            console.error('Error deleting senha:', err);
            ctx.status = 500;
            ctx.body = { status: 'error', message: 'Server error' };
        }
    });


    return router;
};