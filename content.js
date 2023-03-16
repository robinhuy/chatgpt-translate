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

  window.addEventListener('load', () => {
    const textarea = document.querySelector('main form textarea');
    const btnSubmit = textarea.nextElementSibling;

    const eieShowToast = (icon) => {
      // Create toast container
      var toastContainer = document.createElement('div');
      toastContainer.style.top = '10%';
      toastContainer.style.right = '7%';
      toastContainer.style.maxWidth = '80%';
      toastContainer.style.position = 'fixed';
      toastContainer.style.zIndex = '999999';
      toastContainer.style.fontSize = '15px';
      toastContainer.style.lineHeight = '1.5';
      toastContainer.style.color = 'rgba(0,0,0,0.87)';

      // Create toast
      var toast = document.createElement('div');
      toast.style.transform = 'translateY(-35px)';
      toast.style.top = '35px';
      toast.style.marginTop = '10px';
      toast.style.padding = '10px 25px';
      toast.style.backgroundColor = '#323232';
      toast.style.color = '#ffffff';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.justifyContent = 'space-between';
      toast.style.boxShadow =
        '0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2)';

      // Set text
      var span = document.createElement('span');
      var text = document.createTextNode(icon + ' \u00A0 copied to clipboard');
      span.appendChild(text);

      // Append child
      toast.appendChild(span);
      toastContainer.appendChild(toast);
      document.body.appendChild(toastContainer);

      // Remove toast after 3 second
      setTimeout(function () {
        document.body.removeChild(toastContainer);
      }, 3000);
    };

    const createButton = (text, handleClick) => {
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.setAttribute('class', 'btn btn-neutral');
      button.innerText = text;
      button.addEventListener('click', handleClick);
      return button;
    };

    const handleCustomButtonClick = (
      buttonType = BUTTON_TYPE.TRANSLATE_ENGLISH
    ) => {
      return function () {
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
      };
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
        console.log('--- click ---', '');
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

    // Create button translate
    const btnTranslateEnglish = createButton(
      'Translate English',
      handleCustomButtonClick(BUTTON_TYPE.TRANSLATE_ENGLISH)
    );
    const btnTranslateVietnamese = createButton(
      'Translate Vietnamese',
      handleCustomButtonClick(BUTTON_TYPE.TRANSLATE_VIETNAMESE)
    );

    // Create button correct grammar
    const btnCorrectGrammar = createButton(
      'Correct Grammar',
      handleCustomButtonClick(BUTTON_TYPE.CORRECT_GRAMMAR)
    );

    // Add buttons to button group
    const chatToolbar = document.querySelector('main form > div > div');
    chatToolbar.appendChild(btnTranslateEnglish);
    chatToolbar.appendChild(btnTranslateVietnamese);
    chatToolbar.appendChild(btnCorrectGrammar);

    // Add button CopyToClipBoard after submit
    btnSubmit.addEventListener('click', function () {
      setTimeout(() => {
        addButtonCopyToClipboard();
      }, 100);
    });
  });
}
