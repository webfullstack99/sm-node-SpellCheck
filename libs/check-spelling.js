var jsonfile = require('jsonfile')

module.exports = {
    highlightIncorrectClass: 'highlight-incorrect',
    highlightCorrectClass: 'highlight-correct',

    getSpellingResult: function (str, spell) {
        let result = str;
        result = this.checkEachWord(str, spell);
        result = this.checkWordPair(result, spell);
        result = this.solveAccent(result);
        result = this.highlight(result);
        return result;
    },

    solveAccent: function(str){
        let result = str;
        result = result.replace(/[\.\?\!\:](\s*\|*\=*)(\W)/g, (x)=>{
            let result = x.slice(0, x.length-1)+x.slice(-1).toUpperCase();
            return result;
        });
        return result;
    },

    ucfirst: function(str){
        return str[0].toUpperCase()+str.slice(1).toLowerCase();
    },

    highlight: function(str){
        result = str;
        result = result.replace(/\|\|\=\=([^\|\=]+)\=\=\|\|/ig, '==$1==');
        result = result.replace(/\|\|([^\|\=]+)\=\=([^\|\=]+)\=\=([^\|\=]+)\|\|/ig, '||$1$2$3||');
        

        // format incorrect
        result = result.replace(/\|\|([^\|\=]+)\|\|/ig, `<span class="${this.highlightIncorrectClass}">$1</span>`)
        
        // format correct
        result = result.replace(/\=\=([^\|\=]+)\=\=/ig, `<span class="${this.highlightCorrectClass}">$1</span>`)
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

    isWordPairExist: function (incorrect) {
        for (let pair of this.getAllWordPairArray()) 
            if (pair.incorrect == incorrect) return true;
        return false;
    },

    checkWordPair: function (str) {
        let result = str;
        let wordPairArray = this.getAllWordPairArray();
        for (let pair of wordPairArray)
            if (result.match(new RegExp(pair.incorrect, 'i'))) {
                result = result.replace(new RegExp(pair.incorrect, 'ig'), `==${pair.correct}==`);
            }
        return result;
    },

    getAllWordPairArray: function () {
        let all = [...this.getWordPairArray('custom'), ...this.getWordPairArray('general'), ...this.getWordPairArray('ignore')];
        return all;
    },

    makeClean: function (value) {
        return value.replace(/[\r\n]/g, '');
    },

    isCorrect: function (word) {
        let flag = false;

        // number
        if (word.match(/^\d+$/)) flag = true;

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
        for (let word of str.split(/[\s\.\,\!\*\?\(\)\"\"\'\':;]/))
            if (word.trim() != '')
                if (!wordArray.includes(word) && !spell.correct(word) && !this.isCorrect(word))
                    wordArray.push(word);
        return wordArray;
    },

    getWordPairArray: function (type) {
        return jsonfile.readFileSync(this.getFilePath(type));
    },

    saveWordPairArray: function (data, type) {
        data = this.sort(data);
        jsonfile.writeFileSync(this.getFilePath(type), data);
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
}