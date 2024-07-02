const http = require('http');
const WebSocket = require('ws');
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
const getSenhaModel = require('../schema/senha');
const getPreferencialModel = require('../schema/preferencialSenha');
const cors = require('@koa/cors');
const { type } = require('os');
const url = 'mongodb://localhost:27017/Fila';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected successfully to MongoDB server'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = new Koa();
const router = new Router();

app.use(bodyParser());

// Apply CORS middleware
app.use(cors());

const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

// POST endpoint to save senha
router.post('/senha', async (ctx) => {
    const { senha, time, info } = ctx.request.body;
    const collectionName = `senhas_${getCurrentDate()}`;
    const Senha = getSenhaModel(collectionName);

    if (typeof senha === 'number' && typeof time === 'string') {
        try {
            const newSenha = new Senha({ senha, time, info });
            await newSenha.save();
            console.log('Saved to MongoDB:', newSenha);

            // WebSocket broadcast to notify clients of new data
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({type: 'Regular', status: 'success', data: newSenha }));
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


router.post('/prefe', async (ctx) =>  {
    const {senha, time, info} = ctx.request.body;
    const collectionName = `preferencial_${getCurrentDate()}`
    const Senha = getPreferencialModel(collectionName);

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
            ctx.status = 400;
            ctx.body = {status: 'error', message: 'invalid format'};
        }
    }
});

router.get("/prefe", async (ctx) => {
    try {
        const collectionName = `preferencial_${getCurrentDate()}`;
        const Senha = getPreferencialModel(collectionName);
        const senha = await Senha.find({});
        ctx.body = { status: 'Success', data: senha };
    } catch (err) {
        ctx.status = 500;
        ctx.body = {status: 'error', message: 'internal Server Error'};
    }
});


app.use(router.routes());
app.use(router.allowedMethods());

const server = http.createServer(app.callback());

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
        console.log(`Received message: ${message}`);
        try {
            const data = JSON.parse(message);
            const { senha, time, info, type } = data;
            let collectionName, SenhaModel;

            if(type === 'Regular'){
                collectionName = `senhas_${getCurrentDate()}`;
                SenhaModel = getSenhaModel(collectionName);
            }else if(type === 'Preferencial'){
                 collectionName = `preferencial_${getCurrentDate()}`;
                 SenhaModel = getPreferencialModel(collectionName);
            }else{
                ws.send(JSON.stringify({ status: 'error', message: 'Invalid type' }));
                return;
            }


            if (typeof senha === 'number' && typeof time === 'string') {
                const newSenha = new SenhaModel({ senha, time, info });
                await newSenha.save();
                console.log('Saved to MongoDB:', newSenha);

                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type, status: 'success', data: newSenha }));
                    }
                });
            } else {
                ws.send(JSON.stringify({ status: 'error', message: 'Invalid data format' }));
            }

           
        } catch (err) {
            console.error('Error handling message:', err);
            ws.send(JSON.stringify({ status: 'error', message: 'Server error' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const port = 8080;
server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});