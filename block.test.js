const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const { GENESIS_DATA, MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const timestamp = 2000;
    const lasthash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({ timestamp, lasthash, hash, data, difficulty, nonce});

    it('has a timestamp, lasthash, hash and data', ()=>{
        expect(block.timestamp).toEqual(timestamp);
        expect(block.data).toEqual(data);
        expect(block.hash).toEqual(hash);
        expect(block.lasthash).toEqual(lasthash);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(true);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();
        it('return a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('return the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({ lastBlock, data});

        it('return a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('set the `lasthash` to be `hash` of lastBlock', () => {
            expect(minedBlock.lasthash).toEqual(lastBlock.hash);
        });

        it('set the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('set the `data`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('create a SHA-256 `hash` based on the proper inputs', () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    minedBlock.timestamp,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    lastBlock.hash,
                    data
                )
            );
        });

        it('set a `hash` that matches the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjust the difficulty', () => {
            const possibleResults = [ lastBlock.difficulty + 1, lastBlock.difficulty - 1 ];
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('raise diffculty for quickly mined block', () => {
            expect(Block.adjustDifficulty({ 
                orignalBlock: block, timestamp: block.timestamp +  MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it('lower diffculty for slowly mined block', () => {
            expect(Block.adjustDifficulty({
                orignalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('has a lower limit of 1', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({orignalBlock: block })).toEqual(1);
        });
    });
});