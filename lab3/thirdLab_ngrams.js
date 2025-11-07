import fs from 'fs';
import { calculateNgrams } from '../lab1/firstLabFunctions.js';
import { calculateTwoTextsChi2} from '../lab1/firstLabFunctions.js';

const myaZnakZapr = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я', '_'];
const iKratkoe = ['Б', 'В', 'Г', 'Д', 'Ж', 'З', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', '_'];

function transponir(stroka) {
    if (!stroka || stroka.length === 0) {
        return [];
    }
    const height = stroka.length;
    const width = stroka[0].length;
    let columns = [];
    for (let i = 0; i < width; i++) {
        let currentColumn = '';
        for (let j = 0; j < height; j++) {
            currentColumn += stroka[j][i];
        }
        columns.push(currentColumn);
    }
    return columns;   
}

function checkTwoColumns(colA, colB) {
    for (let i = 0; i < colA.length; i++) {
        let charA = colA[i];
        let charB = colB[i];
        if (charB === 'Ь' && myaZnakZapr.includes(charA)) {
            return false;
        } else if (charB === 'Й' && iKratkoe.includes(charA)) {
            return false;
        }
    }
    return true;
}

function buildMatrix(cols) {
    let matrix = [];
    for (let i = 0; i < cols.length; i++) {
        let row = [];
        for (let j = 0; j < cols.length; j++) {
            const compatible = checkTwoColumns(cols[i], cols[j]);
            row.push(compatible)            ;
        }
        matrix.push(row);
    }
    return matrix;
}

function decipher(keychik, column) {
    let sortedColumns = [];
    for (let i = 0; i < keychik.length; i++) {
        const element = keychik[i];
        sortedColumns.push(column[element]);
    }
    return transponir(sortedColumns).join('');
}

function main() {
    const cipherText = fs.readFileSync('lab3/8.15.txt', 'utf8');
    const formatedText = cipherText.replace(/[\r]/g, "").split("\n");
    const filteredStrings = formatedText.filter((word) => word.length > 0);

    let result = '';
    const cleanText = cipherText.replace(/[\r\n\s]/g, '');
    const monoFrequencies = calculateNgrams([cleanText], 1);
    const biFrequencies = calculateNgrams([cleanText], 2);
    const triFrequencies = calculateNgrams([cleanText], 3);
    result += 'Частоты монограмм:\n' + JSON.stringify(monoFrequencies, null, 2) + '\n\n';
    result += 'Частоты биграмм:\n' + JSON.stringify(biFrequencies, null, 2) + '\n\n';
    result += 'Частоты триграмм:\n' + JSON.stringify(triFrequencies, null, 2) + '\n\n';
    fs.writeFileSync('lab3/ngrams.txt', result, 'utf-8');
    
    const key = [12, 10, 4, 9, 11, 1, 5, 13, 14, 2, 6, 8, 3, 7, 0];

    const col = transponir(filteredStrings);
    const matriza = buildMatrix(col);
    console.table(matriza);
    const finalText = (decipher(key, col));
    const secondCleanText =  finalText.replace(/[\r\n\s]/g, '');
    const secondBiFrequencies = calculateNgrams([secondCleanText], 2);
    const chi2 = calculateTwoTextsChi2(biFrequencies, secondBiFrequencies);
    console.log(`Хишка равна: ${chi2}`);
    console.log(finalText);
    fs.writeFileSync('lab3/open_text.txt', finalText, 'utf-8')

}

main();