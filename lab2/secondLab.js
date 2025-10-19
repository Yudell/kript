import fs from 'fs';
import { calculateNgrams } from '../lab1/firstLabFunctions.js';
const rawText = fs.readFileSync("lab2/7B.txt", 'utf8');
const formatedText = rawText.split("//|").slice(2).join('').replace(/[\r\n" "]/g, "");

function repeatedFrequencies(text) {
    let allReplays = {};
    for (let len = 15; len >= 4; len--) {
        let currentLengthGrams = {};
        for (let i = 0; i <= (text.length - len); i++) {
            const element = text.slice(i, i + len);
            currentLengthGrams[element] = (currentLengthGrams[element] || 0) + 1;
        }
        for (const keys of Object.keys(currentLengthGrams)) {
            let smth = currentLengthGrams[keys];
            if (smth > 1) {
                allReplays[keys] = currentLengthGrams[keys];
            }
        }
        
    }
    return allReplays;
}

const apllier = {
    'Б': 'Т', 'Ь': 'Ч', 'К': 'К', 'М': 'З', 'Д': 'П', 'Е': 'О', 'У': 'А', 'Г': 'Р',
    'С': 'В', 'Л': 'И', 'В': 'С', 'И': 'Л', 'А': 'У', 'Ч': 'Ь', 'Ф': 'Я', 'Ш': 'Ы',
    'П': 'Д', 'О': 'Е', 'Ж': 'Н', 'Р': 'Г', 'Н': 'Ж', 'З': 'М', 'Э': 'Ц', 'Т': 'Б',
    'Я': 'Ф', 'Ы': 'Ш', 'Ц': 'Э', 'Ю': 'Х', 'Х': 'Ю', 'Щ': 'Щ',
};
const unknownLet = '_';
function decipher(cipherText, cipherKey, unknownLetter) {
    let decipheredText = '';
    for (let index = 0; index < cipherText.length; index++) {
        const currentCipherChar = cipherText[index];
        if (cipherKey[currentCipherChar]) {
            decipheredText += cipherKey[currentCipherChar];
        } else {
            decipheredText += unknownLetter;
        }   
    }
    return decipheredText;
}

console.log("Зашифрованный текст:", formatedText, "\n");
console.log("Расшифрованный текст:", decipher(formatedText, apllier, unknownLet));

let result = '';
const monoFrequencies = calculateNgrams([formatedText], 1);
const biFrequencies = calculateNgrams([formatedText], 2);
const triFrequencies = calculateNgrams([formatedText], 3);
const repeat = repeatedFrequencies(formatedText);
const entries = (freq) => Object.entries(freq);
const sorting = (a, b) => b[1] - a[1];
const monoSorted = entries(monoFrequencies).sort(sorting);
const biSorted = entries(biFrequencies).sort(sorting);
const triSorted = entries(triFrequencies).sort(sorting);
const repeatSorted = entries(repeat).sort(sorting);

result += 'Частоты монограмм:\n' + JSON.stringify(monoSorted, null, 2) + '\n\n';
result += 'Частоты биграмм:\n' + JSON.stringify(biSorted, null, 2) + '\n\n';
result += 'Частоты триграмм:\n' + JSON.stringify(triSorted, null, 2) + '\n\n';
result += 'Повторяющиеся последовательности:\n' + JSON.stringify(repeatSorted, null, 2) + '\n\n';

fs.writeFileSync('lab2/7BFrequencies.txt', result, 'utf-8');
