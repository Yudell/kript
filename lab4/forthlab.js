import fs from 'fs';

const alphabet = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ';
const rawText = fs.readFileSync('lab4/3.TXT', 'utf-8');
const formatedText = rawText.replaceAll(/[\r\n" "]/g, "");

let chiResults = [];

const etalon = {
    'О': 0.11, 'Е': 0.085, 'А': 0.079, 'И': 0.073, 'Н': 0.067, 'Т': 0.063, 'С': 0.054, 'Р': 0.047, 'В': 0.045, 'Л': 0.043, 
    'К': 0.034, 'М': 0.032, 'Д': 0.029, 'П': 0.028, 'У': 0.026, 'Я': 0.02, 'Ы': 0.019, 'Ь': 0.017, 'Г': 0.0168, 'З': 0.0164, 
    'Б': 0.0159, 'Ч': 0.014, 'Х': 0.012, 'Ж': 0.009, 'Ш': 0.007, 'Ю': 0.006, 'Ц': 0.0048, 'Щ': 0.00361, 'Э': 0.00331, 'Ф': 0.00267 
}

const keyLength = 17;
let finalKey = [];
let keyLetter = '';

for (let R = 2; R <= 50; R++) {
    let cols = new Array(R).fill('');
    for (let i = 0; i < formatedText.length; i++) {
        const letter = formatedText[i];
        const columnIndex = i % R;
        cols[columnIndex] += letter;
    }
    const frequencyMatrix = [];
    for (let i = 0; i < R; i++) {
        frequencyMatrix.push(new Array(alphabet.length).fill(0));
        for (let j = 0; j < cols[i].length; j++) {
            const element = cols[i][j];
            const alphabetIndex = alphabet.indexOf(element);
            if (alphabetIndex !== -1) {
                frequencyMatrix[i][alphabetIndex]++;
            }  
        }
    }
    
    const v_i = cols.map((x) => x.length);
    const v_j = new Array(alphabet.length).fill(0);
    for (let j = 0; j < alphabet.length; j++) {
        for (let i = 0; i < R; i++) {
            v_j[j] += frequencyMatrix[i][j];
        }
        
    }
    let chi2 = 0;
    for (let i = 0; i < R; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            const freq = frequencyMatrix[i][j];
            const letterCount = v_i[i];
            const letterCountText = v_j[j];
            chi2 += freq ** 2 / (letterCount * letterCountText);
        }
    }
    const finalChi2 = (chi2 - 1) * formatedText.length;
    chiResults.push({R: R, chi2: finalChi2});

    if (keyLength === R) {
        const etalonFreq = [];
        for (let i = 0; i < alphabet.length; i++) {
            const element = alphabet[i];
            const frequency = etalon[element];
            etalonFreq.push(frequency || 0);
        }
        console.log(etalonFreq);
        for (let col = 0; col < keyLength; col++) {
            const currentColFreq = frequencyMatrix[col];
            let bestShift = 0;
            let maxMatch = 0;
            for (let s = 0; s < alphabet.length; s++) { 
                let currentMatch = 0;
                for (let j = 0; j < alphabet.length; j++) {
                    let match = etalonFreq[j] * currentColFreq[(j + s) % alphabet.length];
                    currentMatch += match;
                }
                if (currentMatch > maxMatch) {
                    maxMatch = currentMatch;
                    bestShift = s;
                }
            }
            finalKey.push(bestShift);       
        }
    }
}

const sortedChi2 = chiResults.sort((a, b) => b.chi2 - a.chi2);
const top = sortedChi2.slice(0, 5);

console.log(top);
console.log(finalKey);

for (let i = 0; i < finalKey.length; i++) {
    const currentLetter = finalKey[i];
    keyLetter += alphabet[currentLetter];
}
console.log(keyLetter);

let decryptedText = '';
for (let i = 0; i < formatedText.length; i++) {
    const CipheredElement = formatedText[i];
    const cipherIndex = alphabet.indexOf(CipheredElement);
    const keyPosition = i % keyLength;
    const keyIndex = finalKey[keyPosition];
    const openIndex = (cipherIndex - keyIndex + alphabet.length) % alphabet.length;
    const openChar = alphabet[openIndex];
    decryptedText += openChar;
}
console.log(decryptedText);