module.exports = {
    password: 'admin',
    ucfirst: function (str) {
        if (str) return str[0].toUpperCase() + str.slice(1).toLowerCase();
    },

    getFirstLetter: function (str) {
        if (str) return str.slice(0, 1);
        return null;
    },

    isLoggined: function (req) {
        if (req.cookies.password == this.password || req.query.password == this.password) return true;
        return false;
    },

    setLoggined: function (res) {
        res.cookie('password', this.password, {expires: false});
    }

}