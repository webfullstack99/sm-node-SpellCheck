module.exports = {
    highlightClass: 'highlight',

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

    getSpellingResult: function (str, spell) {
        let result = str;
        let incorrectWordArray = this.getIncorrectWordArray(str, spell);
        for (let word of incorrectWordArray) {
            result = result.replace(new RegExp(`${word}`, ''), `<span class="${this.highlightClass}">${word}</span>`);
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

    }


}