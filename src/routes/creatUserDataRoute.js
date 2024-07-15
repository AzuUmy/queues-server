const Router = require('koa-router');
const getUserModel = require('../schema/userAccount');
const router = new Router();

router.post('/newAccount', async (ctx) => {
    const {nome, email, matricula, senha, guiche } = ctx.request.body;
    const collectionName = "Users";
    const userInfo = getUserModel(collectionName);

    if (typeof email === 'string' && typeof senha === 'string') {  // Fix type checking
        try {
            const newUser = new userInfo({ nome, email, matricula, senha, guiche });
            await newUser.save();
            console.log("User saved into database", newUser);
            ctx.body = { status: 'success', data: newUser };
        } catch (err) {
            console.error("Error saving user", err);
            ctx.status = 500;
            ctx.body = { status: 'error', message: 'Invalid user data' };
        }
    } else {
        ctx.status = 400;
        ctx.body = { status: 'error', message: 'Invalid input data' };
    }
});

router.get('/loginUser', async (ctx) =>{
    try {
        const collectionName = 'Users';
        const user = getUserModel(collectionName);
        const us = await user.find({});
        ctx.body =  { us};
    } catch (error){
        ctx.status = 500;
        ctx.body = {status: 'error', message: 'internal Server Error'};
    }
})

module.exports = router;