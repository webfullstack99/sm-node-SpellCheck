module.exports = {
    makeClean: function (value) {
        return value.replace(/[\r\n]/g, '');
    },

    solveWord: function (isIncorrect, word) {
        return (isIncorrect && !this.isCorrect(word)) ? ` <span class="highlight">${word}</span>` : ` ${word}`;
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
    }
}