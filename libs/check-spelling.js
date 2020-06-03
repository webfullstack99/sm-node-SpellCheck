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
        console.log(`\nAfter check each word: ${result}`);
        result = this.checkWordPair(result, spell);
        console.log(`After check word pair: ${result}`);
        result = this.ucfirstSpecial(result);
        console.log(`After ucfirst: ${result}`);
        result = this.solvePunctuation(result);
        console.log(`After solve puntuation: ${result}\n`);
        result = this.highlight(result);
        return result;
    },

    ucfirstSpecial: function (str) {
        let result = str;
        let pattern = new RegExp(`^(\\s*\\${this.incorrectSign}*\\=*)((?!\\s)[\\W\\w])+\\s?`, 'g');
        result = result.replace(pattern, (x) => {
            let firstWord = x;
            console.log(firstWord);
            if (x.indexOf(`${this.incorrectSign}`) == -1 && !x.match(/\d/g)) {
                let pattern = new RegExp(`[^\\|\\="]+`);
                let realWord = x.match(pattern)[0].trim();
                let first = realWord.slice(0, 1);
                if (first == first.slice(0, 1).toLowerCase()) {
                    firstWord = Helper.ucfirst(realWord);
                    firstWord = '==' + firstWord + '==';
                }
            }
            return firstWord + ' ';
        });
        return result;
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
        let pattern = new RegExp(`(?<=[\\.\\?\\!\\:])(\\s*\\${this.incorrectSign}*\\${this.correctSign}*)((?!\\s)[\\W\\w])+`, 'g')
        result = result.replace(pattern, (x) => {
            let word = x;
            let pattern = new RegExp(`[\\d\\.\\,\\!\\?\\"]`)
            if (x.indexOf('|') == -1 && !x.match(/\d/) && !x.match(pattern)) {
                let pattern = new RegExp(`(?!\\s)[^\\${this.incorrectSign}\\${this.correctSign}]+`);
                let realWord = x.match(pattern)[0];
                word = Helper.ucfirst(realWord);
                if (x.indexOf('=') > -1 | realWord.slice(0, 1) == realWord.slice(0, 1).toLowerCase()) word = '==' + word + '==';
                return ` ${word}`;
            }
            return word;
        });
        return result;
    },

    highlight: function (str) {
        result = str;
        let pattern = new RegExp(`(\\${this.incorrectSign}){2}(\\${this.correctSign}){2}([^\\${this.incorrectSign}\\${this.correctSign}]+)(\\${this.correctSign}){2}(\\${this.incorrectSign}){2}`, 'ig');
        result = result.replace(pattern, '==$1==');
        result = result.replace(/\|\|([^\|\=]+)\=\=([^\|\=]+)\=\=([^\|\=]+)\|\|/ig, '||$1$2$3||');
        console.log('before highlight: ' + result);

        // format incorrect
        result = result.replace(/\|\|([^\|\=]+)\|\|/ig, `<span class="${this.highlightIncorrectClass}">$1</span>`)

        // format correct
        result = result.replace(/\=\=([^\|\=]+)\=\=/ig, `<span class="${this.highlightCorrectClass}">$1</span>`)
        return result;
    },

    isWordPairExist: function (incorrect) {
        for (let pair of this.getAllWordPairArray())
            if (pair.incorrect == incorrect) return true;
        return false;
    },

    checkWordPair: function (str) {
        let result = str;
        let wordPairArray = this.getAllWordPairArray();
        let incorrectArrays = [];
        for (let pair of wordPairArray) {
            let errorWordPairArray = this.getErrorWordPairArray(result, pair);
            if (errorWordPairArray.length > 0) incorrectArrays.push(errorWordPairArray);
        }

        // sort
        incorrectArrays = incorrectArrays.sort((x, y) => {
            return y[0].toLowerCase().localeCompare(x[0].toLowerCase());
        })

        for (let arr of incorrectArrays) {
            for (let value of arr) {
                result = result.replace(new RegExp(`(?![\\|\\=]{1,2})${value}(?![\\|\\=]{1,2})`, 'g'), `==${this.getCorrectWord(value)}==`);
            }
        }

        return result;
    },

    getCorrectWord: function (word) {
        let wordPairArray = this.getAllWordPairArray();
        for (let pair of wordPairArray) {
            if (pair.incorrect.toLowerCase() == word.toLowerCase()) return pair.correct;
        }
        return null;
    },

    getErrorWordPairArray: function (str, pair) {
        //clet pattern = new RegExp(`(?!|)${pair.incorrect}(?!|)`, 'ig');
        let pattern = new RegExp(`(?!(\\||\\=))${pair.incorrect}(?!(\\||\\=))`, 'ig');
        let matchResult = str.match(pattern);
        let result = [];
        if (matchResult != null) {
            for (let key in matchResult) {
                if (matchResult[key] != pair.correct && !result.includes(matchResult[key])) result.push(matchResult[key]);
            }
        }
        //if (result.length > 0) console.log(result);
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