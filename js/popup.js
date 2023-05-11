const STORAGE_API_KEY = 'storage-chatgpt-api-key';
const STORAGE_CHAT_MODEL = 'storage-model';
const STORAGE_ACTIVE_TAB = 'storage-active-tab';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Clear events of an element and its surroundings
 */
function clearEvents(element) {
  const parent = element.parentNode;

  if (parent) {
    const clone = element.cloneNode(true);
    parent.replaceChild(clone, element);
  }
}

/**
 * Handle save settings to localstorage
 */
function handleSaveSettings() {
  const btnSaveSettings = document.getElementById('btn-save-settings');

  btnSaveSettings.addEventListener('click', function () {
    let apiKey = document.getElementById('chatgpt-api-key').value;
    if (apiKey) {
      localStorage.setItem(STORAGE_API_KEY, apiKey);
    } else {
      apiKey = localStorage.getItem(STORAGE_API_KEY) || '';
    }

    const chatModel = document.getElementById('chatgpt-model').value;
    if (chatModel) {
      localStorage.setItem(STORAGE_CHAT_MODEL, chatModel);
    }

    alert('Settings saved successfully.');

    handleTranslate(apiKey, chatModel);
    handleCorrectGrammar(apiKey, chatModel);
    handleAskAnything(apiKey, chatModel);
  });
}

/**
 * Load settings from localstorage
 */
function loadSettings() {
  const apiKey = localStorage.getItem(STORAGE_API_KEY) || '';
  const chatModel = localStorage.getItem(STORAGE_CHAT_MODEL) || '';

  if (apiKey) {
    document.getElementById('chatgpt-api-key').placeholder = '*'.repeat(apiKey.length);
  }

  if (chatModel) {
    document.getElementById('chatgpt-model').value = chatModel;
  }

  return { apiKey, chatModel };
}

/**
 * Handle the response from the API as a stream
 */
async function handleMessageStreamData(
  questionElementId,
  answerElementId,
  response,
  progressCallback
) {
  const reader = response.body.getReader();
  let responseObj = {};

  for (;;) {
    const { done, value } = await reader.read();

    if (done) break;

    const lines = new TextDecoder('utf-8').decode(value).split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        if (line.includes('[DONE]')) return responseObj;

        try {
          const data = JSON.parse(line.slice(6));
          const delta = data.choices[0].delta;

          for (const key in delta) {
            if (!(key in responseObj)) responseObj[key] = delta[key];
            else responseObj[key] += delta[key];

            progressCallback(questionElementId, answerElementId, responseObj);
          }
        } catch (e) {
          console.log('Error parsing line:', line);
        }
      }
    }
  }

  return responseObj;
}

/**
 * Display the streamed data on the screen
 */
function displayStreamData(questionElementId, answerElementId, message) {
  console.log(questionElementId, answerElementId, message);
}

/**
 * Handle the response from the API as a JSON object
 */
async function handleMessageJSONData(questionElementId, answerElementId, response) {
  const questionElement = document.getElementById(questionElementId);
  const question = questionElement.value;
  const data = await response.json();
  const answer = marked.parse(data?.choices[0]?.message?.content);

  document.getElementById(
    answerElementId
  ).innerHTML = `<h3>Question:</h3>${question}<br/><br/><h3>Answer:</h3>${answer}`;
  questionElement.value = '';
}

/**
 * Call ChatGPT completion API
 */
async function sendMessage(
  apiKey = '',
  chatModel = '',
  message = '',
  questionElementId,
  answerElementId,
  useStream = false
) {
  const response = await fetch(CHATGPT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: chatModel,
      messages: [{ role: 'user', content: message }],
      stream: useStream,
    }),
  });

  if (response.status !== 200) {
    const errorMessage = await response.text();
    alert('Error: \n' + errorMessage);
  }

  if (useStream) {
    handleMessageStreamData(questionElementId, answerElementId, response, displayStreamData);
  } else {
    handleMessageJSONData(questionElementId, answerElementId, response);
  }
}

/**
 * Handle event when user click to Tab
 */
function handleOnclickTab() {
  const tabs = document.getElementsByClassName('tab');

  // Handle tab clicked
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function () {
      localStorage.setItem(STORAGE_ACTIVE_TAB, i.toString());

      // Remove class "active" from all tabs
      for (let j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove('active');
      }

      // Add class "active" to chosen tab
      this.classList.add('active');

      // Hide all tab contents
      const tabContents = document.getElementsByClassName('tab-content');
      for (let k = 0; k < tabContents.length; k++) {
        tabContents[k].style.display = 'none';
      }

      // Show chosen tab content
      const tabId = this.children[0].getAttribute('href').replace('#', '');
      document.getElementById(tabId).style.display = 'block';
    });
  }

  // Open last active tab
  const activeTab = +localStorage.getItem(STORAGE_ACTIVE_TAB);
  tabs[activeTab].click();
}

/**
 * Update link in popup's footer
 */
function updateFooterLink() {
  document.getElementById('link-to-setting-page').href = chrome.runtime.getURL('index.html');
}

/**
 * Handle event when user inputs a question
 */
function handleInputQuestion() {
  function autoGrow(event) {
    const element = event.target;
    element.style.height = '5px';
    element.style.height = element.scrollHeight + 'px';
  }

  document.getElementById('tab-translate-question').addEventListener('input', autoGrow);
  document.getElementById('tab-correct-grammar-question').addEventListener('input', autoGrow);
  document.getElementById('tab-ask-anything-question').addEventListener('input', autoGrow);
}

/**
 * Handle event when user click to button send of tab translate
 */
function handleTranslate(apiKey, chatModel) {
  const btnAskChatGPT = document.getElementById('btn-translate');

  btnAskChatGPT.addEventListener('click', function () {
    const message =
      'Translate to English:\n' + document.getElementById('tab-translate-question').value;
    sendMessage(apiKey, chatModel, message, 'tab-translate-question', 'tab-translate-answer');
  });
}

/**
 * Handle event when user click to button send of tab correct grammar
 */
function handleCorrectGrammar(apiKey, chatModel) {
  const btnAskChatGPT = document.getElementById('btn-correct-grammar');

  btnAskChatGPT.addEventListener('click', function () {
    const message =
      'Correct English Grammar:\n' + document.getElementById('tab-correct-grammar-question').value;
    sendMessage(
      apiKey,
      chatModel,
      message,
      'tab-correct-grammar-question',
      'tab-correct-grammar-answer'
    );
  });
}

/**
 * Handle event when user click to button send of tab ask anything
 */
function handleAskAnything(apiKey, chatModel) {
  const btnAskChatGPT = document.getElementById('btn-ask-anything');

  btnAskChatGPT.addEventListener('click', function () {
    const message = document.getElementById('tab-ask-anything-question').value;
    sendMessage(apiKey, chatModel, message, 'tab-ask-anything-question', 'tab-ask-anything-answer');
  });
}

/**
 * Add event handlers when DOM loaded
 */
document.addEventListener('DOMContentLoaded', function () {
  handleOnclickTab();
  updateFooterLink();
  handleSaveSettings();
  handleInputQuestion();

  const { apiKey, chatModel } = loadSettings();

  if (apiKey) {
    handleTranslate(apiKey, chatModel);
    handleCorrectGrammar(apiKey, chatModel);
    handleAskAnything(apiKey, chatModel);
  }
});
