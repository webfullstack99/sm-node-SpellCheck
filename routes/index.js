var express = require('express');
var router = express.Router();

var dictionary = require('dictionary-vi')
var nspell = require('nspell')

let page = '';
var __path = require('../app/path');
var CheckSpelling = require('../libs/check-spelling');

let viewFolder = `${__path.views}/pages`;

/* GET home page. */
router.get(`/`, function (req, res, next) {
    res.render(`${viewFolder}/index`);
});

// check spelling
router.post(`/`, async function (req, res, next) {
    dictionary((err, dict) => {
        let checkSpellingResult = '';
        if (req.body.input) {
            let tempInput = CheckSpelling.makeClean(req.body.input)
            let spell = nspell(dict)
            try {
                checkSpellingResult = CheckSpelling.getResult(tempInput, spell);
            } catch (e) { console.log(e.message); }
        }

        res.render(`${viewFolder}/index`, {
            input: req.body.input,
            output: checkSpellingResult,
        });
    })
});

module.exports = router;
