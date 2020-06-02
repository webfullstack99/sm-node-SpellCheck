$(document).ready(function () {
    onPaste();
    onCheck();
    onCopy();
    setup.activeTypeMenu();
    form.checkSpellingForm();
})

let selector = {
    form: '#main-form',
    addSpellingForm: '#add-spelling-form',
    incorrectInput: '#incorrect-input',
    correctInput: '#correct-input',
    areaInput: '#area-input',
    resultContainer: '#result-container',
    message: '#message',
    typeMenu: '#type-menu',

    pasteBtn: '#paste-btn',
    checkBtn: '#check-btn',
    copyBtn: '#copy-btn',
}

let form = {
    checkSpellingForm: function () {
        $(selector.addSpellingForm).submit(function (e) {
            let incorrect = $(selector.incorrectInput).val().trim();
            let correct = $(selector.correctInput).val().trim();
            if (incorrect == '' | correct == '') {
                solveMessage();
                e.preventDefault();
            }
        })
    }
}

let setup = {
    activeTypeMenu: function () {
        let type = setup.getQueryParams('type', 'custom');
        for (let item of $(selector.typeMenu + '>a')) {
            if ($(item).attr('name') == type) $(item).addClass('btn-info');
            else $(item).addClass('btn-light');
        }
    },

    getQueryParams: function (name, defaultVal) {
        let matchResult = window.location.search.match(new RegExp(`(\\?|&)${name}=([a-z]+)&?`));
        if (matchResult) return matchResult[2];
        return defaultVal;
    }
}

function onCopy() {
    $(selector.copyBtn).click(function (e) {
        copy($(selector.resultContainer).text().trim());
    });
}

function onPaste() {
    $(selector.pasteBtn).click(async function (e) {
        let text = await navigator.clipboard.readText();
        $(selector.areaInput).val(text);
        $(selector.form).submit();
    });
}

function onCheck() {
    $(selector.checkBtn).click(async function (e) {
        if ($(selector.areaInput).val().trim() != '') $(selector.form).submit();
        else solveMessage();

    });
}

let messageTimeout;
function solveMessage() {
    clearTimeout(messageTimeout);
    $(selector.message).removeClass('d-none');
    messageTimeout = setTimeout(() => {
        $(selector.message).addClass('d-none');
    }, 2000);
}

function copy(str) {
    console.log(str);

    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}