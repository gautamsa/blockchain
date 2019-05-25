const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain) {

        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }
        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        console.log('replacing chain with', chain);
        this.chain = chain;
    }

    static isValidChain(chain) {
        if (chain != undefined && chain.length > 0 && JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;
        for (let i = 1; i < chain.length; i++){
            const block = chain[i];
            const actualLastHash = chain[i - 1].hash;
            const lastDifficulty = chain[i - 1].difficulty;
            const {timestamp, lasthash, hash, nonce, difficulty, data} = block;

            if(lasthash !== actualLastHash) return false;
            if (Math.abs(lastDifficulty - difficulty) > 1) return false;
            const validHash = cryptoHash(timestamp, lasthash, data, nonce, difficulty);

            if (validHash !== hash) return false;
        }
        return true;
    }
}

module.exports = Blockchain;