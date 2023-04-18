const STORAGE_API_KEY = 'storage-chatgpt-api-key';
const STORAGE_ACTIVE_TAB = 'storage-active-tab';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Save API Key to localstorage
 */
function handleSaveApiKey() {
  const btnSaveApiKey = document.getElementById('btn-save-api-key');

  btnSaveApiKey.addEventListener('click', function () {
    const apiKey = document.getElementById('chatgpt-api-key').value;
    localStorage.setItem(STORAGE_API_KEY, apiKey);
    alert('The API key has been saved successfully.');

    handleTranslate(apiKey);
    handleCorrectGrammar(apiKey);
    handleAskAnything(apiKey);
  });
}

/**
 * Get API Key from localstorage
 */
function getApiKey() {
  if (typeof Storage !== 'undefined') {
    return localStorage.getItem(STORAGE_API_KEY) || '';
  } else {
    return '';
  }
}

/**
 * Handle the response from the API as a stream
 */
async function handleMessageStreamData(displayElementId, response, progressCallback) {
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

            progressCallback(displayElementId, responseObj);
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
function displayStreamData(displayElementId, message) {
  console.log(message);
}

/**
 * Handle the response from the API as a JSON object
 */
async function handleMessageJSONData(displayElementId, response) {
  const data = await response.json();
  document.getElementById(displayElementId).innerHTML =
    'Answer:<br/>' + data.choices[0].message.content;
}

/**
 * Call ChatGPT completion API
 */
async function sendMessage(apiKey = '', message = '', displayElementId, useStream = false) {
  const response = await fetch(CHATGPT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      stream: useStream,
    }),
  });

  if (response.status !== 200) {
    throw new Error(await response.text());
  }

  if (useStream) {
    handleMessageStreamData(displayElementId, response, displayStreamData);
  } else {
    handleMessageJSONData(displayElementId, response);
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
 * Handle event when user click to button send of tab translate
 */
function handleTranslate(apiKey) {
  const btnAskChatGPT = document.getElementById('btn-translate');

  btnAskChatGPT.addEventListener('click', function () {
    const message =
      'Translate to English:\n' + document.getElementById('tab-translate-question').value;
    sendMessage(apiKey, message, 'tab-translate-answer');
  });
}

/**
 * Handle event when user click to button send of tab correct grammar
 */
function handleCorrectGrammar(apiKey) {
  const btnAskChatGPT = document.getElementById('btn-correct-grammar');

  btnAskChatGPT.addEventListener('click', function () {
    const message =
      'Correct English Grammar:\n' + document.getElementById('tab-correct-grammar-question').value;
    sendMessage(apiKey, message, 'tab-correct-grammar-answer');
  });
}

/**
 * Handle event when user click to button send of tab ask anything
 */
function handleAskAnything(apiKey) {
  const btnAskChatGPT = document.getElementById('btn-ask-anything');

  btnAskChatGPT.addEventListener('click', function () {
    const message = document.getElementById('tab-ask-anything-question').value;
    sendMessage(apiKey, message, 'tab-ask-anything-answer');
  });
}

/**
 * Add event handlers when DOM loaded
 */
document.addEventListener('DOMContentLoaded', function () {
  handleOnclickTab();
  updateFooterLink();
  handleSaveApiKey();

  const apiKey = getApiKey();
  if (apiKey) {
    handleTranslate(apiKey);
    handleCorrectGrammar(apiKey);
    handleAskAnything(apiKey);
  }
});
