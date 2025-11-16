import fs from 'fs';
import inquirer from 'inquirer';

function cipher(nameFile, gama) {
    const gammaBuffer = Buffer.from(gama, 'utf-8');
    const resultBuffer = Buffer.alloc(nameFile.length);
    for (let i = 0; i < nameFile.length; i++) {
        const eachByte = nameFile[i];
        const gammaByte = gammaBuffer[i % gammaBuffer.length];
        const cipheredByte = eachByte ^ gammaByte;
        resultBuffer[i] = cipheredByte;
    }
    return resultBuffer;
}

function processFile(processingFunction) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'fileName',
            message: 'Введите имя файла',
        }
    ])
    .then(input => {
        const nameOfFile = input.fileName;
        const fileContent = fs.readFileSync(`lab5/${nameOfFile}`);
        return inquirer.prompt([
            {
                type: 'input',
                name: 'gamma',
                message: 'Введите гамму',
            }
        ]).then(gammaInput => ({ fileContent, gamma: gammaInput.gamma }));
    })
    .then(data => {
        const { fileContent, gamma } = data;
        const result = processingFunction(fileContent, gamma);
        console.log(result);

        return inquirer.prompt([
            {
                type: 'input',
                name: 'saveFileName',
                message: 'Файл, в который сохранить',
            }
        ]).then(saveInput => {
            fs.writeFileSync(`lab5/${saveInput.saveFileName}`, result);
        });
    });
}

function inqWork() {
    return inquirer.prompt([{
        type: 'list',
        name: 'decipher',
        message: 'Зашифровать или расшифровать?',
        choices: ['Зашифровать', 'Расшифровать']
    }])
    .then(choice => {
        processFile(cipher);
    });
}

inqWork();
