const hexToBinary = require('hex-to-binary');
const {GENESIS_DATA, MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');

class Block {
    constructor({ timestamp, data, hash, lasthash, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.lasthash = lasthash;
        this.nonce = nonce;
        this.difficulty = difficulty;
  }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({lastBlock, data}) {
        const lasthash = lastBlock.hash;
        let hash, timestamp;
        let { difficulty } = lastBlock;
        let nonce = 0;
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({orignalBlock: lastBlock, timestamp})
            hash = cryptoHash(timestamp, lasthash, data, nonce, difficulty);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
        return new this({ timestamp, lasthash, data, difficulty, nonce, hash });
    }

    static adjustDifficulty({orignalBlock, timestamp}) {
        const {difficulty} = orignalBlock;

        if(difficulty < 1) return 1;

        if ((timestamp - orignalBlock.timestamp) > MINE_RATE) return difficulty - 1;
        return difficulty + 1;
    }
}

module.exports = Block;