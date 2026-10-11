import { r as reactExports, a as jsxRuntimeExports, c as client, R as React } from './jquery-DzHVvqSG.js';
import { v as slugify, l as courseUrlFromSlug, i as icon, B as Button, A as AdvancedSelect, C as CheckBox, t as useOutlet, x as useRouteError, y as createHashRouter, z as createRoutesFromChildren, R as RouterProvider, D as Route, S as Store, E as AppConfig } from './font-awesome.min-B8F5ZsZH.js';
import { s as sendMessage } from './sendMessage-Clh2_OhT.js';
import './_commonjsHelpers-Dc8z98SR.js';
import './index-CZ1hE2dh.js';
import './LsConfig-Bo_nWYsW.js';

const getQueryStringFromUrlAsObject = (url) => {
  const urlObj = new URL(url);
  const queryParams = urlObj.searchParams;
  const queryParamsObj = {};

  for (const [key, value] of queryParams) {
    queryParamsObj[key] = value;
  }

  return queryParamsObj
};

class ComponentWithMessaging extends reactExports.Component {
  async sendMessageAsync(msg, data, target = "content") {
    return new Promise((resolve, reject) => {
      if (!chrome) {
        reject(`running_in_dev_mode`);
      }
      if (!chrome.runtime) {
        reject(`running_in_dev_mode`);
      }
      const commandListener = (evt, source) => {
        chrome.runtime.onMessage.removeListener(commandListener);
        resolve([evt, source]);
      };
      try {
        chrome.runtime.onMessage.addListener(commandListener);
        sendMessage(msg, data, target);
      } catch (e) {
        reject(e);
      }
    });
  }
  async getFromMessage(msg, data, target) {
    const [evt, source] = await this.sendMessageAsync(msg, data, target);
    if (evt.name === msg) {
      return evt.data;
    }
    return null;
  }
  async onMessageCommand(evt, source) {
  }
  commandListener = (evt, source) => {
    this.onMessageCommand(evt, source);
  };
  onMessage() {
    if (!chrome) {
      return;
    }
    if (!chrome.runtime) {
      return;
    }
    try {
      chrome.runtime.onMessage.removeListener(this.commandListener);
      chrome.runtime.onMessage.addListener(this.commandListener);
    } catch (e) {
      console.log(e);
    }
  }
  initMessaging() {
    this.onMessage();
  }
}

const optionPageBaseUrl = "src/option/";

const getActiveTab = async () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        resolve(tabs[0]);
      });
    } catch (e) {
      resolve(null);
    }
  })
};

const getActiveTabUrl = async () => {
  const activeTab = await getActiveTab();
  if (activeTab) {
    return activeTab.url
  }
  return ""
};

const isYoutubeUrl = (url) => {
  return url.match("youtube.com")
};

const optionUrl = (path, qsobj = null) => {
  const optionUrl = chrome.runtime.getURL(`${optionPageBaseUrl}index.html`);
  let url = `${optionUrl}${path}`;
  if (typeof qsobj === "object") {
    let qsArr = [];
    Object.keys(qsobj).map((qsk, idx) => {
      let qsv = qsobj[qsk];
      if (typeof qsv === "boolean") {
        qsv = qsv ? "1" : "0";
      }
      const qskv = `${qsk}=${qsv}`;
      qsArr.push(qskv);
    });
    url = `${url}?${qsArr.join("&")}`;
  }
  return url
};

const openTabOption = async (url) => {
  const tabs = await chrome.tabs.query({ url: `${url}*` });
  if (tabs.length > 0) {
    chrome.runtime.sendMessage({
      action: "activateTab",
      url,
      optionPageBaseUrl,
    });
  } else {
    chrome.tabs.create({ url });
  }
};

class WelcomePage extends ComponentWithMessaging {
  mApp = null;
  mCourse = null;
  mAuthor = null;
  mSection = null;
  mToc = null;
  store = null;
  courseAuthors = [];
  constructor(props) {
    super(props);
    const { store } = props;
    this.store = store;
    this.mApp = store.get("App");
    this.mCourse = store.get("Course");
    this.mAuthor = store.get("Author");
    this.mSection = store.get("Section");
    this.mToc = store.get("Toc");
    this.mPrxCache = store.get("PrxCache");
    this.state = {
      greeting: "LLFetcher 3.0+",
      lastCourseList: {},
      fetchBtnState: 0,
      loading: false,
      courseInfo: null,
      validCoursePage: false,
      disableFetchBtn: false,
      isLogin: false,
      legacyMode: false,
      blockMainContent: false,
      isYoutube: false
    };
  }
  async addToLastCourseList(ci) {
    this.setState({ courseInfo: ci });
    const slug = ci.slug;
    const course = await this.createCourse(ci);
    if (!Object.keys(this.state.lastCourseList).includes(slug)) {
      this.populateLastCourseList();
    }
    await this.props.onSelectCourse(course, this.courseAuthors);
  }
  onMessageCommand(evt, source) {
    if (evt.name === "cmd.validCoursePageAuto") {
      this.setState({ validCoursePage: evt.data });
    }
  }
  populateLastCourseList() {
    const savedCourseList = this.mCourse.getList();
    let courseListObj = {};
    for (let i in savedCourseList) {
      courseListObj[savedCourseList[i].slug] = savedCourseList[i];
    }
    this.setState({ lastCourseList: courseListObj });
  }
  async componentDidMount() {
    const currentTabUrl = await getActiveTabUrl();
    if (isYoutubeUrl(currentTabUrl)) {
      this.setState({ isYoutube: true });
    } else {
      this.populateLastCourseList();
      this.initMessaging();
      await this.getValidCourseMessage();
    }
  }
  async getValidCourseMessage() {
    const msg = "cmd.validCoursePage";
    const validCoursePage = await this.getFromMessage(msg);
    this.setState({ validCoursePage });
  }
  async insertCourseLegacyM3Rec(slug, result) {
    await this.mPrxCache.set(slug, result, 200);
    await this.activateAddCourseOptionTab(slug, true);
  }
  async insertCourseLegacy(course, sections) {
    if (course) {
      const { title, slug, duration, sourceCodeRepository, description, urn } = course;
      const courseRec = await this.mCourse.create(
        title,
        slug,
        duration,
        sourceCodeRepository,
        description,
        urn
      );
      if (courseRec) {
        console.log(courseRec);
        const courseId = courseRec.id;
        if (Array.isArray(sections)) {
          for (const section of sections) {
            const itemStars = [];
            const sectionSlug = slugify(section.title);
            const sectionRec = await this.mSection.create(
              section.title,
              sectionSlug,
              courseId,
              itemStars
            );
            if (sectionRec) {
              console.log(sectionRec);
              if (Array.isArray(section.items)) {
                for (const toc of section.items) {
                  const sectionId = sectionRec.id;
                  const itemStar = null;
                  const vStatusUrn = null;
                  const tocUrl = courseUrlFromSlug(`${course.slug}/${toc.slug}`);
                  const tocRec = await this.mToc.create(
                    toc.title,
                    toc.slug,
                    tocUrl,
                    toc.duration,
                    null,
                    null,
                    sectionId,
                    itemStar,
                    vStatusUrn
                  );
                  if (tocRec) {
                    console.log(tocRec);
                  } else {
                    console.error("failed to create toc");
                  }
                }
              }
            } else {
              console.error("failed to create section");
            }
          }
        }
      } else {
        console.error("failed to create course");
      }
    }
  }
  async addCourseLegacy(slug) {
    this.setState({ blockMainContent: true });
    const msg = "cmd.getM3Rec";
    const result = await this.getFromMessage(msg, slug);
    this.insertCourseLegacyM3Rec(slug, result);
    this.setState({ blockMainContent: false });
  }
  async getIsLoginMessage() {
    const msg = "cmd.isLogin";
    const isLogin = await this.getFromMessage(msg);
    this.seState({ isLogin });
  }
  async getCourseInfoMessage() {
    const msg = "cmd.getCourseInfo";
    this.setState({ fetchBtnState: 1 });
    const course = await this.getFromMessage(msg);
    await this.addToLastCourseList(course);
  }
  async activateAddCourseOptionTab(slug, useM3Rec = false) {
    const url = optionUrl(`#/course/add/${slug}`, { useM3Rec });
    await openTabOption(url);
  }
  async addCourseFromCurrentUrl() {
    const url = await getActiveTabUrl();
    const courseSlug = url.replace("https://www.linkedin.com/learning/", "").split("/")[0];
    const { legacyMode } = this.state;
    if (legacyMode) {
      this.addCourseLegacy(courseSlug);
    } else {
      this.activateAddCourseOptionTab(courseSlug);
    }
  }
  async onSelectCourse(courseSlug) {
    this.activateAddCourseOptionTab(courseSlug);
  }
  onLegacyModeChanged(mode) {
    this.setState({ legacyMode: mode });
  }
  async analizeVideo() {
    const activeUrl = await getActiveTabUrl();
    const qsobj = getQueryStringFromUrlAsObject(activeUrl);
    const url = optionUrl(`#/developer/video-analizer`, qsobj);
    await openTabOption(url);
  }
  render() {
    const {
      isYoutube,
      blockMainContent,
      legacyMode,
      isLogin,
      greeting,
      lastCourseList,
      fetchBtnState,
      validCoursePage,
      loading,
      disableFetchBtn
    } = this.state;
    const lastCourseListKeys = Object.keys(lastCourseList);
    const btnCls = fetchBtnState == 0 ? "fa-plus" : fetchBtnState == 1 ? "fa-spin fa-spinner" : fetchBtnState == 2 ? "fa-refresh" : "fa-hand-o-right";
    const lastCourseDdData = lastCourseListKeys.map((slug) => {
      const item = lastCourseList[slug];
      const value = item.slug;
      const text = item.title;
      return {
        value,
        text
      };
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      blockMainContent ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 start-0 w-full h-full bg-white/[.5] rounded-lg dark:bg-gray-800/[.4]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500",
            role: "status",
            "aria-label": "loading",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Loading..." })
          }
        ) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "welcome-page page gap-2 flex flex-col items-center pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: icon }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "font-bold pt-2 pb-4 text-center text-lg",
              style: { fontFamily: "Monoton, cursive" },
              children: greeting
            }
          ) })
        ] }),
        isYoutube ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "action-cnt w-full flex gap-2 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            caption: "Analize Video",
            onClick: (e) => this.analizeVideo(),
            icon: "fa fa-youtube"
          }
        ) }) }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "action-cnt w-full", children: [
          lastCourseDdData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            AdvancedSelect,
            {
              data: lastCourseDdData,
              label: "Load Last Course",
              onSelect: (course) => this.onSelectCourse(course)
            }
          ) }) : "",
          validCoursePage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "btn-cnt text-center flex gap-2 p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CheckBox,
              {
                label: "Legacy Mode",
                className: "pt-2",
                checked: legacyMode,
                onChange: (e) => this.onLegacyModeChanged(e)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: fetchBtnState == 1 || !validCoursePage || disableFetchBtn,
                className: "mx-auto btn btn-primary",
                onClick: (e) => this.addCourseFromCurrentUrl(),
                icon: `fa ${btnCls}`,
                caption: "Add This Course"
              }
            )
          ] }) : ""
        ] })
      ] })
    ] });
  }
}

const Template = ({ store, config }) => {
  const outlet = useOutlet();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "app-container w-[300px] py-4 px-2 dark:bg-gray-700 dark:text-gray-200", children: outlet || /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomePage, { store, config }) });
};

function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  const statusToIcons = (status) => {
    if (status) {
      return status.toString().split("").map((number, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: `bi bi-${number}-square` }, index));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "error-page", className: "dark:text-slate-500 p-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Oops!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Sorry, an unexpected error has occurred." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { children: error.statusText || error.message }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: statusToIcons(error.status) })
  ] });
}

const NativeClientHttp = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "NativeClientHttp" }) });
};

function Router({ config, store }) {
  const router = createHashRouter(
    createRoutesFromChildren(
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Route, { path: "/", errorElement: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorPage, {}), element: /* @__PURE__ */ jsxRuntimeExports.jsx(Template, { config, store }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/welcome", element: /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomePage, { store, config }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/native-client-http", element: /* @__PURE__ */ jsxRuntimeExports.jsx(NativeClientHttp, { store, config }) })
      ] })
    )
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterProvider, { router });
}

const store = Store.getInstance();
const config = AppConfig.getInstance();
store.ready(() => {
  client.createRoot(document.getElementById("popup")).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Router, { store, config }) })
  );
});
