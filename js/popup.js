/**
 * Handle event when user click to Tab
 */
function handleOnclickTab() {
  var tabs = document.getElementsByClassName("tab");

  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
      // Remove class "active" from all tabs
      for (var j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove("active");
      }

      // Add class "active" to chosen tab
      this.classList.add("active");

      // Hide all tab contents
      var tabContents = document.getElementsByClassName("tab-content");
      for (var k = 0; k < tabContents.length; k++) {
        tabContents[k].style.display = "none";
      }

      // Show chosen tab content
      var tabId = this.children[0].getAttribute("href").replace("#", "");
      document.getElementById(tabId).style.display = "block";
    });
  }
}

/**
 * Update link in popup's footer
 */
function updateFooterLink() {
  document.getElementById("link-to-setting-page").href = chrome.runtime.getURL("index.html");
}

document.addEventListener("DOMContentLoaded", function () {
  handleOnclickTab();
  updateFooterLink();
});
