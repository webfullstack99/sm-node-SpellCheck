module.exports = {
    asignString: function (value, defaultValue = '') {
        if (value.trim() != '') return value.trim();
        return defaultValue.trim();
    }
}