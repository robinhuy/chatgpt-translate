const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const STORAGE_API_KEY = 'storage-chatgpt-api-key';
const STORAGE_CHAT_MODEL = 'storage-model';
const STORAGE_ACTIVE_TAB = 'storage-active-tab';

/**
 * Clear events of an element and its surroundings
 */
function clearEvents(element) {
  const parent = element.parentNode;

  if (parent) {
    const clone = element.cloneNode(true);
    parent.replaceChild(clone, element);
    return clone;
  }

  return element;
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
async function handleMessageStreamData(questionElementId, answerElementId, response) {
  const questionElement = document.getElementById(questionElementId);
  const answerElement = document.getElementById(answerElementId);
  const question = questionElement.value;
  const reader = response.body.getReader();
  const startWord = 'data:';
  let responseObj = {};

  answerElement.innerHTML = `<h3>Question:</h3>${question}<br/><br/><h3>Answer:</h3>`;
  questionElement.value = '';
  localStorage.setItem(questionElementId, '');

  for (;;) {
    const { done, value } = await reader.read();

    if (done) break;

    const lines = new TextDecoder('utf-8').decode(value).split('\n');

    for (const line of lines) {
      if (line.startsWith(startWord)) {
        if (line.includes('[DONE]')) return responseObj;

        try {
          const strData = line.slice(startWord.length);
          const jsonData = JSON.parse(strData);
          const content = jsonData.choices[0].delta.content || '';

          answerElement.innerHTML += content;
        } catch (e) {
          console.log('Error parsing line:', line);
        }
      }
    }
  }

  return responseObj;
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
  localStorage.setItem(questionElementId, '');
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
    const errorMessage = await response.json();
    alert(errorMessage?.error?.message);
    return;
  }

  if (useStream) {
    handleMessageStreamData(questionElementId, answerElementId, response);
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

      // Load old question
      const questionElement = document.getElementById(tabId + '-question');
      questionElement.value = localStorage.getItem(tabId + '-question') || '';
      questionElement.focus();
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
 * Toggle the setting section
 */
function toggleSettingSection(isShow = true) {
  const settingSectionElement = document.getElementById('setting-section');
  if (isShow) {
    settingSectionElement.setAttribute('class', '');
  } else {
    settingSectionElement.setAttribute('class', 'd-none');
  }
}

/**
 * Handle event when user inputs a question
 */
function handleInputQuestion() {
  function autoGrow(event) {
    const element = event.target;
    element.style.height = '5px';
    element.style.height = element.scrollHeight + 'px';
    localStorage.setItem(element.id, element.value);
  }

  document.getElementById('tab-translate-question').addEventListener('input', autoGrow);
  document.getElementById('tab-correct-grammar-question').addEventListener('input', autoGrow);
  document.getElementById('tab-ask-anything-question').addEventListener('input', autoGrow);
}

/**
 * Handle event when user click to button send of tab translate
 */
function handleTranslate(apiKey, chatModel) {
  const btnAskChatGPT = clearEvents(document.getElementById('btn-translate'));

  btnAskChatGPT.addEventListener('click', function () {
    const language = document.getElementById('select-translate-language').value || 'English';
    const question = document.getElementById('tab-translate-question').value || '';
    const message = `Translate to ${language}:\n${question}`;

    sendMessage(apiKey, chatModel, message, 'tab-translate-question', 'tab-translate-answer', true);
  });
}

/**
 * Handle event when user click to button send of tab correct grammar
 */
function handleCorrectGrammar(apiKey, chatModel) {
  const btnAskChatGPT = clearEvents(document.getElementById('btn-correct-grammar'));

  btnAskChatGPT.addEventListener('click', function () {
    const language = document.getElementById('select-correct-grammar-language').value || 'English';
    const question = document.getElementById('tab-correct-grammar-question').value || '';
    const message = `Correct ${language} Grammar:\n${question}`;

    sendMessage(apiKey, chatModel, message, 'tab-correct-grammar-question', 'tab-correct-grammar-answer', true);
  });
}

/**
 * Handle event when user click to button send of tab ask anything
 */
function handleAskAnything(apiKey, chatModel) {
  const btnAskChatGPT = clearEvents(document.getElementById('btn-ask-anything'));

  btnAskChatGPT.addEventListener('click', function () {
    const message = document.getElementById('tab-ask-anything-question').value;
    sendMessage(apiKey, chatModel, message, 'tab-ask-anything-question', 'tab-ask-anything-answer', true);
  });
}

/**
 * Add event handlers when DOM loaded
 */
document.addEventListener('DOMContentLoaded', function () {
  handleOnclickTab();
  // updateFooterLink();
  handleSaveSettings();
  handleInputQuestion();

  const { apiKey, chatModel } = loadSettings();
  const settingSectionElement = document.getElementById('setting-section');

  if (apiKey) {
    handleTranslate(apiKey, chatModel);
    handleCorrectGrammar(apiKey, chatModel);
    handleAskAnything(apiKey, chatModel);
    settingSectionElement.setAttribute('class', 'd-none');
  }

  const toggleSettingSectionElement = document.getElementById('toggle-setting-section');
  toggleSettingSectionElement.addEventListener('click', function () {
    if (settingSectionElement.getAttribute('class') === 'd-none') {
      settingSectionElement.setAttribute('class', '');
      toggleSettingSectionElement.innerText = 'Show Settings';
    } else {
      settingSectionElement.setAttribute('class', 'd-none');
      toggleSettingSectionElement.innerText = 'Hide Settings';
    }
  });
});
