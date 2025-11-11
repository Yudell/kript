import fs from 'fs';

const alphabet = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ';
const rawText = fs.readFileSync('lab4/3.TXT', 'utf-8');
const formatedText = rawText.replaceAll(/[\r\n" "]/g, "");

let chiResults = [];
for (let R = 2; R <= 50; R++) {
    let cols = new Array(R).fill('');
    for (let i = 0; i < formatedText.length; i++) {
        const letter = formatedText[i];
        const columnIndex = i % R;
        cols[columnIndex] += letter;
    }
    const frequencyMatrix = [];
    for (let i = 0; i < R; i++) {
        frequencyMatrix.push(new Array(32).fill(0));
        for (let j = 0; j < cols[i].length; j++) {
            const element = cols[i][j];
            const alphabetIndex = alphabet.indexOf(element);
            if (alphabetIndex !== -1) {
                frequencyMatrix[i][alphabetIndex]++;
            }  
        }
    }
    console.log(frequencyMatrix);
    const v_i = new Array(1).fill(cols[i].length);
    
}
