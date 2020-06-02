module.exports = {
    ucfirst: function (str) {
        if (str) return str[0].toUpperCase() + str.slice(1).toLowerCase();
    },

}