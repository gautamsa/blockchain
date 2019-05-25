const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const BlockChain = require('./blockchain');
const PubSub = require('./pubsub');

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS =  `http://localhost:${DEFAULT_PORT}`;

const app = express();

const blockchain = new BlockChain();
//console.log('message',blockchain);
const pubsub = new PubSub({ blockchain });

//setTimeout(() => pubsub.broadcastchain(), 1000);

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

const syncChains = () => {
    request({ url : `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if(!error && response.statusCode == 200) {
            const rootNode = JSON.parse(body);
            console.log('replace chain on a sync with', rootNode);
            blockchain.replaceChain(rootNode);
        }
    });
}
let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listning at localhost:${PORT}`);
    if(PORT !== DEFAULT_PORT) {
        syncChains();
    }
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });
    pubsub.broadcastchain();
    res.redirect('/api/blocks');
});

