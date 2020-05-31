$(document).ready(function () {
    onPaste();
    onCheck();
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

//function copy(str) {
    //const el = document.createElement('textarea');
    //el.value = str;
    //el.setAttribute('readonly', '');
    //el.style.position = 'absolute';
    //el.style.left = '-9999px';
    //document.body.appendChild(el);
    //el.select();
    //document.execCommand('copy');
    //document.body.removeChild(el);
//}