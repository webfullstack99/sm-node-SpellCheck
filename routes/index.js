var express = require('express');
var router = express.Router();

var dictionary = require('dictionary-vi')
var nspell = require('nspell')

var __path = require('../app/path');
var CheckSpelling = require('../libs/check-spelling');
var Helper = require(`${__path.libs}/helper`);

let viewFolder = `${__path.views}/pages`;

/* GET home page. */
router.get(`/`, function (req, res, next) {
    let isLoggined = Helper.isLoggined(req);
    res.render(`${viewFolder}/index`, { isLoggined });
});

// check spelling
router.post(`/`, async function (req, res, next) {
    let isLoggined = Helper.isLoggined(req);
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
            isLoggined
        });
    })
});

module.exports = router;
