let nickName = "";
let intervalIDUser = 0;
let intervalIDChat = 0;
let intervalIDParticipants = 0;
let selectedRecipient = document.querySelector(".recipientOptions .first");
let selectedPrivacy = document.querySelector(".privacyOptions .first");
let loginScreenInput = document.querySelector(".nickName");
let messageTypingTypInput = document.querySelector(".messageBox");

loginScreenInput.addEventListener("keyup", clickEffect);
messageTypingTypInput.addEventListener("keyup", clickEffect);

function clickEffect(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      if (document.querySelector(".loginScreen").classList.contains("hiddingClass")) {
            document.querySelector(".bottomBar ion-icon").click();
      } else {
          document.querySelector(".loginScreen button").click();
      }
    }
  }

function tryConection() {
    nickName = document.querySelector(".nickName").value;
    const request = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants", {name:nickName});

    request.then(logOnServer);
    request.catch(tryAnotherName);
}

function logOnServer(answer) {
    intervalIDUser = setInterval(stayLoggedIn, 5000);
    document.querySelector(".loginScreen").classList.add("hiddingClass");
    recoverMessages();
    intervalIDChat = setInterval(recoverMessages, 3000);
    recoverParticipants()
    intervalIDParticipants = setInterval(recoverParticipants, 10000);
}

function tryAnotherName(answer) {
    document.querySelector(".nickName").value = "";
    alert("Nome já existente. Tente outro!");

}

function stayLoggedIn() {
    const request = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status", {name:nickName});
    request.then(stilLogdedIn);
    request.catch(unexpectedLogout);
}

function stilLogdedIn(answer) {
    console.log("Continua logado! Status: " + answer.status);
}

function unexpectedLogout(answer) {
    alert(`Erro ${answer.response.status}. Você foi deslogado no bate-papo. A janela sera recarregada para que você possa logar outra vez.`);
    window.location.reload()
}

function recoverMessages() {
    const request = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages");
    request.then(renderWithMessages);
    request.catch(errorGettingMessages);
}; 

function renderWithMessages(answer) {
    renderChat(answer.data);
}

function errorGettingMessages(answer) {
    alert(`Erro ${answer.response.status}. Mensagens não recuperadas. A janela sera recarregada para que você possa logar outra vez.`);
    window.location.reload();
}

function renderChat(lastMsgs) {
    const chatElement = document.querySelector(".chat");
    chatElement.innerHTML = "";
    let chatLastChild = "";
    for (let i = 0; i < lastMsgs.length; i++) {
        let messageClass = "";
        let privately = "";
        let specificPart = "";
        if (isPrivateButNotForYou(lastMsgs[i])) {
            continue;
        }
        if (lastMsgs[i].type === "status") {
            messageClass = " class=\"statusMessage\"";
            specificPart = `${lastMsgs[i].from}</strong> ${lastMsgs[i].text}`;        
        } else {
            if (lastMsgs[i].type === "private_message") {
                messageClass = " class=\"privateMessage\"";
                privately = " reservadamente";
            }
            specificPart = `${lastMsgs[i].from}</strong>${privately} para <strong>${lastMsgs[i].to}</strong>: ${lastMsgs[i].text}`;        
        }

        chatElement.innerHTML += 
            `<li${messageClass}>
                <span>(${lastMsgs[i].time})</span>
                <span><strong>${specificPart}</span>
            </li>`;
    }
    chatLastChild = document.querySelector(".chat").lastElementChild;
    chatLastChild.scrollIntoView();
}

function isPrivateButNotForYou(message) {
    if (message.type === "private_message") {
        if (message.from !== nickName && message.to !== nickName) {
            return true;
        }
    }
    return false;
}

function recoverParticipants() {
    const request = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants");
    request.then(renderWithParticipants);
    request.catch(errorGettingParticipants);
}

function renderWithParticipants(answer) {
    renderParticipants(answer.data);
}

function errorGettingParticipants() {
    alert(`Erro ${answer.response.status}. Particpantes não recuperadas. A janela sera recarregada para que você possa logar outra vez.`);
    window.location.reload();
}

function renderParticipants(currentParticpants) {
    const particpantsElement = document.querySelector(".recipientOptions");
    let chosenBeforeRender = selectedRecipient.querySelector("span").innerText;
    resetParticpantSelection(particpantsElement);
    for (let i = 0; i < currentParticpants.length; i++) {
        particpantsElement.innerHTML += 
            `<div id="${i}" onclick="selectOption(this)" class="option">
                <div>
                    <ion-icon name="person-circle"></ion-icon>
                    <span>${currentParticpants[i].name}</span>
                </div>
                <ion-icon class="hiddingClass" name="checkmark-outline"></ion-icon>
            </div>`;
        if (currentParticpants[i].name === chosenBeforeRender) {
            chosenBeforeRender = document.getElementById(`${i}`);
            selectOption(chosenBeforeRender)
        } 
    }

}

function resetParticpantSelection(element) {
    element.innerHTML = 
        `<div id="0" onclick="selectOption(this)" class="option first">
            <div>
                <ion-icon name="people"></ion-icon>
                <span>Todos</span>
            </div>
            <ion-icon name="checkmark-outline"></ion-icon>
        </div>`;
    
    selectedRecipient = document.querySelector(".recipientOptions .first");
    selectOption(selectedRecipient);
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
        return "message";
    } else {
        return "private_message";
    }
}

function messageSent(answer) {
    document.querySelector(".messageBox").value = ""
    recoverMessages();
}

function errorSendingMessage(answer) {
    alert(`Erro ${answer.response.status}. Mensagem não enviada. A Página será recarregada e será necessário fazer login no bate-papo novamente.`);
    window.location.reload();
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
    updateChoices();
}

function isSameElement(element) {
    if (element.querySelector("span").innerText === selectedRecipient.querySelector("span").innerText) {
        return true;
    }
    return false;
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

