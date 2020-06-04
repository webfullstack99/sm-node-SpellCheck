module.exports = {
    ucfirst: function (str) {
        if (str) return str[0].toUpperCase() + str.slice(1).toLowerCase();
    },

    getFirstLetter: function (str) {
        if (str) return str.slice(0, 1);
        return null;
    }
}