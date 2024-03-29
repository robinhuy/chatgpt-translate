// Add feature to Chat OpenAI
if (window.location.host === 'chat.openai.com') {
  const BUTTON_TYPE = {
    TRANSLATE_ENGLISH: 1,
    TRANSLATE_VIETNAMESE: 2,
    CORRECT_GRAMMAR: 3,
  };
  const BUTTON_CONTENT = {
    [BUTTON_TYPE.TRANSLATE_ENGLISH]: 'Dịch sang Tiếng Anh',
    [BUTTON_TYPE.TRANSLATE_VIETNAMESE]: 'Dịch sang Tiếng Việt',
    [BUTTON_TYPE.CORRECT_GRAMMAR]: 'Sửa lỗi ngữ pháp Tiếng Anh',
  };

  const createButton = (textarea, text, buttonType = BUTTON_TYPE.TRANSLATE_ENGLISH) => {
    const btnSubmit = textarea.nextElementSibling;

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn btn-neutral');
    button.innerText = text;

    button.addEventListener('click', function () {
      const text = BUTTON_CONTENT[buttonType];

      // If textarea does not has value
      if (textarea.value === '') {
        textarea.value = text + ':\n';
        textarea.style.height = 25 + textarea.scrollHeight + 'px';
        textarea.focus();
      }
      // If textarea has value
      else if (!textarea.value.startsWith(text)) {
        textarea.value = text + ': \n' + textarea.value;
        btnSubmit.click();
      }
    });

    return button;
  };

  const addButtonsToChatToolbar = (textarea) => {
    // Create button Translate
    const btnTranslateEnglish = createButton(
      textarea,
      'Translate English',
      BUTTON_TYPE.TRANSLATE_ENGLISH
    );
    const btnTranslateVietnamese = createButton(
      textarea,
      'Translate Vietnamese',
      BUTTON_TYPE.TRANSLATE_VIETNAMESE
    );

    // Create button Correct grammar
    const btnCorrectGrammar = createButton(
      textarea,
      'Correct Grammar',
      BUTTON_TYPE.CORRECT_GRAMMAR
    );

    // Add buttons
    const chatToolbar = document.querySelector('main form .relative .h-full.flex');
    chatToolbar.appendChild(btnTranslateEnglish);
    chatToolbar.appendChild(btnTranslateVietnamese);
    chatToolbar.appendChild(btnCorrectGrammar);
  };

  const copyText = (text) => {
    if ('clipboard' in navigator) {
      return navigator.clipboard.writeText(text);
    }

    const body = document.body;

    if (!body) {
      return Promise.reject(new Error());
    }

    const node = createNode(text);
    body.appendChild(node);
    copyNode(node);
    body.removeChild(node);

    return Promise.resolve();
  };

  const addButtonCopyToClipboard = () => {
    // Create button CopyToClipboard
    const btnCopyToClipboard = document.createElement('button');
    btnCopyToClipboard.innerHTML = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true">
        <path fill="white" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
        <path fill="white" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
      </svg>`;
    btnCopyToClipboard.addEventListener('click', () => {
      const answerElement =
        this.parentElement.parentElement.parentElement.firstElementChild.firstElementChild
          .firstElementChild;
      console.log('--- click ---', answerElement);
    });

    // Add button to end of ChatGPT responses
    const responseTextElements = document.querySelectorAll(
      'main > div.flex-1.overflow-hidden .flex.items-center .bg-gray-50 .relative .flex.justify-between .flex.self-end'
    );
    for (let responseTextElement of responseTextElements) {
      responseTextElement.innerHTML = '';
      responseTextElement.appendChild(btnCopyToClipboard);
    }
  };

  // Check when URL changed
  let currentUrl = '';

  setInterval(() => {
    const textarea = document.querySelector('main form textarea');

    if (textarea && currentUrl !== window.location.href) {
      currentUrl = window.location.href;
      addButtonsToChatToolbar(textarea);

      // Add button CopyToClipBoard after submit
      // const btnSubmit = textarea.nextElementSibling;
      // btnSubmit.addEventListener('click', function () {
      //   setTimeout(() => {
      //     addButtonCopyToClipboard();
      //   }, 300);
      // });
    }
  }, 2000);
}
