import { C as ChromeLsConfig } from './LsConfig-Bo_nWYsW.js';
import { g as getDefaultExportFromCjs } from './_commonjsHelpers-Dc8z98SR.js';

const menus = [
	{
		slug: "courses",
		childIconCls: "fa fa-bookmark-o",
		childRoutePath: "/manager/{SLUG_VALUE}",
		dev: false,
		displayField: "title",
		hasChild: false,
		hidden: false,
		iconCls: "bi bi-bookmark",
		model: "Course",
		modelListMethod: "getList",
		order: 0,
		path: "/manager",
		slugField: "slug",
		title: "Courses",
		useModel: true,
		level: 0,
		parent: -1,
		children: [
		],
		id: 1
	},
	{
		slug: "developers",
		childIconCls: "",
		childRoutePath: "",
		dev: true,
		displayField: "",
		hasChild: true,
		hidden: false,
		iconCls: "bi bi-terminal",
		model: "",
		modelListMethod: "",
		order: 1,
		path: "/developer",
		slugField: "",
		title: "Developers",
		useModel: false,
		level: 0,
		parent: -1,
		children: [
			{
				dev: true,
				slug: "menu-manager",
				hidden: false,
				order: 0,
				path: "/developer/menu-manager",
				title: "Menu Manager",
				iconCls: "bi bi-menu-button-wide",
				parent: 7,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 8
			},
			{
				dev: false,
				slug: "video-player",
				hidden: false,
				order: 2,
				path: "/developer/video-player",
				title: "Video Player",
				iconCls: "bi bi-film",
				parent: 7,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 10
			}
		],
		id: 7
	},
	{
		slug: "native-clients",
		childIconCls: "",
		childRoutePath: "",
		dev: true,
		displayField: "",
		hasChild: true,
		hidden: false,
		iconCls: "bi bi-window-stack",
		model: "",
		modelListMethod: "",
		order: 2,
		path: "/native-client-app",
		slugField: "",
		title: "Native Client Apps",
		useModel: false,
		level: 0,
		parent: -1,
		children: [
			{
				dev: false,
				slug: "native-client",
				hidden: false,
				order: 0,
				path: "/native-client-app/native-client",
				title: "Native Client",
				iconCls: "bi bi-postage",
				parent: 2,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 3
			},
			{
				dev: false,
				slug: "user-management",
				hidden: false,
				order: 1,
				path: "/native-client-app/user-management",
				title: "User Management",
				iconCls: "fa fa-users",
				parent: 2,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 4
			},
			{
				dev: false,
				slug: "yt-upload-pv",
				hidden: false,
				order: 2,
				path: "/native-client-app/yt-upload",
				title: "YT Upload PV",
				iconCls: "fa fa-youtube",
				parent: 2,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 5
			},
			{
				dev: false,
				slug: "yt-upload-tt",
				hidden: false,
				order: 3,
				path: "/native-client-app/yt-upload-tt",
				title: "YT Upload T&T",
				iconCls: "fa fa-youtube",
				parent: 2,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 6
			}
		],
		id: 2
	},
	{
		slug: "database",
		childIconCls: "",
		childRoutePath: "",
		dev: false,
		displayField: "",
		hasChild: true,
		hidden: true,
		iconCls: "bi bi-database-fill-gear",
		model: "",
		modelListMethod: "",
		order: 3,
		path: "/database",
		slugField: "",
		title: "Database Explorer",
		useModel: false,
		level: 0,
		parent: -1,
		children: [
			{
				dev: false,
				slug: "table-manager",
				hidden: true,
				order: 0,
				path: "/database/table-manager",
				title: "Table Manager",
				iconCls: "bi bi-table",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 19
			},
			{
				dev: false,
				slug: "course",
				hidden: true,
				order: 1,
				path: "/database/course",
				title: "Course",
				iconCls: "bi bi-bookmark",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 20
			},
			{
				dev: false,
				slug: "thumbnail",
				hidden: true,
				order: 2,
				path: "/database/thumbnail",
				title: "Thumbnail",
				iconCls: "bi bi-image",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 21
			},
			{
				dev: false,
				slug: "author",
				hidden: true,
				order: 4,
				path: "/database/author",
				title: "Author",
				iconCls: "bi bi-person-vcard",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 23
			},
			{
				dev: false,
				slug: "exercise-file",
				hidden: true,
				order: 5,
				path: "/database/exercise-file",
				title: "ExerciseFile",
				iconCls: "bi bi-archive",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 24
			},
			{
				dev: false,
				slug: "stream-location",
				hidden: true,
				order: 6,
				path: "/database/stream-location",
				title: "StreamLocation",
				iconCls: "bi bi-cast",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 25
			},
			{
				dev: false,
				slug: "transcript",
				hidden: true,
				order: 7,
				path: "/database/transcript",
				title: "Transcript",
				iconCls: "bi bi-card-text",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 26
			},
			{
				dev: false,
				slug: "section",
				hidden: true,
				order: 10,
				path: "/database/section",
				title: "Section",
				iconCls: "bi bi-signpost",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 29
			},
			{
				dev: false,
				slug: "toc",
				hidden: true,
				order: 11,
				path: "/database/toc",
				title: "Toc",
				iconCls: "bi bi-signpost-2",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 30
			},
			{
				dev: false,
				slug: "dm-setup",
				hidden: true,
				order: 12,
				path: "/database/dm-setup",
				title: "DMSetup",
				iconCls: "bi bi-sliders2",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 31
			},
			{
				dev: false,
				slug: "dm-status",
				hidden: true,
				order: 13,
				path: "/database/dm-status",
				title: "DMStatus",
				iconCls: "bi bi-x-diamond",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 32
			},
			{
				dev: true,
				slug: "qstate",
				hidden: true,
				order: 15,
				path: "/database/qstate",
				title: "QState",
				iconCls: "bi bi-x-diamond-fill",
				parent: 18,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 34
			}
		],
		id: 18
	},
	{
		slug: "manuals",
		childIconCls: "",
		childRoutePath: "",
		dev: true,
		displayField: "",
		hasChild: true,
		hidden: false,
		iconCls: "fa fa-bookmark",
		model: "",
		modelListMethod: "",
		order: 4,
		path: "/manuals",
		slugField: "",
		title: "Manuals",
		useModel: false,
		level: 0,
		parent: -1,
		children: [
			{
				dev: false,
				slug: "dev-notes",
				hidden: false,
				order: 0,
				path: "/manuals/dev-notes",
				title: "Dev Notes",
				iconCls: "fa fa-cog",
				parent: 35,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 36
			},
			{
				dev: false,
				slug: "js-store",
				hidden: false,
				order: 1,
				path: "/manuals/js-store",
				title: "JsStore",
				iconCls: "fa fa-cog",
				parent: 35,
				level: 1,
				hasChild: false,
				useModel: false,
				model: "",
				modelListMethod: "",
				slugField: "",
				displayField: "",
				childRoutePath: "",
				childIconCls: "",
				id: 37
			}
		],
		id: 35
	},
	{
		slug: "settings",
		childIconCls: "",
		childRoutePath: "",
		dev: true,
		displayField: "",
		hasChild: false,
		hidden: false,
		iconCls: "bi bi-gear",
		model: "",
		modelListMethod: "",
		order: 5,
		path: "/setting",
		slugField: "",
		title: "Settings",
		useModel: false,
		level: 0,
		parent: -1,
		children: [
		],
		id: 38
	}
];

var npm_export = {exports: {}};

var jsstore_commonjs2_min = {exports: {}};

/*! For license information please see jsstore.commonjs2.min.js.LICENSE.txt */

(()=>{var e={d:(t,n)=>{for(var r in n)e.o(n,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:true,get:n[r]});},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:true});}},t={};e.r(t),e.d(t,{API:()=>o,CONNECTION_STATUS:()=>p,Connection:()=>b,DATA_TYPE:()=>r,ERROR_TYPE:()=>l,EVENT:()=>i,IDB_MODE:()=>u,OCCURENCE:()=>a,QUERY_OPTION:()=>s,WORKER_STATUS:()=>n,forObj:()=>q,promise:()=>d,promiseAll:()=>v,promiseResolve:()=>f});var n,r,o,i,s,u,a,p,c=function(){function e(e,t){this.type=e,this._info=t,this.message=this.getMsg();}return e.prototype.throw=function(){throw this},e.prototype.log=function(e){this.status&&console.log(e);},e.prototype.logError=function(){console.error(this.get());},e.prototype.logWarning=function(){console.warn(this.get());},e.prototype.get=function(){return {message:this.message,type:this.type}},e.prototype.getMsg=function(){return this.type,this.message},e}(),l={InvalidUpdateColumn:"invalid_update_column",UndefinedColumn:"undefined_column",UndefinedValue:"undefined_value",UndefinedColumnName:"undefined_column_name",UndefinedDbName:"undefined_database_name",UndefinedColumnValue:"undefined_column_value",NotArray:"not_array",NoValueSupplied:"no_value_supplied",ColumnNotExist:"column_not_exist",NoIndexFound:"no_index_found",InvalidOp:"invalid_operator",NullValue:"null_value",WrongDataType:"wrong_data_type",TableNotExist:"table_not_exist",DbNotExist:"db_not_exist",ConnectionAborted:"connection_aborted",ConnectionClosed:"connection_closed",NotObject:"not_object",InvalidConfig:"invalid_config",DbBlocked:"Db_blocked",IndexedDbNotSupported:"indexeddb_not_supported",NullValueInWhere:"null_value_in_where",InvalidJoinQuery:"invalid_join_query",InvalidQuery:"invalid_query",ImportScriptsFailed:"import_scripts_failed",MethodNotExist:"method_not_exist",Unknown:"unknown",InvalidMiddleware:"invalid_middleware",InvalidOrderQuery:"invalid_order_query",InvalidGroupQuery:"invalid_group_query",NoPrimaryKey:"no_primary_key"};!function(e){e.Registered="registerd",e.Failed="failed",e.NotStarted="not_started";}(n||(n={})),function(e){e.String="string",e.Object="object",e.Array="array",e.Number="number",e.Boolean="boolean",e.Null="null",e.DateTime="date_time";}(r||(r={})),function(e){e.InitDb="init_db",e.MapGet="map_get",e.MapSet="map_set",e.MapHas="map_has",e.MapDelete="map_delete",e.Select="select",e.Insert="insert",e.Update="update",e.Remove="remove",e.OpenDb="open_db",e.Clear="clear",e.DropDb="drop_db",e.Count="count",e.ChangeLogStatus="change_log_status",e.Terminate="terminate",e.Transaction="transaction",e.CloseDb="close_db",e.Union="union",e.Intersect="intersect",e.ImportScripts="import_scripts",e.Middleware="middleware";}(o||(o={})),function(e){e.RequestQueueEmpty="requestQueueEmpty",e.RequestQueueFilled="requestQueueFilled",e.Upgrade="upgrade",e.Create="create",e.Open="open";}(i||(i={})),function(e){e.Where="where",e.Like="like",e.Regex="regex",e.In="in",e.Equal="=",e.Between="-",e.GreaterThan=">",e.LessThan="<",e.GreaterThanEqualTo=">=",e.LessThanEqualTo="<=",e.NotEqualTo="!=",e.Aggregate="aggregate",e.Max="max",e.Min="min",e.Avg="avg",e.Count="count",e.Sum="sum",e.List="list",e.Or="or",e.Skip="skip",e.Limit="limit",e.And="and",e.IgnoreCase="ignoreCase",e.Then="then";}(s||(s={})),function(e){e.ReadOnly="readonly",e.ReadWrite="readwrite";}(u||(u={})),function(e){e.First="f",e.Last="l",e.Any="a";}(a||(a={})),function(e){e.Connected="connected",e.Closed="closed",e.NotStarted="not_started",e.UnableToStart="unable_to_start",e.ClosedByJsStore="closed_by_jsstore";}(p||(p={}));var h,d=function(e){return new Promise(e)},f=function(e){return Promise.resolve(e)},_=function(){function e(e){this._events={},this._ctx=e;}return e.prototype.on=function(e,t){return null==this._events[e]&&(this._events[e]=[]),this._events[e].push(t),this},e.prototype.off=function(e,t){if(this._events[e])if(t){var n=this._events[e].indexOf(t);this._events[e].splice(n,1);}else this._events[e]=[];},e.prototype.emit=function(e){for(var t=this,n=[],r=1;r<arguments.length;r++)n[r-1]=arguments[r];var o=this._events[e]||[],i=0,s=o.length,u=[];return new Promise((function(e){var r=function(){i<s?function(){var e=o[i++];if(e){var r=e.call.apply(e,function(e,t,n){if(2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))}([t._ctx],n,false));return r&&r.then?r:Promise.resolve(r)}}().then((function(e){u.push(e),r();})):e(u);};r();}))},e.prototype.destroy=function(){this._events=null,this._ctx=null;},e}(),y=function(){function e(e){this.isConOpened_=false,this.isDbIdle_=true,this.requestQueue_=[],this.isCodeExecuting_=false,this.inactivityTimer_=-1e3,this.middlewares=[],this.eventBus_=new _(this),this.whiteListApi_=[o.InitDb,o.OpenDb,o.MapGet,o.MapSet,o.MapHas,o.MapDelete,o.ChangeLogStatus,o.Terminate,o.DropDb],this.isWorker=true,this.logger=new c(null),e?(this.worker_=e,this.worker_.onmessage=this.onMessageFromWorker_.bind(this)):(this.isWorker=false,this.initQueryManager_());}return Object.defineProperty(e.prototype,"jsstoreWorker",{get:function(){return this.$worker||self.JsStoreWorker},enumerable:false,configurable:true}),e.prototype.initQueryManager_=function(){var e=this.jsstoreWorker;e&&(this.queryManager=new e.QueryManager(this.processFinishedQuery_.bind(this)));},e.prototype.onMessageFromWorker_=function(e){this.processFinishedQuery_(e.data);},e.prototype.processFinishedQuery_=function(e){var t=this.requestQueue_.shift();if(t){if(this.logger.log("request ".concat(t.name," finished")),e.error)t.onError(e.error);else {switch(t.name){case o.OpenDb:case o.InitDb:this.isConOpened_=true;break;case o.Terminate:this.isConOpened_=false,true===this.isWorker&&this.worker_.terminate();case o.DropDb:this.isConOpened_=false,this.requestQueue_=[],this.isDbIdle_=true;break;case o.CloseDb:this.isDbIdle_=true,this.eventBus_.emit(i.RequestQueueEmpty,[]),this.requestQueue_.length>0&&this.openDb_(false);}t.onSuccess(e.result);}this.isCodeExecuting_=false,this.executeQry_();}},e.prototype.openDb_=function(e){ undefined===e&&(e=true);var t={name:o.OpenDb,query:{name:this.database.name,version:this.database.version},onSuccess:function(){},onError:function(e){console.error(e);}};e?this.prcoessExecutionOfQry_(t,0):this.requestQueue_.splice(0,0,t);},e.prototype.executeMiddleware_=function(e){var t=this;return d((function(n){var r=0,o=t.middlewares.length-1,i=function(){if(r<=o){var s=t.middlewares[r++](e);s&&s.then||(s=f(s)),s.then((function(e){i();}));}else n();};i();}))},e.prototype.callResultMiddleware=function(e,t){return d((function(n){var r=0,o=e.length-1,i=function(){if(r<=o){var s=e[r++](t);s.then||(s=f(s)),s.then((function(e){t=e,i();}));}else n(t);};i();}))},e.prototype.pushApi=function(e){var t=this;return new Promise((function(n,r){var s=[];e.onResult=function(e){s.push((function(t){return e(t)}));},t.executeMiddleware_(e).then((function(){e.onSuccess=function(r){t.callResultMiddleware(s,r).then((function(e){n(e);})).catch((function(t){e.onError(t);}));},e.onError=function(e){s=[],r(e);},0===t.requestQueue_.length&&(t.eventBus_.emit(i.RequestQueueFilled,[]),t.isDbIdle_&&t.isConOpened_&&([o.InitDb,o.CloseDb,o.DropDb,o.OpenDb,o.Terminate].indexOf(e.name)>=0||t.openDb_()),clearTimeout(t.inactivityTimer_)),t.prcoessExecutionOfQry_(e);})).catch(r);}))},e.prototype.prcoessExecutionOfQry_=function(e,t){this.isDbIdle_=false,null!=t?this.requestQueue_.splice(t,0,e):this.requestQueue_.push(e),this.logger.log("request pushed: "+e.name),this.executeQry_();},e.prototype.executeQry_=function(){var e=this,t=this.requestQueue_.length;if(!this.isCodeExecuting_&&t>0){if(true===this.isConOpened_)return void this.sendRequestToWorker_(this.requestQueue_[0]);var n=this.requestQueue_.findIndex((function(t){return e.whiteListApi_.indexOf(t.name)>=0}));n>=0&&(this.requestQueue_.splice(0,0,this.requestQueue_.splice(n,1)[0]),this.sendRequestToWorker_(this.requestQueue_[0]));}else 0===t&&false===this.isDbIdle_&&this.isConOpened_&&(this.inactivityTimer_=setTimeout((function(){e.prcoessExecutionOfQry_({name:o.CloseDb,onSuccess:function(){},onError:function(e){console.error(e);}});}),100));},e.prototype.sendRequestToWorker_=function(e){this.isCodeExecuting_=true,this.logger.log("request executing: "+e.name);var t={name:e.name,query:e.query};true===this.isWorker?this.worker_.postMessage(t):this.queryManager.run(t);},e}(),m=function(){function e(e){this.con=e;}return e.prototype.get=function(e){return this.con.pushApi({name:o.MapGet,query:e})},e.prototype.has=function(e){return this.con.pushApi({name:o.MapHas,query:e})},e.prototype.set=function(e,t){return this.con.pushApi({name:o.MapSet,query:{key:e,value:t}})},e.prototype.delete=function(e){return this.con.pushApi({name:o.MapDelete,query:e})},e}(),g=(h=function(e,t){return h=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},h(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function n(){this.constructor=e;}h(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n);}),b=function(e){function t(t){var n=e.call(this,t)||this;return n.Map=new m(n),n}return g(t,e),t.prototype.initDb=function(e){var t=this;return this.database=e,this.pushApi({name:o.InitDb,query:e}).then((function(e){var n,r=e.database;return e.isCreated&&(n=e.oldVersion?t.eventBus_.emit(i.Upgrade,r,e.oldVersion,e.newVersion):t.eventBus_.emit(i.Create,r)),(n||f()).then((function(e){return t.eventBus_.emit(i.Open,r)})).then((function(t){return e.isCreated}))}))},t.prototype.dropDb=function(){return this.pushApi({name:o.DropDb})},t.prototype.select=function(e){return this.pushApi({name:o.Select,query:e})},t.prototype.count=function(e){return this.pushApi({name:o.Count,query:e})},t.prototype.insert=function(e){return this.pushApi({name:o.Insert,query:e})},t.prototype.update=function(e){return this.pushApi({name:o.Update,query:e})},t.prototype.remove=function(e){return this.pushApi({name:o.Remove,query:e})},t.prototype.clear=function(e){return this.pushApi({name:o.Clear,query:e})},Object.defineProperty(t.prototype,"logStatus",{set:function(e){this.logger.status=e,this.pushApi({name:o.ChangeLogStatus,query:e});},enumerable:false,configurable:true}),t.prototype.openDb=function(e,t){var n=this;return this.pushApi({name:o.OpenDb,query:{version:t,name:e}}).then((function(e){return n.database=e,e}))},t.prototype.getDbList=function(){return console.warn("Api getDbList is recommended to use for debugging only. Do not use in code."),indexedDB.databases()},t.prototype.get=function(e){return console.warn("This API is obsolete, please use Map"),this.Map.get(e)},t.prototype.set=function(e,t){return console.warn("This API is obsolete, please use Map"),this.Map.set(e,t)},t.prototype.terminate=function(){return this.pushApi({name:o.Terminate})},t.prototype.transaction=function(e){return this.pushApi({name:o.Transaction,query:e})},t.prototype.on=function(e,t){this.eventBus_.on(e,t);},t.prototype.off=function(e,t){this.eventBus_.off(e,t);},t.prototype.union=function(e){return this.pushApi({name:o.Union,query:e})},t.prototype.intersect=function(e){return this.pushApi({name:o.Intersect,query:e})},t.prototype.addPlugin=function(e,t){return e.setup(this,t)},t.prototype.addMiddleware=function(e,t){return t?this.pushApi({name:o.Middleware,query:e}):(this.middlewares.push(e),Promise.resolve())},t.prototype.importScripts=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return this.pushApi({name:o.ImportScripts,query:e})},t}(y),v=function(e){return Promise.all(e)},q=function(e,t){for(var n in e)t(n,e[n]);};jsstore_commonjs2_min.exports=t;})();


var jsstore_commonjs2_minExports = jsstore_commonjs2_min.exports;

npm_export.exports = jsstore_commonjs2_minExports ;

var npm_exportExports = npm_export.exports;

var jsstore_worker_commonjs2_min = {exports: {}};

/*! For license information please see jsstore.worker.commonjs2.min.js.LICENSE.txt */

var hasRequiredJsstore_worker_commonjs2_min;

function requireJsstore_worker_commonjs2_min () {
	if (hasRequiredJsstore_worker_commonjs2_min) return jsstore_worker_commonjs2_min.exports;
	hasRequiredJsstore_worker_commonjs2_min = 1;
	(()=>{var e={d:(t,n)=>{for(var r in n)e.o(n,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:true,get:n[r]});},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:true});}},t={};e.r(t),e.d(t,{QueryManager:()=>rt});var n,r,o,u,i,a,c,s,l=function(e){return Promise.resolve(e)},f=function(e){return new Promise(e)},h="not_array",p="no_value_supplied",y="column_not_exist",d="no_index_found",v="null_value",m="wrong_data_type",b="table_not_exist",g="not_object",w="Db_blocked",_="indexeddb_not_supported",x="null_value_in_where",k="invalid_join_query",T="import_scripts_failed",S="method_not_exist",E="invalid_middleware";!function(e){e.Registered="registerd",e.Failed="failed",e.NotStarted="not_started";}(n||(n={})),function(e){e.String="string",e.Object="object",e.Array="array",e.Number="number",e.Boolean="boolean",e.Null="null",e.DateTime="date_time";}(r||(r={})),function(e){e.InitDb="init_db",e.MapGet="map_get",e.MapSet="map_set",e.MapHas="map_has",e.MapDelete="map_delete",e.Select="select",e.Insert="insert",e.Update="update",e.Remove="remove",e.OpenDb="open_db",e.Clear="clear",e.DropDb="drop_db",e.Count="count",e.ChangeLogStatus="change_log_status",e.Terminate="terminate",e.Transaction="transaction",e.CloseDb="close_db",e.Union="union",e.Intersect="intersect",e.ImportScripts="import_scripts",e.Middleware="middleware";}(o||(o={})),function(e){e.RequestQueueEmpty="requestQueueEmpty",e.RequestQueueFilled="requestQueueFilled",e.Upgrade="upgrade",e.Create="create",e.Open="open";}(u||(u={})),function(e){e.Where="where",e.Like="like",e.Regex="regex",e.In="in",e.Equal="=",e.Between="-",e.GreaterThan=">",e.LessThan="<",e.GreaterThanEqualTo=">=",e.LessThanEqualTo="<=",e.NotEqualTo="!=",e.Aggregate="aggregate",e.Max="max",e.Min="min",e.Avg="avg",e.Count="count",e.Sum="sum",e.List="list",e.Or="or",e.Skip="skip",e.Limit="limit",e.And="and",e.IgnoreCase="ignoreCase",e.Then="then";}(i||(i={})),function(e){e.ReadOnly="readonly",e.ReadWrite="readwrite";}(a||(a={})),function(e){e.First="f",e.Last="l",e.Any="a";}(c||(c={})),function(e){e.Connected="connected",e.Closed="closed",e.NotStarted="not_started",e.UnableToStart="unable_to_start",e.ClosedByJsStore="closed_by_jsstore";}(s||(s={}));var O,C=function(){function e(e){this.columns=[],this.autoIncColumnValue={},this.columns=this.setColumn(e.columns),this.name=e.name,this.alter=e.alter||{};}return e.prototype.setColumn=function(e){var t=[],n=function(n){var o=e[n];o.name=n,o.autoIncrement&&(r.autoIncColumnValue[n]=0),o.primaryKey&&(r.primaryKey=n,r.keypath=o.keyPath||n),o.enableSearch=null==o.enableSearch||o.enableSearch;var u=r.columns.indexOf((function(e){return e.name===n}));if(u<0)t.push(o);else {var i=r.columns[u];Object.assign(i,o);}},r=this;for(var o in e)n(o);return t},e}(),j=function(){function e(){}return e.autoIncrementKey=function(e,t){return "JsStore_".concat(e,"_").concat(t,"_Value")},e.getStore=function(t){return t.tx||t.createTransaction([e.tableName]),t.objectStore(e.tableName)},e.set=function(t,n,r){var o=e.getStore(r);return f((function(e,r){var u=o.put({key:t,value:n});u.onsuccess=function(){e();},u.onerror=r;}))},e.get=function(t,n){var r=e.getStore(n);return f((function(e,o){var u=r.get(n.keyRange(t));u.onsuccess=function(){var t=u.result;e(t&&t.value);},u.onerror=o;}))},e.remove=function(t,n){var r=e.getStore(n);return f((function(e,o){var u=r.delete(n.keyRange(t));u.onsuccess=function(){e();},u.onerror=o;}))},e.has=function(t,n){var r=e.getStore(n);return f((function(e,o){var u=r.count(n.keyRange(t));u.onsuccess=function(){var t=u.result;e(t>0);},u.onerror=o;}))},e.tableName="JsStore_Meta",e.dbSchema="JsStore_DbSchema",e}(),A=function(e){this.name=e.name,this.version=e.version||1,e.tables.push({name:j.tableName,columns:{key:{primaryKey:true},value:{enableSearch:false}}}),this.tables=e.tables.map((function(e){return new C(e)}));},q=function(e,t){for(var n in e)t(n,e[n]);},I=function(){function e(e,t){this.type=e,this.info_=t,this.message=this.getMsg_();}return e.prototype.log=function(e){this.status&&console.log(e);},e.prototype.throw=function(){throw this.get()},e.prototype.logError=function(){console.error(this.get());},e.prototype.get=function(){return {message:this.message,type:this.type}},e.prototype.warn=function(){console.warn(this.get());},e.prototype.getMsg_=function(){var e,t,n=this.info_,r=((e={})[h]=function(){t="Supplied value is not an array";},e.undefined_column=function(){t="Column is undefined in Where";},e.undefined_value=function(){t="Value is undefined in Where";},e.undefined_column_name=function(){t="Column name is undefined '"+n.TableName+"'";},e.undefined_database_name=function(){t="Database name is not supplied";},e.undefined_column_value=function(){t="Column value is undefined";},e[p]=function(){t="No value is supplied";},e.invalid_operator=function(){t="Invalid Op Value '"+n.Op+"'";},e[y]=function(){var e=n.column;t=n.isOrder?"Column '".concat(e,"' in order query does not exist"):"Column '".concat(e,"' does not exist");},e[d]=function(){t="No index found for column '"+n.column+"'. Query can not be executed without index.";},e[v]=function(){t="Null value is not allowed for column '"+n.ColumnName+"'";},e[m]=function(){t="Expected data type for the column ".concat(n.column," is ").concat(n.expected,", but received a ").concat(n.received,".");},e[b]=function(){t="Table '"+n.tableName+"' does not exist";},e.db_not_exist=function(){t="Database with name ".concat(n.dbName," does not exist");},e[g]=function(){t="supplied value is not object";},e.invalid_config=function(){t="Invalid Config '"+n.Config+" '";},e[w]=function(){t="database is blocked, cant be deleted right now";},e[x]=function(){t="Null/undefined is not allowed in where. Column '".concat(n.column,"' has null");},e[S]=function(){t="method '".concat(n,"' does not exist.");},e[_]=function(){t="Browser does not support indexeddb";},e.getInfo=function(){t=n;},e[k]=function(){r.getInfo();},e[T]=function(){r.getInfo();},e[E]=function(){t="No function ".concat(n," is found.");},e),o=this.type,u=r[o];return u?u():(o||(this.type="unknown"),t=this.message),t},e}(),R=function(){function e(){this.logger=new I(null);}return e.prototype.emptyTx=function(){this.tx&&(this.tx.oncomplete=null,this.tx.onabort=null,this.tx.onerror=null,this.tx=null);},e.prototype.createTransactionIfNotExist=function(e,t){this.tx||this.createTransaction(e,t);},e.prototype.createTransaction=function(e,t){var n=this;return undefined===t&&(t=a.ReadWrite),this.tx=this.con.transaction(e,t),f((function(e,t){n.tx.oncomplete=e,n.tx.onabort=e,n.tx.onerror=t;}))},e.prototype.keyRange=function(e,t){var n;switch(t){case i.Between:n=IDBKeyRange.bound(e.low,e.high,false,false);break;case i.GreaterThan:n=IDBKeyRange.lowerBound(e,true);break;case i.GreaterThanEqualTo:n=IDBKeyRange.lowerBound(e);break;case i.LessThan:n=IDBKeyRange.upperBound(e,true);break;case i.LessThanEqualTo:n=IDBKeyRange.upperBound(e);break;default:n=IDBKeyRange.only(e);}return n},e.prototype.objectStore=function(e){return this.tx.objectStore(e)},e.prototype.abortTransaction=function(){this.tx&&this.tx.abort();},e.prototype.close=function(){var e=this;return this.con&&this.con.close(),f((function(t){e.con=null,setTimeout(t,100);}))},e.prototype.initDb=function(e){var t,n=this,r=false,o=e.version;return f((function(u,i){var a=indexedDB.open(e.name,o);a.onsuccess=function(){n.con=a.result,n.con.onversionchange=function(e){e.target.close();},u({isCreated:r,oldVersion:t,newVersion:o});},a.onerror=function(e){console.error("error",e),i(e);},a.onupgradeneeded=function(n){t=n.oldVersion;var u=n.target,i=u.result;r=true;var a=u.transaction,c=i.objectStoreNames,s=function(e,t){var n=t.name;if(t.enableSearch&&!e.indexNames.contains(n)){var r=t.primaryKey?{unique:true}:{unique:t.unique};r.multiEntry=t.multiEntry;var o=null==t.keyPath?n:t.keyPath;e.createIndex(n,o,r);}},l=function(e,t,n){var r=t.columns.findIndex((function(e){return e.name===n}));r>=0&&(t.columns.splice(r,1),e.deleteIndex(n));};e.tables.forEach((function(e){c.contains(e.name)||function(e){var t=e.primaryKey?{keyPath:e.keypath}:{autoIncrement:true},n=i.createObjectStore(e.name,t);e.columns.forEach((function(e){s(n,e);}));}(e);for(var n=a.objectStore(e.name),r=t+1;r<=o;r++){var u=e.alter[r];u&&(u.add&&e.setColumn(u.add).forEach((function(t){s(n,t),e.columns.push(t);})),q(u.drop||{},(function(t){l(n,e,t);})),q(u.modify||{},(function(t,r){var o=r.multiEntry||r.keyPath||r.unique,u=e.columns.find((function(e){return e.name===t})),i=Object.assign(u,r);i.name=t,o&&(l(n,e,t),s(n,i),e.columns.push(i));})));}}));for(var f=function(t,n){var r=c.item(t);e.tables.findIndex((function(e){return e.name===r}))<0&&i.deleteObjectStore(r);},h=0,p=c.length;h<p;h++)f(h);};}))},e}(),Q=function(e){return Promise.all(e)},L=function(e){return Promise.reject(e)},N=function(e){if(e instanceof I)return e.logError(),e.get();var t=undefined;return e.name?(t=new I(e.name)).message=e.message:(t=new I(e.target.error.name)).message=e.target.error.message,t.get()},D=function(){function e(){this.rowAffected=0,this.isTxQuery=false,this.results=[];}return Object.defineProperty(e.prototype,"db",{get:function(){return this.util.db},enumerable:false,configurable:true}),e.prototype.table=function(e){var t=e||this.tableName;return this.db.tables.find((function(e){return e.name===t}))},e.prototype.primaryKey=function(e){var t=this.query;return !t.from&&t.store&&t.meta?t.meta.primaryKey:this.table(e).primaryKey},e.prototype.getColumnInfo=function(e,t){return this.table(t).columns.find((function(t){return t.name===e}))},e.prototype.onException=function(e,t){return console.error(e),this.util.abortTransaction(),L(function(e,t){return undefined===t&&(t="invalid_query"),e.name=t,N(e)}(e,t))},e}(),W=function(e){if(null==e)return r.Null;var t=typeof e;if("object"===t){if(Array.isArray(e))return r.Array;if(e instanceof Date)return r.DateTime}return t},V=function(e){return null==e||"number"==typeof e&&isNaN(e)},B=function(){function e(e,t){this.table=e,this.autoIncrementValue=t;}return e.prototype.checkAndModifyValues=function(e){var t,n=this;this.query=e;var r=e.values,o=[];return r.every((function(r,u){return t=n.checkAndModifyValue(r),e.ignore&&t&&(o.push(u),t=null),!t})),o.forEach((function(e){r.splice(e,1);})),{err:t,values:r}},e.prototype.checkAndModifyValue=function(e){var t,n=this;return this.table.columns.every((function(r){return !(t=n.checkAndModifyColumnValue_(r,e))})),t},e.prototype.checkNotNullAndDataType_=function(e,t){if(e.notNull&&V(t[e.name]))return this.getError(v,{ColumnName:e.name});if(e.dataType&&!V(t[e.name])){var n=W(t[e.name]);if(n!==e.dataType)return this.getError(m,{column:e.name,expected:e.dataType,received:n})}},e.prototype.checkAndModifyColumnValue_=function(e,t){var n=t[e.name];if(e.autoIncrement?V(n)?t[e.name]=++this.autoIncrementValue[e.name]:W(n)===r.Number&&n>this.autoIncrementValue[e.name]&&(this.autoIncrementValue[e.name]=n):undefined!==e.default&&V(n)&&(t[e.name]=e.default),this.query.validation)return this.checkNotNullAndDataType_(e,t)},e.prototype.getError=function(e,t){return new I(e,t)},e}(),P=function(){function e(e){this.table=e;}return e.prototype.check=function(e,t){var n,o=this;return typeof e===r.Object?this.table?this.table.columns.every((function(t){return t.name in e&&(n=o.checkByColumn_(t,e[t.name])),!n})):n=new I(b,{tableName:t}):n=new I(g),n},e.prototype.checkByColumn_=function(e,t){if(true===e.notNull&&V(t))return new I(v,{ColumnName:e.name});var n=W(t),r=null!=t;if(e.dataType&&r&&n!==e.dataType&&"object"!==n)return new I(m,{column:e.name,expected:e.dataType,received:n});if(r&&"object"===n){var o=["+","-","*","/","{push}"];for(var u in t)if(o.indexOf(u)<0&&e.dataType&&n!==e.dataType)return new I(m,{column:e.name,expected:e.dataType,received:n})}},e}(),M=function(){function e(e){this.db=e;}return e.prototype.validate=function(e,t){switch(e){case o.Select:case o.Remove:case o.Count:return this.checkSelect(t);case o.Insert:return this.checkInsertQuery(t);case o.Update:return this.checkUpdate(t)}},e.prototype.getTable_=function(e){return this.db.tables.find((function(t){return t.name===e}))},e.prototype.isInsertQryValid=function(e){var t,n=this.getTable_(e.into);if(n)switch(W(e.values)){case r.Array:break;case r.Null:t=new I(p);break;default:t=new I(h);}else t=new I(b,{tableName:e.into});return {table:n,log:t}},e.prototype.checkUpdate=function(e){var t=new P(this.getTable_(e.in)).check(e.set,e.in);if(t)return t;if(null!=e.where){if(t=this.checkForNullInWhere_(e))return t;this.addGreatAndLessToNotOp_(e);}},e.prototype.checkSelect=function(e){if(!e.store&&!this.getTable_(e.from))return new I(b,{tableName:e.from});if(e.where){var t=this.checkForNullInWhere_(e);if(t)return t;this.addGreatAndLessToNotOp_(e);}},e.prototype.checkForNullInWhere_=function(e){for(var t in e.where)if(null==e.where[t])return new I(x,{column:t})},e.prototype.addGreatAndLessToNotOp_=function(e){var t=e.where,n=function(e,t){return t.findIndex((function(t){return null!=e[t][i.NotEqualTo]}))>=0},o=function(e,t){var n;return t.forEach((function(t){null!=(n=e[t])[i.NotEqualTo]&&(e[t][i.GreaterThan]=n[i.NotEqualTo],undefined===e[i.Or]?(e[i.Or]={},e[i.Or][t]={}):undefined===e[i.Or][t]&&(e[i.Or][t]={}),e[i.Or][t][i.LessThan]=n[i.NotEqualTo],delete e[t][i.NotEqualTo]);})),e};if(W(t)===r.Object){var u=Object.keys(t);if(n(t,u))if(1===u.length)e.where=o(t,u);else {var a=[];u.forEach((function(e){var n;a.push(o(((n={})[e]=t[e],n),[e]));})),e.where=a;}}else {var c=[];t.forEach((function(e){var t=Object.keys(e);n(e,t)&&(e=o(e,t)),c.push(e);})),e.where=c;}},e.prototype.checkInsertQuery=function(e){var t=this.isInsertQryValid(e),n=t.table,r=t.log;if(r)return r;if(!e.skipDataCheck){var o=new B(n,n.autoIncColumnValue).checkAndModifyValues(e),u=o.values,i=o.err;return e.values=u,i}},e}(),G=(O=function(e,t){return O=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},O(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function n(){this.constructor=e;}O(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n);}),K=function(e){function t(t,n){var r=e.call(this)||this;return r.valuesAffected_=[],null==t.validation&&(t.validation=true),r.query=t,r.util=n,r.tableName=t.into,r}return G(t,e),t.prototype.execute=function(e){var t=this,n=this.db,r=new M(n).validate(o.Insert,this.query);return r?L(r):e().then((function(e){return t.insertData_(n).then((function(e){return t.query.return?t.valuesAffected_:t.rowAffected}))})).catch((function(e){return t.util.abortTransaction(),L(e)}))},t.prototype.insertData_=function(e){var t,n,r,o=this,u=this.query;return t=u.return?function(e){o.valuesAffected_.push(e);}:function(e){++o.rowAffected;},r=u.upsert?"put":"add",n=u.ignore&&!o.isTxQuery?function(e){return o.util.con.transaction(u.into,a.ReadWrite).objectStore(u.into)[r](e)}:(o.isTxQuery||o.util.createTransaction([u.into,j.tableName]),o.objectStore=o.util.objectStore(o.tableName),function(e){return o.objectStore[r](e)}),Q(u.values.map((function(e){return f((function(r,o){var i=n(e);i.onerror=function(e){u.ignore?r():o(e);},i.onsuccess=function(){t(e),r();};}))}))).then((function(){return j.set(j.dbSchema,e,o.util)}))},t}(D),J=undefined===self.alert&&"undefined"==typeof ServiceWorkerGlobalScope,F=function(){try{if(indexedDB||(indexedDB=self.mozIndexedDB||self.webkitIndexedDB||self.msIndexedDB),!indexedDB)return !1;IDBTransaction=IDBTransaction||self.webkitIDBTransaction||self.msIDBTransaction,self.IDBKeyRange=self.IDBKeyRange||self.webkitIDBKeyRange||self.msIDBKeyRange;}catch(e){return  false}return  true}(),U=function(e){return Array.isArray(e)},H=function(e){return Object.keys(e)},z=function(e){return H(e).length},$=function(){function e(){}return e.prototype.setCaseAndValue=function(e,t){this.caseQuery_=e,this.setValue(t);},e.prototype.setCaseAndColumn=function(e,t){return this.caseQuery_=e,this.setColumn(t),this},e.prototype.setColumn=function(e){return this.columnName_=e,this.caseColumnQuery_=this.caseQuery_[this.columnName_],this.length_=this.caseColumnQuery_.length,this},e.prototype.setValue=function(e){return this.value=e,this},e.prototype.evaluate=function(){for(var e=0;e<this.length_;e++)if(true===this.checkCase_(this.caseColumnQuery_[e]))return this.caseColumnQuery_[e].then;var t=this.caseColumnQuery_[this.length_-1].then;return null==t?this.value[this.columnName_]:t},e.prototype.checkCase_=function(e){var t;for(t in e){switch(t){case i.GreaterThan:if(this.value[this.columnName_]>e[t])return  true;break;case i.Equal:if(this.value[this.columnName_]===e[t])return  true;break;case i.LessThan:if(this.value[this.columnName_]<e[t])return  true;break;case i.GreaterThanEqualTo:if(this.value[this.columnName_]>=e[t])return  true;break;case i.LessThanEqualTo:if(this.value[this.columnName_]<=e[t])return  true;break;case i.NotEqualTo:if(this.value[this.columnName_]!==e[t])return  true;break;case i.Between:if(this.value[this.columnName_]>e[t].low&&this.value[this.columnName_]<e[t].high)return  true}return  false}},e}(),X=function(e,t,n,r){if(false===this.limitAtEnd&&false===this.skipAtEnd){if(this.skipRecord)return this.limitRecord?r:n;if(this.limitRecord)return t}return e},Y=function(e){var t=this,n=false;return function(r){var o=r.target.result;o?n&&t.results.length!==t.limitRecord?(t.shouldAddValue(o)&&t.pushResult(o.value),o.continue()):(n=true,o.advance(t.skipRecord)):e();}},Z=function(e){var t=this,n=false;return function(r){var o=r.target.result;o?n?(t.shouldAddValue(o)&&t.pushResult(o.value),o.continue()):(n=true,o.advance(t.skipRecord)):e();}},ee=function(e){var t=this;return function(n){var r=n.target.result;r&&t.results.length!==t.limitRecord?(t.shouldAddValue(r)&&t.pushResult(r.value),r.continue()):e();}},te=function(e){var t=this;return function(n){var r=n.target.result;r?(t.shouldAddValue(r)&&t.pushResult(r.value),r.continue()):e();}},ne=function(e){var t,n=this,r=false;return function(o){(t=o.target.result)?r&&n.results.length!==n.limitRecord?(n.pushResult(t.value),t.continue()):(r=true,t.advance(n.skipRecord)):e();}},re=function(e){var t,n=this,r=false;return function(o){(t=o.target.result)?r?(n.pushResult(t.value),t.continue()):(r=true,t.advance(n.skipRecord)):e();}},oe=function(e){var t,n=this;return function(r){(t=r.target.result)?(n.pushResult(t.value),t.continue()):e();}},ue=function(e){var t,n=this;return function(r){(t=r.target.result)&&n.results.length!==n.limitRecord?(n.pushResult(t.value),t.continue()):e();}},ie=function(e){return e.replace(/\s/g,"")},ae=function(e){var t;if(!this.query.store)if(null==this.query.join)t=this.getColumnInfo(e);else {var n=ie(e).split("."),r=n[1];t=this.getColumnInfo(r,n[0]);}if(null==t){var o=this.results[0][e];if(o)return {dataType:W(o),name:e};throw new I(y,{column:e,isOrder:true})}return t},ce=function(e,t){return t.localeCompare(e)},se=function(e,t){return e.localeCompare(t)},le=function(e,t){return new String(t).localeCompare(e)},fe=function(e,t){return new String(e).localeCompare(t)},he=function(e,t){return t-e},pe=function(e,t){return e-t},ye=function(e,t){return t.getTime()-e.getTime()},de=function(e,t){return e.getTime()-t.getTime()},ve=function(e,t){switch(e.dataType){case r.String:return "asc"===t.type?se:ce;case r.Number:return "asc"===t.type?pe:he;case r.DateTime:return "asc"===t.type?de:ye;default:return "asc"===t.type?fe:le}},me=function(e){var t;e.type=be(e.type);var n=e.by,o=this.thenEvaluator;if(null!=n&&typeof n===r.Object){var u=n,i=function(e,t){return function(n,i){for(var a in u){o.setCaseAndValue(u,n);var c=o.setColumn(a).evaluate();o.setCaseAndValue(u,i);var s=o.setColumn(a).evaluate();return typeof n[c]===r.String?e(n[c],i[s]):t(n[c],i[s])}}},a="asc"===e.type?i(se,pe):i(ce,he);this.results.sort(a);}else {var c=ae.call(this,n);if(null!=c){var s=ve(c,e);n=c.name,null==e.case?this.results.sort((function(e,t){return s(e[n],t[n])})):(o.setCaseAndColumn(((t={})[n]=e.case,t),n),this.results.sort((function(e,t){return s(o.setValue(e).evaluate(),o.setValue(t).evaluate())})));}}},be=function(e){return null==e?"asc":e.toLowerCase()},ge=function(e){for(var t in e)return t},we=function(e){var t,n,r=e.split("%");switch(r[1]?(t=r[1],n=r.length>2?c.Any:c.Last):(t=r[0],n=c.First),n){case c.First:return new RegExp("^".concat(t),"i");case c.Last:return new RegExp("".concat(t,"$"),"i");default:return new RegExp("".concat(t),"i")}},_e=function(e){return "object"===W(e)&&!(e instanceof RegExp)},xe=function(e){if(_e(e)){var t={};for(var n in e)t[n]=null!=e[n]&&_e(e[n])?xe(e[n]):e[n];return t}return e},ke=function(e,t,n){var o=W(e);if(o!==W(t))return  false;switch(o===r.DateTime&&(e=e.getTime(),t=t.getTime()),n){case i.GreaterThan:return e>t;case i.LessThan:return e<t;case i.LessThanEqualTo:return e<=t;case i.GreaterThanEqualTo:return e>=t;case i.NotEqualTo:return e!==t;default:var u;return "array"===o?e.length===t.length&&(e.every((function(e,n){return u=e===t[n]})),u):e===t}},Te=function(){function e(e,t){this.where=xe(e),this.checkFlag=t;}return e.prototype.remove=function(e){var t=e.pop();delete e.reduce((function(e,t){return e&&e[t]}),this.where)[t];},e.prototype.check=function(e){var t=this,n=true;if(!this.checkFlag)return n;var r=this.where,o=function(o){if(!n)return {value:n};var u=r[o],a=e[o],c=U(a),s=U(u),l=function(e){c&&!s?a.every((function(t){return !(n=e(t))})):n=e(a);};if("object"===W(u)){var f=function(e){if(!n)return {value:n};switch(e){case i.In:l((function(e){return t.checkIn(u[i.In],e)}));break;case i.Like:l((function(e){return t.checkLike_(o,e)}));break;case i.Regex:l((function(e){return t.checkRegex(o,e)}));break;case i.Between:case i.GreaterThan:case i.LessThan:case i.GreaterThanEqualTo:case i.LessThanEqualTo:case i.NotEqualTo:l((function(n){return t.checkComparisionOp_(o,n,e)}));break;default:n=false;}};for(var h in u){var p=f(h);if("object"==typeof p)return p}}else l((function(e){return ke(u,e)}));};for(var u in r){var a=o(u);if("object"==typeof a)return a.value}return n},e.prototype.checkIn=function(e,t){return null!=e.find((function(e){return ke(e,t)}))},e.prototype.checkLike_=function(e,t){return we(this.where[e][i.Like]).test(t)},e.prototype.checkRegex=function(e,t){return this.where[e][i.Regex].test(t)},e.prototype.checkComparisionOp_=function(e,t,n){var r=this.where[e][n];return n!=i.Between?ke(t,r,n):ke(t,r.low,">=")&&ke(t,r.high,"<=")},e}(),Se=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),Ee=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.limitAtEnd=false,t.skipAtEnd=false,t}return Se(t,e),t.prototype.goToWhereLogic=function(){var e=this,t=this.query,n=t.where,r=function(){for(var t in n)if(e.objectStore.indexNames.contains(t))return t}();if(null==r&&(r=ge(n),!t.store))return L(new I(d,{column:r}));var o=n[r];if("object"!==W(o))return u=z(n)>1,this.whereChecker=new Te(n,u),this.whereChecker.remove([r]),this.executeWhereLogic(r,o,null,"next");var u=z(o)>1||z(n)>1;this.whereChecker=new Te(n,u);var a=ge(o);switch(this.whereChecker.remove([r,a]),a){case i.Like:var c=we(o[i.Like]);return this.executeRegexLogic(r,c);case i.Regex:return this.executeRegexLogic(r,o[i.Regex]);case i.In:return this.executeInLogic(r,o[i.In]);case i.Between:case i.GreaterThan:case i.LessThan:case i.GreaterThanEqualTo:case i.LessThanEqualTo:return this.executeWhereLogic(r,o,a,"next");case i.Aggregate:break;default:return this.executeWhereLogic(r,o,null,"next")}},t}(D),Oe=function(e,t){var n=this;return function(r){var o=r.target.result;n.results.length!==n.limitRecord&&o?(n.shouldAddValue(o)&&t(o.value),o.continue()):e();}},Ce=function(e,t){var n=this;return function(r){var o=r.target.result;o?(n.shouldAddValue(o)&&t(o.value),o.continue()):e();}},je=function(){return je=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},je.apply(this,arguments)},Ae=function(){function e(e){this.joinQueryStack_=[],this.currentQueryStackIndex_=0,this.tablesFetched=[],this.results=[],this.select=e;}return Object.defineProperty(e.prototype,"query",{get:function(){return this.select.query},enumerable:false,configurable:true}),e.prototype.getTable=function(e){return this.select.table(e)},e.prototype.executeSelect=function(e){return new Qe(e,this.select.util).execute()},e.prototype.execute=function(){var e=this,t=this.query;this.joinQueryStack_=W(t.join)===r.Object?[t.join]:t.join;var n=t.from,o=[];n&&o.push(n);for(var u=this.joinQueryStack_,i=0,a=u.length;i<a;i++){var c=u[i],s=this.getJoinTableInfo_(c.on);c.with===s.table1.table&&(s={table1:s.table2,table2:s.table1});var l=this.checkJoinQuery_(s,c);if(l)return L(l);u[i].joinTableInfo=s,c.with&&o.push(c.with);}!this.select.isTxQuery&&o.length>0&&this.select.util.createTransaction(o);var f=t.where;if(f&&!t.store){var h=this.getTable(n),p=function(e){var t;if(Array.isArray(e))t=[],e=e.filter((function(e){var n=p(e);return Object.keys(n.whereQryAfterJoin).length>0&&t.push(n.whereQryAfterJoin),!n.isWhereEmpty}));else {t={};var n=function(n){if("or"===n){var r={},o=e[n],u=function(e){h.columns.find((function(t){return t.name===e}))||(r[e]=o[e]);};for(var i in o)u(i);if(z(r)>0)for(var i in t.or=r,r)delete o[i];}else h.columns.find((function(e){return e.name===n}))||(t[n]=f[n]);};for(var r in e)n(r);for(var r in t)delete e[r];}return {isWhereEmpty:0===z(e),whereQryAfterJoin:t,whereQueryModified:e}},y=p(f),d=y.whereQryAfterJoin;t.where=y.whereQueryModified,y.isWhereEmpty&&delete t.where;var v=this.joinQueryStack_[0];Object.assign(v.whereJoin,d);}return this.executeSelect({from:n,where:t.where,case:t.case,flatten:t.flatten,store:t.store,meta:t.meta}).then((function(t){return e.results=t.map((function(t){var n;return (n={})[e.currentQueryStackIndex_]=t,n})),e.tablesFetched.push(u[0].joinTableInfo.table1.table),e.startExecutingJoinLogic_()}))},e.prototype.onJoinQueryFinished_=function(){if(0!==this.results.length){var e=this.select;try{var t=[],n=H(this.results[0]).length;this.results.forEach((function(e){for(var r=e[0],o=1;o<n;o++)r=je(je({},r),e[o]);t.push(r);})),e.results=t,e.setLimitAndSkipEvaluationAtEnd_(),e.query.flatten=null,e.processOrderBy();}catch(e){return console.error(e),L(new I(k,e.message))}}},e.prototype.startExecutingJoinLogic_=function(){var e=this,t=this.joinQueryStack_[this.currentQueryStackIndex_];if(!t)return this.onJoinQueryFinished_();try{var n=t.joinTableInfo;return this.executeSelect({from:t.with,where:t.where,case:t.case,flatten:t.flatten,store:t.store,meta:t.meta}).then((function(r){return e.jointables(t,n,r),e.tablesFetched.push(n.table2.table),++e.currentQueryStackIndex_,e.startExecutingJoinLogic_()}))}catch(e){return console.error(e),L(new I(k,e.message))}},e.prototype.jointables=function(e,t,n){var r,o,u,i,a=e.type,c=[],s=t.table1.column,l=t.table2.column,f=this.tablesFetched.indexOf(t.table1.table),h=this.currentQueryStackIndex_+1,p=e.as,y=p?function(e){for(var t in p){var n=p[t];undefined===e[n]&&(e[n]=e[t],delete e[t]);}return e}:function(e){return e},d=0,v=Object.assign({},e.whereJoin),m=new Te(v,z(v)>0);"left"===a?(i={},e.store?H(e.store).forEach((function(e){i[e]=null;})):this.getTable(t.table2.table).columns.forEach((function(e){i[e.name]=null;})),o=1===h?function(e,t){return t[f][s]===e[l]}:function(e,t){var n=t[f];return null!=n&&n[s]===e[l]},u=function(){0===r.length&&(r=[i]);}):(o=function(e,t){return t[f][s]===e[l]},u=function(){}),this.results.forEach((function(e){r=[],n.forEach((function(t){o(t,e)&&r.push(je({},t));})),u(),r.forEach((function(t){t=y(t),m.check(t)&&(c[d]=je({},e),c[d++][h]=t);}));})),this.results=c;},e.prototype.getJoinTableInfo_=function(e){var t=(e=ie(e)).split("="),n=t[0].split("."),r=t[1].split(".");return {table1:{table:n[0],column:n[1]},table2:{table:r[0],column:r[1]}}},e.prototype.checkJoinQuery_=function(e,t){if(t.store)return null;var n,r=e.table1,o=e.table2,u=this.getTable(r.table),i=this.getTable(o.table);t.with!==o.table&&(n=new I(k,"The 'on' condition must reference a column from the table specified in 'with'. Found '".concat(t.on,"', but '").concat(t.with,"' was provided in 'with'."))),null==u.columns.find((function(e){return e.name===r.column}))?n=new I(k,"column ".concat(r.column," does not exist in table ").concat(r.table)):null==i.columns.find((function(e){return e.name===o.column}))&&(n=new I(k,"column ".concat(o.column," does not exist in table ").concat(o.table))),null==t.as&&(t.as={}),u.columns.every((function(e){var u=i.columns.find((function(t){return t.name===e.name&&t.name!==r.column}));return null==u||null!=t.as[u.name]||(n=new I(k,"column ".concat(e.name," exist in both table ").concat(r.table," & ").concat(o.table)),false)}));var a=t.where;if(a){var c,s=function(e,t){var n=function(n){switch(n){case "or":case "in":break;default:i.columns.find((function(e){return e.name===n}))||(t[n]=e[n],delete e[n]);}};for(var r in e)n(r);};Array.isArray(a)?(c=[],a=a.filter((function(e){var t={};return s(e,t),0!==z(t)&&c.push(t),0!==z(e)}))):s(a,c={}),0===z(a)&&(t.where=null),t.whereJoin=c;}else t.whereJoin={};return n},e}(),qe=function(){function e(e){this.data=e;}return Object.defineProperty(e.prototype,"indexNames",{get:function(){var e=H(this.data[0]);return {contains:function(t){return e.indexOf(t)>=0}}},enumerable:false,configurable:true}),e.prototype.index=function(e){var t=this;return {openCursor:function(n){var r={},o=0,u={continue:function(){++o,a();}},i=function(e){r.onsuccess({target:{result:e}});},a=function(){var r=t.data[o];if(r){var a=r[e];a&&(null==n||n.includes(a))?(u.key=a,u.value=r,i(u)):u.continue();}else i(null);};return l().then(a),r}}},e}(),Ie=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),Re=function(){return Re=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},Re.apply(this,arguments)},Qe=function(e){function t(t,n){var r=e.call(this)||this;r.sorted=false,r.isSubQuery=false,r.thenEvaluator=new $,r.returnResult_=function(){if(r.results.length>0){var e=r.query;if(e.flatten){var t=[],n=new Map;e.flatten.forEach((function(e){r.results.forEach((function(r,o){r[e].forEach((function(n){var o;t.push(Re(Re({},r),((o={})[e]=n,o)));})),n.set(o,true);}));}));var o=0;n.forEach((function(e,t){r.results.splice(t-o,1),++o;})),r.results=r.results.concat(t);}r.processGroupDistinctAggr(),r.processOrderBy(),r.skipAtEnd&&r.results.splice(0,e.skip),r.limitAtEnd&&(r.results=r.results.slice(0,e.limit));}return r.results},r.query=t,r.util=n,r.tableName=t.from,r.setPushResult(),U(t.where)?(r.isArrayQry=true,r.setLimitAndSkipEvaluationAtEnd_()):(r.skipRecord=t.skip,r.limitRecord=t.limit);var o=t.order;return o?((U(o)||o.case||"object"==typeof o.by)&&(o.idbSorting=false),r.setLimitAndSkipEvaluationAtEnd_()):t.groupBy&&r.setLimitAndSkipEvaluationAtEnd_(),r}return Ie(t,e),t.prototype.execute=function(e){var t=this;e||(e=function(){return l(null)});var n=this.query;try{var r=new M(this.db).validate(o.Select,n);return r?L(r):e().then((function(e){return t.initTransaction_(),(null==n.join?null!=n.where?U(n.where)?t.processWhereArrayQry():t.processWhere_():t.executeWhereUndefinedLogic():t.executeJoinQuery()).then(t.returnResult_.bind(t))}))}catch(e){return this.onException(e)}},t.prototype.processWhereArrayQry=function(){var e=this;this.isArrayQry=true;var n,r=this.query.where,o=this.primaryKey(),u=true,a=[],c=function(){var t;return n===i.And?true===u?a=e.results:a.length>0&&(t=[],e.results.forEach((function(e){var n;n=e[o],a.findIndex((function(e){return e[o]===n}))>=0&&t.push(e);})),a=t,t=null):(a.length>0&&e.mergeWithResults(a),a=e.results),u=false,r.length>0?(e.results=[],f()):(e.results=a,l())},s=function(n){return new t({from:e.query.from,where:n},e.util).execute().then((function(t){return e.results=t,c()}))},f=function(){var t=r.shift(),o=t[i.Or];if(o){if(U(o))return n=i.Or,s(o);1===z(t)?(n=i.Or,t=o):n=i.And;}else if(n=i.And,U(t))return s(t);return e.query.where=t,e.processWhere_().then(c)};return f()},t.prototype.initTransaction_=function(){var e=this.query.store;e?this.objectStore=new qe(e):(this.isTxQuery||this.util.createTransactionIfNotExist([this.tableName],a.ReadOnly),this.objectStore=this.util.objectStore(this.tableName));},t.prototype.processWhere_=function(){var e=this;return this.shouldAddValue=function(t){var n=t.value,r=e,o=new Proxy(n,{get:function(e,t,o){var u=n[t];if(!u){var i=r.getColumnInfo(t);if(i&&i.keyPath)return i.keyPath.map((function(e){return n[e]}))}return u}});return e.whereChecker.check(o)},this.query.where.or&&this.processOrLogic_(),this.goToWhereLogic().then((function(){return e.onWhereEvaluated()}))},t.prototype.onWhereEvaluated=function(){if(this.isOr)return this.orQuerySuccess_()},t.prototype.orQuerySuccess_=function(){var e=this,n=this.query,r=this.orInfo;return this.results.length>0&&this.mergeWithResults(r.results),new t({where:r.orQuery,from:n.from,case:n.case,store:n.store,meta:n.meta},this.util).execute().then((function(t){e.mergeWithResults(t),e.isOr=false,e.orInfo=null;}))},t.prototype.processOrLogic_=function(){this.isOr=true;var e=this.query.where;this.orInfo={orQuery:e.or,results:[]},this.setLimitAndSkipEvaluationAtEnd_(),delete e.or;},t}(Ee);function Le(e){var t=1===z(e);if(t){var n=ge(e);t=1===z(e[n]);}return t}Qe.prototype.executeInLogic=function(e,t){var n=this,r=this.skipRecord,o=function(e){0===r?n.pushResult(e):--r;},u=X.call(this,te,ee,Ce,Oe);return Q(t.map((function(t){return f((function(r,i){var a=n.objectStore.index(e).openCursor(n.util.keyRange(t));a.onsuccess=u.call(n,r,o),a.onerror=i;}))})))},Qe.prototype.executeWhereUndefinedLogic=function(){var e,t=this,n=this.query,r=n.store;if(r)return this.results=r,this.setLimitAndSkipEvaluationAtEnd_(),l();var o=n.order,u=this.objectStore;if(o&&false!==o.idbSorting&&o.by){if(!u.indexNames.contains(o.by))return L(new I(y,{column:o.by,isOrder:true}));var i=o.type&&"desc"===o.type.toLowerCase()?"prev":"next";this.sorted=true,e=u.index(o.by).openCursor(null,i);}else e=u.openCursor();var a=X.call(this,oe,ue,re,ne);return f((function(n,r){e.onerror=r,e.onsuccess=a.call(t,n);}))},Qe.prototype.executeWhereLogic=function(e,t,n,r){var o=this;t=n?t[n]:t;var u=this.objectStore.index(e).openCursor(this.util.keyRange(t,n),r),i=X.call(this,te,ee,Z,Y);return f((function(e,t){u.onerror=t,u.onsuccess=i.call(o,e);}))},Qe.prototype.executeRegexLogic=function(e,t){var n=this,r=this.skipRecord,o=function(e){0===r?n.pushResult(e):--r;};this.shouldAddValue=function(e){return t.test(e.key)&&n.whereChecker.check(e.value)};var u=this.objectStore.index(e).openCursor(),i=X.call(this,te,ee,Ce,Oe);return f((function(e,t){u.onerror=t,u.onsuccess=i.call(n,e,o);}))},Qe.prototype.setLimitAndSkipEvaluationAtEnd_=function(){this.query.limit&&(this.limitAtEnd=true),this.query.skip&&(this.skipAtEnd=true);},Qe.prototype.setPushResult=function(){var e=this,t=this.query.case;this.pushResult=t?function(n){var r;for(r in e.thenEvaluator.setCaseAndValue(t,n),t)n[r]=e.thenEvaluator.setColumn(r).evaluate();e.results.push(n);}:function(t){e.results.push(t);};},Qe.prototype.mergeWithResults=function(e){var t=this.results,n=this.primaryKey(),r=new Map;t.forEach((function(e){r.set(e[n],1);})),e.forEach((function(e){r.has(e[n])||t.push(e);}));},Qe.prototype.executeJoinQuery=function(){return new Ae(this).execute()},Qe.prototype.processGroupDistinctAggr=function(){var e=this.query;if(e.distinct){var t=[],n=this.results[0];for(var r in n)t.push(r);var o=this.primaryKey(),u=t.indexOf(o);t.splice(u,1),e.groupBy=t.length>0?t:null;}e.groupBy?e.aggregate?this.executeAggregateGroupBy():this.processGroupBy():e.aggregate&&this.processAggregateQry();},Qe.prototype.processOrderBy=function(){var e=this.query.order;if(e&&this.results.length>0&&!this.sorted){var t=W(e);if(t===r.Object)me.call(this,e);else if(t===r.Array){me.call(this,e[0]);for(var n=function(t,n){var r=e[t-1].by,u=e[t],i=u.by,a=ae.call(o,i);if(null!=a){i=a.name,u.type=be(u.type);var c=ve(a,u);o.results.sort((function(e,t){return e[r]===t[r]?c(e[i],t[i]):0}));}},o=this,u=1,i=e.length;u<i;u++)n(u);}}},Qe.prototype.processAggregateQry=function(){var e,t=this.results,n=t.length,o={},u=function(){var n=0;for(var r in t)n+=t[r][e]?1:0;return n},i=function(){var n=0;for(var r in t)n=n>t[r][e]?n:t[r][e];return n},a=function(){var n=1/0,r=1/0;for(var o in t)n=n<(r=t[o][e]?t[o][e]:1/0)?n:r;return n},c=function(){var n=0;for(var r in t)n+=t[r][e];return n},s=function(){return c()/n},l=this.query.aggregate;for(var f in l){var h=l[f],p=W(h),y=undefined;switch(f){case "count":y=u;break;case "max":y=i;break;case "min":y=a;break;case "sum":y=c;break;case "avg":y=s;}switch(p){case r.String:e=h,o["".concat(f,"(").concat(e,")")]=y();break;case r.Array:for(var d in h)e=h[d],o["".concat(f,"(").concat(e,")")]=y();}}for(var f in o)t[0][f]=o[f];this.results=[t[0]];},Qe.prototype.executeAggregateGroupBy=function(){var e,t,n,o,u=this.query.groupBy,a=this.results,c=new Map,s=this.query.aggregate,l=function(){var u=function(){return n=(n=c.get(t))?n["count("+o+")"]:0,n+=a[e][o]?1:0},l=function(){return (n=(n=c.get(t))?n["list("+o+")"]:[]).push(a[e][o]),n},f=function(){return n=(n=c.get(t))?n["max("+o+")"]:0,a[e][o]=a[e][o]?a[e][o]:0,n>a[e][o]?n:a[e][o]},h=function(){return n=(n=c.get(t))?n["min("+o+")"]:1/0,a[e][o]=a[e][o]?a[e][o]:1/0,n<a[e][o]?n:a[e][o]},p=function(){return n=(n=c.get(t))?n["sum("+o+")"]:0,n+=a[e][o]?a[e][o]:0},y=function(){var r=(n=c.get(t))?n["sum("+o+")"]:0;r+=a[e][o]?a[e][o]:0,a[e]["sum("+o+")"]=r,n=n?n["count("+o+")"]:0,n+=a[e][o]?1:0,a[e]["count("+o+")"]=n;};for(var d in s){var v=s[d],m=W(v),b=undefined;switch(d){case i.Count:b=u;break;case i.Max:b=f;break;case i.Min:b=h;break;case i.Sum:b=p;break;case i.Avg:b=y;break;case i.List:b=l;}switch(m){case r.String:o=v,a[e]["".concat(d,"(").concat(o,")")]=b();break;case r.Array:for(var g in v)o=v[g],a[e]["".concat(d,"(").concat(o,")")]=b();}}};if(W(u)===r.String)for(e in a)t=a[e][u],l(),c.set(t,a[e]);else for(e in a){for(var f in t="",u)t+=a[e][u[f]];l(),c.set(t,a[e]);}a=Array.from(c.values());var h=s.avg;if(h)if(W(h)===r.String)for(e in a){var p=a[e]["sum("+h+")"],y=a[e]["count("+h+")"];a[e]["avg("+h+")"]=p/y,s.count!==h&&delete a[e]["count("+h+")"],s.sum!==h&&delete a[e]["sum("+h+")"];}else {var d=W(s.count)===r.String,v=W(s.sum)===r.String;for(e in a)for(var f in h){var m=h[f],b=a[e]["sum("+m+")"],g=a[e]["count("+m+")"];a[e]["avg("+m+")"]=b/g,d&&(s.count!==m||-1===s.count.indexOf(m))&&delete a[e]["count("+m+")"],v&&(s.sum!==m||-1===s.sum.indexOf(m))&&delete a[e]["sum("+m+")"];}}this.results=a;},Qe.prototype.processGroupBy=function(){var e=this.query.groupBy,t=this.results,n=new Map,o=W(e);if(o!==r.Object)if(o===r.String)for(var u in t)n.set(t[u][e],t[u]);else {var i=undefined;for(var u in t){for(var a in i="",e)i+=t[u][e[a]];n.set(i,t[u]);}}else if(1===Object.keys(e).length){var c=ge(e);for(var u in this.thenEvaluator.setCaseAndColumn(e,c),t)n.set(this.thenEvaluator.setValue(t[u]).evaluate(),t[u]);}else for(var u in i=undefined,t){for(var a in i="",this.thenEvaluator.setCaseAndValue(e,t[u]),e)i+=this.thenEvaluator.setColumn(a).evaluate();n.set(i,t[u]);}this.results=Array.from(n.values());};var Ne=function(e){var t=this;return function(n){var r=n.target.result;r?(t.shouldAddValue(r)&&++t.resultCount,r.continue()):e();}},De=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),We=function(e){function t(t,n){var r=e.call(this)||this;return r.resultCount=0,r.query=t,r.util=n,r.tableName=t.from,r}return De(t,e),t.prototype.execute=function(e){var t=this,n=new M(this.db),r=this.query,u=n.validate(o.Count,r);return u?L(u):e().then((function(e){var n;try{var o=function(){var e=new Qe(r,t.util);return e.isTxQuery=t.isTxQuery,e.execute().then((function(e){t.resultCount=e.length;}))};t.initTransaction_(),null==r.join?null!=r.where?r.where.or||U(r.where)?n=o():(t.shouldAddValue=function(e){return t.whereChecker.check(e.value)},n=t.goToWhereLogic()):n=t.executeWhereUndefinedLogic():n=o();}catch(e){t.onException(e);}return n.then((function(e){return t.resultCount}))}))},t.prototype.initTransaction_=function(){var e=this.query.from;this.isTxQuery||this.util.createTransaction([e],a.ReadOnly),this.objectStore=this.util.objectStore(e);},t}(Ee);We.prototype.executeWhereUndefinedLogic=function(){var e,t,n=this,r=this.objectStore,o=r.count?(e=r.count(),function(t){return function(){n.resultCount=e.result,t();}}):(e=r.openCursor(),function(e){return function(r){(t=r.target.result)?(++n.resultCount,t.continue()):e();}});return f((function(t,n){e.onerror=n,e.onsuccess=o(t);}))},We.prototype.executeWhereLogic=function(e,t,n){var r,o=this;t=n?t[n]:t;var u=Le(this.query.where),i=this.objectStore;return f((function(a,c){u&&i.count?(r=i.index(e).count(o.util.keyRange(t,n))).onsuccess=function(){o.resultCount=r.result,a();}:(r=i.index(e).openCursor(o.util.keyRange(t,n))).onsuccess=Ne.call(o,a),r.onerror=c;}))},We.prototype.executeRegexLogic=function(e,t){var n=this,r=this.objectStore.index(e).openCursor();return this.shouldAddValue=function(e){return t.test(e.key)&&n.whereChecker.check(e.value)},f((function(e,t){r.onerror=t,r.onsuccess=Ne.call(n,e);}))},We.prototype.executeInLogic=function(e,t){var n=this,r=this.objectStore,o=r.index(e),u=Le(this.query.where);return Q(t.map((function(e){return t=e,i=n.util.keyRange(t),u&&r.count?f((function(e,t){var r=o.count(i);r.onsuccess=function(t){n.resultCount+=t.target.result,e();},r.onerror=t;})):f((function(e,t){var r=o.openCursor(i);r.onsuccess=Ne.call(n,e),r.onerror=t;}));var t,i;})))};var Ve=function(e){return (U(e)?e:e.split(".")).reduce((function(e,t){return e&&e[t]}),self)},Be=function(e,t){var n=e.set,o=e.mapSet;if(o){var u=o(n,t);null!=u&&(n=u);}for(var i in n){var a=n[i];if(W(a)!==r.Object)t[i]=a;else for(var c in a){var s=a[c];switch(c){case "+":t[i]+=s;break;case "-":t[i]-=s;break;case "*":t[i]*=s;break;case "/":t[i]/=s;break;case "{push}":t[i].push(s);break;default:t[i]=a;}break}}return t},Pe=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),Me=function(e){function t(t,n){var o=e.call(this)||this;t.returnImmediate=null!=t.returnImmediate&&t.returnImmediate,o.query=t,o.util=n,o.tableName=t.in;var u=t.mapSet;if(u){var i=W(u)===r.String?Ve(u):u;if(!i)throw new I(S,u);t.mapSet=i;}return o}return Pe(t,e),t.prototype.execute=function(e){var t=this,n=this.query;try{var r=new M(this.db).validate(o.Update,n);return r?L(r):e().then((function(e){var r=t.initTransaction(),o=[null!=n.where?n.where.or||U(n.where)?t.executeComplexLogic_():t.goToWhereLogic():t.executeWhereUndefinedLogic()];return !1===n.returnImmediate&&r&&o.push(r),Q(o).then((function(){return t.rowAffected}))}))}catch(e){return this.onException(e)}},t.prototype.executeComplexLogic_=function(){var e=this,t=this.query,n=new Qe({from:t.in,where:t.where,ignoreCase:t.ignoreCase},this.util);return n.isTxQuery=this.isTxQuery,n.execute().then((function(n){var r,o,u=e.primaryKey(t.in),a=[];n.forEach((function(e){a.push(e[u]);})),n=null;var c=((r={})[u]=((o={})[i.In]=a,o),r);return e.query.where=c,e.goToWhereLogic()}))},t.prototype.initTransaction=function(){var e,t=this.query.in;return this.isTxQuery||(e=this.util.createTransaction([t])),this.objectStore=this.util.objectStore(t),e},t}(Ee);Me.prototype.executeWhereUndefinedLogic=function(){var e=this,t=this.objectStore.openCursor();return f((function(n,r){t.onsuccess=function(t){var o=t.target.result;if(o)try{var u=o.update(Be(e.query,o.value));u.onsuccess=function(){++e.rowAffected,o.continue();},u.onerror=r;}catch(e){r(e);}else n();},t.onerror=r;}))},Me.prototype.executeWhereLogic=function(e,t,n){var r=this,o=this.query;t=n?t[n]:t;var u=this.objectStore.index(e).openCursor(this.util.keyRange(t,n));return f((function(e,t){u.onsuccess=function(n){var u=n.target.result;if(u)if(r.whereChecker.check(u.value))try{var i=u.update(Be(o,u.value));i.onsuccess=function(){++r.rowAffected,u.continue();},i.onerror=t;}catch(e){t(e);}else u.continue();else e();},u.onerror=t;}))},Me.prototype.executeRegexLogic=function(e,t){var n,r=this,o=this.objectStore.index(e).openCursor();return this.shouldAddValue=function(e){return t.test(e.key)&&r.whereChecker.check(e.value)},f((function(e,t){o.onsuccess=function(o){if(n=o.target.result)if(r.shouldAddValue(n))try{var u=n.update(Be(r.query,n.value));u.onsuccess=function(){++r.rowAffected,n.continue();},u.onerror=t;}catch(e){t(e);}else n.continue();else e();},o.onerror=t;}))},Me.prototype.executeInLogic=function(e,t){var n=this,r=this.objectStore.index(e),o=this.query;return Q(t.map((function(e){return t=e,f((function(e,u){var i=r.openCursor(n.util.keyRange(t));i.onsuccess=function(t){var r=t.target.result;if(r){var i=r.value;if(n.whereChecker.check(i))try{var a=r.update(Be(o,i));a.onsuccess=function(){++n.rowAffected,r.continue();},a.onerror=u;}catch(e){u(e);}else r.continue();}else e();},i.onerror=u;}));var t;})))};var Ge=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),Ke=function(){return Ke=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},Ke.apply(this,arguments)},Je=function(e){function t(t,n){var r=e.call(this)||this;return r.query=t,r.util=n,r}return Ge(t,e),t.prototype.execute=function(){var e,t,n=this,r=this.query,o=0,u={},i={},a=true,c=r.queries,s=c.length;if(c.every((function(e,t){return !(t+1<s&&e.from!==c[t+1].from&&(a=false,1))})),a){var l=this.primaryKey(c[0].from);e=function(e){return e[l]};}else e=function(e){var t="";for(var n in e)t+=e[n];return t};var f=function(){if(o<s)return (t=new Qe(c[o],n.util)).execute().then((function(t){return u={},t.forEach((function(t){var n=e(t);0===o?i[n]=t:null!=i[n]&&(u[n]=t);})),o>0&&(i=Ke({},u)),++o,f()}));var a,l=[],h=undefined,p=r.skip,y=r.limit,d=false,v=function(){l.push(u[a]);},m=function(){l.length<y?v():d=true;},b=function(e){0===p?e():--p;};if(h=r.skip&&r.limit?function(){b((function(){m();}));}:r.limit?m:r.skip?function(){b((function(){v();}));}:function(){v();},y){for(a in u)if(h(a),d)break}else for(a in u)h(a);return t.results=l,Object.assign(t.query,{order:r.order,join:{}}),t.processOrderBy(),t.processGroupDistinctAggr(),t.results};return f()},t}(D),Fe=function(){function e(){}return e.prototype.execute=function(e){return f((function(t,n){var r=indexedDB.deleteDatabase(e);r.onblocked=function(){var e=new I(w);return n(N(e))},r.onerror=function(e){return n(N(e))},r.onsuccess=function(){t();};}))},e}(),Ue=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),He=function(e){function t(t,n){var r=e.call(this)||this;return r.query=t,r.util=n,r}return Ue(t,e),t.prototype.execute=function(){var e,t=this,n=this.query,r=0,o=new Map,u=true,i=n.length;if(n.every((function(e,t){return !(t+1<i&&e.from!==n[t+1].from&&(u=false,1))})),u){var a=this.primaryKey(n[0].from);e=function(e){return e[a]};}else e=function(e){var t="";for(var n in e)t+=e[n];return t};var c=function(){return r<n.length?new Qe(n[r++],t.util).execute().then((function(t){return t.forEach((function(t){o.set(e(t),t);})),c()})):Array.from(o.values())};return c()},t}(D),ze=function(e){var t=this;return function(n){var r=n.target.result;r?(t.shouldAddValue(r.value)&&(r.delete(),++t.rowAffected),r.continue()):e();}},$e=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),Xe=function(e){function t(t,n){var r=e.call(this)||this;return r.query=t,r.util=n,r.tableName=t.from,r}return $e(t,e),t.prototype.execute=function(e){var t,n=this,r=new M(this.db),u=this.query,i=r.validate(o.Remove,u);return i?L(i):e().then((function(e){try{n.initTransaction_(),t=null!=u.where?U(u.where)?n.processWhereArrayQry():n.processWhere_():n.executeWhereUndefinedLogic();}catch(e){return n.onException(e)}return t.then((function(){return n.rowAffected}))}))},t.prototype.processWhereArrayQry=function(){var e=this,t=new Qe(this.query,this.util);return t.isTxQuery=this.isTxQuery,t.execute().then((function(t){var n,r,o=[],u=e.primaryKey(e.query.from);t.forEach((function(e){o.push(e[u]);})),t=null;var a=((n={})[u]=((r={})[i.In]=o,r),n);return e.query[i.Where]=a,e.processWhere_()}))},t.prototype.processWhere_=function(){var e=this;return this.shouldAddValue=function(t){return e.whereChecker.check(t)},this.query.where.or&&this.processOrLogic(),this.goToWhereLogic().then((function(){return e.onWhereEvaluated()}))},t.prototype.initTransaction_=function(){this.isTxQuery||this.util.createTransaction([this.query.from]),this.objectStore=this.util.objectStore(this.query.from);},t.prototype.onWhereEvaluated=function(){if(this.isOr)return this.orQuerySuccess_()},t.prototype.orQuerySuccess_=function(){var e=this,t=this._orInfo.OrQuery,n=ge(t);if(null!=n){var r={};return r[n]=t[n],delete t[n],this.query.where=r,this.goToWhereLogic().then((function(){return e.onWhereEvaluated()}))}this.isOr=true;},t.prototype.processOrLogic=function(){this.isOr=true;var e=this.query.where;this._orInfo={OrQuery:e.or},delete e.or;},t}(Ee);Xe.prototype.executeInLogic=function(e,t){var n=this,r=this.objectStore.index(e);return Q(t.map((function(e){return t=e,f((function(e,o){var u=r.openCursor(n.util.keyRange(t));u.onsuccess=ze.call(n,e),u.onerror=o;}));var t;})))},Xe.prototype.executeWhereUndefinedLogic=function(){var e,t=this,n=this.objectStore.openCursor();return f((function(r,o){n.onsuccess=function(n){(e=n.target.result)?(e.delete(),++t.rowAffected,e.continue()):r();},n.onerror=o;}))},Xe.prototype.executeWhereLogic=function(e,t,n){var r=this;t=n?t[n]:t;var o=this.objectStore.index(e).openCursor(this.util.keyRange(t,n));return f((function(e,t){o.onsuccess=ze.call(r,e),o.onerror=t;}))},Xe.prototype.executeRegexLogic=function(e,t){var n,r=this,o=this.objectStore.index(e).openCursor();return this.shouldAddValue=function(e){return t.test(e.key)&&r.whereChecker.check(e.value)},f((function(e,t){o.onsuccess=function(t){(n=t.target.result)?(r.shouldAddValue(n)&&(n.delete(),++r.rowAffected),n.continue()):e();},o.onerror=t;}))};var Ye=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),Ze=function(e){function t(t,n){var r=e.call(this)||this;return r.query=t,r.util=n,r.tableName=t,r}return Ye(t,e),t.prototype.execute=function(e){var t=this,n=this.query;return this.isTxQuery||this.util.createTransaction([n,j.tableName]),e().then((function(e){var r=t.util.objectStore(n).clear();try{return f((function(e,o){r.onsuccess=function(r){var u=t.table(n);for(var i in u.autoIncColumnValue)u.autoIncColumnValue[i]=0;j.set(j.dbSchema,t.util.db,t.util).then(e).catch(o);},r.onerror=o;}))}catch(e){return t.onException(e)}}))},t}(D),et=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}}(),tt=function(e){function t(t,n){var r=e.call(this)||this;return r.results={},r.reqQueue=[],r.isQueryExecuting=false,r.isTxStarted_=false,r.query=t,r.util=n,r}return et(t,e),t.prototype.execute=function(e){var t=this;this.beforeExecute=e;var n=this.validate();return n?L(n):(this.startExecution_(),f((function(e,n){t.onSuccess=e,t.onError=n;})).then((function(e){return t.beforeExecute=null,t.log("transaction finished"),e})))},t.prototype.validate=function(){var e=this.query,t=this.notExistingTable_(e.tables);if(t)return new I(b,{tableName:t});var n=e.method;return Ve(n)?undefined:new I(S,n)},t.prototype.startExecution_=function(){var e=this,t=this.query,n=function(t){return function(n){return e.pushReq_({name:t,query:n})}},r=t.method,u=Ve(r);return this.log("transaction query started"),u.call(this,{data:t.data,insert:n(o.Insert),select:n(o.Select),update:n(o.Update),remove:n(o.Remove),count:n(o.Count),setResult:function(t,n){e.results[t]=n;},getResult:function(t){return e.results[t]},abort:function(t){e.abortTx_(t);},start:function(){e.startTx_();}})},t.prototype.log=function(e){this.util.logger.log(e);},t.prototype.startTx_=function(){var e=this;try{this.isTxStarted_=!0;var t=this.query.tables;return t=t.concat(j.tableName),this.util.createTransaction(t).then((function(t){e.onSuccess(e.results);})).catch((function(t){e.onError(t);})),this.processExecutionOfQry_()}catch(e){this.onError(this.onException(e));}},t.prototype.onReqFinished_=function(e){var t=this.reqQueue.shift();this.log("finished request : ".concat(t.name," ")),t&&(e.error?(this.abortTx_("automatic abort of transaction due to error occured"),this.log("transaction aborted due to error occured"),this.onError(e.error)):(this.isQueryExecuting=false,t.onSuccess&&t.onSuccess(e),this.processExecutionOfQry_()));},t.prototype.abortTx_=function(e){this.reqQueue=[],this.util.abortTransaction(),this.log("transaction aborted. Msg : ".concat(e));},t.prototype.executeRequest_=function(e){var t,n=this;this.isQueryExecuting=true,this.log("executing request : ".concat(e.name," "));var r=this.onReqFinished_.bind(this),u=e.query,i=function(e){u.returnImmediate=true,t=new e(u,n.util);};switch(e.name){case o.Select:i(Qe);break;case o.Insert:i(K);break;case o.Update:i(Me);break;case o.Remove:i(Xe);break;case o.Count:i(We);}t.isTxQuery=true,t.execute(this.beforeExecute).then(r).catch((function(e){r({error:e});}));},t.prototype.pushReq_=function(e){var t=f((function(t,n){e.onSuccess=function(e){t(e);},e.onError=function(e){n(e);};}));return this.reqQueue.push(e),true===this.isTxStarted_&&this.processExecutionOfQry_(),this.log("request pushed : ".concat(e.name)),t},t.prototype.processExecutionOfQry_=function(){ false===this.isQueryExecuting&&this.reqQueue.length>0&&this.executeRequest_(this.reqQueue[0]);},t.prototype.notExistingTable_=function(e){var t=this,n=null;return e.every((function(e){return null!=t.table(e)||(n=e,false)})),n},t}(D),nt=function(e){if(null==e)throw new Error("userDbSchema db is null");var t={name:e.name,version:e.version,tables:[]};return e.tables.forEach((function(e){var n={name:e.name,columns:{}};e.columns.forEach((function(e){n.columns[e.name]=e;})),t.tables.push(n);})),t},rt=function(){function e(e){this.middlewares=[],this.util=new R,this.onQryFinished=J?function(e){self.postMessage(e);}:e;}return Object.defineProperty(e.prototype,"db",{get:function(){return this.util.db},enumerable:false,configurable:true}),Object.defineProperty(e.prototype,"logger",{get:function(){return this.util.logger},enumerable:false,configurable:true}),e.prototype.executeMiddleware_=function(e){var t=this,n=z(this.middlewares)-1;if(n<0)return l();var r={},o=this.db;return Object.defineProperty(r,"database",{get:function(){return nt(o)}}),f((function(o){var u=0,i=function(){if(u<=n){var a=Ve(t.middlewares[u++])(e,r);a&&a.then||(a=Promise.resolve(a)),a.then((function(e){i();}));}else o();};i();}))},e.prototype.executeQuery=function(e,t){var n,r=e.query,u=this,i=u.util,a=function(e,t){n=new e(r,i).execute(t);};switch(e.name){case o.OpenDb:t(),n=u.openDb(r);break;case o.InitDb:t(),n=u.initDb(r);break;case o.CloseDb:t(),n=u.closeDb();break;case o.Insert:a(K,t);break;case o.Select:a(Qe,t);break;case o.Count:a(We,t);break;case o.Update:a(Me,t);break;case o.Intersect:t(),a(Je);break;case o.DropDb:t(),n=u.dropDb();break;case o.Terminate:t(),n=u.terminate();break;case o.Union:t(),a(He);break;case o.Remove:a(Xe,t);break;case o.Clear:a(Ze,t);break;case o.Transaction:a(tt,t);break;case o.MapGet:t(),n=j.get(r,i);break;case o.MapSet:t(),n=j.set(r.key,r.value,i);break;case o.MapHas:t(),n=j.has(r,i);break;case o.MapDelete:t(),n=j.remove(r,i);break;case o.ImportScripts:t(),n=u.importScripts_(e);break;case o.ChangeLogStatus:t(),u.logger.status=r,n=Promise.resolve();break;case o.Middleware:return t(),Ve(r)?(u.middlewares.push(r),l()):L(new I(E,r));default:n=l();}return u.logger.log("Executing query ".concat(e.name," in web worker")),n},e.prototype.callMiddleware_=function(e,t){return f((function(n){var r=0,o=z(e)-1,u=function(){if(r<=o){var i=e[r++](t);i instanceof Promise||(i=l(i)),i.then((function(e){t=e,u();}));}else n(t);};u();}))},e.prototype.run=function(e){var t=this,n=[],r=[];e.onResult=function(e){n.push((function(t){return e(t)}));},e.beforeExecute=function(e){r.push((function(t){return e(t)}));},this.executeMiddleware_(e).then((function(o){return t.executeQuery(e,(function(){return t.callMiddleware_(r)})).then((function(e){return t.callMiddleware_(n,e).then((function(e){t.returnResult_({result:e});}))}))})).catch((function(e){n=[];var r={error:N(e)};t.returnResult_(r);}));},e.prototype.importScripts_=function(e){return f((function(t,n){try{importScripts.apply(void 0,e.query),t();}catch(e){n(new I(T,e.message));}}))},e.prototype.returnResult_=function(e){this.logger.log("Query finished inside web worker"),this.util&&this.util.emptyTx(),this.onQryFinished(e);},e.prototype.dropDb=function(){var e=this.db.name;return this.terminate().then((function(){return (new Fe).execute(e)}))},e.prototype.closeDb=function(){return this.util.close()},e.prototype.terminate=function(){var e=this;return this.closeDb().then((function(){e.util.db=null;}))},e.prototype.openDb=function(e){var t=this;return this.closeDb().then((function(n){return (t.db&&e.name===t.db.name?t.initDb():t.initDb({name:e.name,tables:[],version:e.version})).then((function(){return t.db}))}))},e.prototype.initDb=function(e){var t=this;if(!F)return L(new I(_));var n=e?new A(e):this.db;if(null==n)throw new Error("dbMeta is null");return this.util=new R,this.util.initDb(n).then((function(e){return j.get(j.dbSchema,t.util).then((function(r){return e.isCreated?(r&&r.tables.forEach((function(e){var t=n.tables.find((function(t){return t.name===e.name}));if(t)for(var r in e.autoIncColumnValue){var o=e.autoIncColumnValue[r];o&&(t.autoIncColumnValue[r]=o);}})),t.util.db=n,e.database=nt(t.db),j.set(j.dbSchema,n,t.util).then((function(){return e}))):j.get(j.dbSchema,t.util).then((function(n){return t.util.db=n,e.database=nt(t.db),e}))}))}))},e}();if(J){var ot=new rt;self.onmessage=function(e){ot.run(e.data);};}jsstore_worker_commonjs2_min.exports=t;})();
	
	return jsstore_worker_commonjs2_min.exports;
}

var worker_injector = { setup(r, e) {
  r.$worker = requireJsstore_worker_commonjs2_min() , r.initQueryManager_();
} };

const workerInjector = /*@__PURE__*/getDefaultExportFromCjs(worker_injector);

class JsStoreDB {
  pk = "id"
  dbName = "llfetcher"
  //   table = null
  //   columns = null
  connection = null
  connected = false
  constructor() {}
  async connect() {
    this.connection = new npm_exportExports.Connection();
    this.connection.addPlugin(workerInjector);
  }
  calculateOffset(pageNumber, limit) {
    const offset = (pageNumber - 1) * limit;
    return offset
  }

  calculateTotalPages(recordCount, limit) {
    return Math.ceil(recordCount / limit)
  }

  async getCount() {
    const results = await this.connection.count({
      from: this.table,
      // where: {
      //     column1: some_value,
      //     column2: some_another_value
      // }
    });
    return results
  }
  async getList(limit = 5, page = 1, orderBy = "id", orderDir = "asc") {
    const total_records = await this.getCount();

    const total_pages = this.calculateTotalPages(total_records, limit);
    const offset = this.calculateOffset(page, limit);

    // const skip = (page - 1) * limit
    const records = await this.connection.select({
      from: this.table,
      limit,
      skip: offset,
      order: {
        by: orderBy,
        type: orderDir,
      },
    });
    return {
      limit,
      page,
      orderBy,
      orderDir,
      total_pages,
      total_records,
      records,
    }
  }
  async get(pk) {
    let where = {};
    where[this.pk] = pk;
    const results = await this.connection.select({
      from: this.table,
      where,
    });
    return results.length > 0 ? results[0] : null
  }
  async delete(pk) {
    const rowsDeleted = await this.connection.remove({
      from: this.table,
      where: {
        [this.pk]: pk,
      },
    });
    return rowsDeleted
  }
  async insert(row) {
    const insertedRow = await this.connection.insert({
      into: this.table,
      values: [row],
    });
    return insertedRow
  }
  async update(pk, row) {
    let updatedRow = 0;
    let existingRow = await this.get(pk);
    if (existingRow) {
      const uKeys = Object.keys(row);
      for (const key of uKeys) {
        existingRow[key] = row[key];
      }
      updatedRow = await this.connection.insert({
        into: this.table,
        upsert: true,
        values: [existingRow],
      });
    }
    return updatedRow
  }
  async getByKey(key, value) {
    const results = await this.connection.select({
      from: this.table,
      where: {
        [key]: value,
      },
    });
    return results.length > 0 ? results[0] : null
  }
  async insertOrUpdate(row, key = "slug") {
    const existingRow = await this.getByKey(key, row[key]);
    let inupcount = 0;
    if (!existingRow) {
      inupcount = await this.insert(row);
      //   console.log(insertedRow)
    } else {
      inupcount = await this.update(existingRow[this.pk], row);
      //   console.log(existingRow)
    }
    return inupcount
  }
}

class Menu extends JsStoreDB {
  table = "menu"

  columns = {
    id: { primaryKey: true, autoIncrement: true },
    title: { notNull: true, dataType: "string" },
    slug: { notNull: true, dataType: "string", unique: true },
    path: { notNull: true, dataType: "string" },
    iconCls: { notNull: false, dataType: "string" },
    order: { notNull: false, dataType: "number", default: 0 },
    hasChild: { notNull: false, dataType: "boolean", default: false },

    level: { notNull: false, dataType: "number", default: 0 },
    parent: { notNull: false, dataType: "number", default: -1 },
    hidden: { notNull: false, dataType: "boolean", default: false },
    dev: { notNull: false, dataType: "boolean", default: false },

    useModel: { notNull: false, dataType: "boolean", default: false },
    model: { notNull: false, dataType: "string", default: "" },
    modelListMethod: { notNull: false, dataType: "string", default: "" },
    slugField: { notNull: false, dataType: "string", default: "" },
    displayField: { notNull: false, dataType: "string", default: "" },
    childRoutePath: { notNull: false, dataType: "string", default: "" },
    childIconCls: { notNull: false, dataType: "string", default: "" },
  }
  constructor() {
    super();
    this.connect();
    this.initTable();
  }
  static instance = null
  static getInstance() {
    if (Menu.instance instanceof Menu) {
      return Menu.instance
    } else {
      Menu.instance = new Menu();
      return Menu.instance
    }
  }
  static arrayToTreeData(array) {
    const treeData = [];
    const height = 50;
    for (const item of array) {
      const treeItem = {
        data: item,
        height,
      };
      treeData.push(treeItem);
    }
    return treeData
  }
  async getList(parent = -1, limit = 5, page = 1, orderBy = "order", orderDir = "asc") {
    const total_records = await this.getCount(parent);

    const total_pages = this.calculateTotalPages(total_records, limit);
    const offset = this.calculateOffset(page, limit);

    // const skip = (page - 1) * limit
    const records = await this.connection.select({
      from: this.table,
      limit,
      skip: offset,
      where: {
        parent,
      },
      order: {
        by: orderBy,
        type: orderDir,
      },
    });
    return {
      limit,
      page,
      orderBy,
      orderDir,
      total_pages,
      total_records,
      records,
    }
  }
  async insertOrUpdate(row, key = "slug") {
    let record = null;
    const existingRow = await this.getByKey(key, row[key]);
    if (!existingRow) {
      await this.insert(row);
      // console.log(`i:${inupcount}`)
      record = await this.getByKey(key, row[key]);
    } else {
      record = existingRow;
      await this.update(existingRow[this.pk], row);
      // console.log(`u:${inupcount}`)
    }
    return record
  }
  async getMaxOrder(parent = -1) {
    const results = await this.connection.select({
      from: this.table,
      where: {
        ["parent"]: parent,
      },
      aggregate: {
        max: "order",
      },
    });
    if (results.length > 0) {
      return results[0]["max(order)"]
    }
    return 0
  }
  async initTable() {
    const db = {
      name: this.dbName,
      tables: [
        {
          name: this.table,
          columns: this.columns,
        },
      ],
    };
    const isDbCreated = await this.connection.initDb(db);
    if (isDbCreated) {
      this.connected = true;
      console.log("Db Created & connection is opened");
    } else {
      console.log("Connection is opened");
    }
  }
  async fixOrder(parent = -1) {
    const records = await this.connection.select({
      from: this.table,
      order: {
        by: "order",
        type: "asc",
      },
      where: {
        parent,
      },
    });
    const pkOrders = [];
    const orders = [];
    let newOrder = 0;
    for (const row of records) {
      pkOrders.push(row[this.pk]);
      orders.push(row.order);

      if (row.order !== newOrder) {
        row.order = newOrder;
        await this.update(row[this.pk], row);
      }
      newOrder += 1;
    }
    console.log(orders, pkOrders);
  }
  async getPrevRecord(parent, currentOrder) {
    const records = await this.connection.select({
      from: this.table,
      order: {
        by: "order",
        type: "asc",
      },
      where: {
        parent,
        order: currentOrder - 1,
      },
    });
    return records.length > 0 ? records[0] : null
  }
  async getNextRecord(parent, currentOrder) {
    const records = await this.connection.select({
      from: this.table,
      order: {
        by: "order",
        type: "asc",
      },
      where: {
        parent,
        order: currentOrder + 1,
      },
    });
    return records.length > 0 ? records[0] : null
  }
  async moveUp(pk) {
    let ok = false;
    let currentRow = await this.get(pk);

    await this.fixOrder(currentRow.parent);
    currentRow = await this.get(pk);
    const currentOrder = currentRow.order;
    const prevRecord = await this.getPrevRecord(currentRow.parent, currentOrder);

    if (prevRecord) {
      currentRow.order = prevRecord.order;
      prevRecord.order = currentOrder;
      await this.update(prevRecord[this.pk], prevRecord);
      await this.update(currentRow[this.pk], currentRow);
      ok = true;
    } else {
      console.log("nothing to move up");
    }

    console.log(currentOrder, prevRecord);
    return ok
  }
  async moveDown(pk) {
    let ok = false;
    let currentRow = await this.get(pk);

    await this.fixOrder(currentRow.parent);
    currentRow = await this.get(pk);
    const currentOrder = currentRow.order;
    const nextRecord = await this.getNextRecord(currentRow.parent, currentOrder);

    if (nextRecord) {
      currentRow.order = nextRecord.order;
      nextRecord.order = currentOrder;
      await this.update(nextRecord[this.pk], nextRecord);
      await this.update(currentRow[this.pk], currentRow);
      ok = true;
    } else {
      console.log("nothing to move down");
    }

    console.log(currentOrder, nextRecord);
    return ok
  }
  async getMenuList(maxRow = 100, createTreeData = false, exportMode = false) {
    const lists = await this.getList(-1, maxRow);
    const menus = !createTreeData ? lists.records : Menu.arrayToTreeData(lists.records);
    for (const menu of menus) {
      const subLists = await this.getList(!createTreeData ? menu.id : menu.data.id, maxRow);
      const childMenus = !createTreeData ? subLists.records : Menu.arrayToTreeData(subLists.records);
      menu.children = childMenus;
    }
    return menus
  }
  async import(menus) {
    for (const menu of menus) {
      delete menu.id;
      console.log(menu);
      const record = await this.insertOrUpdate(menu, "slug");
      for (const child of menu.children) {
        delete child.id;
        child.parent = record.id;
        const childRecord = await this.insertOrUpdate(child, "slug");
        console.log(childRecord);
      }
    }
  }
}

const mMenu = Menu.getInstance();

class AppInstaller extends ChromeLsConfig {
  constructor() {
    const config_key = "llfetcher_installer";
    super(config_key);
    //
  }

  async importAppMenu() {
    await mMenu.import(menus);
    this.setData("freshInstall", false);
    try {
      document.location.reload();
    } catch (e) {}
  }
  async onInstall() {
    await this.importAppMenu();
  }
  async isFreshIstall() {
    let freshInstall = await this.getData("freshInstall");
    console.log(freshInstall);

    if (freshInstall !== false) {
      //   await this.setData("freshInstall", true)
      return true
    }
    return freshInstall
  }
}

const idb_get = async(storeName, key, connection) => {
    const get_transaction = connection.transaction(storeName, "readonly");
    const objectStore = get_transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        get_transaction.oncomplete = function () {
        // console.log("ALL GET TRANSACTIONS COMPLETE.")
        };

        get_transaction.onerror = function () {
        // console.log("PROBLEM GETTING RECORDS.")
        };

        let request = objectStore.get(key);

        request.onsuccess = function (event) {
        resolve(event.target.result);
        };
    })
};
  
const idb_insert = async(storeName, records, connection) => {

    const insert_transaction = connection.transaction(storeName, "readwrite");
    const objectStore = insert_transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        insert_transaction.oncomplete = function () {
            // console.log("ALL INSERT TRANSACTIONS COMPLETE.")
            resolve(true);
        };

        insert_transaction.onerror = function () {
            // console.log("PROBLEM INSERTING RECORDS.")
            resolve(false);
        };
        if(Array.isArray(records)){
        records.forEach(item => {
            let request = objectStore.add(item);

            request.onsuccess = function () {
                // console.log("Added: ", item)
            };
        });
        }else {
        const item = records;
        let request = objectStore.add(item);

            request.onsuccess = function () {
                // console.log("Added: ", item)
            };
        }
        
    })
};

const idb_update = async(storeName, record, connection) => {
    const put_transaction = connection.transaction(storeName, "readwrite");
    const objectStore = put_transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        put_transaction.oncomplete = function () {
            // console.log("ALL PUT TRANSACTIONS COMPLETE.")
            resolve(true);
        };

        put_transaction.onerror = function () {
            // console.log("PROBLEM UPDATING RECORDS.")
            reject(false);
        };

        objectStore.put(record);
    })
};

const idb_delete = async(storeName, key, clear, connection) => {
    const delete_transaction = connection.transaction(storeName, "readwrite");
    const objectStore = delete_transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        delete_transaction.oncomplete = function () {
            // console.log("ALL DELETE TRANSACTIONS COMPLETE.")
            resolve(true);
        };

        delete_transaction.onerror = function () {
            // console.log("PROBLEM DELETE RECORDS.")
            resolve(false);
        };

        if(!clear){
        objectStore.delete(key);
        }else {
        objectStore.clear();
        }
    })
};

const idb_connect = async(schema = 'main') => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(schema);

        request.onerror = (e)=>{
            reject(e);
        };

        request.onsuccess = (e)=>{
            resolve(e.target.result);
        };
    })
};

/***
 * storeDefs : example [{name:'prxCache',key:'key'}]
 * storeDefs : example {name:'prxCache',key:'key'}
*/
const idb_create_store = async(storeDefs, schema='main') => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(schema);
        request.onupgradeneeded = function (event) {
            const conn = event.target.result;

            if(Array.isArray(storeDefs)){
                storeDefs.map((item,index) => {
                    const {name,keyPath} = item;
                    const objectStore = conn.createObjectStore(name, {keyPath});
                    objectStore.transaction.oncomplete = e =>{
                        console.log(`object store ${name} : created`);
                        if(index === storeDefs.length-1){
                            resolve(conn);
                        }
                    };
                });
            }else {
                const {name,keyPath} = storeDefs;
                const objectStore = conn.createObjectStore(name, {keyPath});
                objectStore.transaction.oncomplete = e =>{
                    console.log(`object store ${name} : created`);
                    resolve(conn);
                };
            }    
        };

        request.onerror = (e)=>{
            reject(e);
        };

        request.onsuccess = (e)=>{
            resolve(e.target.result);
        };
    })
};

const idb_close = connection => connection.close();

export { AppInstaller as A, Menu as M, idb_update as a, idb_insert as b, idb_delete as c, idb_create_store as d, idb_connect as e, idb_close as f, idb_get as i };
