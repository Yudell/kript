import inquirer from 'inquirer';
import fs from 'fs' ;
const alphabet = 'абвгдежзиклмнопростуфхцчшщъыьэюя';
const rawText = fs.readFileSync('input.txt', 'utf-8');
const formatedText = rawText.toLowerCase().replace(/[\r\n]/g, " ").replace(/[„“«»()—:;.,!?-]/g, " ").replace(/ +/g, " ").trim().split(' ');

const monoFrequencies = {};
for (let i = 0; i < alphabet.length; i++) {
    monoFrequencies[alphabet[i]] = 0;
}
for (let index = 0; index < formatedText.length; index++) {
    const currentWord = formatedText[index];
    for (let i = 0; i < currentWord.length; i++) {
        const element = currentWord[i];
        if (alphabet.includes(element)) {
            monoFrequencies[element]++;
        }
    }
}


let textLength = 0;

for (const key in monoFrequencies) {
    if (!Object.hasOwn(monoFrequencies, key)) continue;
    const element = monoFrequencies[key];
    textLength += element
}

const alphabetLengh = alphabet.length;
const expectedFrequency = textLength / alphabetLengh;

let chi2 = 0;
for (let index = 0; index < alphabet.length; index++) {
    const letter = alphabet[index];
    const observedFrequency = monoFrequencies[letter];
    chi2 += (observedFrequency - expectedFrequency) ** 2 / expectedFrequency;
}

const bigramFrequencies = {};
for (let index = 0; index < formatedText.length; index++) {
    const currentWord = formatedText[index];
    for (let i = 0; i < currentWord.length - 1; i++) {
        const element = currentWord[i] + currentWord[i + 1];
        bigramFrequencies[element] = (bigramFrequencies[element] || 0) + 1;
    }   
}

const trigramFrequencies = {};
for (let index = 0; index < formatedText.length; index++) {
    const currentWord = formatedText[index];
    for (let i = 0; i < currentWord.length - 2; i++) {
        const element = currentWord[i] + currentWord[i + 1] + currentWord[i + 2];
        trigramFrequencies[element] = (trigramFrequencies[element] || 0) + 1;
    }   
}

let resultString = '';
resultString += 'Результаты статистического анализа текста\n';
resultString += '========================================\n\n';
resultString += 'Значение хи-квадрат (для букв): ' + chi2 + '\n\n';
resultString += JSON.stringify(monoFrequencies, null, 2) + '\n\n';
resultString += JSON.stringify(bigramFrequencies, null, 2) + '\n\n';
resultString += JSON.stringify(trigramFrequencies, null, 2) + '\n\n';
fs.writeFileSync('output.txt', resultString, 'utf-8');

function userAnswer() {
    return inquirer.prompt([{
        type: 'number',
        name: 'userInput',
        message: 'Какой топ-100 список n-граммы вывести?'
    }])
    .then(input => {
        console.log(input.userInput);
        const nFrequencies = {};
        for (let index = 0; index < formatedText.length; index++) {
            const currentWord = formatedText[index];
            for (let i = 0; i < currentWord.length - input.userInput + 1; i++) {
                const element = currentWord.slice(i, i + input.userInput);
                nFrequencies[element] = (nFrequencies[element] || 0) + 1;
            }   
        }
        const entries = Object.entries(nFrequencies);
        const sortedNgrams = entries.sort((a, b) => b[1] - a[1]);
        const top100 = sortedNgrams.slice(0, 100);
        console.log(monoFrequencies);
        const top100Object = Object.fromEntries(top100);
        console.log(JSON.stringify(top100Object, null, 2));
        console.log(`Хи квадрат равен: ${chi2}`);
    });
}

userAnswer();
