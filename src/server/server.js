const http = require('http');
const WebSocket = require('ws');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
const cors = require('@koa/cors');
const creatSenhaRouter = require('../routes/generateQueuesNumbe');
const createPrefRoute = require('../routes/prefSenhaQueuesNumber');
const guicheRoute = require('../routes/guicheRoute');
const newUserRoute = require('../routes/creatUserDataRoute');
const creatCurrentCalling = require('../routes/callingPass');
const url = 'mongodb://localhost:27017/Fila';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected successfully to MongoDB server'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = new Koa();
app.use(bodyParser());
app.use(cors());

const server = http.createServer(app.callback());

const wss = new WebSocket.Server({ server });

const senhaRouter = creatSenhaRouter(wss);
const prefRouter = createPrefRoute(wss);
const callingPass = creatCurrentCalling(wss);

app.use(senhaRouter.routes()).use(senhaRouter.allowedMethods());
app.use(prefRouter.routes()).use(prefRouter.allowedMethods());
app.use(guicheRoute.routes()).use(guicheRoute.allowedMethods());
app.use(newUserRoute.routes()).use(newUserRoute.allowedMethods());
app.use(callingPass.routes()).use(callingPass.allowedMethods());


wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
        console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


const port = 8080;
server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});