let selectedRecipient = document.querySelector(".recipientOptions .first");
let selectedPrivacy = document.querySelector(".privacyOptions .first");

function toggleSidebar() {
    let sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("hiddingClass");
}

function selectOption(element) {
    toggleSelection(element.children[1]);

    if(isRecipientOption(element)) {
        toggleSelection(selectedRecipient.children[1]);
        selectedRecipient = element;
    } else {
        toggleSelection(selectedPrivacy.children[1]);
        selectedPrivacy = element;
    }
    updateChoices()
}

function toggleSelection(element) {
    element.classList.toggle("hiddingClass");
}

function isRecipientOption(element){
    return element.parentNode.classList.contains("recipientOptions");
}

function updateChoices() {
    let newRecipient = selectedRecipient.children[0].children[1].innerText;
    let chosenPrivacy = selectedPrivacy.children[0].children[1].innerText;
    let newInfo = `Enviando para ${newRecipient}`;
    if (chosenPrivacy === 'Reservadamente') {
        newInfo +=  ' (reservadamente)';
    }
    document.querySelector(".bottomBar p").innerHTML = newInfo;
}