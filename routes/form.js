var express = require('express');
var router = express.Router();

var CheckSpelling = require('../libs/check-spelling');

let page = 'form';
var __path = require('../app/path');
let viewFolder = `${__path.views}/pages`;
var Helper = require(`${__path.libs}/helper`);

router.get(`/`, function (req, res, next) {
    if (!Helper.isLoggined(req)) req.redirect('/');
    Helper.setLoggined(res);
    let type = CheckSpelling.getWordPairType(req.query.type);
    res.render(`${viewFolder}/${page}`, { require, wordPairType: type });
});

router.post(`/`, async function (req, res, next) {
    let type = CheckSpelling.getWordPairType(req.query.type);
    let incorrect = req.body.incorrect || '';
    let correct = req.body.correct || '';
    let status = CheckSpelling.addSpelling(incorrect, correct, type);
    let msg = (status) ? 'Add spelling successfully' : 'Oh...oh.. something went wrong';
    req.flash(status, msg);
    res.render(`${viewFolder}/${page}`, { incorrect, correct, require, wordPairType: type });
});

// delete
router.get(`/delete/:incorrect`, async function (req, res, next) {
    let type = CheckSpelling.getWordPairType(req.query.type);
    let status = CheckSpelling.deleteWordPair(req.params.incorrect, type)
    let msg = (status) ? `Deleted incorrect: ${req.params.incorrect}` : 'Oh...oh.. something went wrong';
    req.flash(status, msg, `/form?type=${type}`);
});

// show json
router.get(`/json`, function (req, res, next) {
    let type = CheckSpelling.getWordPairType(req.query.type);
    res.json(CheckSpelling.getWordPairArray(type));
});

module.exports = router;
