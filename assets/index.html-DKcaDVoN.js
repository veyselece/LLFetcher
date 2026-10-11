import { j as jQuery, r as reactExports, a as jsxRuntimeExports, c as client } from './jquery-DzHVvqSG.js';
import { c as crc } from './index-CZ1hE2dh.js';
import { w as waitForElm } from './waitForElm-BcNoclUa.js';
import './_commonjsHelpers-Dc8z98SR.js';

/**
 * Adds a custom :containsRegex pseudo selector to jQuery
 * that matches elements whose text content matches the
 * given regular expression.
 */
const applyJQueryContainsRegex = (jq) => {
  jq.expr[":"].containsRegex = jq.expr.createPseudo(function (pattern) {
    var regex = new RegExp(pattern, "i");
    return function (elem) {
      return regex.test(jq(elem).text())
    }
  });
};

function getM3Rec$1() {
  let Ember;
  try {
    Ember = requireModule("ember")["default"];
  } catch {
    Ember = window.Ember;
  }
  try {
    let app = Ember.Namespace.NAMESPACES.find(
      (namespace) => namespace instanceof Ember.Application
    );
    let store = app.__container__.lookup("service:store");
    return store._globalM3RecordDataCache;
  } catch (e) {
  }
  return null;
}

const getM3RecByType$1 = (type, m3Rec) => {
  let results = [];
  for (let m in m3Rec) {
    if ("undefined" !== typeof m3Rec[m]._data.$type) {
      if (m3Rec[m]._data.$type == type) {
        results.push([m, m3Rec[m]._data]);
      }
    }
  }
  return results
};

function getCourseInfo(slug) {
  const m3Rec = getM3Rec$1();

  if (m3Rec === null) {
    return null
  }

  let results = getM3RecByType$1(
    "com.linkedin.learning.api.deco.content.Course",
    m3Rec
  );

  let course = {
    title: "",
    slug: "",
    duration: 0,
    sourceCodeRepository: "",
    subtitle: "",
    description: "",
    urn: "",
    authors: [],
  };

  results = results.filter((result) => {
    let valid = false;
    try {
      if (result.length > 1) {
        result = result.filter((item) => typeof item === "object");
        result = result[0];
        valid = result.slug === slug;
      }
    } catch (e) {
      console.log(e);
    }
    return valid
  });

  if (results.length > 0) {
    const [urn, courseTmp] = results[0];
    course.title = courseTmp.title;
    course.duration = courseTmp.duration.duration;
    course.sourceCodeRepository = courseTmp.sourceCodeRepository;
    course.subtitle = courseTmp.subtitle;
    course.slug = courseTmp.slug;
    course.urn = urn;
    try {
      course.description = courseTmp.descriptionV2.text;
    } catch (e) {}
  }

  results = getM3RecByType$1(
    "com.linkedin.learning.api.deco.content.Author",
    m3Rec
  );

  for (let authorIndex in results) {
    try {
      const [urn, authorTmp] = results[authorIndex];
      const author = {
        biography: authorTmp.biographyV2.text,
        shortBiography: authorTmp.shortBiographyV2.text,
        slug: authorTmp.slug,
        urn: urn,
      };

      course.authors.push(author);
    } catch (e) {
      console.log(e);
    }
  }

  return course
}

const findProp = (key, src) => {
  const regexObj = new RegExp("^" + key, "g");
  for (let k in src) {
    if (k.match(regexObj)) {
      return src[k]
    }
  }
  return null
};

function getCourseSections(urn) {
  const m3Rec = getM3Rec$1();
  let secs = [];

  let lac_key = urn;
  let lac = findProp(lac_key, m3Rec);
  let secs_;
  try {
    secs_ = lac.__data.contents;
  } catch (e) {
    return secs
  }
  for (let i in secs_) {
    let sec_urn = secs_[i]["*section"];
    let sec = { items: [] };
    try {
      let sec_ = m3Rec[sec_urn].__data;
      sec.title = sec_.title;

      for (let j in sec_["*items"]) {
        let si_urn = sec_["*items"][j];
        try {
          let si_ = m3Rec[m3Rec[si_urn].__data.content.video].__data;
          let si = {
            duration: si_.duration.duration,
            slug: m3Rec[si_.entityUrn].__data.slug,
            title: si_.title,
          };
          sec.items.push(si);
        } catch (e) {
          console.log(e);
        }
      }
      secs.push(sec);
    } catch (e) {
      console.log(e);
    }
  }
  return secs
}

applyJQueryContainsRegex(jQuery);
class ContentScriptAppAction extends reactExports.Component {
  constructor(props) {
    super(props);
    this.state = {
      validCoursePage: false,
      slug: "",
      outputScriptCls: "default",
      outputScript: "",
      // ocls : 'default',
      display: "flex"
    };
  }
  async getCourseInfo() {
    return getCourseInfo(this.state.slug);
  }
  async getM3Rec() {
    return getM3Rec();
  }
  async getM3RecByType(type, m3Rec) {
    return getM3RecByType(type, m3Rec);
  }
  async validCoursePage() {
    return this.state.validCoursePage;
  }
  async isLogin() {
    return !Array.from(document.querySelectorAll("a")).some((item) => /sign\s*in/i.test(item.textContent || ""));
  }
  async getCookie() {
    return document.cookie;
  }
  async validCoursePageAuto() {
    return this.state.validCoursePage;
  }
  async getCourseToc(url) {
    console.log(url);
  }
  async getCourseSections(urn) {
    console.log(urn);
  }
  async addCourseLegacy(slug) {
    if (!slug) {
      slug = document.location.href.replace("https://www.linkedin.com/learning/", "").split("/")[0];
    }
    console.log(`Add Course using internal API: ${slug}`);
    let course = getCourseInfo(slug);
    let sections;
    if (course) {
      if (course.urn) {
        sections = getCourseSections(course.urn);
      }
    }
    return [course, sections];
  }
}

const CheckerTag = ({ children, hasChildren }) => {
  const cls = hasChildren ? "course-checker" : "course-checker-last";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cls, children });
};

const CoursePageChecker = ({ validCoursePage }) => {
  const [checkers, setCheckers] = reactExports.useState("[]");
  const [tree, setTree] = reactExports.useState(0);
  reactExports.useEffect(() => {
    console.log(validCoursePage);
    console.log(chrome);
    let tree_ = tree;
    tree_ += 1;
    setTree(tree_);
    buildTree(tree_);
  }, [validCoursePage]);
  const buildTree = (p) => {
    const newCheckers = [];
    let newCheckersP = newCheckers;
    console.log(p);
    let childrens = [];
    let i = 0;
    while (p--) {
      console.log(p);
      if (newCheckersP.length === 0) {
        childrens.push([]);
        newCheckersP.push(childrens[i]);
        newCheckersP = childrens[i];
        i++;
      }
    }
    let newCheckersStr = JSON.stringify(newCheckers);
    console.log(newCheckersStr);
    setCheckers(newCheckersStr);
  };
  const buildTreeTag = (checker2) => {
    const finalText = !validCoursePage ? "Bu bir ders sayfası değil." : "Bu geçerli bir ders sayfası.";
    return checker2.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckerTag, { hasChildren: true, children: buildTreeTag(checker2.pop()) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckerTag, { hasChildren: false, children: finalText });
  };
  const checker = JSON.parse(checkers);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: buildTreeTag(checker) });
};

function jsonStringifyRecursive(obj) {
  const cache = /* @__PURE__ */ new Set();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) {
          return;
        }
        cache.add(value);
      }
      return value;
    },
    4
  );
}
class ContentScriptApp extends ContentScriptAppAction {
  inputScriptRef = null;
  inputScriptCallerRef = null;
  constructor(props) {
    super(props);
    this.inputScriptRef = reactExports.createRef(null);
    this.inputScriptCallerRef = reactExports.createRef(null);
  }
  getData() {
    console.log("ContentScriptApp.getData()");
  }
  componentDidMount() {
    setTimeout(() => {
    }, 5e3);
  }
  createRandCls() {
    const dtStr = (/* @__PURE__ */ new Date()).getTime().toString();
    return `os-${crc.crc32(dtStr).toString(16)}`;
  }
  async runScript() {
    let is = {
      cmd: "getCourseInfo",
      param: null,
      ocls: this.createRandCls()
    };
    const caller = this.inputScriptCallerRef.current.value;
    this.setState({ inputScriptCaller: caller });
    try {
      is = JSON.parse(this.inputScriptRef.current.value);
      const method = is.cmd;
      const param = is.param || null;
      const ocls = is.ocls || "default";
      if (["getCourseInfo", "getM3Rec", "getM3RecByType", "validCoursePage", "isLogin", "getCookie", "validCoursePageAuto", "getCourseToc", "getCourseSections", "addCourseLegacy"].includes(method) && typeof this[method] === "function") {
        const result = await this[method](param);
        const state = {
          outputScript: (/* @__PURE__ */ new Date()).getTime().toString(),
          outputScriptCls: ocls
          // inputScriptCaller: caller
        };
        try {
          state.outputScript = jsonStringifyRecursive(result);
          if (state.outputScript.length / 1024 > 1e3) {
            setTimeout(() => {
              this.setState({ outputScript: `{cleared:'to save memory'}` });
            }, 5e3);
          }
        } catch (e) {
          console.error(e);
        }
        this.setState(state);
      } else {
        console.error(
          `ContentScriptApp doesnt have any method called ${method}`
        );
      }
      console.log(is);
    } catch (e) {
      console.error(e);
    }
  }
  onInputScriptChange(evt) {
  }
  onInputScriptCallerChange(evt) {
  }
  render() {
    let { display, inputScriptCaller } = this.state;
    const { appContainerId } = this.props;
    const inputScriptDefaultValue = JSON.stringify({
      cmd: "getCourseInfo",
      param: null,
      ocls: this.createRandCls()
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        id: appContainerId,
        style: {
          display,
          flexDirection: "column",
          width: "400px",
          position: "absolute",
          background: "#000",
          color: "#fff",
          zIndex: 2001,
          opacity: 0.7,
          fontFamily: "monospace",
          marginTop: "3.1em",
          marginLeft: "22%",
          padding: "1em"
        },
        children: [
          this.state.validCoursePage ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: this.state.slug }) }) : "Eklenti hazır",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "input-script",
              style: { color: "#fff" },
              defaultValue: inputScriptDefaultValue,
              onChange: (evt) => this.onInputScriptChange(evt),
              ref: this.inputScriptRef
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "input-script-caller",
              style: { color: "#fff" },
              defaultValue: inputScriptCaller,
              onChange: (evt) => this.onInputScriptCallerChange(evt),
              ref: this.inputScriptCallerRef
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "output-script",
              style: { color: "#fff" },
              className: this.state.outputScriptCls,
              onChange: (f) => f,
              value: this.state.outputScript
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: "100%", textAlign: "right" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              style: { padding: "1em", background: "#fff", color: "#000" },
              id: "exec-button",
              onClick: (e) => {
                this.runScript();
              },
              children: "Sayfa komutunu çalıştır"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CoursePageChecker, { validCoursePage: this.state.validCoursePage })
        ]
      }
    ) });
  }
}

const createReactRootElement = (f) => {
  if (document.getElementById("app-container")) return;
  const container = document.createElement("div");
  container.id = "app-container";
  const root = document.createElement("div");
  root.id = "content-script-root";
  root.textContent = "ROOT";
  container.appendChild(root);
  document.body.prepend(container);
};

const attachRouteChangesEvent = (callback) => {
  let previousUrl = "";

  let observer = new MutationObserver(function (mutations) {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      const path = location.href.replace(
        /https\:\/\/www\.linkedin\.com\/learning/,
        ""
      );
      callback(path);
    }
  });

  const config = { subtree: true, childList: true };
  observer.observe(document, config);
};

const getCourseSlugByPath = (path) => {
  let slug = "";
  try {
    path.split("/");
    slug = path.split("/")[1];
  } catch (e) {}

  return slug
};

const detectVideoJs = (callback) => {
  waitForElm(".video-js").then((elm) => {
    // console.log('.video-js is ready');
    callback(elm);
  });
};

const pauseVideo = () => {
  detectVideoJs(() => {
    const video = document.querySelector("video");
    if (!video || !video.autoplay) return;
    const pauseAutoplay = () => {
      if (video.autoplay && !video.paused) video.pause();
    };
    if (video.readyState >= 2 && !video.paused) pauseAutoplay();
    else video.addEventListener("playing", pauseAutoplay, { once: true });
  });
};

const isCoursePage = () => {
  let valid =
    jQuery("div[data-avail-test]").attr("data-avail-test") === "page:course";

  return valid
};

console.log("this is content script inject app");
const main = async () => {
  const reactRootId = "content-script-root";
  const appContainerId = "content-script-app";
  const appRef = reactExports.createRef(null);
  let appInstance = null;
  attachRouteChangesEvent(async (path) => {
    console.log(`URL changed to ${path}`);
    if (!appInstance) {
      await waitForElm(`#${appContainerId}`);
      appInstance = appRef.current;
    }
    const validCoursePage = isCoursePage();
    const slug = getCourseSlugByPath(path);
    appInstance.setState({ validCoursePage, slug });
    if (validCoursePage) {
      pauseVideo();
    }
  });
  createReactRootElement();
  const el = await waitForElm(`#${reactRootId}`);
  const root = client.createRoot(el);
  root.render(/* @__PURE__ */ jsxRuntimeExports.jsx(ContentScriptApp, { ref: appRef, appContainerId }));
};
main();
