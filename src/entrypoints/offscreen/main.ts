import { onMessage } from "~/lib/messaging";

const textarea = document.querySelector("textarea");
if (!textarea) {
  throw new Error("offscreen.html needs a textarea");
}

// The Clipboard API needs a focused document and offscreen documents can never take
// focus, so the text goes through a textarea and the copy command.
onMessage("writeClipboard", ({ data }) => {
  textarea.value = data;
  textarea.select();
  if (!document.execCommand("copy")) {
    throw new Error("The copy command failed");
  }
});
