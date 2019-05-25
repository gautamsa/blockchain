const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
};

class PubSub {
    constructor({ blockchain }) {
        this.blockchain = blockchain;
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();
        //this.subscriber.subscribe(CHANNELS.TEST);
        //this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);
        this.subscribToChannels();
        this.subscriber.on("message", (channel, message) => this.handleMessage(channel, message));
    }

    handleMessage(channel, message) {
        console.log(`Message Received. Channel: ${channel}. Message: ${message}`);
        const parse = JSON.parse(message);

        if(channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parse);
        }
    }

    subscribToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }

    publish({ channel, message }) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });
    }

    broadcastchain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }
}

//const testPubSub = new PubSub();

//const subscriber = redis.createClient();
//subscriber.subscribe(CHANNELS.TEST);
//subscriber.on("message", (channel, message) => testPubSub.handleMessage(channel, message));
/*const publisher = redis.createClient();
console.log(testPubSub instanceof PubSub);
setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, "loo"), 1000);*/

module.exports = PubSub;