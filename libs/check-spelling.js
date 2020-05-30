module.exports = {
    makeClean: function (value) {
        return value.replace(/[\r\n]/g, '');
    },

    solveWord: function (isIncorrect, word) {
        return (isIncorrect && !word.match(/^\d+$/)) ? ` <span class="highlight">${word}</span>` : ` ${word}`;
    }
}