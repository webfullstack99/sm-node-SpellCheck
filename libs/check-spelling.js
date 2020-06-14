const jsonfile = require('jsonfile');
const Helper = require('./helper');

module.exports = {
    incorrectSign: '|',
    correctSign: '=',
    highlightIncorrectClass: 'highlight-incorrect',
    highlightCorrectClass: 'highlight-correct',

    getResult: function (str, spell) {
        let result = str.trim();
        result = this.checkEachWord(str, spell);
        this.printConsole(`\nAfter check each word: ${result}`);

        result = this.checkWordPair(result, spell);
        this.printConsole(`After check word pair: ${result}`);

        result = this.prioritizieCorrection(result);
        this.printConsole(`After prioritize correction: ${result}`);

        result = this.ucfirstSpecial(result);
        this.printConsole(`After ucfirst: ${result}`);

        result = this.solvePunctuation(result);
        this.printConsole(`After solve puntuation: ${result}\n`);

        result = this.highlight(result);
        return result;
    },

    printConsole(content) {
        //console.log(content);
    },

    ucfirstSpecial: function (str) {
        let result = str;
        let pattern = new RegExp(`^(\\s*\\${this.incorrectSign}*\\=*)((?!\\s)[\\W\\w])+\\s?`, 'g');
        result = result.replace(pattern, (x) => { return this.solvefirstWordUcfirst(x); });
        return result;
    },

    solvefirstWordUcfirst: function (x) {
        x = x.trim();
        let firstWord = x;
        if (x.indexOf(`${this.incorrectSign}`) == -1 && !x.match(/\d/g)) {
            let pattern = new RegExp(`[^\\|\\="]+`);
            let realWord = x.match(pattern)[0].trim();
            let first = realWord.slice(0, 1);
            if (first == first.toLowerCase()) {
                firstWord = Helper.ucfirst(realWord);
                firstWord = `==${firstWord}`;
                if (!(x.slice(0, 1) == '=' && x.slice(-1) != '=')) firstWord += '==';
            }
        }
        return firstWord + ' ';
    },

    addSpelling: function (incorrect, correct, type) {
        incorrect = incorrect.trim();
        correct = correct.trim();
        if (incorrect != '' && correct != '') {
            let wordPairArray = this.getWordPairArray(type);
            let existFlag = this.isWordPairExist(incorrect);
            if (!existFlag) {
                wordPairArray.push({ incorrect, correct });
                this.saveWordPairArray(wordPairArray, type);
                return true;
            }
        }
        return false;
    },

    makeClean: function (value) {
        return value.replace(/[\r\n]/g, ' ');
    },

    // SUPPORTED FUNCTIONS ===========
    solvePunctuation: function (str) {
        let result = str;
        result = result.replace(/(?<=[\.\?\!\:])(\s*\|*\=*){1,2}((?!\s)[\W\w])+/g, (x) => {
            x = x.trim();
            let word = x;
            if (this.isAfterPunctuation(word)) {
                let matchResult = x.match(new RegExp(`(?!\\s)[^\\${this.incorrectSign}\\${this.correctSign}]+`));
                if (matchResult) {
                    let realWord = matchResult[0];
                    word = Helper.ucfirst(realWord);
                    if (Helper.getFirstLetter(x) != Helper.getFirstLetter(word)) {
                        if (x.slice(0, 1) == '=') word = `== ==${word}==`;
                        else word = ` ==${word}==`;
                        return `${word}`;
                    } else return ` ${word}`;
                }
            }
            return word;
        });
        return result;
    },

    isAfterPunctuation: function (word) {
        let pattern = new RegExp(`[\\d\\.\\,\\!\\?\\"]`)
        return (word.indexOf(`${this.incorrectSign}`) == -1 && !word.match(/\d/) && !word.match(pattern));
    },

    highlight: function (str) {
        result = str;
        // format incorrect
        result = result.replace(/\|\|([^\|\=]+)\|\|/ig, `<span class="${this.highlightIncorrectClass}">$1</span>`)

        // format correct
        result = result.replace(/\=\=([^\|\=]+)\=\=/ig, `<span class="${this.highlightCorrectClass}">$1</span>`)

        result = result.replace(/\|\||\=\=/g, '');
        return result;
    },

    prioritizieCorrection: function (str) {
        return str.replace(/\|\|\=\=(((?!(\||\=)).)+)\=\=\|\|/g, '==$1==');

    },

    isWordPairExist: function (incorrect) {
        for (let pair of this.getAllWordPairArray())
            if (pair.incorrect == incorrect) return true;
        return false;
    },

    checkWordPair: function (str) {
        let result = str;
        let incorrectArrays = this.getIncorrectArrays(result)
        incorrectArrays = this.sortIncorrectArrays(incorrectArrays);
        result = this.addCorrectSign(result, incorrectArrays);
        return result;
    },

    addCorrectSign: function (str, incorrectArrays) {
        let result = str;
        for (let arr of incorrectArrays) {
            for (let value of arr) {
                let flag = false;
                if (result.match(new RegExp(`^${value}(\\s|$)`))) {
                    flag = true;
                } else if (result.match(new RegExp(`\\|\\|${value}\\|\\|`))) {
                    flag = true;
                } else if (result.match(new RegExp(`\\s${value}(\\s|$)`))) {
                    flag = true;
                }
                if (!flag) break;
                let pattern = new RegExp(`${value}`, 'g');
                result = result.replace(pattern, `==${this.getCorrectWord(value)}==`);
            }
        }
        return result;
    },

    getIncorrectArrays: function (str) {
        let wordPairArray = this.getAllWordPairArray();
        let result = [];
        for (let pair of wordPairArray) {
            let errorWordPairArray = this.getErrorWordPairArray(str, pair);
            if (errorWordPairArray.length > 0) result.push(errorWordPairArray);
        }
        return result;
    },

    sortIncorrectArrays: function (arr) {
        return arr.sort((x, y) => {
            return y[0].toLowerCase().localeCompare(x[0].toLowerCase());
        })
    },

    getCorrectWord: function (word) {
        let wordPairArray = this.getAllWordPairArray();
        for (let pair of wordPairArray) {
            let incorrect = pair.incorrect.toLowerCase();
            word = word.toLowerCase();
            if (incorrect.includes(word)) {
                if (incorrect == word) return pair.correct;
                for (let item of incorrect.split('|')) {
                    item = item.replace(/\(|\)/g, '');
                    if (item == word) return pair.correct;
                }
            }
            //if ( == word.toLowerCase()) return pair.correct;
        }
        return null;
    },

    getErrorWordPairArray: function (str, pair) {
        //let pattern = new RegExp(`(?<=(\\||\\s))${pair.incorrect}(?=(\\||\\s))`, 'ig');
        let pattern = new RegExp(`${pair.incorrect}`, 'ig');
        let matchResult = str.match(pattern);
        let result = [];
        if (matchResult != null) {
            for (let key in matchResult) {
                if (matchResult[key] != pair.correct && !result.includes(matchResult[key])) result.push(matchResult[key]);
            }
        }
        return result;
    },

    getAllWordPairArray: function () {
        let all = [...this.getWordPairArray('custom'), ...this.getWordPairArray('general'), ...this.getWordPairArray('ignore')];
        return all;
    },

    isCorrect: function (word) {
        let flag = false;

        // number
        if (word.match(/^\d+$/)) flag = true;
        if (word.match(/^\d+(,\d+){0,}%$/)) flag = true;

        // date
        if (word.match(/^\d+([\/\-]\d+){1,2}$/)) flag = true;

        // time
        if (word.match(/^\d+h$/)) flag = true;

        return flag;
    },

    checkEachWord: function (str, spell) {
        let result = str;
        let incorrectWordArray = this.getIncorrectWordArray(str, spell);
        for (let word of incorrectWordArray) {
            result = result.replace(new RegExp(`${word}`, 'g'), `||${word}||`);
        }
        //let text = '((?!\\|).)+';
        //let mayText = '((?!\\|).)+';
        //console.log(result);
        //result = result.replace(new RegExp(`\\|{2}\\|{2}${text}\\|{2}${mayText}\\|{2}`, 'g'), '||$1$2||'); 
        return result;
    },

    getIncorrectWordArray: function (str, spell) {
        let wordArray = [];
        for (let word of str.split(/[\s\.\,\!\*\?\(\)\"\"\'\':;“”\-]/))
            if (word.trim() != '')
                if (!wordArray.includes(word) && !spell.correct(word) && !this.isCorrect(word)) {
                    wordArray.push(word);
                }
        return wordArray;
    },

    sort: function (arr) {
        arr.sort((x, y) => {
            let incorrectX = x.incorrect.toLowerCase();
            let incorrectY = y.incorrect.toLowerCase();
            return incorrectX.localeCompare(incorrectY);
        })
        return arr;
    },

    deleteWordPair: function (incorrect, type) {
        let wordPairArray = this.getWordPairArray(type);
        let index = 0;
        for (let pair of wordPairArray) {
            if (pair.incorrect == incorrect) wordPairArray.splice(index, 1);
            index++;
        }
        this.saveWordPairArray(wordPairArray, type);
        return true;
    },

    getWordPairType: function (type) {
        if (['custom', 'general', 'ignore'].includes(type)) return type;
        return 'custom';
    },

    getFilePath: function (type) {
        if (type == 'custom') return `${__dirname}/custom-word-pair.json`;
        else if (type == 'general') return `${__dirname}/word-pair.json`;
        else if (type == 'ignore') return `${__dirname}/ignore-word-pair.json`;
    },

    // get and save word pair
    getWordPairArray: function (type) {
        return jsonfile.readFileSync(this.getFilePath(type));
    },

    saveWordPairArray: function (data, type) {
        data = this.sort(data);
        jsonfile.writeFileSync(this.getFilePath(type), data);
    },

}