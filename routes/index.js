var express = require('express');
var router = express.Router();

var dictionary = require('dictionary-vi')
var nspell = require('nspell')
var CheckSpelling = require('../libs/check-spelling');
var Custom = require('../libs/custom');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

// check spelling
router.post('/', async function (req, res, next) {
    dictionary((err, dict) => {
        let checkSpellingResult = '';
        if (req.body.input) {
            try {
                let tempInput = CheckSpelling.makeClean(req.body.input)
                let spell = nspell(dict)
                for (let word of tempInput.split(/[\s\.\,\!\*\?\(\)\"\"\'\':;]/))
                    if (word.trim()!='')
                        checkSpellingResult += CheckSpelling.solveWord(!spell.correct(word), word);
            } catch (error) { console.log('input invalid'); }
            checkSpellingResult = Custom.asignString(checkSpellingResult, req.body.input);
        }

        res.render('index', {
            input: req.body.input,
            output: checkSpellingResult,
        });
    })
});

module.exports = router;
