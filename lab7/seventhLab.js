import fs from "fs";
import inquirer from "inquirer";
import { PC1, PC2, E, P, SBOX, initialPermutation, reverseInitialPermutation, bitShift } from './seventhLabConsts.js';

function stringBin(str) {
    let bits = [];
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        const binka = char.toString(2).padStart(8, '0');
        for (let j = 0; j < 8; j++) {
            bits.push(parseInt(binka[j]));
        }
    }
    return bits;
}

function binString(bin) {
    let str = "";
    for (let i = 0; i < bin.length; i += 8) {
        const byte = bin.slice(i, i + 8);
        const byteStr = byte.join("");
        const decimal = parseInt(byteStr, 2);
        if (decimal !== 0) {
            str += String.fromCharCode(decimal);
        }
    }
    return str;
}

function bufferToBits(buffer) {
    let bits = [];
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        const bin = byte.toString(2).padStart(8, '0');
        for (let j = 0; j < 8; j++) {
            bits.push(parseInt(bin[j]));
        }
    }
    return bits;
}

function bitsToBuffer(bits) {
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        const chunk = bits.slice(i, i + 8);
        const byteVal = parseInt(chunk.join(''), 2);
        bytes.push(byteVal);
    }
    return Buffer.from(bytes);
}

function bitsToHex(bits) {
    let hex = '';
    for (let i = 0; i < bits.length; i += 4) {
        const chunk = bits.slice(i, i + 4);
        const val = parseInt(chunk.join(''), 2);
        hex += val.toString(16);
    }
    return hex.toUpperCase();
}

function hexToBits(hex) {
    let bits = [];
    for (let i = 0; i < hex.length; i++) {
        const val = parseInt(hex[i], 16);
        const chunk = val.toString(2).padStart(4, '0');
        for(let j=0; j<4; j++) bits.push(parseInt(chunk[j]));
    }
    return bits;
}

function printRoundKeys(keys) {
    keys.forEach((k, index) => {
        console.log(`раунд ${index + 1}: ${bitsToHex(k)}`);
    });
}

function blocks(allBits) {
    let blocks = [];
    for (let i = 0; i < allBits.length; i += 64) {
        const block = allBits.slice(i, i + 64);
        while (block.length < 64) {
            block.push(0);
        }
        blocks.push(block);
    }
    return blocks;
}

function xor(leftA, rightB) {
    let afterXOR = [];
    for (let i = 0; i < leftA.length; i++) {
        const elementA = leftA[i];
        const elementB = rightB[i];
        const logOR = elementA ^ elementB;
        afterXOR.push(logOR);
    }
    return afterXOR;
}

function permute(input, table) {
    let output = [];
    for (let i = 0; i < table.length; i++) {
        const element = table[i];
        const currentBit = input[element - 1];
        output.push(currentBit);
    }
    return output;
}

function rotateBits(bits, n) {
    const slicedStart = bits.slice(0, n);
    const slicedEnd = bits.slice(n);
    return slicedEnd.concat(slicedStart);
}

function generateKeys(keyBits) {
    const swapping = permute(keyBits, PC1);
    let C = swapping.slice(0, 28);
    let D = swapping.slice(28);
    let keys = [];
    for (let i = 0; i < 16; i++) {
        const shift = bitShift[i];
        C = rotateBits(C, shift);
        D = rotateBits(D, shift);
        const CD = C.concat(D);
        const swappingTwo = permute(CD, PC2);
        keys.push(swappingTwo);
    }
    return keys;
}

function SBlocks(bits48) {
    let eightBlocks = [];
    for (let i = 0; i < bits48.length; i += 6) {
        const slicedBlock = bits48.slice(i, i + 6);
        const firstBit = slicedBlock.slice(0, 1);
        const lastBit = slicedBlock.slice(5);
        const rowNum = firstBit.concat(lastBit);
        const colNum = slicedBlock.slice(1, 5);
        const row = parseInt(rowNum.join(''), 2);
        const col = parseInt(colNum.join(''), 2);
        const currentSBOX = SBOX[i / 6];
        const val = currentSBOX[(row * 16) + col];
        const backToArray = val.toString(2).padStart(4, '0');
        for (let j = 0; j < backToArray.length; j++) {
            eightBlocks.push(parseInt(backToArray[j]));
        }
    }
    return eightBlocks;
}

function feistel(rightPart, roundKey) {
    const expansion = permute(rightPart, E);
    const XORed = xor(expansion, roundKey);
    const rounds = SBlocks(XORed);
    const transposition = permute(rounds, P);
    return transposition;
}

function cipher(block64, key) {
    const firstTransposition = permute(block64, initialPermutation);
    let L = firstTransposition.slice(0, 32);
    let R = firstTransposition.slice(32);
    for (let i = 0; i < 16; i++) {
        const tempR = R;
        const newR = xor(L, feistel(R, key[i]));
        L = tempR;
        R = newR;
    }
    const finalCycle = R.concat(L);
    const lastPermute = permute(finalCycle, reverseInitialPermutation);
    return lastPermute;
}

function DES() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'mode',
            choices: ['Зашифровать', 'Расшифровать']
        },
        {
            type: 'input',
            name: 'key',
            message: 'введите секретный ключ',
            validate: input => input.length === 8 ? true : '8 символов'
        },
        {
            type: 'list',
            name: 'inputType',
            message: 'откуда брать текст?',
            choices: ['ручками', 'из файла']
        }
    ]).then(initialAnswers => {
        
        const keyBits = stringBin(initialAnswers.key);
        const subKeys = generateKeys(keyBits);
        
        printRoundKeys(subKeys);

        if (initialAnswers.mode === 'Расшифровать') {
            subKeys.reverse();
        }
        
        let questions = [];
        if (initialAnswers.inputType === 'ручками') {
            questions.push({
                type: 'input',
                name: 'content',
                message: 'введите текст'
            });
        } else {
            questions.push({
                type: 'input',
                name: 'filename',
                message: 'введите имя фалйа',
            });
        }

        inquirer.prompt(questions).then(inputAnswer => {
             let dataBits = [];

            if (initialAnswers.inputType === 'ручками') {
                if (initialAnswers.mode === 'Зашифровать') {
                    dataBits = stringBin(inputAnswer.content);
                } else {
                    dataBits = hexToBits(inputAnswer.content);
                }
            } else {                
                const fileBuffer = fs.readFileSync(`lab7/${inputAnswer.filename}`);
                dataBits = bufferToBits(fileBuffer);
            }

            const dataBlocks = blocks(dataBits);
            let resultBits = [];

            for (let b of dataBlocks) {
                resultBits = resultBits.concat(cipher(b, subKeys));
            }

            if (initialAnswers.inputType === 'ручками') {
                if (initialAnswers.mode === 'Зашифровать') {
                    console.log('Результат (HEX):', bitsToHex(resultBits));
                } else {
                    console.log('Результат (Текст):', binString(resultBits));
                }
            }

            inquirer.prompt([{
                type: 'confirm',
                name: 'save',
                message: 'сохранить результат в файл?',
                default: true
            }, {
                type: 'input',
                name: 'outFilename',
                message: 'введите имя выходного файла:',
                when: (answers) => answers.save
            }]).then(saveAnswer => {
                if (saveAnswer.save) {
                   
                    const outBuffer = bitsToBuffer(resultBits);
                    
                    fs.writeFileSync(`lab7/${saveAnswer.outFilename}`, outBuffer);
                    console.log(`сохранено в ${saveAnswer.outFilename}`);
                }
            });
        });
    });
}

DES();