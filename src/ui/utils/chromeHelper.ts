export const sendTestMsg = () => {
  return new Promise((resolve, reject) => {
    if (!chrome || !chrome.tabs) {
      reject("chrome not avaiable");
    } else {
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        if (tabs.length && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, "test", (result: boolean) => {
            resolve(result);
          });
        }
      });
    }
  });
};
