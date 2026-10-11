import { w as waitForElm } from './waitForElm-BcNoclUa.js';
import { s as sendMessage } from './sendMessage-Clh2_OhT.js';

const onMessage = (callback) => {
  try {
    chrome.runtime.onMessage.addListener((evt, source) => {
      callback(evt, source);
    });
  } catch (e) {
    console.log(e);
  }
};

class ContentScript {
  constructor() {
    this.initController();
  }
  initController() {
    onMessage((evt, source) => {
      switch (evt.name) {
        case "cmd.getCourseInfo":
          this.onCommand(evt.name);
          break;
        case "cmd.addCourseLegacy":
          this.onCommand(evt.name, evt.data);
          break;
        case "cmd.getCourseSections":
          this.onCommand(evt.name, evt.data);
          break;
        case "cmd.getCourseToc":
          this.onCommand(evt.name, evt.data);
          break;
        case "cmd.getCookie":
          this.onCommand(evt.name, evt.data);
          break;
        case "cmd.isLogin":
          this.onCommand(evt.name, evt.data);
          break;
        case "cmd.validCoursePage":
        case "cmd.validCoursePageAuto":
          this.onCommand(evt.name);
          break;
        case "ui.togglePanel":
          this.togglePanel(!(evt.data && evt.data.visible === false));
          break;
        case "console.log":
          evt.data.map((item) => console.log(item));
          break;
        default:
          this.onCommand(evt.name, evt.data);
          break;
      }
    });
    this.waitForCheckerElm();
  }
  togglePanel(visible = true) {
    const apply = () => {
      const panel = document.getElementById("content-script-app");
      if (!panel) return false;
      panel.classList.toggle("lltr-panel-visible", Boolean(visible));
      panel.setAttribute("aria-hidden", visible ? "false" : "true");
      return true;
    };
    if (apply()) return;
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 5000);
  }
  getExecuteBtn() {
    return document.getElementById("exec-button");
  }
  getInputScriptEl() {
    return document.getElementById("input-script");
  }
  getInputScriptCaller() {
    return document.getElementById("input-script-caller");
  }
  setInputScriptCaller(caller) {
    return this.getInputScriptCaller().value = caller;
  }
  getOutputScriptEl() {
    return document.getElementById("output-script");
  }
  setOutputScriptContent(value) {
    this.getOutputScriptEl().value = value;
  }
  setInputScriptContent(is) {
    this.getInputScriptEl().value = JSON.stringify(is);
  }
  createRandCls() {
    const dtStr = (/* @__PURE__ */ new Date()).getTime().toString();
    return `os-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 8)}`;
  }
  executeScriptContent(is, callback, caller = "popup") {
    try {
      if (!is.ocls) {
        is.ocls = this.createRandCls();
      }
      this.setInputScriptCaller(caller);
      this.setInputScriptContent(is);
      this.getExecuteBtn().click();
      this.waitForScriptOutput(is.ocls, callback, caller);
    } catch (e) {
      console.error(e);
    }
  }
  async executeTopScript(cmd, param) {
    return new Promise((resolve, reject) => {
      const is = {
        ocls: this.createRandCls(),
        cmd,
        param
      };
      const caller = "content";
      try {
        this.setInputScriptCaller(caller);
        this.setInputScriptContent(is);
        this.getExecuteBtn().click();
        this.waitForScriptOutput(
          is.ocls,
          (result) => {
            resolve(result);
          },
          caller
        );
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }
  // callContentFn(is, callback, caller){
  //     try{
  //         this.setInputScriptContent(is)
  //         this.getExecuteBtn().click()
  //         this.waitForScriptOutput(is.ocls, callback, caller)
  //     }catch(e){
  //         // console.log(e)
  //     }
  // }
  waitForScriptOutput(ocls, callback, caller = "popup") {
    waitForElm(`.${ocls}`).then((elm) => {
      const data = JSON.parse(elm.value);
      callback(data);
    });
  }
  /*onGetCourseInfo(){
          const ocls = `ocls-${(new Date).getTime()}`
          const is = {
              cmd : 'getCourseInfo',
              ocls
          }
          
          this.executeScriptContent(is, data => {
              // console.log(data)
              sendMessage(`cmd.${is.cmd}`, data)
          })
  
      }*/
  waitForCheckerElm() {
    waitForElm(".course-checker-last").then((el) => {
      if (el) {
        el.setAttribute("class", "_blank");
        setTimeout(() => {
          this.onCommand("cmd.validCoursePageAuto");
          this.waitForCheckerElm();
        }, 3e3);
      }
    });
  }
  createRandCls() {
    const dtStr = (/* @__PURE__ */ new Date()).getTime().toString();
    return `os-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 8)}`;
  }
  onCommand(command, param) {
    const cmd = command.replace(/^cmd\./, "");
    const ocls = this.createRandCls();
    const is = {
      cmd,
      ocls,
      param
    };
    this.executeScriptContent(is, (data) => {
      sendMessage(`${command}`, data, "popup");
    });
  }
}

/**
 * Injects a script tag into the DOM at the specified location.
 *
 * @param {string} src - The URL of the script to be injected.
 * @param {string} tag - The HTML tag name to use for the script element for eample head or body.
 * @param {function} [callback] - An optional callback function to be executed when the script has finished loading.
 * @param {function} [error] - An optional callback function to be executed if there is an error loading the script.
 */
const injectScript = (
  src,
  tag,
  type = "text/javascript",
  callback = (f) => f,
  error = (f) => f
) => {
  let node = document.getElementsByTagName(tag)[0];
  let script = document.createElement("script");
  script.addEventListener("load", () => {
    console.log(`${script.src} loaded`);
    callback(script);
  });
  script.addEventListener("error", (ev) => {
    console.log("Error on loading file", ev);
    error(ev);
  });
  script.setAttribute("type", type);
  script.setAttribute("src", src);
  node.appendChild(script);
};

/**
 * Injects a script tag asynchronously into the DOM at the body element.
 *
 * @param {string} src - The URL of the script to be injected.
 * @param {function} [callback] - An optional callback function to be executed when the script has finished loading.
 * @returns {Promise<HTMLScriptElement>} A promise that resolves to the injected script element.
 */
const injectScriptAsync = async (src,type="text/javascript",tag="body", callback = (f) => f) => {
  return new Promise((resolve, reject) => {
    injectScript(
      chrome.runtime.getURL(src),
      tag,
      type,
      (el) => {
        if (typeof callback === "function") {
          callback();
        }
        resolve(el);
      },
      (ev) => {
        reject(ev);
      }
    );
  })
};

/**
 * Injects a link tag into the DOM at the specified location.
 *
 * @param {string} href - The URL of the link to be injected.
 * @param {string} tag - The HTML tag name to use for the link element for eample head or body.
 * @param {function} [callback] - An optional callback function to be executed when the link has finished loading.
 * @param {function} [error] - An optional callback function to be executed if there is an error loading the link.
 */
const injectLink = (
  rel,
  href,
  preload=false,
  tag='head',
  callback = (f) => f,
  error = (f) => f
) => {
  let node = document.getElementsByTagName(tag)[0];
  let link = document.createElement("link");
  link.addEventListener("load", () => {
    console.log(`${link.href} loaded`);
    callback(link);
  });
  link.addEventListener("error", (ev) => {
    console.log("Error on loading file", ev);
    error(ev);
  });
  if(preload){
    link.setAttribute("preload", true);
  }
  link.setAttribute("rel", rel);
  link.setAttribute("crossorigin",true);
  link.setAttribute("href", href);
  node.appendChild(link);
};

/**
 * Injects a script tag asynchronously into the DOM at the body element.
 *
 * @param {string} href - The URL of the script to be injected.
 * @param {function} [callback] - An optional callback function to be executed when the script has finished loading.
 * @returns {Promise<HTMLScriptElement>} A promise that resolves to the injected script element.
 */
const injectLinkAsync = async (  rel,
  href,
  preload=true,tag="body", callback = (f) => f) => {
  return new Promise((resolve, reject) => {
    injectLink(
      rel,
      href,
  preload,
  tag,
      (el) => {
        if (typeof callback === "function") {
          callback();
        }
        resolve(el);
      },
      (ev) => {
        reject(ev);
      }
    );
  })
};

const main = async () => {
  window.contentScript = new ContentScript();
  /*INJECT_START*/
  await injectScriptAsync("assets/content-script-inject/content-inject.js");
  await injectLinkAsync("assets/content-script-inject/content-inject.css");
  /*INJECT_END*/
};

main();
