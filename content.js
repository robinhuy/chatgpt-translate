chrome.runtime.onMessage.addListener(function (request) {
  function eieShowToast(icon) {
    // Create toast container
    var toastContainer = document.createElement("div");
    toastContainer.style.top = "10%";
    toastContainer.style.right = "7%";
    toastContainer.style.maxWidth = "80%";
    toastContainer.style.position = "fixed";
    toastContainer.style.zIndex = "999999";
    toastContainer.style.fontSize = "15px";
    toastContainer.style.lineHeight = "1.5";
    toastContainer.style.color = "rgba(0,0,0,0.87)";

    // Create toast
    var toast = document.createElement("div");
    toast.style.transform = "translateY(-35px)";
    toast.style.top = "35px";
    toast.style.marginTop = "10px";
    toast.style.padding = "10px 25px";
    toast.style.backgroundColor = "#323232";
    toast.style.color = "#ffffff";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.justifyContent = "space-between";
    toast.style.boxShadow =
      "0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2)";

    // Set text
    var span = document.createElement("span");
    var text = document.createTextNode(icon + " \u00A0 copied to clipboard");
    span.appendChild(text);

    // Append child
    toast.appendChild(span);
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);

    // Remove toast after 3 second
    setTimeout(function () {
      document.body.removeChild(toastContainer);
    }, 3000);
  }

  // Show toast when received message "copy emoticon"
  if (request.action === "copy-emoticon") {
    eieShowToast(request.icon);
  }
});

function createButton(text, handleClick) {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("class", "btn btn-neutral");
  button.innerText = text;
  button.addEventListener("click", handleClick);
  return button;
}

function handleCustomButtonClick(buttonType = 1) {
  return function () {
    const textarea = document.querySelector("main form textarea");

    const text = buttonType === 1 ? "Dịch sang Tiếng Anh" : "Sửa lỗi ngữ pháp Tiếng Anh";

    // If textarea does not has value
    if (textarea.value === "") {
      textarea.value = text + ":\n";
      textarea.style.height = 25 + textarea.scrollHeight + "px";
      textarea.focus();
    }
    // If textarea has value
    else if (!textarea.value.startsWith(text)) {
      textarea.value = text + ": \n" + textarea.value;

      const btnSubmit = textarea.nextElementSibling;
      btnSubmit.click();
    }
  };
}

// Add feature to Chat OpenAI
if (window.location.host === "chat.openai.com") {
  // Add button translate
  const btnTranslate = createButton("Translate English", handleCustomButtonClick(1));

  // Add button correct grammar
  const btnCorrectGrammar = createButton("Correct Grammar", handleCustomButtonClick(2));

  const chatToolbar = document.querySelector("main form > div > div");
  chatToolbar.appendChild(btnTranslate);
  chatToolbar.appendChild(btnCorrectGrammar);
}
