var express = require('express');
var router = express.Router();

var CheckSpelling = require('../libs/check-spelling');

let page = 'form';
var __path = require('../app/path');
let viewFolder = `${__path.views}/pages`;


router.get(`/`, function (req, res, next) {
    res.render(`${viewFolder}/${page}`, { require });
});

router.post(`/`, async function (req, res, next) {
    let incorrect = req.body.incorrect || '';
    let correct = req.body.correct || '';
    let status = CheckSpelling.addSpelling(incorrect, correct);
    res.render(`${viewFolder}/${page}`, { status, incorrect, correct, require });
});

// delete
router.get(`/delete/:incorrect`, async function (req, res, next) {
    CheckSpelling.deleteWordPair(req.params.incorrect)
    res.redirect('/form');
});

router.get(`/json`, function (req, res, next) {
    res.json(CheckSpelling.getWordPairArray());
});


module.exports = router;
