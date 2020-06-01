var jsonfile = require('jsonfile')

module.exports = {
    highlightIncorrectClass: 'highlight-incorrect',
    highlightCorrectClass: 'highlight-correct',
    wordPairFile: `${__dirname}/word-pair.json`,

    getSpellingResult: function (str, spell) {
        let result = str;
        result = this.checkEachWord(str, spell);
        result = this.checkWordPair(result, spell);
        return result;
    },

    addSpelling: function (incorrect, correct) {
        incorrect = incorrect.trim();
        correct = correct.trim();
        if (incorrect != '' && correct != '') {
            let wordPairArray = this.getWordPairArray();
            let existFlag = false;
            for (let pair of wordPairArray) {
                if (pair.incorrect == incorrect) {
                    existFlag = true;
                    break;
                }
            }

            if (!existFlag) {
                wordPairArray.push({ incorrect, correct });
                this.saveWordPairArray(wordPairArray);
                return true;
            }
        }
        return false;
    },

    checkWordPair: function (str) {
        let result = str;
        let wordPairArray = this.getWordPairArray();
        for (let pair of wordPairArray)
            if (result.toLowerCase().includes(pair.incorrect)) {
                result = result.replace(new RegExp(pair.incorrect, 'ig'), `<span class="${this.highlightCorrectClass}">${pair.correct}</span>`);
            }
        return result;
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
            result = result.replace(new RegExp(`${word}`, ''), `<span class="${this.highlightIncorrectClass}">${word}</span>`);
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

    getWordPairArray: function () {
        return jsonfile.readFileSync(this.wordPairFile);
    },

    saveWordPairArray: function (data) {
        data = this.sort(data);
        jsonfile.writeFileSync(this.wordPairFile, data);
    },


    sort: function (arr) {
        arr.sort((x, y) => {
            let incorrectX = x.incorrect.toLowerCase();
            let incorrectY = y.incorrect.toLowerCase();
            return incorrectX.localeCompare(incorrectY);
        })
        return arr;
    },

    deleteWordPair: function (incorrect) {
        let wordPairArray = this.getWordPairArray();
        let index = 0;
        for (let pair of wordPairArray) {
            if (pair.incorrect == incorrect) wordPairArray.splice(index, 1);
            index++;
        }
        this.saveWordPairArray(wordPairArray);
    }
}