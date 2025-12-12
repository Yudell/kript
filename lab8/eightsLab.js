import fs from "fs"
import inquirer from "inquirer"
import {PI} from "./eightsLabConsts.js"

function generateKeys(key256) {
    let keys32 = [];
    let keys8 = [];
    for (let i = 0; i < 8; i++) {
        const partKey = key256.readUInt32BE(i * 4);
        keys8.push(partKey);
    }
    for (let j = 0; j < 3; j++) {
        for (let k = 0; k < keys8.length; k++) {
            keys32.push(keys8[k]);
        }
    }
    for (let l = 7; l >= 0; l--) {
       keys32.push(keys8[l]);
    }
    return keys32;
}

function blocks(allBits) {
    let blocks = [];
    for (let i = 0; i < allBits.length; i += 8) {
        let block = allBits.slice(i, i + 8);
        if (block.length < 8) {
            const padding = Buffer.alloc(8);
            block.copy(padding);
            block = padding;
        }
        blocks.push(block);
    }
    return blocks;
}

function g(a, k) {
    let output = 0;
    let sum = (a + k) >>> 0;
    for (let i = 0; i < 8; i++) {
        let current4Blocks = (sum >>> (i * 4)) & 0x0F;
        let change = PI[i][current4Blocks];
        output = output | change << (i * 4);
    }
    const finalShift = ((output << 11) | (output >>> 21)) >>> 0;
    return finalShift;
}

function cipher(block64, keys) {
    let L = block64.readUInt32BE(0);
    let R = block64.readUInt32BE(4);
    for (let i = 0; i < 32; i++) {
        const tempR = R;
        const newR = (L ^ g(R, keys[i])) >>> 0;
        L = tempR;
        R = newR;
    }
    const output = Buffer.alloc(8);
    output.writeUInt32BE(R, 0);
    output.writeUInt32BE(L, 4);
    
    return output;
}

function MAGMA() {
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
        },
        {
            type: 'list',
            name: 'inputType',
            message: 'откуда брать текст?',
            choices: ['ручками', 'из файла']
        }
    ]).then(initialAnswers => {
        
        let keyBuffer = Buffer.alloc(32);
        const inputKeyBuffer = Buffer.from(initialAnswers.key);
        inputKeyBuffer.copy(keyBuffer);
        const keys = generateKeys(keyBuffer);
        
        keys.forEach((k, index) => {
            console.log(k.toString(16).padStart(8, '0'));
        });

        if (initialAnswers.mode === 'Расшифровать') {
            keys.reverse();
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
            let dataBuffer;

            if (initialAnswers.inputType === 'ручками') {
                 dataBuffer = Buffer.from(inputAnswer.content, 'utf-8');
            } else {
                 dataBuffer = fs.readFileSync(`lab8/${inputAnswer.filename}`);
            }

            const dataBlocks = blocks(dataBuffer);
            let resultBuffer = Buffer.alloc(0);
            
            for (let block of dataBlocks) {
                const processedBlock = cipher(block, keys);
                resultBuffer = Buffer.concat([resultBuffer, processedBlock]);
            }
            console.log("Результат (HEX): ", resultBuffer.toString('hex'));

            inquirer.prompt([{
                type: 'input',
                name: 'outName',
                message: 'Имя файла для сохранения:'
            }]).then(saveAns => {
                fs.writeFileSync(`lab8/${saveAns.outName}`, resultBuffer);
                console.log("Сохранено!");
            });
        });
    });
}

//MAGMA();

function testGOST() {
    const keyHex = "ffeeddccbbaa99887766554433221100f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff";
    const keyBuffer = Buffer.from(keyHex, 'hex');

    const plainHex = "fedcba9876543210";
    const plainBuffer = Buffer.from(plainHex, 'hex');

    const expectedCipherHex = "4ee901e5c2d8ca3d";

    console.log("Ключ:", keyHex);
    console.log("Текст:", plainHex);

    const subKeys = generateKeys(keyBuffer);
    
    subKeys.forEach((k, index) => {
            console.log(k.toString(16).padStart(8, '0'));
        });

    const encrypted = cipher(plainBuffer, subKeys);
    const resultHex = encrypted.toString('hex');

    console.log("Результат шифрования:", resultHex);
    console.log("Ожидаемый результат: ", expectedCipherHex);
}

testGOST();
