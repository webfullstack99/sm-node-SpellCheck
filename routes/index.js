var express = require('express');
var router = express.Router();

var dictionary = require('dictionary-vi')
var nspell = require('nspell')
var CheckSpelling = require('../libs/check-spelling');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

// check spelling
router.post('/', async function (req, res, next) {
    dictionary((err, dict) => {
        let checkSpellingResult = '';
        if (req.body.input) {
            let tempInput = CheckSpelling.makeClean(req.body.input)
            let spell = nspell(dict)
            checkSpellingResult = CheckSpelling.getSpellingResult(tempInput, spell);
        }

        res.render('index', {
            input: req.body.input,
            output: checkSpellingResult,
        });
    })
});

module.exports = router;
