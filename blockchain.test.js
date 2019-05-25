const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');

describe("Blockchain", () => {
    let blockchain, newChain, orignalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        orignalChain = blockchain.chain;
    });

    it("contains a `chain` Array instance", () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('start with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('add block in blockchain', () => {
        const newData = 'new data block'
        blockchain.addBlock({ data : newData });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not starts with the genesis block', () => {
            it('return false', () => {
                blockchain.chain[0] = {data : 'fake-genesis' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block and has multiple block', () => {
            beforeEach(() => {
                blockchain.addBlock({ data: 'star wars' });
                blockchain.addBlock({ data: 'the last jedi' });
                blockchain.addBlock({ data: 'star wars solo' });
            });

            describe('and last hash reference has changed', () => {
                it('return false', () => { 
                    blockchain.chain[2].lasthash = 'broken-lasthash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a invalid field', () => {
                it('return false', () => {
                    blockchain.chain[2].data = 'some-bad-evil-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a jumped difficulty', () => {
                it('return false', () => {
                    const lastblock = blockchain.chain[blockchain.chain.length - 1];
                    const lasthash = lastblock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastblock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lasthash, difficulty, nonce, data);
                    const badBlock = new Block({ timestamp, lasthash, difficulty, hash, nonce, data});
                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contains an invalid block', () => {
                it('return true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let errorMock, logMock;
        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () =>{
            beforeEach(() => {
                newChain.chain[0] = { new: 'chain' };
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () =>{
                expect(blockchain.chain).toEqual(orignalChain);
            });

            it('log an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data: 'star wars' });
                newChain.addBlock({ data: 'the last jedi' });
                newChain.addBlock({ data: 'star wars solo' });
            });

            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'blade-runner'
                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(orignalChain);
                });

                it('log an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('does replace the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('log about the chain replacement ', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

    });
});