$(document).ready(function () {
    onPaste();
    onCheck();
    onCopy();
})

let selector = {
    form: '#main-form',
    areaInput: '#area-input',
    resultContainer: '#result-container',
    message: '#message',

    pasteBtn: '#paste-btn',
    checkBtn: '#check-btn',
    copyBtn: '#copy-btn',
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

let messageTimeout;
function onCheck() {
    $(selector.checkBtn).click(async function (e) {
        if ($(selector.areaInput).val().trim() != '') $(selector.form).submit();
        else {
            clearTimeout(messageTimeout);
            $(selector.message).removeClass('d-none');
            messageTimeout = setTimeout(() => {
                $(selector.message).addClass('d-none');
            }, 2000);
        }

    });
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