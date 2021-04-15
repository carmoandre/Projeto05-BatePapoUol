let nickName = "";
let idUser = 0;
let idChat = 0;
let selectedRecipient = document.querySelector(".recipientOptions .first");
let selectedPrivacy = document.querySelector(".privacyOptions .first");

function tryConection() {
    nickName = document.querySelector(".nickName").value;
    const request = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants", {name:nickName});

    request.then(logOnServer);
    request.catch(tryAnotherName);
}

function logOnServer(answer) {
    console.log(answer);
    console.log(answer.status);
    idUser = setInterval(stayLoggedIn, 5000);
    document.querySelector(".loginScreen").classList.add("hiddingClass");
    recoverMessages();
    idChat = setInterval(recoverMessages, 10000);
}

function tryAnotherName(answer) {
    console.log(answer);
    console.log(answer.response.status);
    document.querySelector(".nickName").value = "";
    alert("Nome já existente. Tente outro!");

}

function stayLoggedIn() {
    const request = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status", {name:nickName});
    request.then(stilLogdedIn);
    request.catch(unexpectedLogout);
}

function stilLogdedIn(answer) {
    console.log("continua logado! Status: " + answer.status);
}

function unexpectedLogout(answer) {
    console.log("Erro: " + answer.response.status);
}

function recoverMessages() {
    const request = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages")
    request.then(renderWithAnswer);
    request.catch(errorGettingMessages);
}; 

function renderWithAnswer(answer) {
    renderChat(answer.data);
}

function errorGettingMessages(answer) {
    alert(`Erro ${answer.response.status}. Mensagens não recuperadas. Tente atualizar a pagina e fazer novo login.`);
}

function renderChat(lastMsgs) {
    let messageClass = "";
    let privately = "";
    const chatElement = document.querySelector(".chat");
    chatElement.innerHTML = "";
    for (let i = 0; i < lastMsgs.length; i++) {
        if (lastMsgs[i].type === "status") {
            messageClass = " class=\"statusMessage\"";
            chatElement.innerHTML += 
                `<li${messageClass}>
                    <span>(${lastMsgs[i].time})</span>
                    <span><strong>${lastMsgs[i].from}</strong> ${lastMsgs[i].text}</span>
                </li>`
            
        } else {
            if (lastMsgs[i].type === "private_message") {
                messageClass = " class=\"privateMessage\"";
                privately = " reservadamente";
            }            
            chatElement.innerHTML += 
            `<li${messageClass}>
                <span>(${lastMsgs[i].time})</span>
                <span><strong>${lastMsgs[i].from}</strong>${privately} para <strong>${lastMsgs[i].to}</strong>: ${lastMsgs[i].text}</span>
            </li>`
        }
        messageClass = "";
        privately = "";
    }
}

function sentMesasge() {
    const newMessage = document.querySelector(".messageBox").value;
    const recipient = selectedRecipient.querySelector("span").innerText;
    const type = findTypebyPrivacy();
    const messageObject = {
        from: nickName,
        to: recipient,
        text: newMessage,
        type: type
    }
    const request = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages", messageObject);

    request.then(messageSent);
    request.catch(errorSendingMessage);
}

function findTypebyPrivacy () {
    if (selectedPrivacy.querySelector("span").innerText === "Público") {
        console.log("Encontrou Público como privacidade");
        return "message";
    } else {
        return "private_message";
    }
}

function messageSent(answer) {
    document.querySelector(".messageBox").value = ""
    recoverMessages();
    console.log("Mensagem enviada! Status: " + answer.status);
}

function errorSendingMessage(answer) {
    alert(`Erro ${answer.response.status}. Mensagem não enviada. Tente atualizar a pagina e fazer novo login.`);
}

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

