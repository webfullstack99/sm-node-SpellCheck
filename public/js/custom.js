$(document).ready(function () {
    onDelete();
    onPaste();
    onCheck();
    onCopy();
    onLogin();
    setup.activeTypeMenu();
    form.checkSpellingForm();
})

let selector = {
    form: '#main-form',
    loginForm: '#login-form',
    addSpellingForm: '#add-spelling-form',
    incorrectInput: '#incorrect-input',
    correctInput: '#correct-input',
    areaInput: '#area-input',
    resultContainer: '#result-container',
    message: '#message',
    typeMenu: '#type-menu',

    loginInput: '#loginInput',
    loginConfirm: '#loginConfirm',
    loginMsg: '.loginMsg',

    pasteBtn: '#paste-btn',
    checkBtn: '#check-btn',
    copyBtn: '#copy-btn',
    deleteBtn: '.delete-btn',
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

function onDelete() {
    $(selector.deleteBtn).click(function (e) {
        let r = confirm(`Do you want to delete "${$(this).data('incorrect')}"?`);
        if (!r) e.preventDefault();
    })
}

function onLogin() {
    $(selector.loginConfirm).click(function () { $(selector.loginForm).submit(); })

    $(selector.loginForm).submit(function (e) {
        $(selector.loginMsg).detach();
        let val = $(selector.loginInput).val();
        if (val != 'admin') {
            $(selector.loginInput).after('<span class="loginMsg badge badge-danger">Password is incorrect<span>');
            e.preventDefault();
        }
    })
}

function onCopy() {
    $(selector.copyBtn).click(function (e) {
        copy($(selector.resultContainer).text().trim());
    });
}

function onPaste() {
    if (!navigator) $(selector.pasteBtn).addClass('d-none');
    $(selector.pasteBtn).click(async function (e) {
        try {
            let text = await navigator.clipboard.readText();
            if (text.trim() != '') {
                $(selector.areaInput).val(text);
                $(selector.form).submit();
            }
        } catch (e) { }
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