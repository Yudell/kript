import fs from 'fs';

const cipherText = fs.readFileSync('lab3/8.15.txt', 'utf8');
const formatedText = cipherText.replace(/[\r]/g, "");

function strings() {
    let eachString = [];
    let string = '';
    for (let index = 0; index < formatedText.length; index++) {
        const element = formatedText[index];
        if (element !== "\n") {
            string += element;
        } else {
            eachString.push(string);
            string = '';
        }
    }
    if (string.length > 0) {
        eachString.push(string);
    }
    return eachString;
}

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
    /*let columns = [];
    for (let i = 0; i < 15; i++) {
        let currentColumn = '';
        for (let j = 0; j < stroka.length; j++) {
            currentColumn += stroka[j][i];
        }
        columns.push(currentColumn);
        
    }
    return columns;*/
}

const stringArray = strings();
const col = transponir(stringArray);

const myaZnakZapr = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я', '_'];
const iKratkoe = ['Б', 'В', 'Г', 'Д', 'Ж', 'З', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', '_'];

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
    for (let i = 0; i < 15; i++) {
        let row = [];
        for (let j = 0; j < 15; j++) {
            const compatible = checkTwoColumns(cols[i], cols[j]);
            row.push(compatible)            ;
        }
        matrix.push(row);
    }
    return matrix;
}

const matriza = buildMatrix(col);
console.table(matriza);

let sortedColumns = [];
const key = [12, 10, 4, 9, 11, 1, 5, 13, 14, 2, 6, 8, 3, 7, 0];
for (let i = 0; i < key.length; i++) {
    const element = key[i];
    sortedColumns.push(col[element]);
}
const deciphered = transponir(sortedColumns).join('');

console.log(deciphered);
