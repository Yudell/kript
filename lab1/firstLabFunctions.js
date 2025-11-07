import inquirer from 'inquirer';
import fs from 'fs';
import { fileURLToPath } from 'url';

export function calculateNgrams(wordArray, n) {
    const frequencies = {};
    for (const currentWord of wordArray) {
        if (currentWord.length < n) {
            continue;
        }
        for (let i = 0; i <= currentWord.length - n; i++) {
            const ngram = currentWord.slice(i, i + n);
            frequencies[ngram] = (frequencies[ngram] || 0) + 1;
        }
    }
    return frequencies;
}

function calculateChi2(frequencies, alphabet) {
    let textLength = 0;

    for (const key in frequencies) {
        textLength += frequencies[key];
    }

    const alphabetLengh = alphabet.length;
    const expectedFrequency = textLength / alphabetLengh;

    let chi2 = 0;
    for (let index = 0; index < alphabet.length; index++) {
        const letter = alphabet[index];
        const observedFrequency = frequencies[letter];
        chi2 += (observedFrequency - expectedFrequency) ** 2 / expectedFrequency;
    }
    return chi2;
}


function userAnswer(inputArray) {
    return inquirer.prompt([{
        type: 'number',
        name: 'userInput',
        message: 'Какой топ-100 список n-граммы вывести?'
    }])
    .then(input => {
        const n = input.userInput;
        const nFrequencies = calculateNgrams(inputArray, n);
        const entries = Object.entries(nFrequencies);
        const sortedNgrams = entries.sort((a, b) => b[1] - a[1]);
        const top100 = sortedNgrams.slice(0, 100);
        const top100Object = Object.fromEntries(top100);
        console.log("Топ-100 n-грамм n=" + n);
        console.log(JSON.stringify(top100Object, null, 2));
    });
}

export function calculateTwoTextsChi2(frequencies1, frequencies2) {
    const values1 = Object.keys(frequencies1);
    const values2 = Object.keys(frequencies2);
    const uniqueBigrams = new Set([...values1, ...values2]);
    const startValue = 0;
    const total1 = Object.values(frequencies1).reduce((accumulator, initialValue) => accumulator + initialValue, startValue);
    const total2 = Object.values(frequencies2).reduce((accumulator, initialValue) => accumulator + initialValue, startValue);
    let chi2Bigram = 0;
    for (const element of uniqueBigrams) {
        let observed1 = frequencies1[element] || 0;
        let observed2 = frequencies2[element] || 0;
        let expected1 = (observed1 + observed2) * (total1 / (total1 + total2));
        let expected2 = (observed1 + observed2) * (total2 / (total1 + total2));
        if (expected1 === 0 || expected2 === 0) {
            continue;
        }
        chi2Bigram += (((expected1 - observed1) ** 2) / expected1) + (((expected2 - observed2) ** 2) / expected2);
    }
    return chi2Bigram;
}


function main() {
    const alphabet = 'абвгдежзиклмнопростуфхцчшщъыьэюя';
    const firstText = fs.readFileSync('lab1/input.txt', 'utf-8');
    const secondText = fs.readFileSync('lab1/nakazanie2.txt', 'utf-8');
    const formatedText = (rawText) => rawText.toLowerCase().replace(/[.]/g, "тчк").replace(/[,]/g, "зпт").replace(/[\r\n]/g, " ").replace(/[„“«»()—:;!?-]/g, " ").replace(/ +/g, " ").trim().split(' ');
    const monoFrequencies = calculateNgrams(formatedText(firstText), 1);
    const biFrequencies = calculateNgrams(formatedText(firstText), 2);
    const triFrequencies = calculateNgrams(formatedText(firstText), 3);
    const secondBiFrequencies = calculateNgrams(formatedText(secondText), 2);
    const chi2 = calculateChi2(monoFrequencies, alphabet);
    const twoTextChi2 = calculateTwoTextsChi2(biFrequencies, secondBiFrequencies);
    
    const monoDegrees = new Set([...Object.keys(monoFrequencies)]).size - 1;
    const criticalValue = monoDegrees + 3 * Math.sqrt(2 * monoDegrees);
    if (chi2 > criticalValue) {
        console.log(`Хи-квадрат выше ${criticalValue}: ${chi2}`);
    } else {
        console.log(`Хи-квадрат ниже ${criticalValue}: ${chi2}`);
    }

    const degreesOfFreedom = alphabet.length ** 2 - 1; //new Set([...Object.keys(biFrequencies), ...Object.keys(secondBiFrequencies)]).size - 1;
    const criticalValueTwoTexts = degreesOfFreedom + 3 * Math.sqrt(2 * degreesOfFreedom);
    if (twoTextChi2 > criticalValueTwoTexts) {
        console.log(`Хи-квадрат двух текстов выше ${criticalValueTwoTexts}: ${twoTextChi2}`);
    } else {
        console.log(`Хи-квадрат двух текстов ниже ${criticalValueTwoTexts}: ${twoTextChi2}`);
    }
    
    let resultString = '';
    resultString += 'хи-квадрат по биграммам двух текстов: ' + twoTextChi2 + '\n\n';
    resultString += 'хи-квадрат: ' + chi2 + '\n\n';
    resultString += 'Монограммы:\n' + JSON.stringify(monoFrequencies, null, 2) + '\n\n';
    resultString += 'Биграммы:\n' + JSON.stringify(biFrequencies, null, 2) + '\n\n';
    resultString += 'Триграммы:\n' + JSON.stringify(triFrequencies, null, 2) + '\n\n';
    
    fs.writeFileSync('lab1/output.txt', resultString, 'utf-8');

    userAnswer(formatedText(firstText));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

