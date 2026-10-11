import { c as crc } from './index-CZ1hE2dh.js';
import { s as sendMessage } from './sendMessage-Clh2_OhT.js';
import { r as reactExports, b as React, d as ReactDOM, j as jQuery$1, a as jsxRuntimeExports } from './jquery-DzHVvqSG.js';
import { c as commonjsGlobal, g as getDefaultExportFromCjs } from './_commonjsHelpers-Dc8z98SR.js';
import { L as LsConfig } from './LsConfig-Bo_nWYsW.js';

const slugify$1 = (str) => {
  const words = str.replace(/\W+/g, " ").split(" ");
  return words.join("-").toLowerCase()
};

const makeDelay = (ms) => {
  let timer = 0;
  return function (callback) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
    return timer
  }
};

/*
	chromeStorageDB v 1.0
	A simple database layer for chrome.storage
	License	:	MIT License
*/


class ChromeStorageDB{
    db_prefix = 'db_';
    db_id ;
    db_name;
    db_new ; // this flag determines whether a new database was created during an object initialisation
    db = null;
    storage;
    stype = 0
    initiator = null
    constructor(db_name, engine) {
        this.db_name = db_name;
        this.db_id = this.db_prefix + db_name;
        this.db_new = false;

        try {
            this.storage = chrome.storage[(engine === 'local' ? 'local': 'sync')];
        } catch(e) { // ie8 hack
            this.storage = localStorage;
            this.stype = 1;
        }

        
        // this.init()
    }
    setInitiator(initiator){
        this.initiator = initiator;
    }
    // Retrieve data from chrome.storage and get the size
    lcfirst(str) {
        if (typeof str !== 'string' || str.length === 0) {
          return str
        }
      
        return str.charAt(0).toLowerCase() + str.slice(1)
    }
    getTableCounts(table) {
        const tbl = this.lcfirst(table);
        const recs = this.db.data[tbl];
        if(recs){
            // console.log(recs)
            return Object.keys(recs).length
        }
        return 0
    }
	getDataSize(table,callback) {
		// Get the serialized data from chrome.storage.local
        
        if(table){
            const tbl = this.lcfirst(table);
            // console.log(tbl)
            // console.log(this.db.data[tbl])
            let dataSize = new TextEncoder().encode(JSON.stringify(this.db.data[tbl])).length;
            callback(dataSize);
            return
        }
        // const {db_id} = this
		chrome.storage.local.get(null, function(result) {
            // Check if the data is present in chrome.storage
            let dataSize = 0;
            for(let key in result) {
                if (result[key]) {
                    // Calculate the size of the serialized data
                    // if(table){
                        dataSize += new TextEncoder().encode(JSON.stringify(result[key])).length;
                    // }
                    
    
                    // Call the callback with the size
                    // callback(dataSize)
                }
            }
            callback(dataSize);
		});
	}
    async init(){
        // console.log(`${this.constructor.name}.init()`)
        let tmpDb = await this.getItem(this.db_id );
        if(this.stype === 1){
            tmpDb = JSON.parse(tmpDb);
            this.db = tmpDb;
        }else {
            if(typeof tmpDb[this.db_id] !== 'undefined'){
                this.db = tmpDb[this.db_id];
            }
        }

        
        if( !( this.db  && this.db.tables && this.db.data ) ) {
            // console.log(`${this.constructor.name}.init() storage is null`)

            if(!this.validateName(this.db_name)) {
                this.error("The name '" + this.db_name + "' contains invalid characters");
            } else {
                this.db = {tables: {}, data: {}};
                await this.commit();
                this.db_new = true;
            }
        }
    }
    async reload(){
        await this.init();
        return this
    }

    // ______________________ private methods

    // _________ database functions
    // drop the database
   async drop() {
        
        await this.setItem(this.db_id, null);
        this.db = null;

    }

    async getItem(key) {
        let data = null;
        if(this.stype === 0){
            data = await this.storage.get([key]);
        }else {
            data = await this.storage.getItem([key]);
        }
        
        return data
    }

    async replace(data) {
        await setItem(this.db_id, data);
    }

    async setItem(key, value) {

        if(this.stype === 0){
            const obj = {};
            obj[key] = value;
            await this.storage.set(obj);
            return true;
        } else {
            await this.storage.setItem(key, JSON.stringify(value));
            return false;
        }
    }

    // number of tables in the database
    tableCount() {
        var count = 0;
		for(var table in this.db.tables) {
			if( this.db.tables.hasOwnProperty(table) ) {
                count++;
            }
        }
        return count;
    }

    // _________ table functions

    // returns all fields in a table.
    tableFields(table_name) {
        return this.db.tables[table_name].fields;
    }

    // check whether a table exists
    tableExists(table_name) {
        if(typeof this.db.tables[table_name] !== 'object'){
            return false;
        }
        return this.db.tables[table_name] ? true : false;
    }

    // check whether a table exists, and if not, throw an error
    tableExistsWarn(table_name) {
		if(!this.tableExists(table_name)) {
            this.error("The table '" + table_name + "' does not exist");
        }
    }

    // check whether a table column exists
    columnExists(table_name, field_name) {
        var exists = false;
        var table_fields = this.db.tables[table_name].fields;
		for(var field in table_fields){
			if(table_fields[field] === field_name)
			{
                exists = true;
                break;
            }
        }
        return exists;
    }

    // create a table
    _createTable(table_name, fields) {
        this.db.tables[table_name] = {fields: fields, auto_increment: 1};
        this.db.data[table_name] = {};
    }

    // drop a table
    _dropTable(table_name) {
        delete this.db.tables[table_name];
        delete this.db.data[table_name];
    }

    // empty a table
    _truncate(table_name) {
        this.db.tables[table_name].auto_increment = 1;
        this.db.data[table_name] = {};
    }

    //alter a table
    _alterTable(table_name, new_fields, default_values){
        this.db.tables[table_name].fields = this.db.tables[table_name].fields.concat(new_fields);

        // insert default values in existing table
        if(typeof default_values !== "undefined") {
            // loop through all the records in the table
            for(var id in this.db.data[table_name]) {
                if( !db.data[table_name].hasOwnProperty(id) ) {
                    continue;
                }
                for(var field in new_fields) {
                    if(typeof default_values === "object") {
                        this.db.data[table_name][id][new_fields[field]] = default_values[new_fields[field]];
                    } else {
                        this.db.data[table_name][id][new_fields[field]] = default_values;
                    }
                }
            }
        }
    }

    // number of rows in a table
    _rowCount(table_name) {
        var count = 0;
        for(var id in this.db.data[table_name]) {
            if( this.db.data[table_name].hasOwnProperty(id) ) {
                count++;
            }
        }
        return count;
    }

    // insert a new row
    _insert(table_name, data) {
        data.id = this.db.tables[table_name].auto_increment;
        this.db.data[table_name][ this.db.tables[table_name].auto_increment ] = data;
        this.db.tables[table_name].auto_increment++;
        return data.id;
    }

    // select rows, given a list of ids of rows in a table
    select(table_name, ids, start, limit, sort, distinct) {
        var id = null, results = [], row = null;

        var i;
        for(i=0; i<ids.length; i++) {
            id = ids[i];
            row = this.db.data[table_name][id];
            results.push( this.clone(row) );
        }

        // there are sorting params
        if(sort && sort instanceof Array) {
            for(i=0; i<sort.length; i++) {
                results.sort(this.sort_results(sort[i][0], sort[i].length > 1 ? sort[i][1] : null));
            }
        }

        // distinct params
        if(distinct && distinct instanceof Array) {
            for(var j=0; j<distinct.length; j++) {
                var seen = {}, d = distinct[j];

                for(i=0; i<results.length; i++) {
                    if(results[i] === undefined) {
                        continue;
                    }

                    if(results[i].hasOwnProperty(d) && seen.hasOwnProperty(results[i][d])) {
                        delete(results[i]);
                    } else {
                        seen[results[i][d]] = 1;
                    }
                }
            }

            // can't use .filter(ie8)
            var new_results = [];
            for(i=0; i<results.length; i++) {
                if(results[i] !== undefined) {
                    new_results.push(results[i]);
                }
            }

            results = new_results;
        }

        // limit and offset
        start = start && typeof start === "number" ? start : null;
        limit = limit && typeof limit === "number" ? limit : null;

        if(start && limit) {
            results = results.slice(start, start+limit);
        } else if(start) {
            results = results.slice(start);
        } else if(limit) {
            results = results.slice(start, limit);
        }

        return results;
    }

    // sort a result set
    sort_results(field, order) {
        return function(x, y) {
            // case insensitive comparison for string values
            var v1 = typeof(x[field]) === "string" ? x[field].toLowerCase() : x[field],
				v2 = typeof(y[field]) === "string" ? y[field].toLowerCase() : y[field];

            if(order === "DESC") {
                return v1 === v2 ? 0 : (v1 < v2 ? 1 : -1);
            } else {
                return v1 === v2 ? 0 : (v1 > v2 ? 1 : -1);
            }
        };
    }

    // select rows in a table by field-value pairs, returns the ids of matches
    queryByValues(table_name, data) {
        var result_ids = [],
			exists = false,
			row = null;

        // loop through all the records in the table, looking for matches
        for(var id in this.db.data[table_name]) {
            if( ! this.db.data[table_name].hasOwnProperty(id) ) {
                continue;
            }

            row = this.db.data[table_name][id];
            exists = true;

            for(var field in data) {
                if( !data.hasOwnProperty(field) ) {
                    continue;
                }

                if(typeof data[field] === 'string') {	// if the field is a string, do a case insensitive comparison
                    if(row[field] === null || row[field].toString().toLowerCase() !== data[field].toString().toLowerCase()) {
                        exists = false;
                        break;
                    }
                } else {
                    if(row[field] !== data[field]) {
                        exists = false;
                        break;
                    }
                }
            }
            if(exists) {
                result_ids.push(id);
            }
        }

        return result_ids;
    }

    // select rows in a table by a function, returns the ids of matches
    queryByFunction(table_name, query_function) {
        var result_ids = [],
			row = null;

        // loop through all the records in the table, looking for matches
        for(var id in this.db.data[table_name]) {
            if( ! this.db.data[table_name].hasOwnProperty(id) ) {
                continue;
            }

            row = this.db.data[table_name][id];

            if( query_function( this.clone(row) ) === true ) {	// it's a match if the supplied conditional function is satisfied
                result_ids.push(id);
            }
        }

        return result_ids;
    }

    // return all the ids in a table
    getIDs(table_name) {
        var result_ids = [];

        for(var id in this.db.data[table_name]) {
            if( this.db.data[table_name].hasOwnProperty(id) ) {
                result_ids.push(id);
            }
        }
        return result_ids;
    }

    // delete rows, given a list of their ids in a table
    _deleteRows(table_name, ids) {
        for(var i=0; i<ids.length; i++) {
            if( this.db.data[table_name].hasOwnProperty(ids[i]) ) {
                delete this.db.data[table_name][ ids[i] ];
            }
        }
        return ids.length;
    }

    // update rows
    _update(table_name, ids, update_function) {
        var id = '', num = 0;

        for(var i=0; i<ids.length; i++) {
            id = ids[i];

            var updated_data = update_function( this.clone(this.db.data[table_name][id]) );

            if(updated_data) {
                delete updated_data['id']; // no updates possible to id

                var new_data = this.db.data[table_name][id];
                // merge updated data with existing data
                for(var field in updated_data) {
                    if( updated_data.hasOwnProperty(field) ) {
                        new_data[field] = updated_data[field];
                    }
                }

                this.db.data[table_name][id] = this.validFields(table_name, new_data);
                num++;
            }
        }
        return num;
    }

    // commit the database to localStorage
    async commit() {
        // console.log(this.initiator,this.db)
        if(this.stype === 0) {
            // console.log(this.db)
            await this.setItem(this.db_id, this.db);
            
        } else {
            await this.setItem(this.db_id, this.serialize());

        }
    }

    // serialize the database
    serialize() {
        return this.db
    }

    // throw an error
    error(msg) {
        console.error(msg);
    }

    // clone an object
    clone(obj) {
        var new_obj = {};
        for(var key in obj) {
            if( obj.hasOwnProperty(key) ) {
                new_obj[key] = obj[key];
            }
        }
        return new_obj;
    }

    // validate db, table, field names (alpha-numeric only)
    validateName(name) {
        return name.toString().match(/[^a-z_0-9]/ig) ? false : true;
    }

    // given a data list, only retain valid fields in a table
    validFields(table_name, data) {
        var field = '', new_data = {};

        for(field in data) {
            var index = this.db.tables[table_name].fields.indexOf(field);
            if (index === -1) {
                this.error("Invalid query parameter: " + field);
            }
            new_data[field] = data[field];
        }
        return new_data;
    }

    // given a data list, populate with valid field names of a table
    validateData(table_name, data) {
        var field = '', new_data = {};
        for(var i=0; i<this.db.tables[table_name].fields.length; i++) {
            field = this.db.tables[table_name].fields[i];
            new_data[field] = (data[field] === null || data[field] === undefined) ? null : data[field];
        }
        return new_data;
    }

   isNew(fn) {

        return setTimeout(()=>{fn(this.db_new);}, 100);
    }

    // create a table
    createTable(table_name, fields) {
        var result = false;
        if(!this.validateName(table_name)) {
            this.error("The database name '" + table_name + "' contains invalid characters.");
        } else if(this.tableExists(table_name)) {
            this.error("The table name '" + table_name + "' already exists.");
        } else {
            // make sure field names are valid
            var is_valid = true;
            var i;
            for(i =0; i<fields.length; i++) {
                if(!this.validateName(fields[i])) {
                    is_valid = false;
                    break;
                }
            }

            if(is_valid) {
                // cannot use indexOf due to <IE9 incompatibility
                // de-duplicate the field list
                var fields_literal = {};
                for(i=0; i<fields.length; i++) {
                    fields_literal[ fields[i] ] = true;
                }
                delete fields_literal['id']; // id is a reserved field name

                fields = ['id'];
                for(var field in fields_literal) {
                    if( fields_literal.hasOwnProperty(field) ) {
                        fields.push(field);
                    }
                }

                this._createTable(table_name, fields);
                result = true;
            } else {
                this.error("One or more field names in the table definition contains invalid characters");
            }
        }

        return result;
    }

    // Create a table using array of Objects @ [{k:v,k:v},{k:v,k:v},etc]
    createTableWithData(table_name, data) {
        if(typeof data !== 'object' || !data.length || data.length < 1) {
            this.error("Data supplied isn't in object form. Example: [{k:v,k:v},{k:v,k:v} ..]");
        }

        var fields = Object.keys(data[0]);

        // create the table
        if( this.createTable(table_name, fields) ) {
            this.commit();

            // populate
            for (var i=0; i<data.length; i++) {
                if( !insert(table_name, data[i]) ) {
                    this.error("Failed to insert record: [" + JSON.stringify(data[i]) + "]");
                }
            }
            this.commit();
        }
        return true;
    }

    // drop a table
    dropTable(table_name) {
        this.tableExistsWarn(table_name);
        this._dropTable(table_name);
    }

    // empty a table
    truncate(table_name) {
        this.tableExistsWarn(table_name);
        this._truncate(table_name);
    }

    // alter a table
    alterTable(table_name, new_fields, default_values) {
        var result = false;
        if(!this.validateName(table_name)) {
            this.error("The database name '" + table_name + "' contains invalid characters");
        } else {
            if(typeof new_fields === "object") {
                // make sure field names are valid
                var is_valid = true;
                var i;
                for (i = 0; i < new_fields.length; i++) {
                    if(!this.validateName(new_fields[i])) {
                        is_valid = false;
                        break;
                    }
                }

                if(is_valid) {
                    // cannot use indexOf due to <IE9 incompatibility
                    // de-duplicate the field list
                    var fields_literal = {};
                    for(i=0; i<new_fields.length; i++) {
                        fields_literal[ new_fields[i] ] = true;
                    }
                    delete fields_literal['id']; // id is a reserved field name

                    new_fields = [];
                    for(var field in fields_literal) {
                        if( fields_literal.hasOwnProperty(field) ) {
                            new_fields.push(field);
                        }
                    }

                    this._alterTable(table_name, new_fields, default_values);
                    result = true;
                } else {
                    this.error("One or more field names in the table definition contains invalid characters");
                }
            } else if(typeof new_fields === "string") {
                if(this.validateName(new_fields)) {
                    var new_fields_array = [];
                    new_fields_array.push(new_fields);
                    this._alterTable(table_name, new_fields_array, default_values);
                    result = true;
                } else {
                    this.error("One or more field names in the table definition contains invalid characters");
                }
            }
        }

        return result;
    }

    // number of rows in a table
    rowCount(table_name) {
        this.tableExistsWarn(table_name);
        return this._rowCount(table_name);
    }

    // insert a row
    insert(table_name, data) {
        this.tableExistsWarn(table_name);
        return this._insert(table_name, this.validateData(table_name, data) );
    }

    // insert or update based on a given condition
    insertOrUpdate(table_name, query, data) {
        this.tableExistsWarn(table_name);

        var result_ids = [];
        if(!query) {
            result_ids = this.getIDs(table_name);                // there is no query. applies to all records
        } else if(typeof query === 'object') {              // the query has key-value pairs provided
            result_ids = this.queryByValues(table_name, this.validFields(table_name, query));
        } else if(typeof query === 'function') {                // the query has a conditional map function provided
            result_ids = this.queryByFunction(table_name, query);
        }

        // no existing records matched, so insert a new row
        if(result_ids.length === 0) {
            return this._insert(table_name, this.validateData(table_name, data) );
        } else {
            var ids = [];
            this._update(table_name, result_ids, function(o) {
                ids.push(o.id);
                return data;
            });

            return ids;
        }
    }

    // update rows
    update(table_name, query, update_function) {
        this.tableExistsWarn(table_name);

        var result_ids = [];
        if(!query) {
            result_ids = this.getIDs(table_name);                // there is no query. applies to all records
        } else if(typeof query === 'object') {              // the query has key-value pairs provided
            result_ids = this.queryByValues(table_name, this.validFields(table_name, query));
        } else if(typeof query === 'function') {                // the query has a conditional map function provided
            result_ids = this.queryByFunction(table_name, query);
        }
        return this._update(table_name, result_ids, update_function);
    }

    // select rows
    query(table_name, query, limit, start, sort, distinct) {
        this.tableExistsWarn(table_name);

        var result_ids = [];
        if(!query) {
            result_ids = this.getIDs(table_name, limit, start); // no conditions given, return all records
        } else if(typeof query === 'object') {          // the query has key-value pairs provided
            result_ids = this.queryByValues(table_name, this.validFields(table_name, query), limit, start);
        } else if(typeof query === 'function') {        // the query has a conditional map function provided
            result_ids = this.queryByFunction(table_name, query, limit, start);
        }

        return this.select(table_name, result_ids, start, limit, sort, distinct);
    }

    // alias for query() that takes a dict of params instead of positional arrguments
    queryAll(table_name, params) {
        if(!params) {
            return this.query(table_name)
        } else {
            return this.query(table_name,
                params.hasOwnProperty('query') ? params.query : null,
                params.hasOwnProperty('limit') ? params.limit : null,
                params.hasOwnProperty('start') ? params.start : null,
                params.hasOwnProperty('sort') ? params.sort : null,
                params.hasOwnProperty('distinct') ? params.distinct : null
            );
        }
    }

    // delete rows
    deleteRows(table_name, query) {
        this.tableExistsWarn(table_name);

        var result_ids = [];
        if(!query) {
            result_ids = this.getIDs(table_name);
        } else if(typeof query === 'object') {
            result_ids = this.queryByValues(table_name, this.validFields(table_name, query));
        } else if(typeof query === 'function') {
            result_ids = this.queryByFunction(table_name, query);
        }
        return this._deleteRows(table_name, result_ids);
    }

}

function convertToMySQLDatetime(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const mysqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return mysqlDatetime;
}

class DB {
	db = null
	database = 'learning'
	type = 'collection'
	useIndexedDb = false


	static instance = null
	static instances = []
	static configSet = null
	static connection = null
	
	constructor(){
		if(!DB.connection){
			DB.connection = new ChromeStorageDB(this.database, 'local');
			DB.connection.setInitiator(this.constructor.name);
		}
		this.db = DB.connection;
	}
	
	async getCount(){

	}

	async initTable(){
		// console.log(`${this.constructor.name}.initTable()`)

		if(!this.table){
			// console.error(`${this.constructor.name}.initTable() empty table`)

			return
		}
		if(!this.db.tableExists(this.table)){
			this.db.createTable(this.table, this.fields);
			await this.db.commit();
		}
	}	
	async initDB(){
		await this.db.init();
		if(this instanceof DB){
			await this.initTable();
		}else {
			console.error(`${this.constructor.name}.initTable() not implemented`);
		}

		
	}

	singleResult(results){
		if(results.length>0){
			return results[0]
		}
		return null
	}
	singleQuery(params){
		if(!this.table){
			console.error(`${this.constructor.name}.singleQuery() table is not specified`);
			return null
		}
		const results = this.db.queryAll(this.table,params);
        return this.singleResult(results)
	}
	query(params){
		if(!this.table){
			console.error(`${this.constructor.name}.query() table is not specified`);
			return []
		}
		return this.db.queryAll(this.table,params)
	}
	getList(){
        const results =  this.db.queryAll(this.table);
        return results
    }
	getAll(){
        const results =  this.db.queryAll(this.table);
        return results
    }
	/**
	 * get singleton instance */
	static async getInstance(){
		if(this.instance instanceof this);else {
			this.instance = this.factory();
			await this.instance.initDB();

			DB.instances.push(this.instance);
		}	

		return this.instance;
	}
	static gotInstance(){
		if(this.instance instanceof this);else {
			this.instance = this.factory();
			DB.instances.push(this.instance);
		}	

		return this.instance;
	}
	/**
	 * singleton factory*/
	static factory(){
		return new this()
	}
	// legacy Store.prepareAppStorage()
	static async prepare(){
        // logServer.log(`Store.prepareAppStorage()`,494);
        // Store.init(()=>{
        //     logServer.log(`After Store.init()`,498);

        //     App.init('',fn);
        // });
    }

	async sync(){
		this.db.reload();
	}
	async deleteRows(query){
		await this.db.deleteRows(this.table,query);
		await this.db.commit();
	}

	async drop(){

		if(this instanceof DB){
			await this.db.drop();

			for(let i in DB.instances){
				const instance = DB.instances[i];
				await instance.initDB();
				if(instance.table === 'app'){
					await instance.init();
				}
			}
		}else {
			console.error(`${this.constructor.name}.drop() only implemented for DB instaces`);
		}
        // Store.db().setFresh(true);

    }
    async dropTable(){

		this.db.dropTable(this.table);
		await this.db.commit();
		for(let i in DB.instances){
			const instance = DB.instances[i];
			await instance.initDB();
			if(instance.table === 'app'){
				await instance.init();
			}
		}
	}

	async truncate(){
		this.db.deleteRows(this.table);
		await this.db.commit();
	}
    static async isFresh(){
        // chrome.storage.local.get('db_learning',(db)=>{
        //     console.log(db);
        //     let isFreshInstall = true;
        //     if(typeof db.db_learning == 'object'){
        //         if(typeof db.db_learning.tables == 'object'){
        //             if(typeof db.db_learning.tables.app == 'object'){
        //                 isFreshInstall = false;
        //             }
        //         }
        //     }
        //     fn(isFreshInstall,db);
        // });
    }
/**/
}

/*
	chromeStorageDB v 1.0
	A simple database layer for chrome.storage
	License	:	MIT License
*/

async function insert_csidb(db, records) {
  if (db) {
    const insert_transaction = db.transaction("csidb", "readwrite");
    const objectStore = insert_transaction.objectStore("csidb");

    return new Promise((resolve, reject) => {
      insert_transaction.oncomplete = function () {
        // console.log("ALL INSERT TRANSACTIONS COMPLETE.")
        resolve(true);
      };

      insert_transaction.onerror = function () {
        // console.log("PROBLEM INSERTING RECORDS.")
        resolve(false);
      };

      records.forEach((item) => {
        let request = objectStore.add(item);

        request.onsuccess = function () {
          // console.log("Added: ", item)
        };
      });
    })
  }
}
async function get_csidb(db, dbName) {
  if (db) {
    const get_transaction = db.transaction("csidb", "readonly");
    const objectStore = get_transaction.objectStore("csidb");

    return new Promise((resolve, reject) => {
      get_transaction.oncomplete = function () {
        // console.log("ALL GET TRANSACTIONS COMPLETE.")
      };

      get_transaction.onerror = function () {
        // console.log("PROBLEM GETTING RECORDS.")
      };

      let request = objectStore.get(dbName);

      request.onsuccess = function (event) {
        resolve(event.target.result);
      };
    })
  }
}

async function update_csidb(db, record) {
  if (db) {
    const put_transaction = db.transaction("csidb", "readwrite");
    const objectStore = put_transaction.objectStore("csidb");

    return new Promise((resolve, reject) => {
      put_transaction.oncomplete = function () {
        // console.log("ALL PUT TRANSACTIONS COMPLETE.")
        resolve(true);
      };

      put_transaction.onerror = function () {
        // console.log("PROBLEM UPDATING RECORDS.")
        resolve(false);
      };

      objectStore.put(record);
    })
  }
}
class IndexedDBStorage {
  dbName = null
  tmpDb = {}
  constructor(dbName) {
    this.dbName = dbName;
  }
  async getDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("main");

      request.onerror = function (event) {
        console.log("Problem opening DB.");
        reject(event);
      };

      request.onupgradeneeded = function (event) {
        const db = event.target.result;

        let objectStore = db.createObjectStore("prxCache", {
          keyPath: "key",
        });

        objectStore = db.createObjectStore("csidb", {
          keyPath: "dbName",
        });

        objectStore.transaction.oncomplete = function (event) {
          console.log("ObjectStore Created.");
        };
      };

      request.onsuccess = function (event) {
        const db = event.target.result;
        // console.log("DB OPENED.")
        // insert_records(roster)
        // insert_prxCache([{key:'nana'}])
        resolve(db);

        db.onerror = function (event) {
          // console.log("FAILED TO OPEN DB.")
        };
      };
    })
  }
  async get(input) {
    const db = await this.getDb();
    if (db) {
      let content = await get_csidb(db, "db_learning");
      console.log(content);
      return content
    }
    return null
  }

  async set(input) {
    let result = {};
    const db = await this.getDb();
    if (db) {
      if (typeof input === "object") {
        const dbNames = Object.keys(input);
        dbNames.map((dbName) => {
          const row = input[dbName];
          console.log(row);
          this.tmpDb[dbName] = row;
          row.dbName = dbName;
          // const {key,cacheContent,statusCode,url} = this
          const record = row;
          const records = [record];
          // const record = records[0]
          get_csidb(db, dbName).then((existingRec) => {
            if (existingRec) {
              console.log(`Update csidb existing rec:${existingRec.dbName}`);
              update_csidb(db, record);
            } else {
              console.log(`insert csidb:${record.dbName}`);
              insert_csidb(db, records);
            }
          });
          // sendMessage('csidb.commit',{records:[record]},'background',()=>{
          //     // resolve(true)
          // })
        });
      }
    }

    // if(Array.isArray(input)){
    //     dbName = input.pop()
    // }
    // if(typeof this.tmpDb[dbName] !== 'undefined'){
    //     result[dbName]=this.tmpDb[dbName]
    // }else{
    //     result[dbName]=null
    // }
    // console.log(dbName)
    // console.log(arguments)

    result = this.tmpDb;

    return result
  }
}
class ChromeStorageIndexedDB {
  db_prefix = "db_"
  db_id
  db_name
  db_new // this flag determines whether a new database was created during an object initialisation
  db = null
  storage
  stype = 0
  initiator = null
  constructor(db_name, engine) {
    this.db_name = db_name;
    this.db_id = this.db_prefix + db_name;
    this.db_new = false;

    // try {
    //     this.storage = chrome.storage[(engine === 'local' ? 'local': 'sync')];
    // } catch(e) { // ie8 hack
    //     this.storage = localStorage;
    //     this.stype = 1
    // }
    this.storage = new IndexedDBStorage(db_name);

    // this.init()
  }
  setInitiator(initiator) {
    this.initiator = initiator;
  }
  // Retrieve data from chrome.storage and get the size
  lcfirst(str) {
    if (typeof str !== "string" || str.length === 0) {
      return str
    }

    return str.charAt(0).toLowerCase() + str.slice(1)
  }
  getTableCounts(table) {
    const tbl = this.lcfirst(table);
    const recs = this.db.data[tbl];
    if (recs) {
      // console.log(recs)
      return Object.keys(recs).length
    }
    return 0
  }
  getDataSize(table, callback) {
    // Get the serialized data from chrome.storage.local
    let dataSize = 0;
    if (table) {
      const tbl = this.lcfirst(table);
      console.log(tbl);
      console.log(this.db.data[tbl]);
      dataSize = new TextEncoder().encode(
        JSON.stringify(this.db.data[tbl])
      ).length;
      callback(dataSize);
      return
    }
    // const {db_id} = this
    Object.keys(this.db.data).map((tbl) => {
      if (this.db.data[tbl]) {
        // Calculate the size of the serialized data
        // if(table){
        dataSize += new TextEncoder().encode(
          JSON.stringify(this.db.data[tbl])
        ).length;
        // }

        // Call the callback with the size
        // callback(dataSize)
      }

      callback(dataSize);
    });
  }
  retryInit = 0
  isReady = true
  async init(dontRetry = false, callback = (f) => f) {
    this.retryInit += 1;
    // console.log(`${this.constructor.name}.init()`)
    let tmpDb = await this.getItem(this.db_id);
    console.log(tmpDb);
    this.db = tmpDb;
    let passedCount = 0;
    if (this.db) {
      passedCount += 1;
      if (typeof this.db.data !== undefined) {
        if (this.db.data) {
          passedCount += 1;
        }
      }
      if (typeof this.db.tables !== undefined) {
        if (this.db.tables) {
          passedCount += 1;
        }
      }
    }
    console.log(`passedCount:${passedCount}`);
    if (passedCount === 3) ; else {
      await this.createEmptyDb();

      //     // this.isReady = true
    }
    callback();
  }
  async createEmptyDb() {
    console.log("CREATING NEW DB DATA");
    // console.log(`${this.constructor.name}.init() storage is null`)

    if (!this.validateName(this.db_name)) {
      this.error("The name '" + this.db_name + "' contains invalid characters");
    } else {
      this.db = { tables: {}, data: {} };
      await this.commit();
      this.db_new = true;
    }
  }
  async reload() {
    await this.init();
    return this
  }

  // ______________________ private methods

  // _________ database functions
  // drop the database
  async drop() {
    await this.setItem(this.db_id, null);
    this.db = null;
  }

  async getItem(key) {
    let data = null;
    if (this.stype === 0) {
      data = await this.storage.get([key]);
    } else {
      data = await this.storage.getItem([key]);
    }

    return data
  }

  async replace(data) {
    await setItem(this.db_id, data);
  }

  async setItem(key, value) {
    if (this.stype === 0) {
      const obj = {};
      obj[key] = value;
      await this.storage.set(obj);
      return true
    } else {
      await this.storage.setItem(key, JSON.stringify(value));
      return false
    }
  }

  // number of tables in the database
  tableCount() {
    var count = 0;
    for (var table in this.db.tables) {
      if (this.db.tables.hasOwnProperty(table)) {
        count++;
      }
    }
    return count
  }

  // _________ table functions

  // returns all fields in a table.
  tableFields(table_name) {
    return this.db.tables[table_name].fields
  }

  // check whether a table exists
  tableExists(table_name) {
    if (!this.isReady) {
      return false
    }
    if (typeof this.db.tables[table_name] !== "object") {
      return false
    }
    return this.db.tables[table_name] ? true : false
  }

  // check whether a table exists, and if not, throw an error
  tableExistsWarn(table_name) {
    if (!this.isReady) {
      return false
    }
    if (!this.tableExists(table_name)) {
      this.error("The table '" + table_name + "' does not exist");
    }
  }

  // check whether a table column exists
  columnExists(table_name, field_name) {
    var exists = false;
    var table_fields = this.db.tables[table_name].fields;
    for (var field in table_fields) {
      if (table_fields[field] === field_name) {
        exists = true;
        break
      }
    }
    return exists
  }

  // create a table
  _createTable(table_name, fields) {
    this.db.tables[table_name] = { fields: fields, auto_increment: 1 };
    this.db.data[table_name] = {};
  }

  // drop a table
  _dropTable(table_name) {
    delete this.db.tables[table_name];
    delete this.db.data[table_name];
  }

  // empty a table
  _truncate(table_name) {
    this.db.tables[table_name].auto_increment = 1;
    this.db.data[table_name] = {};
  }

  //alter a table
  _alterTable(table_name, new_fields, default_values) {
    this.db.tables[table_name].fields =
      this.db.tables[table_name].fields.concat(new_fields);

    // insert default values in existing table
    if (typeof default_values !== "undefined") {
      // loop through all the records in the table
      for (var id in this.db.data[table_name]) {
        if (!db.data[table_name].hasOwnProperty(id)) {
          continue
        }
        for (var field in new_fields) {
          if (typeof default_values === "object") {
            this.db.data[table_name][id][new_fields[field]] =
              default_values[new_fields[field]];
          } else {
            this.db.data[table_name][id][new_fields[field]] = default_values;
          }
        }
      }
    }
  }

  // number of rows in a table
  _rowCount(table_name) {
    var count = 0;
    for (var id in this.db.data[table_name]) {
      if (this.db.data[table_name].hasOwnProperty(id)) {
        count++;
      }
    }
    return count
  }

  // insert a new row
  _insert(table_name, data) {
    data.id = this.db.tables[table_name].auto_increment;
    this.db.data[table_name][this.db.tables[table_name].auto_increment] = data;
    this.db.tables[table_name].auto_increment++;
    return data.id
  }

  // select rows, given a list of ids of rows in a table
  select(table_name, ids, start, limit, sort, distinct) {
    var id = null,
      results = [],
      row = null;

    var i;
    for (i = 0; i < ids.length; i++) {
      id = ids[i];
      row = this.db.data[table_name][id];
      results.push(this.clone(row));
    }

    // there are sorting params
    if (sort && sort instanceof Array) {
      for (i = 0; i < sort.length; i++) {
        results.sort(
          this.sort_results(sort[i][0], sort[i].length > 1 ? sort[i][1] : null)
        );
      }
    }

    // distinct params
    if (distinct && distinct instanceof Array) {
      for (var j = 0; j < distinct.length; j++) {
        var seen = {},
          d = distinct[j];

        for (i = 0; i < results.length; i++) {
          if (results[i] === undefined) {
            continue
          }

          if (
            results[i].hasOwnProperty(d) &&
            seen.hasOwnProperty(results[i][d])
          ) {
            delete results[i];
          } else {
            seen[results[i][d]] = 1;
          }
        }
      }

      // can't use .filter(ie8)
      var new_results = [];
      for (i = 0; i < results.length; i++) {
        if (results[i] !== undefined) {
          new_results.push(results[i]);
        }
      }

      results = new_results;
    }

    // limit and offset
    start = start && typeof start === "number" ? start : null;
    limit = limit && typeof limit === "number" ? limit : null;

    if (start && limit) {
      results = results.slice(start, start + limit);
    } else if (start) {
      results = results.slice(start);
    } else if (limit) {
      results = results.slice(start, limit);
    }

    return results
  }

  // sort a result set
  sort_results(field, order) {
    return function (x, y) {
      // case insensitive comparison for string values
      var v1 = typeof x[field] === "string" ? x[field].toLowerCase() : x[field],
        v2 = typeof y[field] === "string" ? y[field].toLowerCase() : y[field];

      if (order === "DESC") {
        return v1 === v2 ? 0 : v1 < v2 ? 1 : -1
      } else {
        return v1 === v2 ? 0 : v1 > v2 ? 1 : -1
      }
    }
  }

  // select rows in a table by field-value pairs, returns the ids of matches
  queryByValues(table_name, data) {
    if (!this.isReady) {
      return false
    }
    var result_ids = [],
      exists = false,
      row = null;

    // loop through all the records in the table, looking for matches
    for (var id in this.db.data[table_name]) {
      if (!this.db.data[table_name].hasOwnProperty(id)) {
        continue
      }

      row = this.db.data[table_name][id];
      exists = true;

      for (var field in data) {
        if (!data.hasOwnProperty(field)) {
          continue
        }

        if (typeof data[field] === "string") {
          // if the field is a string, do a case insensitive comparison
          if (
            row[field] === null ||
            row[field].toString().toLowerCase() !==
              data[field].toString().toLowerCase()
          ) {
            exists = false;
            break
          }
        } else {
          if (row[field] !== data[field]) {
            exists = false;
            break
          }
        }
      }
      if (exists) {
        result_ids.push(id);
      }
    }

    return result_ids
  }

  // select rows in a table by a function, returns the ids of matches
  queryByFunction(table_name, query_function) {
    var result_ids = [],
      row = null;

    // loop through all the records in the table, looking for matches
    for (var id in this.db.data[table_name]) {
      if (!this.db.data[table_name].hasOwnProperty(id)) {
        continue
      }

      row = this.db.data[table_name][id];

      if (query_function(this.clone(row)) === true) {
        // it's a match if the supplied conditional function is satisfied
        result_ids.push(id);
      }
    }

    return result_ids
  }

  // return all the ids in a table
  getIDs(table_name) {
    var result_ids = [];

    for (var id in this.db.data[table_name]) {
      if (this.db.data[table_name].hasOwnProperty(id)) {
        result_ids.push(id);
      }
    }
    return result_ids
  }

  // delete rows, given a list of their ids in a table
  _deleteRows(table_name, ids) {
    for (var i = 0; i < ids.length; i++) {
      if (this.db.data[table_name].hasOwnProperty(ids[i])) {
        delete this.db.data[table_name][ids[i]];
      }
    }
    return ids.length
  }

  // update rows
  _update(table_name, ids, update_function) {
    var id = "",
      num = 0;

    for (var i = 0; i < ids.length; i++) {
      id = ids[i];

      var updated_data = update_function(
        this.clone(this.db.data[table_name][id])
      );

      if (updated_data) {
        delete updated_data["id"]; // no updates possible to id

        var new_data = this.db.data[table_name][id];
        // merge updated data with existing data
        for (var field in updated_data) {
          if (updated_data.hasOwnProperty(field)) {
            new_data[field] = updated_data[field];
          }
        }

        this.db.data[table_name][id] = this.validFields(table_name, new_data);
        num++;
      }
    }
    return num
  }

  // commit the database to localStorage
  async commit() {
    // console.log(this.initiator,this.db)
    if (this.stype === 0) {
      // console.log(this.db)
      await this.setItem(this.db_id, this.db);
    } else {
      await this.setItem(this.db_id, this.serialize());
    }
  }

  // serialize the database
  serialize() {
    return this.db
  }

  // throw an error
  error(msg) {
    console.error(msg);
  }

  // clone an object
  clone(obj) {
    var new_obj = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        new_obj[key] = obj[key];
      }
    }
    return new_obj
  }

  // validate db, table, field names (alpha-numeric only)
  validateName(name) {
    return name.toString().match(/[^a-z_0-9]/gi) ? false : true
  }

  // given a data list, only retain valid fields in a table
  validFields(table_name, data) {
    if (!this.isReady) {
      return false
    }
    var field = "",
      new_data = {};

    for (field in data) {
      var index = this.db.tables[table_name].fields.indexOf(field);
      if (index === -1) {
        this.error("Invalid query parameter: " + field);
      }
      new_data[field] = data[field];
    }
    return new_data
  }

  // given a data list, populate with valid field names of a table
  validateData(table_name, data) {
    var field = "",
      new_data = {};
    for (var i = 0; i < this.db.tables[table_name].fields.length; i++) {
      field = this.db.tables[table_name].fields[i];
      new_data[field] =
        data[field] === null || data[field] === undefined ? null : data[field];
    }
    return new_data
  }

  isNew(fn) {
    return setTimeout(() => {
      fn(this.db_new);
    }, 100)
  }

  // create a table
  createTable(table_name, fields) {
    var result = false;
    if (!this.validateName(table_name)) {
      this.error(
        "The database name '" + table_name + "' contains invalid characters."
      );
    } else if (this.tableExists(table_name)) {
      this.error("The table name '" + table_name + "' already exists.");
    } else {
      // make sure field names are valid
      var is_valid = true;
      var i;
      for (i = 0; i < fields.length; i++) {
        if (!this.validateName(fields[i])) {
          is_valid = false;
          break
        }
      }

      if (is_valid) {
        // cannot use indexOf due to <IE9 incompatibility
        // de-duplicate the field list
        var fields_literal = {};
        for (i = 0; i < fields.length; i++) {
          fields_literal[fields[i]] = true;
        }
        delete fields_literal["id"]; // id is a reserved field name

        fields = ["id"];
        for (var field in fields_literal) {
          if (fields_literal.hasOwnProperty(field)) {
            fields.push(field);
          }
        }

        this._createTable(table_name, fields);
        result = true;
      } else {
        this.error(
          "One or more field names in the table definition contains invalid characters"
        );
      }
    }

    return result
  }

  // Create a table using array of Objects @ [{k:v,k:v},{k:v,k:v},etc]
  createTableWithData(table_name, data) {
    if (typeof data !== "object" || !data.length || data.length < 1) {
      this.error(
        "Data supplied isn't in object form. Example: [{k:v,k:v},{k:v,k:v} ..]"
      );
    }

    var fields = Object.keys(data[0]);

    // create the table
    if (this.createTable(table_name, fields)) {
      this.commit();

      // populate
      for (var i = 0; i < data.length; i++) {
        if (!insert(table_name, data[i])) {
          this.error(
            "Failed to insert record: [" + JSON.stringify(data[i]) + "]"
          );
        }
      }
      this.commit();
    }
    return true
  }

  // drop a table
  dropTable(table_name) {
    this.tableExistsWarn(table_name);
    this._dropTable(table_name);
  }

  // empty a table
  truncate(table_name) {
    this.tableExistsWarn(table_name);
    this._truncate(table_name);
  }

  // alter a table
  alterTable(table_name, new_fields, default_values) {
    var result = false;
    if (!this.validateName(table_name)) {
      this.error(
        "The database name '" + table_name + "' contains invalid characters"
      );
    } else {
      if (typeof new_fields === "object") {
        // make sure field names are valid
        var is_valid = true;
        var i;
        for (i = 0; i < new_fields.length; i++) {
          if (!this.validateName(new_fields[i])) {
            is_valid = false;
            break
          }
        }

        if (is_valid) {
          // cannot use indexOf due to <IE9 incompatibility
          // de-duplicate the field list
          var fields_literal = {};
          for (i = 0; i < new_fields.length; i++) {
            fields_literal[new_fields[i]] = true;
          }
          delete fields_literal["id"]; // id is a reserved field name

          new_fields = [];
          for (var field in fields_literal) {
            if (fields_literal.hasOwnProperty(field)) {
              new_fields.push(field);
            }
          }

          this._alterTable(table_name, new_fields, default_values);
          result = true;
        } else {
          this.error(
            "One or more field names in the table definition contains invalid characters"
          );
        }
      } else if (typeof new_fields === "string") {
        if (this.validateName(new_fields)) {
          var new_fields_array = [];
          new_fields_array.push(new_fields);
          this._alterTable(table_name, new_fields_array, default_values);
          result = true;
        } else {
          this.error(
            "One or more field names in the table definition contains invalid characters"
          );
        }
      }
    }

    return result
  }

  // number of rows in a table
  rowCount(table_name) {
    this.tableExistsWarn(table_name);
    return this._rowCount(table_name)
  }

  // insert a row
  insert(table_name, data) {
    this.tableExistsWarn(table_name);
    return this._insert(table_name, this.validateData(table_name, data))
  }

  // insert or update based on a given condition
  insertOrUpdate(table_name, query, data) {
    this.tableExistsWarn(table_name);

    var result_ids = [];
    if (!query) {
      result_ids = this.getIDs(table_name); // there is no query. applies to all records
    } else if (typeof query === "object") {
      // the query has key-value pairs provided
      result_ids = this.queryByValues(
        table_name,
        this.validFields(table_name, query)
      );
    } else if (typeof query === "function") {
      // the query has a conditional map function provided
      result_ids = this.queryByFunction(table_name, query);
    }

    // no existing records matched, so insert a new row
    if (result_ids.length === 0) {
      return this._insert(table_name, this.validateData(table_name, data))
    } else {
      var ids = [];
      this._update(table_name, result_ids, function (o) {
        ids.push(o.id);
        return data
      });

      return ids
    }
  }

  // update rows
  update(table_name, query, update_function) {
    this.tableExistsWarn(table_name);

    var result_ids = [];
    if (!query) {
      result_ids = this.getIDs(table_name); // there is no query. applies to all records
    } else if (typeof query === "object") {
      // the query has key-value pairs provided
      result_ids = this.queryByValues(
        table_name,
        this.validFields(table_name, query)
      );
    } else if (typeof query === "function") {
      // the query has a conditional map function provided
      result_ids = this.queryByFunction(table_name, query);
    }
    return this._update(table_name, result_ids, update_function)
  }

  // select rows
  query(table_name, query, limit, start, sort, distinct) {
    this.tableExistsWarn(table_name);

    var result_ids = [];
    if (!query) {
      result_ids = this.getIDs(table_name, limit, start); // no conditions given, return all records
    } else if (typeof query === "object") {
      // the query has key-value pairs provided
      result_ids = this.queryByValues(
        table_name,
        this.validFields(table_name, query),
        limit,
        start
      );
    } else if (typeof query === "function") {
      // the query has a conditional map function provided
      result_ids = this.queryByFunction(table_name, query, limit, start);
    }

    return this.select(table_name, result_ids, start, limit, sort, distinct)
  }

  // alias for query() that takes a dict of params instead of positional arrguments
  queryAll(table_name, params) {
    if (!params) {
      return this.query(table_name)
    } else {
      return this.query(
        table_name,
        params.hasOwnProperty("query") ? params.query : null,
        params.hasOwnProperty("limit") ? params.limit : null,
        params.hasOwnProperty("start") ? params.start : null,
        params.hasOwnProperty("sort") ? params.sort : null,
        params.hasOwnProperty("distinct") ? params.distinct : null
      )
    }
  }

  // delete rows
  deleteRows(table_name, query) {
    this.tableExistsWarn(table_name);

    var result_ids = [];
    if (!query) {
      result_ids = this.getIDs(table_name);
    } else if (typeof query === "object") {
      result_ids = this.queryByValues(
        table_name,
        this.validFields(table_name, query)
      );
    } else if (typeof query === "function") {
      result_ids = this.queryByFunction(table_name, query);
    }
    return this._deleteRows(table_name, result_ids)
  }
}

class DBIndexed {
	db = null
	database = 'learning'
	type = 'collection'
	useIndexedDb = true


	static instance = null
	static instances = []
	static configSet = null
	static connection = null
	
	constructor(){
		if(!DBIndexed.connection){
			DBIndexed.connection = new ChromeStorageIndexedDB(this.database);
			DBIndexed.connection.setInitiator(this.constructor.name);
		}
		this.db = DBIndexed.connection;
	}
	
	async getCount(){

	}

	async initTable(){
		// console.log(`${this.constructor.name}.initTable()`)

		if(!this.table){
			// console.error(`${this.constructor.name}.initTable() empty table`)

			return
		}
		// if(this.db.isReady){
			if(!this.db.tableExists(this.table)){
				this.db.createTable(this.table, this.fields);
				await this.db.commit();
			}
		// }else{
			// console.error(`db is not ready`)
		// }
	}	
	async initDB(){
		await this.db.init(true, ()=>{
			if(this instanceof DBIndexed){
				console.log(`${this.constructor.name}.initTable()`);

				this.initTable();
			}else {
				console.error(`${this.constructor.name}.initTable() not implemented`);
			}
		});
		

		
	}

	singleResult(results){
		if(results.length>0){
			return results[0]
		}
		return null
	}
	singleQuery(params){
		if(!this.table){
			console.error(`${this.constructor.name}.singleQuery() table is not specified`);
			return null
		}
		const results = this.db.queryAll(this.table,params);
        return this.singleResult(results)
	}
	query(params){
		if(!this.table){
			console.error(`${this.constructor.name}.query() table is not specified`);
			return []
		}
		return this.db.queryAll(this.table,params)
	}
	getList(){
        const results =  this.db.queryAll(this.table);
        return results
    }
	getAll(){
        const results =  this.db.queryAll(this.table);
        return results
    }
	/**
	 * get singleton instance */
	static async getInstance(){
		if(this.instance instanceof this);else {
			this.instance = this.factory();
			await this.instance.initDB();

			DBIndexed.instances.push(this.instance);
		}	

		return this.instance;
	}
	static gotInstance(){
		if(this.instance instanceof this);else {
			this.instance = this.factory();
			DBIndexed.instances.push(this.instance);
		}	

		return this.instance;
	}
	/**
	 * singleton factory*/
	static factory(){
		return new this()
	}
	// legacy Store.prepareAppStorage()
	static async prepare(){
        // logServer.log(`Store.prepareAppStorage()`,494);
        // Store.init(()=>{
        //     logServer.log(`After Store.init()`,498);

        //     App.init('',fn);
        // });
    }

	async sync(){
		this.db.reload();
	}
	async deleteRows(query){
		await this.db.deleteRows(this.table,query);
		await this.db.commit();
	}

	async drop(){

		if(this instanceof DBIndexed){
			await this.db.drop();

			for(let i in DBIndexed.instances){
				const instance = DBIndexed.instances[i];
				await instance.initDB();
				if(instance.table === 'app'){
					await instance.init();
				}
			}
		}else {
			console.error(`${this.constructor.name}.drop() only implemented for DB instaces`);
		}
        // Store.db().setFresh(true);

    }
    async dropTable(){

		this.db.dropTable(this.table);
		await this.db.commit();
		for(let i in DBIndexed.instances){
			const instance = DBIndexed.instances[i];
			await instance.initDB();
			if(instance.table === 'app'){
				await instance.init();
			}
		}
	}

	async truncate(){
		this.db.deleteRows(this.table);
		await this.db.commit();
	}
    static async isFresh(){
        // chrome.storage.local.get('db_learning',(db)=>{
        //     console.log(db);
        //     let isFreshInstall = true;
        //     if(typeof db.db_learning == 'object'){
        //         if(typeof db.db_learning.tables == 'object'){
        //             if(typeof db.db_learning.tables.app == 'object'){
        //                 isFreshInstall = false;
        //             }
        //         }
        //     }
        //     fn(isFreshInstall,db);
        // });
    }
/**/
}

class App extends DB {
	table = 'app'
	fields = ["version","state","lastCourseSlug","nav","freshInstall"]
	type = 'single'
    version = '2.0'
    defaultNav = 'welcome'
    rowExists = false
	
    get(){
        const version = this.version;
        const results = this.db.queryAll(this.table,{query:{version}});
        return this.singleResult(results)
    }

    async init(courseSlug = ''){
        
        let app = this.get();
        if(!app){
            const state = 0;
            const id = 0;
            const lastCourseSlug = courseSlug;
            const nav = this.defaultNav;
            app = {id,state,version:this.version,lastCourseSlug,nav};
            app.id = this.db.insert(this.table,app);
            await this.db.commit();
            this.rowExists = true;
        }else {
        	if(courseSlug !== ''){
	            if(app.lastCourseSlug !== courseSlug){
	                app.lastCourseSlug = courseSlug;
	                console.log(`App.init() update courseSlug=${courseSlug}`);
	                await this.update(row => {
	                    row.lastCourseSlug = courseSlug;
	                    return row
	                });
	            }
	        } 
        }
        return app
    }

    async setState(state, courseSlug){
        await this.update( row =>{
            row.state = state;
            if(courseSlug){
                row.lastCourseSlug = courseSlug;
            }
            return row
        });
        
    }

    async setNav(nav){
        await this.update( row => {
            row.nav = nav;
            return row
        });
    }

    async update(callback){
        // if(!this.rowExists){
        //     console.error(`${this.constructor.name}.update() rowExists is false`)
        //     return
        // }
        const version = this.version;
        this.db.update(this.table,{version}, callback);
        await this.db.commit();
    }	
}

class Author extends DB {
	table = 'author'
	fields = ["name","slug","biography", "shortBiography","courseIds"]

    getBySlug(slug){

        return this.singleQuery({query: {slug}})
    }
    getById(id){
        return this.singleQuery({query: {id}})
    }
   
    getListByCourse(course){

        const authors = [];
        if(!course){
            return authors
        }
        for(let i in course.authorIds){
            const author = this.getById(course.authorIds[i]);
            if(author){
                authors.push(author);
            }
        }
        return authors
    }
    async create(name,slug,biography,shortBiography,courseId){
        let author = this.getBySlug(slug);
        if(!author){
            const courseIds = [];
            if(typeof courseId === 'number'){
                courseIds.push(courseId);
            }
            const id = 0;
            author = {id,name,slug,biography,shortBiography,courseIds};

            author.id = this.db.insert(this.table,author);

            await this.db.commit();
        }else {
            const courseIds = author.courseIds;
            if(!courseIds.includes(courseId)){
                courseIds.push(courseId);

                this.db.update(this.table,{slug},(row)=>{
                    row.courseIds = courseIds;
                    return row
                });
                
                await this.db.commit();
                author.courseIds = courseIds;
            }
        }
        

        return author
    }	
}

class Section extends DB {
	table = 'section'
	fields = ["courseId","slug","title","tocIds","itemStars"]

    getBySlug(slug, courseId){
        return this.singleQuery({query: {slug,courseId}})
    }
    get(id){
        return this.singleQuery({query: {id}})
    }
    getList(){
        const results =  this.db.queryAll(this.table);
        return results
    }
    getListByCourseId(courseId){
        const results =  this.query({query: {courseId}});
        return results
    }
    async create(title, slug, courseId,itemStars=[]){
        let section = this.getBySlug(slug,courseId);

        if(!section){
            const id = 0;
            const tocIds=[];
            section = {id,courseId,title,slug,tocIds,itemStars};
            section.id = this.db.insert(this.table,section);
            await this.db.commit();

        }else {
            console.error(`${this.constructor.name}.create() section row exists`);
        }

        return section
    }
    async updateTocIds(id, tocIds){
        let section = this.get(id);
        if(section){
            this.db.update(this.table,{id}, row => {
                row.tocIds = tocIds;
                return row
            });

            await this.db.commit();
            section.tocIds = tocIds;

        }else {
            console.error(`${this.constructor.name}.updateTocIds() toc row not exists`);
        }

        return section
    }
	
}

class Toc extends DB {
	table = 'toc'
	fields = ["sectionId","title","slug","url","duration","captionUrl","captionFmt","streamLocationIds","itemStar","vStatusUrn"]


    getListBySectionId(sectionId){
        return this.query({query: {sectionId}})
    }
    getBySlug(slug,sectionId){
        return this.singleQuery({query: {slug,sectionId}})
    }
    get(id){
        return this.singleQuery({query: {id}})
    }
    getByItemStar(itemStar){
        return this.singleQuery({query: {itemStar}})

    }
    async update(id, tocUrl, captionUrl, captionFmt, streamlocIds){
        const toc = this.get(id);
        if(toc){
            this.db.update(this.table, {id}, row => {
                row.captionUrl = captionUrl;
                row.captionFmt = captionFmt;
                row.streamLocationIds = streamlocIds;
                row.url = tocUrl;
                return row
            });
            toc.streamLocationIds = streamlocIds;
            await this.db.commit();
        }else {
            console.warn(`${this.constructor.name}.update() row is not exists`);
        }
        return toc
    }

    async create(title, slug, url, duration, captionUrl, captionFmt, sectionId,itemStar,vStatusUrn){
        let toc = this.getBySlug(slug,sectionId);

        if(!toc){
            const id = 0;
            const streamLocationIds = [];
            toc = {id,sectionId,title,slug,url,duration,captionUrl,captionFmt,streamLocationIds,itemStar,vStatusUrn};
            toc.id = this.db.insert('toc',toc);
            await this.db.commit();

        }else {
            console.error(`${this.constructor.name}.create() toc row exists`);
        }

        return toc
    }    
}

class Course extends DB {
	table = 'course'
	fields = ["title", "slug", "duration", "sourceCodeRepository", "description",'authorIds','urn','thumbnail']


 /**
  * Gets a single course by its slug property.
  * Queries the database for courses matching the given slug, 
  * and returns the first result.
  * @param {string} slug - The slug property to search for.
  * @returns {Object|null} The matching course, or null if not found.
 */
    getBySlug(slug) {
        const results = this.db.queryAll(this.table, { query: { slug } });
        return this.singleResult(results)
    }
    /**
     * Gets the last used course slug from the App model.
     * 
     * Gets the App model instance and retrieves the stored document.
     * Returns the lastCourseSlug property from the document if found,
     * otherwise returns an empty string.
     */
    async getLastSlug() {
        const mApp = await App.getInstance();

        const app = mApp.get();
        if (app) {
            return app.lastCourseSlug
        }
        return ''
    }
    /**
     * Sets the last used course slug in the App model.
     * Gets the singleton App model instance. 
     * If the slug parameter is not empty, it logs a message and updates the 
     * lastCourseSlug property in the App document to the given slug value.
     * @param {string} slug - The course slug to set as last used.
     */
    async setLastSlug(slug) {
        const mApp = await App.getInstance();

        if (slug !== '') {
            console.log(`App.init() update courseSlug=${slug}`);

            await mApp.update(row => {
                row.lastCourseSlug = slug;
                return row
            });
        }
    }
    /**
     * Fetches all data needed to display a course page, including the course itself, authors, 
     * sections, and table of contents.
     * 
     * Takes a course slug. Gets the course by that slug. Also gets the authors, 
     * sections, and TOCs related to that course from their respective models.
     * 
     * Returns an object containing the course data, authors array, sections array,
     * and TOCs object mapping section slugs to array of TOC items.
     * 
     * Returns null if no course found for the given slug.
    */
    async getCoursePageData(slug) {
        if (!slug) {
            return null
        }
        const mAuthor = await Author.getInstance();
        const mSection = await Section.getInstance();
        const mToc = await Toc.getInstance();
        let course = null, authors = [], sections = [], tocs = {};
        course = this.getBySlug(slug);
        if (course) {
            authors = mAuthor.getListByCourse(course);
            sections = mSection.getListByCourseId(course.id);

            for(let i in sections){
                const section = sections[i];
                tocs[section.slug] = mToc.getListBySectionId(section.id);
            }

        } 
        return {course, authors, sections, tocs}

    }
    async getCourseSecsTocs(courseId){
        let  sections=[], tocs={};

        const mSection = await Section.getInstance();
        const mToc = await Toc.getInstance();
        sections = mSection.getListByCourseId(courseId);
        for(let i in sections){
            const section = sections[i];
            tocs[section.slug] = mToc.getListBySectionId(section.id);
        }

        return {sections, tocs}

    }
	getList(){
        const results =  this.db.queryAll(this.table);
        return results
    }

    getById(id){
        return this.singleQuery({query: {id}});
    }

    async addAuthorId(id, authorId){
        const course = this.getById(id);
        if(course){
            const authorIds = course.authorIds.filter(item=>item);
            if(!authorIds.includes(authorId)){
                authorIds.push(authorId);

                this.db.update(this.table,{id}, row => {
                    row.authorIds = authorIds;
                    return row
                });
                
                await this.db.commit();
            }
        }

        return course
        
    }
    async create(title,slug,duration,sourceCodeRepository,description,urn){
        let course = this.getBySlug(slug);
        if(!course){
            const id = 0;
            const authorIds = [];
            course = {id,title,slug,duration,sourceCodeRepository,description,authorIds,urn};
            course.id = this.db.insert(this.table,course);
            await this.db.commit();
        }else {
            course = await this.update(course.id,{title,slug,duration,sourceCodeRepository,description,urn});
            console.error(`${this.constructor.name}.create() rowExist, update row`);

        }

        return course;
    }
    async update(id,row_){
        let record = this.getById(id);
        if(record){
            this.db.update(this.table,{id},(row)=>{
                for(let k in row_){
                    row[k] = row_[k];
                    record[k] = row_[k];
                }
                return row
            });
            await this.db.commit();
        }
        
        return record
    }
}

class ExerciseFile extends DB {
	table = 'exerciseFile'
	fields = ["courseId","name","url","size"]

	getByNameAndCourseId(name,courseId){
        return this.singleQuery({query: {name,courseId}})
	}
    getListByCourseId(courseId){
        return this.query({query:{courseId}})
    }
    async create(name,url,size,courseId){
        let exerciseFile = this.getByNameAndCourseId(name,courseId);

        if(!exerciseFile){
            const id = 0;
            exerciseFile = {id,courseId,name,url,size};
            exerciseFile.id = this.db.insert(this.table,exerciseFile);

        }else {
            console.log(exerciseFile.url, url);
            const id = exerciseFile.id;
            exerciseFile.url = url;
            this.db.update(this.table,{id}, row => {
                row.url = url;
                return row
            });
            console.log(`Exercise file updated`);
        }
        await this.db.commit();

        return exerciseFile
    }
}

class StreamLocation extends DB {
	table = 'streamLocation'
	fields = ["tocId","fmt","url","expiresAt"]

    async deleteByTocId(tocId){
        await this.deleteRows({tocId});
    }
    getByTocId(tocId,fmt){
        return this.singleQuery({query: {tocId,fmt}})
        
    }
    getListByTocId(tocId){
        return this.query({query: {tocId}})
    }
    async create(fmt, url, tocId,expiresAt=null){
        
        let streamloc = this.getByTocId(tocId,fmt);
        if(streamloc){
            streamloc.url = url;
            this.db.update(this.table,(row)=>{
                row.url = url;
                return row
            });
        }else {
            const id = 0;
            streamloc = {id,tocId,fmt,url,expiresAt};
            streamloc.id = this.db.insert(this.table,streamloc);
        }
        await this.db.commit();

        return streamloc
    }

}

class Message extends DB {
	table = 'message'
	fields = ["eventName", "data", "target", "callback"]

	get(eventName,target){
		return this.singleQuery({query:{eventName,target}})
	} 
	async set(eventName, data, target, callback = null){
        let message = this.get(eventName,target);
  
        if(!message){
            const id = 0;
            message = {id,eventName,data,target,callback};
            message.id = this.db.insert(this.table,message);
            

        }else {
            this.db.update(this.table,{eventName,target},row=>{
            	row.data = data;
            	row.callback = callback;
            	return row
            });
            message.data = data;
            message.callback = callback;
        }
        await this.db.commit();
        return message
    }
}

class DMSetup extends DB{
    table = 'dmSetup'
	fields = [
        "courseId",
        "status",
        "finished",
        "availableFmt", 
        "availableTrans", 
        "selectedFmt", 
        "selectedTrans", 
        "exerciseFiles", 
        "sourceRepo",
        "enableFilenameIndex"
        ]
	type = "collection"

    getListWithCourse(){
        const mCourse = Course.gotInstance();
        let results =  this.db.queryAll(this.table);
        results = results.map(item => {
            try{item.course = mCourse.getById(item.courseId).title;}catch(e){}
            return item
        });
        return results
    }
    async deleteByCourseId(courseId){
        await this.deleteRows({courseId});
    }
    getByCourseId(courseId){
        return this.singleQuery({query: {courseId}})
    }
    getById(id){
        return this.singleQuery({query: {id}})
    }
    async create(courseId,availableFmt,selectedFmt,availableTrans,selectedTrans,sourceRepo,exerciseFiles,status,finished,enableFilenameIndex){
        let row = this.getByCourseId(courseId);
        if(!row){
            const id = 0;
            row = {id,courseId,availableFmt,selectedFmt,availableTrans,selectedTrans,sourceRepo,exerciseFiles,status,finished,enableFilenameIndex};
            row.id = this.db.insert(this.table,row);
            await this.db.commit();
        }else {
            console.error(`${this.constructor.name}.create() rowExist`);

        }

        return row
    }
    async update(id,row_){
        let record = this.getById(id);
        if(record){
            this.db.update(this.table,{id},(row)=>{
                for(let k in row_){
                    row[k] = row_[k];
                    record[k] = row_[k];
                }
                return row
            });
            await this.db.commit();
        }
        
        return record
    }
    async updateByCourseId(courseId, row_){
        let record = this.getByCourseId(courseId);
        if(record){
            record = await this.update(record.id, row_);
        }
        return record
    }
}

class DMStatus extends DB{
    table = 'dmStatus'
	fields = [
        "courseId",
        "vIndex",
        "metaStatus",
        "videoStatus",
        "captionStatus", 
        "dtMetaStart",
        "dtVideoStart",
        "dtCaptionStart",
        "dtMetaEnd",
        "dtVideoEnd",
        "dtCaptionEnd",
        "dlMetaRetryCount",
        "dlCaptionRetryCount",
        "dlVideoRetryCount",
        "videoSz",
        "captionSz",
        "finished",
        "interupted"
    ]
	type = "collection"
    async deleteByCourseId(courseId){
        await this.deleteRows({courseId});
    }
    getListWithCourse(){
        const mCourse = Course.gotInstance();
        let results =  this.db.queryAll(this.table);
        results = results.map(item => {
            try{item.course = mCourse.getById(item.courseId).title;}catch(e){}
            return item
        });
        return results
    }
    getByCourseId(courseId, vIndex){
        return this.singleQuery({query: {courseId, vIndex: this.createVIndex(vIndex)}})
    }
    getListByCourseId(courseId){
        return this.query({query: {courseId}})
    }
    getById(id){
        return this.singleQuery({query: {id}})
    }
    createVIndex(vIndex){
        const [sIndex,tIndex] = vIndex;
        return `${sIndex}${tIndex}`
    }
    async create(courseId,vIndex){
        let row = this.getByCourseId(courseId, vIndex);
        if(!row){

            row = this.createDefaultRow(courseId, vIndex);

            row.id = this.db.insert(this.table,row);
            await this.db.commit();
        }else {
            console.error(`${this.constructor.name}.create() rowExist`);

        }

        return row
    }
    async update(id,row_){
        let record = this.getById(id);
        if(record){
            this.db.update(this.table,{id},(row)=>{
                for(let k in row_){
                    row[k] = row_[k];
                    record[k] = row_[k];
                }
                return row
            });
            await this.db.commit();
        }
        
        return record
    }
    async updateByCourseId(courseId,vIndex, row){
        let record = this.getByCourseId(courseId, vIndex);
        if(record){
            record = await this.update(record.id, row);
        }
        return record
    }

    async setDlStatus(courseId, t, vIndex, dlStatus, retryCount=0){
        const dt = convertToMySQLDatetime(new Date);

        let current = this.getByCourseId(courseId, vIndex);
        if(!current){
            current = await this.create(courseId, vIndex);
        }

        let row,dlStatusResult;
        if(t == "caption"){
            const captionStatus = dlStatus;
            dlStatusResult = parseInt(current.videoStatus) + parseInt(dlStatus);
            row = {
                captionStatus
            };
            if(dlStatus == 1){
                row.dtCaptionStart = dt;
            }else {
                row.dtCaptionEnd = dt;
            }
            if(retryCount >= 0){
                row.dlCaptionRetryCount = retryCount;
            }
        }else {
            const videoStatus = dlStatus;
            dlStatusResult = parseInt(current.captionStatus) + parseInt(dlStatus);

            row = {
                videoStatus
            };
            if(dlStatus == 1){
                row.dtVideoStart = dt;
            }else {
                row.dtVideoEnd = dt;
            }
            if(retryCount >= 0){
                row.dlVideoRetryCount = retryCount;
            }
        }
        if(dlStatus == -1){
            row.interupted = true;
        }
        if(dlStatusResult == 4){
            row.finished = true;
            row.interupted = true;

        }

        current = await this.updateByCourseId(courseId,vIndex, row);
        return current
    }

    async setDlStatusMeta(courseId,vIndex, dlStatus, retryCount = 0){
        const dt = convertToMySQLDatetime(new Date);

        let current = this.getByCourseId(courseId, vIndex);
        if(!current){
            current = await this.create(courseId, vIndex);
        }

        const metaStatus = dlStatus;
        let row = {
            metaStatus
        };
        if(dlStatus == 1){
            row.dtMetaStart = dt;
        }else {
            row.dtMetaEnd = dt;
        }
        if(retryCount >= 0){
            row.dlMetaRetryCount = retryCount;
        }

        current = await this.updateByCourseId(courseId,vIndex, row);
        return current

    }
    async setDlSize(courseId, t, vIndex, loaded){
        // console.log(`DMStatus.setDlSize(${courseId},${t},${this.createVIndex(vIndex)},${loaded})`)

        let current = this.getByCourseId(courseId, vIndex);
        if(!current){
            return
        }
        
        let row = {};
        if(t == "caption"){
            row.captionSz = loaded;
        }else {
            row.videoSz = loaded;
        }
        // row[szField] = loaded

        await this.updateByCourseId(courseId, vIndex, row);
    }

    createDefaultRow(courseId, vIndex){
        const dt = convertToMySQLDatetime(new Date);

        const id = 0;
        const metaStatus = 0;
        const videoStatus = 0;
        const captionStatus = 0;
        const dtMetaStart = dt;
        const dtVideoStart = dt;
        const dtCaptionStart = dt;     
        const dtMetaEnd = dt;
        const dtVideoEnd = dt;
        const dtCaptionEnd = dt;
        const dlCaptionRetryCount = 0;
        const dlVideoRetryCount = 0;
        const finished = false;
        const interupted = false;
        const videoSz = 0;
        const captionSz = 0;

        const row = { id, courseId, courseId,
                    vIndex : this.createVIndex(vIndex),
                    metaStatus,
                    videoStatus,
                    captionStatus, 
                    dtMetaStart,
                    dtVideoStart,
                    dtCaptionStart,
                    dtMetaEnd,
                    dtVideoEnd,
                    dtCaptionEnd,
                    dlCaptionRetryCount,
                    dlVideoRetryCount,
                    finished,
                    videoSz,
                    captionSz,
                    interupted
        };

        return row
    }
}

class Transcript extends DBIndexed {
	table = 'transcript'
	fields = ["tocId", "lang", "country", "fmt","url","autoGenerated"]

    async deleteByTocId(tocId){
        await this.deleteRows({tocId});
    }

    getListByTocId(tocId){
        return this.query({query: {tocId}})
    }
    getListByTocIdAsObject(tocId){
        const results = this.getListByTocId(tocId);
        let transcripts = null;
        if(results.length > 0){
            transcripts = {};
            for(const row of results){
                transcripts[row.lang] = row;
            }
        }
        return transcripts
    }
    getByLang(lang, tocId){
        return this.singleQuery({query: {lang,tocId}})
    }
    get(id){
        return this.singleQuery({query: {id}})
    }
    async create(tocId, lang, country, fmt, url, autoGenerated){
        let row = this.getByLang(lang,tocId);
        if(!row){
            const id = 0;
            row = {id,tocId,lang,country,fmt,url,autoGenerated};
            row.id = this.db.insert(this.table,row);
            await this.db.commit();
        }else {
            console.error(`${this.constructor.name}.create() toc row exists`);
        }
        
        return row
    }
}

const WEBCACHE_PREFIX = "WebCache_";
class WebCache {
  key = null;
  cacheContent = null;
  statusCode = 0;
  url = null;
  constructor(url) {
    this.setUrl(url);
    sendMessage("prxCache.create", null, "background");
  }
  setUrl(url) {
    this.url = url;
    if (url) {
      this.key = `${WEBCACHE_PREFIX}${crc.crc32(url).toString(16)}`;
    }
  }
  static async fromKey(key) {
    return new Promise((resolve, reject) => {
      sendMessage("prxCache.get", { key }, "background", (data) => {
        if (data) {
          const webCache = new WebCache(data.url);
          webCache.setCacheContent(data.cacheContent);
          webCache.setStatusCode(data.statusCode);
          resolve(webCache);
        }
        resolve(null);
      });
    });
  }
  setCacheContent(cacheContent) {
    this.cacheContent = cacheContent;
  }
  setStatusCode(statusCode) {
    this.statusCode = statusCode;
  }
  async save() {
    const { key, cacheContent, statusCode, url } = this;
    const record = { key, statusCode, url, cacheContent };
    sendMessage("prxCache.insert", { records: [record] }, "background");
  }
  async delete() {
    await sendMessage("prxCache.delete", { key: this.key });
  }
  getKey() {
    return this.key;
  }
  async remove() {
    await this.delete();
  }
  async load() {
    return new Promise((resolve, reject) => {
      sendMessage("prxCache.get", { key: this.key }, "background", (data) => {
        if (data) {
          if (data.cacheContent) {
            this.cacheContent = data.cacheContent;
          }
        }
        resolve(true);
      });
    });
  }
  getCacheContent() {
    return this.cacheContent;
  }
  getStatusCode() {
    return this.statusCode;
  }
  isEmpty() {
    const empty = this.cacheContent == null || typeof this.cacheContent == "undefined";
    console.log(`Empty:`, empty);
    return empty;
  }
}
class PrxCache {
  table = "PrxCache";
  static instance = null;
  static getInstance() {
    if (!PrxCache.instance) {
      PrxCache.instance = new PrxCache();
    }
    return PrxCache.instance;
  }
  async clearAll() {
    return new Promise((resolve, reject) => {
      sendMessage("prxCache.clear", null, "background", (data) => {
        resolve(data);
      });
    });
  }
  async get(url, noCache = false) {
    const webCache = new WebCache(url);
    if (noCache) {
      await webCache.delete();
      console.log(`PrxCache.get(${url},noCache=${noCache ? "1" : "0"})`);
    } else {
      await webCache.load();
    }
    return webCache;
  }
  async getByKey(key) {
    const webCache = await WebCache.fromKey(key);
    return webCache;
  }
  async set(url, cacheContent, statusCode) {
    const webCache = new WebCache(url);
    webCache.setCacheContent(cacheContent);
    webCache.setStatusCode(statusCode);
    await webCache.save();
    return webCache;
  }
  async unset(url) {
    const webCache = await this.get(url);
    if (!webCache.isEmpty()) {
      webCache.remove();
    }
  }
  async unsetByKey(key) {
    const webCache = await this.getByKey(key);
    if (webCache) {
      if (!webCache.isEmpty()) {
        webCache.remove();
      }
    }
  }
  async getCounts() {
    return new Promise((resolve, reject) => {
      sendMessage("prxCache.count", null, "background", (data) => {
        resolve(data);
      });
    });
  }
  async getSize() {
    return new Promise((resolve, reject) => {
      sendMessage("prxCache.size", null, "background", (data) => {
        resolve(data);
      });
    });
  }
}

// import DB from "./DB"

class Thumbnail extends DBIndexed {
	table = 'thumbnail'
	fields = ["courseId", "size", "url","expiresAt"]

    async deleteByCourseId(courseId){
        await this.deleteRows({courseId});
    }


    getListByCourseId(courseId){
        return this.query({query: {courseId}})
    }
    getListByCourseIdAsObject(courseId){
        const results = this.getListByCourseId(courseId);
        let thumbs = null;
        if(results.length > 0){
            thumbs = {};
            for(const row of results){
                thumbs[row.size] = row;
            }
        }
        return thumbs
    }
    getBySizeAndCourseId(size,courseId){
        return this.singleQuery({query: {courseId,size}})
    }
    getById(id){
        return this.singleQuery({query: {id}})
    }
    async create(courseId, size, url, expiresAt){
        let row = this.getBySizeAndCourseId(size,courseId);
        if(!row){
            row = {courseId, size, url, expiresAt};
            row.id = this.db.insert(this.table,row);
            await this.db.commit();
        }else {
            await this.update(row.id,{size, url, expiresAt});
            // console.error(`${this.constructor.name}.create() toc row exists`)
        }
        
        return row
    }
    async update(id,row_){
        let record = this.getById(id);
        if(record){
            this.db.update(this.table,{id},(row)=>{
                for(let k in row_){
                    row[k] = row_[k];
                    record[k] = row_[k];
                }
                return row
            });
            await this.db.commit();
        }
        
        return record
    }
}

/*class Queue {
    static clone(instance){
        const keys = Object.keys(instance.items)
        const copyObj = new Queue()
        keys.map((k,i)=>{
            const item = instance.items[k]
            copyObj.enqueue(item)
        })
        return copyObj
    }
	constructor() {
		this.items = {}
		this.frontIndex = 0
		this.backIndex = 0
	}
	enqueue(item) {
		this.items[this.backIndex] = item
		this.backIndex++
		return item + ' inserted'
	}
	dequeue() {
		const item = this.items[this.frontIndex]
		delete this.items[this.frontIndex]
		this.frontIndex++
		return item
	}
	peek() {
		return this.items[this.frontIndex]
	}
	get printQueue() {
		return this.items
	}
}
*/
class QueueResult {
  static INIT = 0
  static FAILED = 1
  static FAILED_MEDIA = 2
  static FAILED_TRANS = 3
  static SUCCESS_MEDIA = 4
  static SUCCESS_TRANS = 5
  static SUCCESS = 6

  static toStr(result) {
    const strs = ["INIT", "FAILED", "FAILED_MEDIA", "FAILED_TRANS", "SUCCESS_MEDIA", "SUCCESS_TRANS", "SUCCESS"];
    if (typeof strs[result] != "undefined") {
      return strs[result]
    }
    return `${result} : Unknown`
  }
}
class QueueState {
  static INIT = 0
  static FETCH_META = 1

  static FETCH_META_FAIL = 2
  static FETCH_META_RETRY = 3
  static FETCH_META_OK = 4

  static FETCH_MEDIA_SKIP = 5
  static FETCH_MEDIA = 6
  static FETCH_MEDIA_FAIL = 7
  static FETCH_MEDIA_RETRY = 8
  static FETCH_MEDIA_OK = 9

  static FETCH_TRANS_SKIP = 9
  static FETCH_TRANS = 10

  static FETCH_TRANS_FAIL = 11
  static FETCH_TRANS_RETRY = 12

  static FETCH_TRANS_OK = 13

  static FINISHED = 14
  static INTERUPTED = 15

  static toStr(state) {
    const strs = [
      "INIT",

      "FETCH_META",

      "FETCH_META_FAIL",
      "FETCH_META_RETRY",
      "FETCH_META_OK",

      "FETCH_MEDIA_SKIP",
      "FETCH_MEDIA",
      "FETCH_MEDIA_FAIL",
      "FETCH_MEDIA_RETRY",
      "FETCH_MEDIA_OK",

      "FETCH_TRANS_SKIP",
      "FETCH_TRANS",
      "FETCH_TRANS_FAIL",
      "FETCH_TRANS_RETRY",
      "FETCH_TRANS_OK",

      "FINISHED",
      "INTERUPTED",
    ];
    if (typeof strs[state] != "undefined") {
      return strs[state]
    }
    return `${state} : Unknown`
  }
}
class QueueItem {
  state = QueueState.INIT
  // loaded=null
  // size=null
  idx = null
  // percentage=null
  constructor(idx, state) {
    this.state = state;
    this.idx = idx;
  }
  setState(state) {
    this.state = state;
  }

  // setSize(size){
  //     this.size = size
  // }

  // setLoaded(loaded){
  //     this.loaded = loaded
  //     this.percentage = Math.floor(this.loaded / this.size * 100)

  // }

  // setPercentage(percentage){
  //     this.percentage = percentage
  // }
}
class Queue {
  static clone(instance) {
    const keys = Object.keys(instance.items);
    const copyObj = new Queue();
    keys.map((k, i) => {
      const item = instance.items[k];
      copyObj.enqueue(item);
    });
    return copyObj
  }
  constructor() {
    this.items = [];
  }
  // enqueue function
  enqueue(element) {
    // adding element to the queue
    this.items.push(element);
  }

  // dequeue function
  dequeue() {
    // removing element from the queue
    // returns underflow when called
    // on empty queue
    if (this.isEmpty()) return "underflow"
    return this.items.shift()
  }

  // peek function
  peek() {
    // returns the Front element of
    // the queue without removing it.
    if (this.isEmpty()) return "no_elements_in_queue"
    return this.items[0]
  }
  // isEmpty function
  isEmpty() {
    // return true if the queue is empty.
    return this.items.length == 0
  }
  // printQueue function
  printQueue() {
    let str = "";
    for (var i = 0; i < this.items.length; i++) str += this.items[i] + " ";
    return str
  }
}
class QueueData {
  course = null
  tocs = null
  tocArr = []
  sections = null
  vidx = {}
  pkIdxMaps = {}
  defaultQueue = null
  constructor(sections, tocs, course) {
    this.sections = sections;
    this.tocs = tocs;
    this.course = course;
    this.defaultQueue = new Queue();
    this.buildQueue();
  }

  buildQueue() {
    let sidx = 0;
    let midx = 0;
    if (this.sections) {
      for (const section of this.sections) {
        let tidx = 0;
        for (const toc of this.tocs[section.slug]) {
          const pk = toc.id;
          this.tocArr.push(toc);
          const pkIdx = `pk-${pk}`;
          const vidxKey = `v-${sidx}-${tidx}`;
          this.pkIdxMaps[pkIdx] = midx;
          this.vidx[vidxKey] = midx;
          this.defaultQueue.enqueue(new QueueItem(midx, QueueState.INIT));
          tidx += 1;
          midx += 1;
        }
        sidx += 1;
      }
    }
  }

  getByVidx(sidx, tidx) {
    const vidxKey = `v-${sidx}-${tidx}`;
    const midx = this.vidx[vidxKey];
    return this.tocArr[midx]
  }
  getByPkIdx(pk) {
    const pkIdx = `pk-${pk}`;
    const midx = this.pkIdxMaps[pkIdx];
    return this.tocArr[midx]
  }
  getByIdx(idx) {
    return this.tocArr[idx]
  }
  cloneQueue() {
    return Queue.clone(this.defaultQueue)
  }

  getTocArr() {
    return this.tocArr
  }
  pk2Idx(pk) {
    const pkIdx = `pk-${pk}`;
    const midx = this.pkIdxMaps[pkIdx];
    return midx
  }
  getQueueItem(idx) {
    return this.defaultQueue.items[idx]
  }
}

class QState extends DB {
  table = "qstate"
  fields = [
    "courseId",
    "tocId",
    "idx",
    "state",
    "result",
    "mState",
    "mResult",
    "mLoaded",
    "mSize",
    "tState",
    "tResult",
    "tLoaded",
    "tSize",
    "dtStart",
    "dtEnd",
  ]
  type = "collection"
  async deleteByCourseId(courseId) {
    await this.deleteRows({ courseId });
  }
  getListWithCourse() {
    const mCourse = Course.gotInstance();
    let results = this.db.queryAll(this.table);
    results = results.map((item) => {
      try {
        item.course = mCourse.getById(item.courseId).title;
      } catch (e) {}
      const state = QueueState.toStr(item.state);
      const mState = QueueState.toStr(item.mState);
      const tState = QueueState.toStr(item.tState);

      const result = QueueResult.toStr(item.result);
      const mResult = QueueResult.toStr(item.mResult);
      const tResult = QueueResult.toStr(item.tResult);
      item.state = `[${state},${mState},${tState}]`;
      item.result = `[${result},${mResult},${tResult}]`;

      const mLoaded = item.tLoaded;
      const tLoaded = item.tLoaded;
      const mSize = item.mSize;
      const tSize = item.tSize;

      item.size = `[${mLoaded},${mSize},${tLoaded},${tSize}]`;
      return item
    });
    return results
  }
  getRow(courseId, tocId, idx) {
    return this.singleQuery({ query: { courseId, tocId, idx } })
  }
  getByTocId(tocId) {
    return this.singleQuery({ query: { tocId } })
  }
  getListByCourseId(courseId) {
    return this.query({ query: { courseId } })
  }
  getById(id) {
    return this.singleQuery({ query: { id } })
  }
  async deleteByCourseId(courseId) {
    await this.deleteRows({ courseId });
  }

  async create(courseId, tocId, idx, state, result = 0) {
    let row = this.getRow(courseId, tocId, idx);
    if (!row) {
      const tState = 0;
      const mState = 0;
      const mResult = 0;
      const tResult = 0;
      const mLoaded = 0;
      const mSize = 0;
      const tLoaded = 0;
      const tSize = 0;

      row = {
        courseId,
        tocId,
        idx,
        state,
        result,
        mState,
        mResult,
        tState,
        tResult,
        mLoaded,
        mSize,
        tLoaded,
        tSize,
      };

      row.id = this.db.insert(this.table, row);
      await this.db.commit();
    } else {
      console.error(`${this.constructor.name}.create() rowExist`);
    }

    return row
  }
  async update(id, row_) {
    let record = this.getById(id);
    if (record) {
      this.db.update(this.table, { id }, (row) => {
        for (let k in row_) {
          row[k] = row_[k];
          record[k] = row_[k];
        }
        return row
      });
      await this.db.commit();
    }

    return record
  }
  async updateRow(courseId, tocId, idx, row) {
    let record = this.getRow(courseId, tocId, idx);
    if (record) {
      record = await this.update(record.id, row);
    }
    return record
  }
  async updateState(id, state) {
    let record = this.getById(id);
    if (record) {
      record = await this.update(id, { state });
    }
    return record
  }
  async updateTState(id, tState) {
    let record = this.getById(id);
    if (record) {
      record = await this.update(id, { tState });
    }
    return record
  }
  async updateMState(id, mState) {
    let record = this.getById(id);
    if (record) {
      record = await this.update(id, { mState });
    }
    return record
  }
  async updateResult(id, result) {
    let record = this.getById(id);
    if (record) {
      record = await this.update(id, { result });
    }
    return record
  }
  async updateMResult(id, mResult) {
    let record = this.getById(id);
    if (record) {
      record = await this.update(id, { mResult });
    }
    return record
  }
  async updateTResult(id, tResult) {
    let record = this.getById(id);
    if (record) {
      record = await this.update(id, { tResult });
    }
    return record
  }
  async updateMLoaded(id, mLoaded) {
    let record = this.getById(id);
    if (record) {
      record = await this.update(id, { mLoaded });
    }
    return record
  }
  async updateMSize(id, mSize, mLoaded = null) {
    let record = this.getById(id);
    if (record) {
      if (!mLoaded) {
        mLoaded = record.mLoaded;
      }
      record = await this.update(id, { mSize, mLoaded });
    }
    return record
  }
  async updateTLoaded(id, tLoaded) {
    let record = this.getById(id);
    if (record) {
      record = await this.update(id, { tLoaded });
    }
    return record
  }
  async updateTSize(id, tSize, tLoaded = null) {
    let record = this.getById(id);
    if (record) {
      if (!tLoaded) {
        tLoaded = record.tLoaded;
      }
      record = await this.update(id, { tSize, tLoaded });
    }
    return record
  }
  isFinished(tocId) {
    const record = this.getByTocId(tocId);
    if (!record) {
      return false
    }

    return record.result === QueueResult.SUCCESS
  }

  getResult(tocId) {
    const record = this.getByTocId(tocId);
    if (!record) {
      return null
    }

    return record.result
  }
  getTResult(tocId) {
    const record = this.getByTocId(tocId);
    if (!record) {
      return null
    }

    return record.tResult
  }
  getMResult(tocId) {
    const record = this.getByTocId(tocId);
    if (!record) {
      return null
    }

    return record.mResult
  }
}

class Store {
  mApp = null
  mAuthor = null
  mCourse = null
  // mDownload = null
  // mDownloadConfig = null
  // mDownloadState = null
  mExerciseFile = null
  mSection = null
  mStreamLocation = null
  mToc = null
  mDB = null
  mMessage = null
  mDMSetup = null
  mDMStatus = null
  mTranscript = null
  mPrxCache = null
  mQState = null

  /**
   * List of model class names that the Store will initialize instances of.
   * These model classes will have singleton instances assigned to similarly
   * named properties on the Store instance (e.g. mDB, mApp etc.)
   */
  availables = [
    "DB",
    "App",
    "Author",
    "Course",
    // "Download",
    // "DownloadConfig",
    // "DownloadState",
    "ExerciseFile",
    "Section",
    "StreamLocation",
    "Toc",
    "Message",
    "QState",
    "DMSetup",
    "DMStatus",
    // "Cookie",
    "Transcript",
    "PrxCache",
    "Thumbnail",
  ]

  static instance = null

  constructor() {}

  /**
   * Initializes all model instances and calls the callback when ready.
   *
   * Gets singleton instances for each model class using getInstance(), assigns them
   * to properties like mDB, mApp etc., calls init() on mApp, and calls the callback
   * when complete.
   *
   * This allows consumer code to wait for all models to initialize before continuing.
   */
  async ready(callback) {
    this.mDB = await DB.getInstance();
    this.mApp = await App.getInstance();
    this.mAuthor = await Author.getInstance();
    this.mCourse = await Course.getInstance();
    // this.mDownload = await Download.getInstance()
    // this.mDownloadConfig = await DownloadConfig.getInstance()
    // this.mDownloadState = await DownloadState.getInstance()
    this.mExerciseFile = await ExerciseFile.getInstance();
    this.mSection = await Section.getInstance();
    this.mStreamLocation = await StreamLocation.getInstance();
    this.mToc = await Toc.getInstance();
    this.mMessage = await Message.getInstance();
    this.mDMSetup = await DMSetup.getInstance();
    this.mDMStatus = await DMStatus.getInstance();
    // this.mCookie = await Cookie.getInstance()
    this.mTranscript = await Transcript.getInstance();
    this.mPrxCache = PrxCache.getInstance();
    this.mThumbnail = await Thumbnail.getInstance();
    this.mQState = await QState.getInstance();
    await this.mApp.init();
    callback();
  }

  /**
   * Get singleton instance of Store
   * Checks if static instance property is already initialized
   * If not initialized, creates new instance of Store and assigns to static property
   * Returns static instance property
   */
  static getInstance() {
    if (Store.instance instanceof Store) ; else {
      Store.instance = new Store();
    }
    return Store.instance
  }
  async reload() {
    await DB.connection.reload();
  }
  /**
   * Get model instance from store
   * @param {string} model - Model name
   * @returns Model instance if found, null if not found
   */
  get(model) {
    if (this.availables.includes(model)) {
      const prop = `m${model}`;
      return this[prop]
    }
    // console.error(`Store.get() ${model} is not available`)
    return null
  }

  async getStorageSize(model = null, table = null) {
    return new Promise((resolve, reject) => {
      if (model) {
        if (!model.useIndexedDb) {
          DB.connection.getDataSize(table, (size) => resolve(size));
        } else {
          DBIndexed.connection.getDataSize(table, (size) => resolve(size));
        }
      } else {
        DB.connection.getDataSize(null, (size) => {
          DBIndexed.connection.getDataSize(null, (size2) => resolve(size + size2));
        });
      }
    })
  }
  getCounts(model, table) {
    if (!model.useIndexedDb) {
      return DB.connection.getTableCounts(table)
    } else {
      return DBIndexed.connection.getTableCounts(table)
    }
  }
}

/**
 * @remix-run/router v1.21.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends$2() {
  _extends$2 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$2.apply(this, arguments);
}
var Action;
(function(Action2) {
  Action2["Pop"] = "POP";
  Action2["Push"] = "PUSH";
  Action2["Replace"] = "REPLACE";
})(Action || (Action = {}));
const PopStateEventType = "popstate";
function createHashHistory(options) {
  if (options === undefined) {
    options = {};
  }
  function createHashLocation(window2, globalHistory) {
    let {
      pathname = "/",
      search = "",
      hash = ""
    } = parsePath(window2.location.hash.substr(1));
    if (!pathname.startsWith("/") && !pathname.startsWith(".")) {
      pathname = "/" + pathname;
    }
    return createLocation(
      "",
      {
        pathname,
        search,
        hash
      },
      // state defaults to `null` because `window.history.state` does
      globalHistory.state && globalHistory.state.usr || null,
      globalHistory.state && globalHistory.state.key || "default"
    );
  }
  function createHashHref(window2, to) {
    let base = window2.document.querySelector("base");
    let href = "";
    if (base && base.getAttribute("href")) {
      let url = window2.location.href;
      let hashIndex = url.indexOf("#");
      href = hashIndex === -1 ? url : url.slice(0, hashIndex);
    }
    return href + "#" + (typeof to === "string" ? to : createPath(to));
  }
  function validateHashLocation(location, to) {
    warning(location.pathname.charAt(0) === "/", "relative pathnames are not supported in hash history.push(" + JSON.stringify(to) + ")");
  }
  return getUrlBasedHistory(createHashLocation, createHashHref, validateHashLocation, options);
}
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index
  };
}
function createLocation(current, to, state, key) {
  if (state === undefined) {
    state = null;
  }
  let location = _extends$2({
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: ""
  }, typeof to === "string" ? parsePath(to) : to, {
    state,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: to && to.key || key || createKey()
  });
  return location;
}
function createPath(_ref) {
  let {
    pathname = "/",
    search = "",
    hash = ""
  } = _ref;
  if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref, validateLocation, options) {
  if (options === undefined) {
    options = {};
  }
  let {
    window: window2 = document.defaultView,
    v5Compat = false
  } = options;
  let globalHistory = window2.history;
  let action = Action.Pop;
  let listener = null;
  let index = getIndex();
  if (index == null) {
    index = 0;
    globalHistory.replaceState(_extends$2({}, globalHistory.state, {
      idx: index
    }), "");
  }
  function getIndex() {
    let state = globalHistory.state || {
      idx: null
    };
    return state.idx;
  }
  function handlePop() {
    action = Action.Pop;
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({
        action,
        location: history.location,
        delta
      });
    }
  }
  function push(to, state) {
    action = Action.Push;
    let location = createLocation(history.location, to, state);
    validateLocation(location, to);
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      window2.location.assign(url);
    }
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 1
      });
    }
  }
  function replace2(to, state) {
    action = Action.Replace;
    let location = createLocation(history.location, to, state);
    validateLocation(location, to);
    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 0
      });
    }
  }
  function createURL(to) {
    let base = window2.location.origin !== "null" ? window2.location.origin : window2.location.href;
    let href = typeof to === "string" ? to : createPath(to);
    href = href.replace(/ $/, "%20");
    invariant(base, "No window.location.(origin|href) available to create URL for href: " + href);
    return new URL(href, base);
  }
  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window2, globalHistory);
    },
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window2.addEventListener(PopStateEventType, handlePop);
      listener = fn;
      return () => {
        window2.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref(window2, to);
    },
    createURL,
    encodeLocation(to) {
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    },
    push,
    replace: replace2,
    go(n) {
      return globalHistory.go(n);
    }
  };
  return history;
}
var ResultType;
(function(ResultType2) {
  ResultType2["data"] = "data";
  ResultType2["deferred"] = "deferred";
  ResultType2["redirect"] = "redirect";
  ResultType2["error"] = "error";
})(ResultType || (ResultType = {}));
const immutableRouteKeys = /* @__PURE__ */ new Set(["lazy", "caseSensitive", "path", "id", "index", "children"]);
function isIndexRoute(route) {
  return route.index === true;
}
function convertRoutesToDataRoutes(routes, mapRouteProperties, parentPath, manifest) {
  if (parentPath === undefined) {
    parentPath = [];
  }
  if (manifest === undefined) {
    manifest = {};
  }
  return routes.map((route, index) => {
    let treePath = [...parentPath, String(index)];
    let id = typeof route.id === "string" ? route.id : treePath.join("-");
    invariant(route.index !== true || !route.children, "Cannot specify children on an index route");
    invariant(!manifest[id], 'Found a route id collision on id "' + id + `".  Route id's must be globally unique within Data Router usages`);
    if (isIndexRoute(route)) {
      let indexRoute = _extends$2({}, route, mapRouteProperties(route), {
        id
      });
      manifest[id] = indexRoute;
      return indexRoute;
    } else {
      let pathOrLayoutRoute = _extends$2({}, route, mapRouteProperties(route), {
        id,
        children: undefined
      });
      manifest[id] = pathOrLayoutRoute;
      if (route.children) {
        pathOrLayoutRoute.children = convertRoutesToDataRoutes(route.children, mapRouteProperties, treePath, manifest);
      }
      return pathOrLayoutRoute;
    }
  });
}
function matchRoutes(routes, locationArg, basename) {
  if (basename === undefined) {
    basename = "/";
  }
  return matchRoutesImpl(routes, locationArg, basename, false);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial) {
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    let decoded = decodePath(pathname);
    matches = matchRouteBranch(branches[i], decoded, allowPartial);
  }
  return matches;
}
function convertRouteMatchToUiMatch(match, loaderData) {
  let {
    route,
    pathname,
    params
  } = match;
  return {
    id: route.id,
    pathname,
    params,
    data: loaderData[route.id],
    handle: route.handle
  };
}
function flattenRoutes(routes, branches, parentsMeta, parentPath) {
  if (branches === undefined) {
    branches = [];
  }
  if (parentsMeta === undefined) {
    parentsMeta = [];
  }
  if (parentPath === undefined) {
    parentPath = "";
  }
  let flattenRoute = (route, index, relativePath) => {
    let meta = {
      relativePath: relativePath === undefined ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      invariant(meta.relativePath.startsWith(parentPath), 'Absolute route path "' + meta.relativePath + '" nested under path ' + ('"' + parentPath + '" is not valid. An absolute child route path ') + "must start with the combined path of all its parent routes.");
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    if (route.children && route.children.length > 0) {
      invariant(
        // Our types know better, but runtime JS may not!
        // @ts-expect-error
        route.index !== true,
        "Index routes must not have child routes. Please remove " + ('all child routes from route path "' + path + '".')
      );
      flattenRoutes(route.children, branches, routesMeta, path);
    }
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes.forEach((route, index) => {
    var _route$path;
    if (route.path === "" || !((_route$path = route.path) != null && _route$path.includes("?"))) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, exploded);
      }
    }
  });
  return branches;
}
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0) return [];
  let [first, ...rest] = segments;
  let isOptional = first.endsWith("?");
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  result.push(...restExploded.map((subpath) => subpath === "" ? required : [required, subpath].join("/")));
  if (isOptional) {
    result.push(...restExploded);
  }
  return result.map((exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded);
}
function rankRouteBranches(branches) {
  branches.sort((a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(a.routesMeta.map((meta) => meta.childrenIndex), b.routesMeta.map((meta) => meta.childrenIndex)));
}
const paramRe = /^:[\w-]+$/;
const dynamicSegmentValue = 3;
const indexRouteValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = (s) => s === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter((s) => !isSplat(s)).reduce((score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue), initialScore);
}
function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a[a.length - 1] - b[b.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function matchRouteBranch(branch, pathname, allowPartial) {
  if (allowPartial === undefined) {
    allowPartial = false;
  }
  let {
    routesMeta
  } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath({
      path: meta.relativePath,
      caseSensitive: meta.caseSensitive,
      end
    }, remainingPathname);
    let route = meta.route;
    if (!match && end && allowPartial && !routesMeta[routesMeta.length - 1].route.index) {
      match = matchPath({
        path: meta.relativePath,
        caseSensitive: meta.caseSensitive,
        end: false
      }, remainingPathname);
    }
    if (!match) {
      return null;
    }
    Object.assign(matchedParams, match.params);
    matches.push({
      // TODO: Can this as be avoided?
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = {
      path: pattern,
      caseSensitive: false,
      end: true
    };
  }
  let [matcher, compiledParams] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce((memo, _ref, index) => {
    let {
      paramName,
      isOptional
    } = _ref;
    if (paramName === "*") {
      let splatValue = captureGroups[index] || "";
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
    }
    const value = captureGroups[index];
    if (isOptional && !value) {
      memo[paramName] = undefined;
    } else {
      memo[paramName] = (value || "").replace(/%2F/g, "/");
    }
    return memo;
  }, {});
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive, end) {
  if (caseSensitive === undefined) {
    caseSensitive = false;
  }
  if (end === undefined) {
    end = true;
  }
  warning(path === "*" || !path.endsWith("*") || path.endsWith("/*"), 'Route path "' + path + '" will be treated as if it were ' + ('"' + path.replace(/\*$/, "/*") + '" because the `*` character must ') + "always follow a `/` in the pattern. To get rid of this warning, " + ('please change the route path to "' + path.replace(/\*$/, "/*") + '".'));
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (_, paramName, isOptional) => {
    params.push({
      paramName,
      isOptional: isOptional != null
    });
    return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
  });
  if (path.endsWith("*")) {
    params.push({
      paramName: "*"
    });
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else ;
  let matcher = new RegExp(regexpSource, caseSensitive ? undefined : "i");
  return [matcher, params];
}
function decodePath(value) {
  try {
    return value.split("/").map((v) => decodeURIComponent(v).replace(/\//g, "%2F")).join("/");
  } catch (error) {
    warning(false, 'The URL path "' + value + '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' + ("encoding (" + error + ")."));
    return value;
  }
}
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
function resolvePath(to, fromPathname) {
  if (fromPathname === undefined) {
    fromPathname = "/";
  }
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname = toPathname ? toPathname.startsWith("/") ? toPathname : resolvePathname(toPathname, fromPathname) : fromPathname;
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return "Cannot include a '" + char + "' character in a manually specified " + ("`to." + field + "` field [" + JSON.stringify(path) + "].  Please separate it out to the ") + ("`to." + dest + "` field. Alternatively you may provide the full path as ") + 'a string in <Link to="..."> and the router will parse it for you.';
}
function getPathContributingMatches(matches) {
  return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0);
}
function getResolveToMatches(matches, v7_relativeSplatPath) {
  let pathMatches = getPathContributingMatches(matches);
  if (v7_relativeSplatPath) {
    return pathMatches.map((match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase);
  }
  return pathMatches.map((match) => match.pathnameBase);
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative) {
  if (isPathRelative === undefined) {
    isPathRelative = false;
  }
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = _extends$2({}, toArg);
    invariant(!to.pathname || !to.pathname.includes("?"), getInvalidPathError("?", "pathname", "search", to));
    invariant(!to.pathname || !to.pathname.includes("#"), getInvalidPathError("#", "pathname", "hash", to));
    invariant(!to.search || !to.search.includes("#"), getInvalidPathError("#", "search", "hash", to));
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (!isPathRelative && toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
const joinPaths = (paths) => paths.join("/").replace(/\/\/+/g, "/");
const normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
const normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
const normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
class ErrorResponseImpl {
  constructor(status, statusText, data2, internal) {
    if (internal === undefined) {
      internal = false;
    }
    this.status = status;
    this.statusText = statusText || "";
    this.internal = internal;
    if (data2 instanceof Error) {
      this.data = data2.toString();
      this.error = data2;
    } else {
      this.data = data2;
    }
  }
}
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
const validMutationMethodsArr = ["post", "put", "patch", "delete"];
const validMutationMethods = new Set(validMutationMethodsArr);
const validRequestMethodsArr = ["get", ...validMutationMethodsArr];
const validRequestMethods = new Set(validRequestMethodsArr);
const redirectStatusCodes = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
const redirectPreserveMethodStatusCodes = /* @__PURE__ */ new Set([307, 308]);
const IDLE_NAVIGATION = {
  state: "idle",
  location: undefined,
  formMethod: undefined,
  formAction: undefined,
  formEncType: undefined,
  formData: undefined,
  json: undefined,
  text: undefined
};
const IDLE_FETCHER = {
  state: "idle",
  data: undefined,
  formMethod: undefined,
  formAction: undefined,
  formEncType: undefined,
  formData: undefined,
  json: undefined,
  text: undefined
};
const IDLE_BLOCKER = {
  state: "unblocked",
  proceed: undefined,
  reset: undefined,
  location: undefined
};
const ABSOLUTE_URL_REGEX$1 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const defaultMapRouteProperties = (route) => ({
  hasErrorBoundary: Boolean(route.hasErrorBoundary)
});
const TRANSITIONS_STORAGE_KEY = "remix-router-transitions";
function createRouter(init) {
  const routerWindow = init.window ? init.window : typeof window !== "undefined" ? window : undefined;
  const isBrowser = typeof routerWindow !== "undefined" && typeof routerWindow.document !== "undefined" && typeof routerWindow.document.createElement !== "undefined";
  const isServer = !isBrowser;
  invariant(init.routes.length > 0, "You must provide a non-empty routes array to createRouter");
  let mapRouteProperties;
  if (init.mapRouteProperties) {
    mapRouteProperties = init.mapRouteProperties;
  } else if (init.detectErrorBoundary) {
    let detectErrorBoundary = init.detectErrorBoundary;
    mapRouteProperties = (route) => ({
      hasErrorBoundary: detectErrorBoundary(route)
    });
  } else {
    mapRouteProperties = defaultMapRouteProperties;
  }
  let manifest = {};
  let dataRoutes = convertRoutesToDataRoutes(init.routes, mapRouteProperties, undefined, manifest);
  let inFlightDataRoutes;
  let basename = init.basename || "/";
  let dataStrategyImpl = init.dataStrategy || defaultDataStrategy;
  let patchRoutesOnNavigationImpl = init.patchRoutesOnNavigation;
  let future = _extends$2({
    v7_fetcherPersist: false,
    v7_normalizeFormMethod: false,
    v7_partialHydration: false,
    v7_prependBasename: false,
    v7_relativeSplatPath: false,
    v7_skipActionErrorRevalidation: false
  }, init.future);
  let unlistenHistory = null;
  let subscribers = /* @__PURE__ */ new Set();
  let savedScrollPositions = null;
  let getScrollRestorationKey = null;
  let getScrollPosition = null;
  let initialScrollRestored = init.hydrationData != null;
  let initialMatches = matchRoutes(dataRoutes, init.history.location, basename);
  let initialErrors = null;
  if (initialMatches == null && !patchRoutesOnNavigationImpl) {
    let error = getInternalRouterError(404, {
      pathname: init.history.location.pathname
    });
    let {
      matches,
      route
    } = getShortCircuitMatches(dataRoutes);
    initialMatches = matches;
    initialErrors = {
      [route.id]: error
    };
  }
  if (initialMatches && !init.hydrationData) {
    let fogOfWar = checkFogOfWar(initialMatches, dataRoutes, init.history.location.pathname);
    if (fogOfWar.active) {
      initialMatches = null;
    }
  }
  let initialized;
  if (!initialMatches) {
    initialized = false;
    initialMatches = [];
    if (future.v7_partialHydration) {
      let fogOfWar = checkFogOfWar(null, dataRoutes, init.history.location.pathname);
      if (fogOfWar.active && fogOfWar.matches) {
        initialMatches = fogOfWar.matches;
      }
    }
  } else if (initialMatches.some((m) => m.route.lazy)) {
    initialized = false;
  } else if (!initialMatches.some((m) => m.route.loader)) {
    initialized = true;
  } else if (future.v7_partialHydration) {
    let loaderData = init.hydrationData ? init.hydrationData.loaderData : null;
    let errors = init.hydrationData ? init.hydrationData.errors : null;
    if (errors) {
      let idx = initialMatches.findIndex((m) => errors[m.route.id] !== undefined);
      initialized = initialMatches.slice(0, idx + 1).every((m) => !shouldLoadRouteOnHydration(m.route, loaderData, errors));
    } else {
      initialized = initialMatches.every((m) => !shouldLoadRouteOnHydration(m.route, loaderData, errors));
    }
  } else {
    initialized = init.hydrationData != null;
  }
  let router;
  let state = {
    historyAction: init.history.action,
    location: init.history.location,
    matches: initialMatches,
    initialized,
    navigation: IDLE_NAVIGATION,
    // Don't restore on initial updateState() if we were SSR'd
    restoreScrollPosition: init.hydrationData != null ? false : null,
    preventScrollReset: false,
    revalidation: "idle",
    loaderData: init.hydrationData && init.hydrationData.loaderData || {},
    actionData: init.hydrationData && init.hydrationData.actionData || null,
    errors: init.hydrationData && init.hydrationData.errors || initialErrors,
    fetchers: /* @__PURE__ */ new Map(),
    blockers: /* @__PURE__ */ new Map()
  };
  let pendingAction = Action.Pop;
  let pendingPreventScrollReset = false;
  let pendingNavigationController;
  let pendingViewTransitionEnabled = false;
  let appliedViewTransitions = /* @__PURE__ */ new Map();
  let removePageHideEventListener = null;
  let isUninterruptedRevalidation = false;
  let isRevalidationRequired = false;
  let cancelledDeferredRoutes = [];
  let cancelledFetcherLoads = /* @__PURE__ */ new Set();
  let fetchControllers = /* @__PURE__ */ new Map();
  let incrementingLoadId = 0;
  let pendingNavigationLoadId = -1;
  let fetchReloadIds = /* @__PURE__ */ new Map();
  let fetchRedirectIds = /* @__PURE__ */ new Set();
  let fetchLoadMatches = /* @__PURE__ */ new Map();
  let activeFetchers = /* @__PURE__ */ new Map();
  let deletedFetchers = /* @__PURE__ */ new Set();
  let activeDeferreds = /* @__PURE__ */ new Map();
  let blockerFunctions = /* @__PURE__ */ new Map();
  let unblockBlockerHistoryUpdate = undefined;
  function initialize() {
    unlistenHistory = init.history.listen((_ref) => {
      let {
        action: historyAction,
        location,
        delta
      } = _ref;
      if (unblockBlockerHistoryUpdate) {
        unblockBlockerHistoryUpdate();
        unblockBlockerHistoryUpdate = undefined;
        return;
      }
      warning(blockerFunctions.size === 0 || delta != null, "You are trying to use a blocker on a POP navigation to a location that was not created by @remix-run/router. This will fail silently in production. This can happen if you are navigating outside the router via `window.history.pushState`/`window.location.hash` instead of using router navigation APIs.  This can also happen if you are using createHashRouter and the user manually changes the URL.");
      let blockerKey = shouldBlockNavigation({
        currentLocation: state.location,
        nextLocation: location,
        historyAction
      });
      if (blockerKey && delta != null) {
        let nextHistoryUpdatePromise = new Promise((resolve) => {
          unblockBlockerHistoryUpdate = resolve;
        });
        init.history.go(delta * -1);
        updateBlocker(blockerKey, {
          state: "blocked",
          location,
          proceed() {
            updateBlocker(blockerKey, {
              state: "proceeding",
              proceed: undefined,
              reset: undefined,
              location
            });
            nextHistoryUpdatePromise.then(() => init.history.go(delta));
          },
          reset() {
            let blockers = new Map(state.blockers);
            blockers.set(blockerKey, IDLE_BLOCKER);
            updateState({
              blockers
            });
          }
        });
        return;
      }
      return startNavigation(historyAction, location);
    });
    if (isBrowser) {
      restoreAppliedTransitions(routerWindow, appliedViewTransitions);
      let _saveAppliedTransitions = () => persistAppliedTransitions(routerWindow, appliedViewTransitions);
      routerWindow.addEventListener("pagehide", _saveAppliedTransitions);
      removePageHideEventListener = () => routerWindow.removeEventListener("pagehide", _saveAppliedTransitions);
    }
    if (!state.initialized) {
      startNavigation(Action.Pop, state.location, {
        initialHydration: true
      });
    }
    return router;
  }
  function dispose() {
    if (unlistenHistory) {
      unlistenHistory();
    }
    if (removePageHideEventListener) {
      removePageHideEventListener();
    }
    subscribers.clear();
    pendingNavigationController && pendingNavigationController.abort();
    state.fetchers.forEach((_, key) => deleteFetcher(key));
    state.blockers.forEach((_, key) => deleteBlocker(key));
  }
  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }
  function updateState(newState, opts) {
    if (opts === undefined) {
      opts = {};
    }
    state = _extends$2({}, state, newState);
    let completedFetchers = [];
    let deletedFetchersKeys = [];
    if (future.v7_fetcherPersist) {
      state.fetchers.forEach((fetcher, key) => {
        if (fetcher.state === "idle") {
          if (deletedFetchers.has(key)) {
            deletedFetchersKeys.push(key);
          } else {
            completedFetchers.push(key);
          }
        }
      });
    }
    [...subscribers].forEach((subscriber) => subscriber(state, {
      deletedFetchers: deletedFetchersKeys,
      viewTransitionOpts: opts.viewTransitionOpts,
      flushSync: opts.flushSync === true
    }));
    if (future.v7_fetcherPersist) {
      completedFetchers.forEach((key) => state.fetchers.delete(key));
      deletedFetchersKeys.forEach((key) => deleteFetcher(key));
    }
  }
  function completeNavigation(location, newState, _temp) {
    var _location$state, _location$state2;
    let {
      flushSync
    } = _temp === undefined ? {} : _temp;
    let isActionReload = state.actionData != null && state.navigation.formMethod != null && isMutationMethod(state.navigation.formMethod) && state.navigation.state === "loading" && ((_location$state = location.state) == null ? undefined : _location$state._isRedirect) !== true;
    let actionData;
    if (newState.actionData) {
      if (Object.keys(newState.actionData).length > 0) {
        actionData = newState.actionData;
      } else {
        actionData = null;
      }
    } else if (isActionReload) {
      actionData = state.actionData;
    } else {
      actionData = null;
    }
    let loaderData = newState.loaderData ? mergeLoaderData(state.loaderData, newState.loaderData, newState.matches || [], newState.errors) : state.loaderData;
    let blockers = state.blockers;
    if (blockers.size > 0) {
      blockers = new Map(blockers);
      blockers.forEach((_, k) => blockers.set(k, IDLE_BLOCKER));
    }
    let preventScrollReset = pendingPreventScrollReset === true || state.navigation.formMethod != null && isMutationMethod(state.navigation.formMethod) && ((_location$state2 = location.state) == null ? undefined : _location$state2._isRedirect) !== true;
    if (inFlightDataRoutes) {
      dataRoutes = inFlightDataRoutes;
      inFlightDataRoutes = undefined;
    }
    if (isUninterruptedRevalidation) ;
    else if (pendingAction === Action.Pop) ;
    else if (pendingAction === Action.Push) {
      init.history.push(location, location.state);
    } else if (pendingAction === Action.Replace) {
      init.history.replace(location, location.state);
    }
    let viewTransitionOpts;
    if (pendingAction === Action.Pop) {
      let priorPaths = appliedViewTransitions.get(state.location.pathname);
      if (priorPaths && priorPaths.has(location.pathname)) {
        viewTransitionOpts = {
          currentLocation: state.location,
          nextLocation: location
        };
      } else if (appliedViewTransitions.has(location.pathname)) {
        viewTransitionOpts = {
          currentLocation: location,
          nextLocation: state.location
        };
      }
    } else if (pendingViewTransitionEnabled) {
      let toPaths = appliedViewTransitions.get(state.location.pathname);
      if (toPaths) {
        toPaths.add(location.pathname);
      } else {
        toPaths = /* @__PURE__ */ new Set([location.pathname]);
        appliedViewTransitions.set(state.location.pathname, toPaths);
      }
      viewTransitionOpts = {
        currentLocation: state.location,
        nextLocation: location
      };
    }
    updateState(_extends$2({}, newState, {
      actionData,
      loaderData,
      historyAction: pendingAction,
      location,
      initialized: true,
      navigation: IDLE_NAVIGATION,
      revalidation: "idle",
      restoreScrollPosition: getSavedScrollPosition(location, newState.matches || state.matches),
      preventScrollReset,
      blockers
    }), {
      viewTransitionOpts,
      flushSync: flushSync === true
    });
    pendingAction = Action.Pop;
    pendingPreventScrollReset = false;
    pendingViewTransitionEnabled = false;
    isUninterruptedRevalidation = false;
    isRevalidationRequired = false;
    cancelledDeferredRoutes = [];
  }
  async function navigate(to, opts) {
    if (typeof to === "number") {
      init.history.go(to);
      return;
    }
    let normalizedPath = normalizeTo(state.location, state.matches, basename, future.v7_prependBasename, to, future.v7_relativeSplatPath, opts == null ? undefined : opts.fromRouteId, opts == null ? undefined : opts.relative);
    let {
      path,
      submission,
      error
    } = normalizeNavigateOptions(future.v7_normalizeFormMethod, false, normalizedPath, opts);
    let currentLocation = state.location;
    let nextLocation = createLocation(state.location, path, opts && opts.state);
    nextLocation = _extends$2({}, nextLocation, init.history.encodeLocation(nextLocation));
    let userReplace = opts && opts.replace != null ? opts.replace : undefined;
    let historyAction = Action.Push;
    if (userReplace === true) {
      historyAction = Action.Replace;
    } else if (userReplace === false) ;
    else if (submission != null && isMutationMethod(submission.formMethod) && submission.formAction === state.location.pathname + state.location.search) {
      historyAction = Action.Replace;
    }
    let preventScrollReset = opts && "preventScrollReset" in opts ? opts.preventScrollReset === true : undefined;
    let flushSync = (opts && opts.flushSync) === true;
    let blockerKey = shouldBlockNavigation({
      currentLocation,
      nextLocation,
      historyAction
    });
    if (blockerKey) {
      updateBlocker(blockerKey, {
        state: "blocked",
        location: nextLocation,
        proceed() {
          updateBlocker(blockerKey, {
            state: "proceeding",
            proceed: undefined,
            reset: undefined,
            location: nextLocation
          });
          navigate(to, opts);
        },
        reset() {
          let blockers = new Map(state.blockers);
          blockers.set(blockerKey, IDLE_BLOCKER);
          updateState({
            blockers
          });
        }
      });
      return;
    }
    return await startNavigation(historyAction, nextLocation, {
      submission,
      // Send through the formData serialization error if we have one so we can
      // render at the right error boundary after we match routes
      pendingError: error,
      preventScrollReset,
      replace: opts && opts.replace,
      enableViewTransition: opts && opts.viewTransition,
      flushSync
    });
  }
  function revalidate() {
    interruptActiveLoads();
    updateState({
      revalidation: "loading"
    });
    if (state.navigation.state === "submitting") {
      return;
    }
    if (state.navigation.state === "idle") {
      startNavigation(state.historyAction, state.location, {
        startUninterruptedRevalidation: true
      });
      return;
    }
    startNavigation(pendingAction || state.historyAction, state.navigation.location, {
      overrideNavigation: state.navigation,
      // Proxy through any rending view transition
      enableViewTransition: pendingViewTransitionEnabled === true
    });
  }
  async function startNavigation(historyAction, location, opts) {
    pendingNavigationController && pendingNavigationController.abort();
    pendingNavigationController = null;
    pendingAction = historyAction;
    isUninterruptedRevalidation = (opts && opts.startUninterruptedRevalidation) === true;
    saveScrollPosition(state.location, state.matches);
    pendingPreventScrollReset = (opts && opts.preventScrollReset) === true;
    pendingViewTransitionEnabled = (opts && opts.enableViewTransition) === true;
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let loadingNavigation = opts && opts.overrideNavigation;
    let matches = matchRoutes(routesToUse, location, basename);
    let flushSync = (opts && opts.flushSync) === true;
    let fogOfWar = checkFogOfWar(matches, routesToUse, location.pathname);
    if (fogOfWar.active && fogOfWar.matches) {
      matches = fogOfWar.matches;
    }
    if (!matches) {
      let {
        error,
        notFoundMatches,
        route
      } = handleNavigational404(location.pathname);
      completeNavigation(location, {
        matches: notFoundMatches,
        loaderData: {},
        errors: {
          [route.id]: error
        }
      }, {
        flushSync
      });
      return;
    }
    if (state.initialized && !isRevalidationRequired && isHashChangeOnly(state.location, location) && !(opts && opts.submission && isMutationMethod(opts.submission.formMethod))) {
      completeNavigation(location, {
        matches
      }, {
        flushSync
      });
      return;
    }
    pendingNavigationController = new AbortController();
    let request = createClientSideRequest(init.history, location, pendingNavigationController.signal, opts && opts.submission);
    let pendingActionResult;
    if (opts && opts.pendingError) {
      pendingActionResult = [findNearestBoundary(matches).route.id, {
        type: ResultType.error,
        error: opts.pendingError
      }];
    } else if (opts && opts.submission && isMutationMethod(opts.submission.formMethod)) {
      let actionResult = await handleAction(request, location, opts.submission, matches, fogOfWar.active, {
        replace: opts.replace,
        flushSync
      });
      if (actionResult.shortCircuited) {
        return;
      }
      if (actionResult.pendingActionResult) {
        let [routeId, result] = actionResult.pendingActionResult;
        if (isErrorResult(result) && isRouteErrorResponse(result.error) && result.error.status === 404) {
          pendingNavigationController = null;
          completeNavigation(location, {
            matches: actionResult.matches,
            loaderData: {},
            errors: {
              [routeId]: result.error
            }
          });
          return;
        }
      }
      matches = actionResult.matches || matches;
      pendingActionResult = actionResult.pendingActionResult;
      loadingNavigation = getLoadingNavigation(location, opts.submission);
      flushSync = false;
      fogOfWar.active = false;
      request = createClientSideRequest(init.history, request.url, request.signal);
    }
    let {
      shortCircuited,
      matches: updatedMatches,
      loaderData,
      errors
    } = await handleLoaders(request, location, matches, fogOfWar.active, loadingNavigation, opts && opts.submission, opts && opts.fetcherSubmission, opts && opts.replace, opts && opts.initialHydration === true, flushSync, pendingActionResult);
    if (shortCircuited) {
      return;
    }
    pendingNavigationController = null;
    completeNavigation(location, _extends$2({
      matches: updatedMatches || matches
    }, getActionDataForCommit(pendingActionResult), {
      loaderData,
      errors
    }));
  }
  async function handleAction(request, location, submission, matches, isFogOfWar, opts) {
    if (opts === undefined) {
      opts = {};
    }
    interruptActiveLoads();
    let navigation = getSubmittingNavigation(location, submission);
    updateState({
      navigation
    }, {
      flushSync: opts.flushSync === true
    });
    if (isFogOfWar) {
      let discoverResult = await discoverRoutes(matches, location.pathname, request.signal);
      if (discoverResult.type === "aborted") {
        return {
          shortCircuited: true
        };
      } else if (discoverResult.type === "error") {
        let boundaryId = findNearestBoundary(discoverResult.partialMatches).route.id;
        return {
          matches: discoverResult.partialMatches,
          pendingActionResult: [boundaryId, {
            type: ResultType.error,
            error: discoverResult.error
          }]
        };
      } else if (!discoverResult.matches) {
        let {
          notFoundMatches,
          error,
          route
        } = handleNavigational404(location.pathname);
        return {
          matches: notFoundMatches,
          pendingActionResult: [route.id, {
            type: ResultType.error,
            error
          }]
        };
      } else {
        matches = discoverResult.matches;
      }
    }
    let result;
    let actionMatch = getTargetMatch(matches, location);
    if (!actionMatch.route.action && !actionMatch.route.lazy) {
      result = {
        type: ResultType.error,
        error: getInternalRouterError(405, {
          method: request.method,
          pathname: location.pathname,
          routeId: actionMatch.route.id
        })
      };
    } else {
      let results = await callDataStrategy("action", state, request, [actionMatch], matches, null);
      result = results[actionMatch.route.id];
      if (request.signal.aborted) {
        return {
          shortCircuited: true
        };
      }
    }
    if (isRedirectResult(result)) {
      let replace2;
      if (opts && opts.replace != null) {
        replace2 = opts.replace;
      } else {
        let location2 = normalizeRedirectLocation(result.response.headers.get("Location"), new URL(request.url), basename);
        replace2 = location2 === state.location.pathname + state.location.search;
      }
      await startRedirectNavigation(request, result, true, {
        submission,
        replace: replace2
      });
      return {
        shortCircuited: true
      };
    }
    if (isDeferredResult(result)) {
      throw getInternalRouterError(400, {
        type: "defer-action"
      });
    }
    if (isErrorResult(result)) {
      let boundaryMatch = findNearestBoundary(matches, actionMatch.route.id);
      if ((opts && opts.replace) !== true) {
        pendingAction = Action.Push;
      }
      return {
        matches,
        pendingActionResult: [boundaryMatch.route.id, result]
      };
    }
    return {
      matches,
      pendingActionResult: [actionMatch.route.id, result]
    };
  }
  async function handleLoaders(request, location, matches, isFogOfWar, overrideNavigation, submission, fetcherSubmission, replace2, initialHydration, flushSync, pendingActionResult) {
    let loadingNavigation = overrideNavigation || getLoadingNavigation(location, submission);
    let activeSubmission = submission || fetcherSubmission || getSubmissionFromNavigation(loadingNavigation);
    let shouldUpdateNavigationState = !isUninterruptedRevalidation && (!future.v7_partialHydration || !initialHydration);
    if (isFogOfWar) {
      if (shouldUpdateNavigationState) {
        let actionData = getUpdatedActionData(pendingActionResult);
        updateState(_extends$2({
          navigation: loadingNavigation
        }, actionData !== undefined ? {
          actionData
        } : {}), {
          flushSync
        });
      }
      let discoverResult = await discoverRoutes(matches, location.pathname, request.signal);
      if (discoverResult.type === "aborted") {
        return {
          shortCircuited: true
        };
      } else if (discoverResult.type === "error") {
        let boundaryId = findNearestBoundary(discoverResult.partialMatches).route.id;
        return {
          matches: discoverResult.partialMatches,
          loaderData: {},
          errors: {
            [boundaryId]: discoverResult.error
          }
        };
      } else if (!discoverResult.matches) {
        let {
          error,
          notFoundMatches,
          route
        } = handleNavigational404(location.pathname);
        return {
          matches: notFoundMatches,
          loaderData: {},
          errors: {
            [route.id]: error
          }
        };
      } else {
        matches = discoverResult.matches;
      }
    }
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let [matchesToLoad, revalidatingFetchers] = getMatchesToLoad(init.history, state, matches, activeSubmission, location, future.v7_partialHydration && initialHydration === true, future.v7_skipActionErrorRevalidation, isRevalidationRequired, cancelledDeferredRoutes, cancelledFetcherLoads, deletedFetchers, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, pendingActionResult);
    cancelActiveDeferreds((routeId) => !(matches && matches.some((m) => m.route.id === routeId)) || matchesToLoad && matchesToLoad.some((m) => m.route.id === routeId));
    pendingNavigationLoadId = ++incrementingLoadId;
    if (matchesToLoad.length === 0 && revalidatingFetchers.length === 0) {
      let updatedFetchers2 = markFetchRedirectsDone();
      completeNavigation(location, _extends$2({
        matches,
        loaderData: {},
        // Commit pending error if we're short circuiting
        errors: pendingActionResult && isErrorResult(pendingActionResult[1]) ? {
          [pendingActionResult[0]]: pendingActionResult[1].error
        } : null
      }, getActionDataForCommit(pendingActionResult), updatedFetchers2 ? {
        fetchers: new Map(state.fetchers)
      } : {}), {
        flushSync
      });
      return {
        shortCircuited: true
      };
    }
    if (shouldUpdateNavigationState) {
      let updates = {};
      if (!isFogOfWar) {
        updates.navigation = loadingNavigation;
        let actionData = getUpdatedActionData(pendingActionResult);
        if (actionData !== undefined) {
          updates.actionData = actionData;
        }
      }
      if (revalidatingFetchers.length > 0) {
        updates.fetchers = getUpdatedRevalidatingFetchers(revalidatingFetchers);
      }
      updateState(updates, {
        flushSync
      });
    }
    revalidatingFetchers.forEach((rf) => {
      abortFetcher(rf.key);
      if (rf.controller) {
        fetchControllers.set(rf.key, rf.controller);
      }
    });
    let abortPendingFetchRevalidations = () => revalidatingFetchers.forEach((f) => abortFetcher(f.key));
    if (pendingNavigationController) {
      pendingNavigationController.signal.addEventListener("abort", abortPendingFetchRevalidations);
    }
    let {
      loaderResults,
      fetcherResults
    } = await callLoadersAndMaybeResolveData(state, matches, matchesToLoad, revalidatingFetchers, request);
    if (request.signal.aborted) {
      return {
        shortCircuited: true
      };
    }
    if (pendingNavigationController) {
      pendingNavigationController.signal.removeEventListener("abort", abortPendingFetchRevalidations);
    }
    revalidatingFetchers.forEach((rf) => fetchControllers.delete(rf.key));
    let redirect3 = findRedirect(loaderResults);
    if (redirect3) {
      await startRedirectNavigation(request, redirect3.result, true, {
        replace: replace2
      });
      return {
        shortCircuited: true
      };
    }
    redirect3 = findRedirect(fetcherResults);
    if (redirect3) {
      fetchRedirectIds.add(redirect3.key);
      await startRedirectNavigation(request, redirect3.result, true, {
        replace: replace2
      });
      return {
        shortCircuited: true
      };
    }
    let {
      loaderData,
      errors
    } = processLoaderData(state, matches, loaderResults, pendingActionResult, revalidatingFetchers, fetcherResults, activeDeferreds);
    activeDeferreds.forEach((deferredData, routeId) => {
      deferredData.subscribe((aborted) => {
        if (aborted || deferredData.done) {
          activeDeferreds.delete(routeId);
        }
      });
    });
    if (future.v7_partialHydration && initialHydration && state.errors) {
      errors = _extends$2({}, state.errors, errors);
    }
    let updatedFetchers = markFetchRedirectsDone();
    let didAbortFetchLoads = abortStaleFetchLoads(pendingNavigationLoadId);
    let shouldUpdateFetchers = updatedFetchers || didAbortFetchLoads || revalidatingFetchers.length > 0;
    return _extends$2({
      matches,
      loaderData,
      errors
    }, shouldUpdateFetchers ? {
      fetchers: new Map(state.fetchers)
    } : {});
  }
  function getUpdatedActionData(pendingActionResult) {
    if (pendingActionResult && !isErrorResult(pendingActionResult[1])) {
      return {
        [pendingActionResult[0]]: pendingActionResult[1].data
      };
    } else if (state.actionData) {
      if (Object.keys(state.actionData).length === 0) {
        return null;
      } else {
        return state.actionData;
      }
    }
  }
  function getUpdatedRevalidatingFetchers(revalidatingFetchers) {
    revalidatingFetchers.forEach((rf) => {
      let fetcher = state.fetchers.get(rf.key);
      let revalidatingFetcher = getLoadingFetcher(undefined, fetcher ? fetcher.data : undefined);
      state.fetchers.set(rf.key, revalidatingFetcher);
    });
    return new Map(state.fetchers);
  }
  function fetch(key, routeId, href, opts) {
    if (isServer) {
      throw new Error("router.fetch() was called during the server render, but it shouldn't be. You are likely calling a useFetcher() method in the body of your component. Try moving it to a useEffect or a callback.");
    }
    abortFetcher(key);
    let flushSync = (opts && opts.flushSync) === true;
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let normalizedPath = normalizeTo(state.location, state.matches, basename, future.v7_prependBasename, href, future.v7_relativeSplatPath, routeId, opts == null ? undefined : opts.relative);
    let matches = matchRoutes(routesToUse, normalizedPath, basename);
    let fogOfWar = checkFogOfWar(matches, routesToUse, normalizedPath);
    if (fogOfWar.active && fogOfWar.matches) {
      matches = fogOfWar.matches;
    }
    if (!matches) {
      setFetcherError(key, routeId, getInternalRouterError(404, {
        pathname: normalizedPath
      }), {
        flushSync
      });
      return;
    }
    let {
      path,
      submission,
      error
    } = normalizeNavigateOptions(future.v7_normalizeFormMethod, true, normalizedPath, opts);
    if (error) {
      setFetcherError(key, routeId, error, {
        flushSync
      });
      return;
    }
    let match = getTargetMatch(matches, path);
    let preventScrollReset = (opts && opts.preventScrollReset) === true;
    if (submission && isMutationMethod(submission.formMethod)) {
      handleFetcherAction(key, routeId, path, match, matches, fogOfWar.active, flushSync, preventScrollReset, submission);
      return;
    }
    fetchLoadMatches.set(key, {
      routeId,
      path
    });
    handleFetcherLoader(key, routeId, path, match, matches, fogOfWar.active, flushSync, preventScrollReset, submission);
  }
  async function handleFetcherAction(key, routeId, path, match, requestMatches, isFogOfWar, flushSync, preventScrollReset, submission) {
    interruptActiveLoads();
    fetchLoadMatches.delete(key);
    function detectAndHandle405Error(m) {
      if (!m.route.action && !m.route.lazy) {
        let error = getInternalRouterError(405, {
          method: submission.formMethod,
          pathname: path,
          routeId
        });
        setFetcherError(key, routeId, error, {
          flushSync
        });
        return true;
      }
      return false;
    }
    if (!isFogOfWar && detectAndHandle405Error(match)) {
      return;
    }
    let existingFetcher = state.fetchers.get(key);
    updateFetcherState(key, getSubmittingFetcher(submission, existingFetcher), {
      flushSync
    });
    let abortController = new AbortController();
    let fetchRequest = createClientSideRequest(init.history, path, abortController.signal, submission);
    if (isFogOfWar) {
      let discoverResult = await discoverRoutes(requestMatches, path, fetchRequest.signal);
      if (discoverResult.type === "aborted") {
        return;
      } else if (discoverResult.type === "error") {
        setFetcherError(key, routeId, discoverResult.error, {
          flushSync
        });
        return;
      } else if (!discoverResult.matches) {
        setFetcherError(key, routeId, getInternalRouterError(404, {
          pathname: path
        }), {
          flushSync
        });
        return;
      } else {
        requestMatches = discoverResult.matches;
        match = getTargetMatch(requestMatches, path);
        if (detectAndHandle405Error(match)) {
          return;
        }
      }
    }
    fetchControllers.set(key, abortController);
    let originatingLoadId = incrementingLoadId;
    let actionResults = await callDataStrategy("action", state, fetchRequest, [match], requestMatches, key);
    let actionResult = actionResults[match.route.id];
    if (fetchRequest.signal.aborted) {
      if (fetchControllers.get(key) === abortController) {
        fetchControllers.delete(key);
      }
      return;
    }
    if (future.v7_fetcherPersist && deletedFetchers.has(key)) {
      if (isRedirectResult(actionResult) || isErrorResult(actionResult)) {
        updateFetcherState(key, getDoneFetcher(undefined));
        return;
      }
    } else {
      if (isRedirectResult(actionResult)) {
        fetchControllers.delete(key);
        if (pendingNavigationLoadId > originatingLoadId) {
          updateFetcherState(key, getDoneFetcher(undefined));
          return;
        } else {
          fetchRedirectIds.add(key);
          updateFetcherState(key, getLoadingFetcher(submission));
          return startRedirectNavigation(fetchRequest, actionResult, false, {
            fetcherSubmission: submission,
            preventScrollReset
          });
        }
      }
      if (isErrorResult(actionResult)) {
        setFetcherError(key, routeId, actionResult.error);
        return;
      }
    }
    if (isDeferredResult(actionResult)) {
      throw getInternalRouterError(400, {
        type: "defer-action"
      });
    }
    let nextLocation = state.navigation.location || state.location;
    let revalidationRequest = createClientSideRequest(init.history, nextLocation, abortController.signal);
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let matches = state.navigation.state !== "idle" ? matchRoutes(routesToUse, state.navigation.location, basename) : state.matches;
    invariant(matches, "Didn't find any matches after fetcher action");
    let loadId = ++incrementingLoadId;
    fetchReloadIds.set(key, loadId);
    let loadFetcher = getLoadingFetcher(submission, actionResult.data);
    state.fetchers.set(key, loadFetcher);
    let [matchesToLoad, revalidatingFetchers] = getMatchesToLoad(init.history, state, matches, submission, nextLocation, false, future.v7_skipActionErrorRevalidation, isRevalidationRequired, cancelledDeferredRoutes, cancelledFetcherLoads, deletedFetchers, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, [match.route.id, actionResult]);
    revalidatingFetchers.filter((rf) => rf.key !== key).forEach((rf) => {
      let staleKey = rf.key;
      let existingFetcher2 = state.fetchers.get(staleKey);
      let revalidatingFetcher = getLoadingFetcher(undefined, existingFetcher2 ? existingFetcher2.data : undefined);
      state.fetchers.set(staleKey, revalidatingFetcher);
      abortFetcher(staleKey);
      if (rf.controller) {
        fetchControllers.set(staleKey, rf.controller);
      }
    });
    updateState({
      fetchers: new Map(state.fetchers)
    });
    let abortPendingFetchRevalidations = () => revalidatingFetchers.forEach((rf) => abortFetcher(rf.key));
    abortController.signal.addEventListener("abort", abortPendingFetchRevalidations);
    let {
      loaderResults,
      fetcherResults
    } = await callLoadersAndMaybeResolveData(state, matches, matchesToLoad, revalidatingFetchers, revalidationRequest);
    if (abortController.signal.aborted) {
      return;
    }
    abortController.signal.removeEventListener("abort", abortPendingFetchRevalidations);
    fetchReloadIds.delete(key);
    fetchControllers.delete(key);
    revalidatingFetchers.forEach((r) => fetchControllers.delete(r.key));
    let redirect3 = findRedirect(loaderResults);
    if (redirect3) {
      return startRedirectNavigation(revalidationRequest, redirect3.result, false, {
        preventScrollReset
      });
    }
    redirect3 = findRedirect(fetcherResults);
    if (redirect3) {
      fetchRedirectIds.add(redirect3.key);
      return startRedirectNavigation(revalidationRequest, redirect3.result, false, {
        preventScrollReset
      });
    }
    let {
      loaderData,
      errors
    } = processLoaderData(state, matches, loaderResults, undefined, revalidatingFetchers, fetcherResults, activeDeferreds);
    if (state.fetchers.has(key)) {
      let doneFetcher = getDoneFetcher(actionResult.data);
      state.fetchers.set(key, doneFetcher);
    }
    abortStaleFetchLoads(loadId);
    if (state.navigation.state === "loading" && loadId > pendingNavigationLoadId) {
      invariant(pendingAction, "Expected pending action");
      pendingNavigationController && pendingNavigationController.abort();
      completeNavigation(state.navigation.location, {
        matches,
        loaderData,
        errors,
        fetchers: new Map(state.fetchers)
      });
    } else {
      updateState({
        errors,
        loaderData: mergeLoaderData(state.loaderData, loaderData, matches, errors),
        fetchers: new Map(state.fetchers)
      });
      isRevalidationRequired = false;
    }
  }
  async function handleFetcherLoader(key, routeId, path, match, matches, isFogOfWar, flushSync, preventScrollReset, submission) {
    let existingFetcher = state.fetchers.get(key);
    updateFetcherState(key, getLoadingFetcher(submission, existingFetcher ? existingFetcher.data : undefined), {
      flushSync
    });
    let abortController = new AbortController();
    let fetchRequest = createClientSideRequest(init.history, path, abortController.signal);
    if (isFogOfWar) {
      let discoverResult = await discoverRoutes(matches, path, fetchRequest.signal);
      if (discoverResult.type === "aborted") {
        return;
      } else if (discoverResult.type === "error") {
        setFetcherError(key, routeId, discoverResult.error, {
          flushSync
        });
        return;
      } else if (!discoverResult.matches) {
        setFetcherError(key, routeId, getInternalRouterError(404, {
          pathname: path
        }), {
          flushSync
        });
        return;
      } else {
        matches = discoverResult.matches;
        match = getTargetMatch(matches, path);
      }
    }
    fetchControllers.set(key, abortController);
    let originatingLoadId = incrementingLoadId;
    let results = await callDataStrategy("loader", state, fetchRequest, [match], matches, key);
    let result = results[match.route.id];
    if (isDeferredResult(result)) {
      result = await resolveDeferredData(result, fetchRequest.signal, true) || result;
    }
    if (fetchControllers.get(key) === abortController) {
      fetchControllers.delete(key);
    }
    if (fetchRequest.signal.aborted) {
      return;
    }
    if (deletedFetchers.has(key)) {
      updateFetcherState(key, getDoneFetcher(undefined));
      return;
    }
    if (isRedirectResult(result)) {
      if (pendingNavigationLoadId > originatingLoadId) {
        updateFetcherState(key, getDoneFetcher(undefined));
        return;
      } else {
        fetchRedirectIds.add(key);
        await startRedirectNavigation(fetchRequest, result, false, {
          preventScrollReset
        });
        return;
      }
    }
    if (isErrorResult(result)) {
      setFetcherError(key, routeId, result.error);
      return;
    }
    invariant(!isDeferredResult(result), "Unhandled fetcher deferred data");
    updateFetcherState(key, getDoneFetcher(result.data));
  }
  async function startRedirectNavigation(request, redirect3, isNavigation, _temp2) {
    let {
      submission,
      fetcherSubmission,
      preventScrollReset,
      replace: replace2
    } = _temp2 === undefined ? {} : _temp2;
    if (redirect3.response.headers.has("X-Remix-Revalidate")) {
      isRevalidationRequired = true;
    }
    let location = redirect3.response.headers.get("Location");
    invariant(location, "Expected a Location header on the redirect Response");
    location = normalizeRedirectLocation(location, new URL(request.url), basename);
    let redirectLocation = createLocation(state.location, location, {
      _isRedirect: true
    });
    if (isBrowser) {
      let isDocumentReload = false;
      if (redirect3.response.headers.has("X-Remix-Reload-Document")) {
        isDocumentReload = true;
      } else if (ABSOLUTE_URL_REGEX$1.test(location)) {
        const url = init.history.createURL(location);
        isDocumentReload = // Hard reload if it's an absolute URL to a new origin
        url.origin !== routerWindow.location.origin || // Hard reload if it's an absolute URL that does not match our basename
        stripBasename(url.pathname, basename) == null;
      }
      if (isDocumentReload) {
        if (replace2) {
          routerWindow.location.replace(location);
        } else {
          routerWindow.location.assign(location);
        }
        return;
      }
    }
    pendingNavigationController = null;
    let redirectHistoryAction = replace2 === true || redirect3.response.headers.has("X-Remix-Replace") ? Action.Replace : Action.Push;
    let {
      formMethod,
      formAction,
      formEncType
    } = state.navigation;
    if (!submission && !fetcherSubmission && formMethod && formAction && formEncType) {
      submission = getSubmissionFromNavigation(state.navigation);
    }
    let activeSubmission = submission || fetcherSubmission;
    if (redirectPreserveMethodStatusCodes.has(redirect3.response.status) && activeSubmission && isMutationMethod(activeSubmission.formMethod)) {
      await startNavigation(redirectHistoryAction, redirectLocation, {
        submission: _extends$2({}, activeSubmission, {
          formAction: location
        }),
        // Preserve these flags across redirects
        preventScrollReset: preventScrollReset || pendingPreventScrollReset,
        enableViewTransition: isNavigation ? pendingViewTransitionEnabled : undefined
      });
    } else {
      let overrideNavigation = getLoadingNavigation(redirectLocation, submission);
      await startNavigation(redirectHistoryAction, redirectLocation, {
        overrideNavigation,
        // Send fetcher submissions through for shouldRevalidate
        fetcherSubmission,
        // Preserve these flags across redirects
        preventScrollReset: preventScrollReset || pendingPreventScrollReset,
        enableViewTransition: isNavigation ? pendingViewTransitionEnabled : undefined
      });
    }
  }
  async function callDataStrategy(type, state2, request, matchesToLoad, matches, fetcherKey) {
    let results;
    let dataResults = {};
    try {
      results = await callDataStrategyImpl(dataStrategyImpl, type, state2, request, matchesToLoad, matches, fetcherKey, manifest, mapRouteProperties);
    } catch (e) {
      matchesToLoad.forEach((m) => {
        dataResults[m.route.id] = {
          type: ResultType.error,
          error: e
        };
      });
      return dataResults;
    }
    for (let [routeId, result] of Object.entries(results)) {
      if (isRedirectDataStrategyResultResult(result)) {
        let response = result.result;
        dataResults[routeId] = {
          type: ResultType.redirect,
          response: normalizeRelativeRoutingRedirectResponse(response, request, routeId, matches, basename, future.v7_relativeSplatPath)
        };
      } else {
        dataResults[routeId] = await convertDataStrategyResultToDataResult(result);
      }
    }
    return dataResults;
  }
  async function callLoadersAndMaybeResolveData(state2, matches, matchesToLoad, fetchersToLoad, request) {
    let currentMatches = state2.matches;
    let loaderResultsPromise = callDataStrategy("loader", state2, request, matchesToLoad, matches, null);
    let fetcherResultsPromise = Promise.all(fetchersToLoad.map(async (f) => {
      if (f.matches && f.match && f.controller) {
        let results = await callDataStrategy("loader", state2, createClientSideRequest(init.history, f.path, f.controller.signal), [f.match], f.matches, f.key);
        let result = results[f.match.route.id];
        return {
          [f.key]: result
        };
      } else {
        return Promise.resolve({
          [f.key]: {
            type: ResultType.error,
            error: getInternalRouterError(404, {
              pathname: f.path
            })
          }
        });
      }
    }));
    let loaderResults = await loaderResultsPromise;
    let fetcherResults = (await fetcherResultsPromise).reduce((acc, r) => Object.assign(acc, r), {});
    await Promise.all([resolveNavigationDeferredResults(matches, loaderResults, request.signal, currentMatches, state2.loaderData), resolveFetcherDeferredResults(matches, fetcherResults, fetchersToLoad)]);
    return {
      loaderResults,
      fetcherResults
    };
  }
  function interruptActiveLoads() {
    isRevalidationRequired = true;
    cancelledDeferredRoutes.push(...cancelActiveDeferreds());
    fetchLoadMatches.forEach((_, key) => {
      if (fetchControllers.has(key)) {
        cancelledFetcherLoads.add(key);
      }
      abortFetcher(key);
    });
  }
  function updateFetcherState(key, fetcher, opts) {
    if (opts === undefined) {
      opts = {};
    }
    state.fetchers.set(key, fetcher);
    updateState({
      fetchers: new Map(state.fetchers)
    }, {
      flushSync: (opts && opts.flushSync) === true
    });
  }
  function setFetcherError(key, routeId, error, opts) {
    if (opts === undefined) {
      opts = {};
    }
    let boundaryMatch = findNearestBoundary(state.matches, routeId);
    deleteFetcher(key);
    updateState({
      errors: {
        [boundaryMatch.route.id]: error
      },
      fetchers: new Map(state.fetchers)
    }, {
      flushSync: (opts && opts.flushSync) === true
    });
  }
  function getFetcher(key) {
    if (future.v7_fetcherPersist) {
      activeFetchers.set(key, (activeFetchers.get(key) || 0) + 1);
      if (deletedFetchers.has(key)) {
        deletedFetchers.delete(key);
      }
    }
    return state.fetchers.get(key) || IDLE_FETCHER;
  }
  function deleteFetcher(key) {
    let fetcher = state.fetchers.get(key);
    if (fetchControllers.has(key) && !(fetcher && fetcher.state === "loading" && fetchReloadIds.has(key))) {
      abortFetcher(key);
    }
    fetchLoadMatches.delete(key);
    fetchReloadIds.delete(key);
    fetchRedirectIds.delete(key);
    deletedFetchers.delete(key);
    cancelledFetcherLoads.delete(key);
    state.fetchers.delete(key);
  }
  function deleteFetcherAndUpdateState(key) {
    if (future.v7_fetcherPersist) {
      let count = (activeFetchers.get(key) || 0) - 1;
      if (count <= 0) {
        activeFetchers.delete(key);
        deletedFetchers.add(key);
      } else {
        activeFetchers.set(key, count);
      }
    } else {
      deleteFetcher(key);
    }
    updateState({
      fetchers: new Map(state.fetchers)
    });
  }
  function abortFetcher(key) {
    let controller = fetchControllers.get(key);
    if (controller) {
      controller.abort();
      fetchControllers.delete(key);
    }
  }
  function markFetchersDone(keys) {
    for (let key of keys) {
      let fetcher = getFetcher(key);
      let doneFetcher = getDoneFetcher(fetcher.data);
      state.fetchers.set(key, doneFetcher);
    }
  }
  function markFetchRedirectsDone() {
    let doneKeys = [];
    let updatedFetchers = false;
    for (let key of fetchRedirectIds) {
      let fetcher = state.fetchers.get(key);
      invariant(fetcher, "Expected fetcher: " + key);
      if (fetcher.state === "loading") {
        fetchRedirectIds.delete(key);
        doneKeys.push(key);
        updatedFetchers = true;
      }
    }
    markFetchersDone(doneKeys);
    return updatedFetchers;
  }
  function abortStaleFetchLoads(landedId) {
    let yeetedKeys = [];
    for (let [key, id] of fetchReloadIds) {
      if (id < landedId) {
        let fetcher = state.fetchers.get(key);
        invariant(fetcher, "Expected fetcher: " + key);
        if (fetcher.state === "loading") {
          abortFetcher(key);
          fetchReloadIds.delete(key);
          yeetedKeys.push(key);
        }
      }
    }
    markFetchersDone(yeetedKeys);
    return yeetedKeys.length > 0;
  }
  function getBlocker(key, fn) {
    let blocker = state.blockers.get(key) || IDLE_BLOCKER;
    if (blockerFunctions.get(key) !== fn) {
      blockerFunctions.set(key, fn);
    }
    return blocker;
  }
  function deleteBlocker(key) {
    state.blockers.delete(key);
    blockerFunctions.delete(key);
  }
  function updateBlocker(key, newBlocker) {
    let blocker = state.blockers.get(key) || IDLE_BLOCKER;
    invariant(blocker.state === "unblocked" && newBlocker.state === "blocked" || blocker.state === "blocked" && newBlocker.state === "blocked" || blocker.state === "blocked" && newBlocker.state === "proceeding" || blocker.state === "blocked" && newBlocker.state === "unblocked" || blocker.state === "proceeding" && newBlocker.state === "unblocked", "Invalid blocker state transition: " + blocker.state + " -> " + newBlocker.state);
    let blockers = new Map(state.blockers);
    blockers.set(key, newBlocker);
    updateState({
      blockers
    });
  }
  function shouldBlockNavigation(_ref2) {
    let {
      currentLocation,
      nextLocation,
      historyAction
    } = _ref2;
    if (blockerFunctions.size === 0) {
      return;
    }
    if (blockerFunctions.size > 1) {
      warning(false, "A router only supports one blocker at a time");
    }
    let entries = Array.from(blockerFunctions.entries());
    let [blockerKey, blockerFunction] = entries[entries.length - 1];
    let blocker = state.blockers.get(blockerKey);
    if (blocker && blocker.state === "proceeding") {
      return;
    }
    if (blockerFunction({
      currentLocation,
      nextLocation,
      historyAction
    })) {
      return blockerKey;
    }
  }
  function handleNavigational404(pathname) {
    let error = getInternalRouterError(404, {
      pathname
    });
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let {
      matches,
      route
    } = getShortCircuitMatches(routesToUse);
    cancelActiveDeferreds();
    return {
      notFoundMatches: matches,
      route,
      error
    };
  }
  function cancelActiveDeferreds(predicate) {
    let cancelledRouteIds = [];
    activeDeferreds.forEach((dfd, routeId) => {
      if (!predicate || predicate(routeId)) {
        dfd.cancel();
        cancelledRouteIds.push(routeId);
        activeDeferreds.delete(routeId);
      }
    });
    return cancelledRouteIds;
  }
  function enableScrollRestoration(positions, getPosition, getKey) {
    savedScrollPositions = positions;
    getScrollPosition = getPosition;
    getScrollRestorationKey = getKey || null;
    if (!initialScrollRestored && state.navigation === IDLE_NAVIGATION) {
      initialScrollRestored = true;
      let y = getSavedScrollPosition(state.location, state.matches);
      if (y != null) {
        updateState({
          restoreScrollPosition: y
        });
      }
    }
    return () => {
      savedScrollPositions = null;
      getScrollPosition = null;
      getScrollRestorationKey = null;
    };
  }
  function getScrollKey(location, matches) {
    if (getScrollRestorationKey) {
      let key = getScrollRestorationKey(location, matches.map((m) => convertRouteMatchToUiMatch(m, state.loaderData)));
      return key || location.key;
    }
    return location.key;
  }
  function saveScrollPosition(location, matches) {
    if (savedScrollPositions && getScrollPosition) {
      let key = getScrollKey(location, matches);
      savedScrollPositions[key] = getScrollPosition();
    }
  }
  function getSavedScrollPosition(location, matches) {
    if (savedScrollPositions) {
      let key = getScrollKey(location, matches);
      let y = savedScrollPositions[key];
      if (typeof y === "number") {
        return y;
      }
    }
    return null;
  }
  function checkFogOfWar(matches, routesToUse, pathname) {
    if (patchRoutesOnNavigationImpl) {
      if (!matches) {
        let fogMatches = matchRoutesImpl(routesToUse, pathname, basename, true);
        return {
          active: true,
          matches: fogMatches || []
        };
      } else {
        if (Object.keys(matches[0].params).length > 0) {
          let partialMatches = matchRoutesImpl(routesToUse, pathname, basename, true);
          return {
            active: true,
            matches: partialMatches
          };
        }
      }
    }
    return {
      active: false,
      matches: null
    };
  }
  async function discoverRoutes(matches, pathname, signal) {
    if (!patchRoutesOnNavigationImpl) {
      return {
        type: "success",
        matches
      };
    }
    let partialMatches = matches;
    while (true) {
      let isNonHMR = inFlightDataRoutes == null;
      let routesToUse = inFlightDataRoutes || dataRoutes;
      let localManifest = manifest;
      try {
        await patchRoutesOnNavigationImpl({
          path: pathname,
          matches: partialMatches,
          patch: (routeId, children) => {
            if (signal.aborted) return;
            patchRoutesImpl(routeId, children, routesToUse, localManifest, mapRouteProperties);
          }
        });
      } catch (e) {
        return {
          type: "error",
          error: e,
          partialMatches
        };
      } finally {
        if (isNonHMR && !signal.aborted) {
          dataRoutes = [...dataRoutes];
        }
      }
      if (signal.aborted) {
        return {
          type: "aborted"
        };
      }
      let newMatches = matchRoutes(routesToUse, pathname, basename);
      if (newMatches) {
        return {
          type: "success",
          matches: newMatches
        };
      }
      let newPartialMatches = matchRoutesImpl(routesToUse, pathname, basename, true);
      if (!newPartialMatches || partialMatches.length === newPartialMatches.length && partialMatches.every((m, i) => m.route.id === newPartialMatches[i].route.id)) {
        return {
          type: "success",
          matches: null
        };
      }
      partialMatches = newPartialMatches;
    }
  }
  function _internalSetRoutes(newRoutes) {
    manifest = {};
    inFlightDataRoutes = convertRoutesToDataRoutes(newRoutes, mapRouteProperties, undefined, manifest);
  }
  function patchRoutes(routeId, children) {
    let isNonHMR = inFlightDataRoutes == null;
    let routesToUse = inFlightDataRoutes || dataRoutes;
    patchRoutesImpl(routeId, children, routesToUse, manifest, mapRouteProperties);
    if (isNonHMR) {
      dataRoutes = [...dataRoutes];
      updateState({});
    }
  }
  router = {
    get basename() {
      return basename;
    },
    get future() {
      return future;
    },
    get state() {
      return state;
    },
    get routes() {
      return dataRoutes;
    },
    get window() {
      return routerWindow;
    },
    initialize,
    subscribe,
    enableScrollRestoration,
    navigate,
    fetch,
    revalidate,
    // Passthrough to history-aware createHref used by useHref so we get proper
    // hash-aware URLs in DOM paths
    createHref: (to) => init.history.createHref(to),
    encodeLocation: (to) => init.history.encodeLocation(to),
    getFetcher,
    deleteFetcher: deleteFetcherAndUpdateState,
    dispose,
    getBlocker,
    deleteBlocker,
    patchRoutes,
    _internalFetchControllers: fetchControllers,
    _internalActiveDeferreds: activeDeferreds,
    // TODO: Remove setRoutes, it's temporary to avoid dealing with
    // updating the tree while validating the update algorithm.
    _internalSetRoutes
  };
  return router;
}
function isSubmissionNavigation(opts) {
  return opts != null && ("formData" in opts && opts.formData != null || "body" in opts && opts.body !== undefined);
}
function normalizeTo(location, matches, basename, prependBasename, to, v7_relativeSplatPath, fromRouteId, relative) {
  let contextualMatches;
  let activeRouteMatch;
  if (fromRouteId) {
    contextualMatches = [];
    for (let match of matches) {
      contextualMatches.push(match);
      if (match.route.id === fromRouteId) {
        activeRouteMatch = match;
        break;
      }
    }
  } else {
    contextualMatches = matches;
    activeRouteMatch = matches[matches.length - 1];
  }
  let path = resolveTo(to ? to : ".", getResolveToMatches(contextualMatches, v7_relativeSplatPath), stripBasename(location.pathname, basename) || location.pathname, relative === "path");
  if (to == null) {
    path.search = location.search;
    path.hash = location.hash;
  }
  if ((to == null || to === "" || to === ".") && activeRouteMatch) {
    let nakedIndex = hasNakedIndexQuery(path.search);
    if (activeRouteMatch.route.index && !nakedIndex) {
      path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
    } else if (!activeRouteMatch.route.index && nakedIndex) {
      let params = new URLSearchParams(path.search);
      let indexValues = params.getAll("index");
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? "?" + qs : "";
    }
  }
  if (prependBasename && basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
function normalizeNavigateOptions(normalizeFormMethod, isFetcher, path, opts) {
  if (!opts || !isSubmissionNavigation(opts)) {
    return {
      path
    };
  }
  if (opts.formMethod && !isValidMethod(opts.formMethod)) {
    return {
      path,
      error: getInternalRouterError(405, {
        method: opts.formMethod
      })
    };
  }
  let getInvalidBodyError = () => ({
    path,
    error: getInternalRouterError(400, {
      type: "invalid-body"
    })
  });
  let rawFormMethod = opts.formMethod || "get";
  let formMethod = normalizeFormMethod ? rawFormMethod.toUpperCase() : rawFormMethod.toLowerCase();
  let formAction = stripHashFromPath(path);
  if (opts.body !== undefined) {
    if (opts.formEncType === "text/plain") {
      if (!isMutationMethod(formMethod)) {
        return getInvalidBodyError();
      }
      let text = typeof opts.body === "string" ? opts.body : opts.body instanceof FormData || opts.body instanceof URLSearchParams ? (
        // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#plain-text-form-data
        Array.from(opts.body.entries()).reduce((acc, _ref3) => {
          let [name, value] = _ref3;
          return "" + acc + name + "=" + value + "\n";
        }, "")
      ) : String(opts.body);
      return {
        path,
        submission: {
          formMethod,
          formAction,
          formEncType: opts.formEncType,
          formData: undefined,
          json: undefined,
          text
        }
      };
    } else if (opts.formEncType === "application/json") {
      if (!isMutationMethod(formMethod)) {
        return getInvalidBodyError();
      }
      try {
        let json3 = typeof opts.body === "string" ? JSON.parse(opts.body) : opts.body;
        return {
          path,
          submission: {
            formMethod,
            formAction,
            formEncType: opts.formEncType,
            formData: void 0,
            json: json3,
            text: void 0
          }
        };
      } catch (e) {
        return getInvalidBodyError();
      }
    }
  }
  invariant(typeof FormData === "function", "FormData is not available in this environment");
  let searchParams;
  let formData;
  if (opts.formData) {
    searchParams = convertFormDataToSearchParams(opts.formData);
    formData = opts.formData;
  } else if (opts.body instanceof FormData) {
    searchParams = convertFormDataToSearchParams(opts.body);
    formData = opts.body;
  } else if (opts.body instanceof URLSearchParams) {
    searchParams = opts.body;
    formData = convertSearchParamsToFormData(searchParams);
  } else if (opts.body == null) {
    searchParams = new URLSearchParams();
    formData = new FormData();
  } else {
    try {
      searchParams = new URLSearchParams(opts.body);
      formData = convertSearchParamsToFormData(searchParams);
    } catch (e) {
      return getInvalidBodyError();
    }
  }
  let submission = {
    formMethod,
    formAction,
    formEncType: opts && opts.formEncType || "application/x-www-form-urlencoded",
    formData,
    json: undefined,
    text: undefined
  };
  if (isMutationMethod(submission.formMethod)) {
    return {
      path,
      submission
    };
  }
  let parsedPath = parsePath(path);
  if (isFetcher && parsedPath.search && hasNakedIndexQuery(parsedPath.search)) {
    searchParams.append("index", "");
  }
  parsedPath.search = "?" + searchParams;
  return {
    path: createPath(parsedPath),
    submission
  };
}
function getLoaderMatchesUntilBoundary(matches, boundaryId, includeBoundary) {
  if (includeBoundary === undefined) {
    includeBoundary = false;
  }
  let index = matches.findIndex((m) => m.route.id === boundaryId);
  if (index >= 0) {
    return matches.slice(0, includeBoundary ? index + 1 : index);
  }
  return matches;
}
function getMatchesToLoad(history, state, matches, submission, location, initialHydration, skipActionErrorRevalidation, isRevalidationRequired, cancelledDeferredRoutes, cancelledFetcherLoads, deletedFetchers, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, pendingActionResult) {
  let actionResult = pendingActionResult ? isErrorResult(pendingActionResult[1]) ? pendingActionResult[1].error : pendingActionResult[1].data : undefined;
  let currentUrl = history.createURL(state.location);
  let nextUrl = history.createURL(location);
  let boundaryMatches = matches;
  if (initialHydration && state.errors) {
    boundaryMatches = getLoaderMatchesUntilBoundary(matches, Object.keys(state.errors)[0], true);
  } else if (pendingActionResult && isErrorResult(pendingActionResult[1])) {
    boundaryMatches = getLoaderMatchesUntilBoundary(matches, pendingActionResult[0]);
  }
  let actionStatus = pendingActionResult ? pendingActionResult[1].statusCode : undefined;
  let shouldSkipRevalidation = skipActionErrorRevalidation && actionStatus && actionStatus >= 400;
  let navigationMatches = boundaryMatches.filter((match, index) => {
    let {
      route
    } = match;
    if (route.lazy) {
      return true;
    }
    if (route.loader == null) {
      return false;
    }
    if (initialHydration) {
      return shouldLoadRouteOnHydration(route, state.loaderData, state.errors);
    }
    if (isNewLoader(state.loaderData, state.matches[index], match) || cancelledDeferredRoutes.some((id) => id === match.route.id)) {
      return true;
    }
    let currentRouteMatch = state.matches[index];
    let nextRouteMatch = match;
    return shouldRevalidateLoader(match, _extends$2({
      currentUrl,
      currentParams: currentRouteMatch.params,
      nextUrl,
      nextParams: nextRouteMatch.params
    }, submission, {
      actionResult,
      actionStatus,
      defaultShouldRevalidate: shouldSkipRevalidation ? false : (
        // Forced revalidation due to submission, useRevalidator, or X-Remix-Revalidate
        isRevalidationRequired || currentUrl.pathname + currentUrl.search === nextUrl.pathname + nextUrl.search || // Search params affect all loaders
        currentUrl.search !== nextUrl.search || isNewRouteInstance(currentRouteMatch, nextRouteMatch)
      )
    }));
  });
  let revalidatingFetchers = [];
  fetchLoadMatches.forEach((f, key) => {
    if (initialHydration || !matches.some((m) => m.route.id === f.routeId) || deletedFetchers.has(key)) {
      return;
    }
    let fetcherMatches = matchRoutes(routesToUse, f.path, basename);
    if (!fetcherMatches) {
      revalidatingFetchers.push({
        key,
        routeId: f.routeId,
        path: f.path,
        matches: null,
        match: null,
        controller: null
      });
      return;
    }
    let fetcher = state.fetchers.get(key);
    let fetcherMatch = getTargetMatch(fetcherMatches, f.path);
    let shouldRevalidate = false;
    if (fetchRedirectIds.has(key)) {
      shouldRevalidate = false;
    } else if (cancelledFetcherLoads.has(key)) {
      cancelledFetcherLoads.delete(key);
      shouldRevalidate = true;
    } else if (fetcher && fetcher.state !== "idle" && fetcher.data === undefined) {
      shouldRevalidate = isRevalidationRequired;
    } else {
      shouldRevalidate = shouldRevalidateLoader(fetcherMatch, _extends$2({
        currentUrl,
        currentParams: state.matches[state.matches.length - 1].params,
        nextUrl,
        nextParams: matches[matches.length - 1].params
      }, submission, {
        actionResult,
        actionStatus,
        defaultShouldRevalidate: shouldSkipRevalidation ? false : isRevalidationRequired
      }));
    }
    if (shouldRevalidate) {
      revalidatingFetchers.push({
        key,
        routeId: f.routeId,
        path: f.path,
        matches: fetcherMatches,
        match: fetcherMatch,
        controller: new AbortController()
      });
    }
  });
  return [navigationMatches, revalidatingFetchers];
}
function shouldLoadRouteOnHydration(route, loaderData, errors) {
  if (route.lazy) {
    return true;
  }
  if (!route.loader) {
    return false;
  }
  let hasData = loaderData != null && loaderData[route.id] !== undefined;
  let hasError = errors != null && errors[route.id] !== undefined;
  if (!hasData && hasError) {
    return false;
  }
  if (typeof route.loader === "function" && route.loader.hydrate === true) {
    return true;
  }
  return !hasData && !hasError;
}
function isNewLoader(currentLoaderData, currentMatch, match) {
  let isNew = (
    // [a] -> [a, b]
    !currentMatch || // [a, b] -> [a, c]
    match.route.id !== currentMatch.route.id
  );
  let isMissingData = currentLoaderData[match.route.id] === undefined;
  return isNew || isMissingData;
}
function isNewRouteInstance(currentMatch, match) {
  let currentPath = currentMatch.route.path;
  return (
    // param change for this match, /users/123 -> /users/456
    currentMatch.pathname !== match.pathname || // splat param changed, which is not present in match.path
    // e.g. /files/images/avatar.jpg -> files/finances.xls
    currentPath != null && currentPath.endsWith("*") && currentMatch.params["*"] !== match.params["*"]
  );
}
function shouldRevalidateLoader(loaderMatch, arg) {
  if (loaderMatch.route.shouldRevalidate) {
    let routeChoice = loaderMatch.route.shouldRevalidate(arg);
    if (typeof routeChoice === "boolean") {
      return routeChoice;
    }
  }
  return arg.defaultShouldRevalidate;
}
function patchRoutesImpl(routeId, children, routesToUse, manifest, mapRouteProperties) {
  var _childrenToPatch;
  let childrenToPatch;
  if (routeId) {
    let route = manifest[routeId];
    invariant(route, "No route found to patch children into: routeId = " + routeId);
    if (!route.children) {
      route.children = [];
    }
    childrenToPatch = route.children;
  } else {
    childrenToPatch = routesToUse;
  }
  let uniqueChildren = children.filter((newRoute) => !childrenToPatch.some((existingRoute) => isSameRoute(newRoute, existingRoute)));
  let newRoutes = convertRoutesToDataRoutes(uniqueChildren, mapRouteProperties, [routeId || "_", "patch", String(((_childrenToPatch = childrenToPatch) == null ? undefined : _childrenToPatch.length) || "0")], manifest);
  childrenToPatch.push(...newRoutes);
}
function isSameRoute(newRoute, existingRoute) {
  if ("id" in newRoute && "id" in existingRoute && newRoute.id === existingRoute.id) {
    return true;
  }
  if (!(newRoute.index === existingRoute.index && newRoute.path === existingRoute.path && newRoute.caseSensitive === existingRoute.caseSensitive)) {
    return false;
  }
  if ((!newRoute.children || newRoute.children.length === 0) && (!existingRoute.children || existingRoute.children.length === 0)) {
    return true;
  }
  return newRoute.children.every((aChild, i) => {
    var _existingRoute$childr;
    return (_existingRoute$childr = existingRoute.children) == null ? undefined : _existingRoute$childr.some((bChild) => isSameRoute(aChild, bChild));
  });
}
async function loadLazyRouteModule(route, mapRouteProperties, manifest) {
  if (!route.lazy) {
    return;
  }
  let lazyRoute = await route.lazy();
  if (!route.lazy) {
    return;
  }
  let routeToUpdate = manifest[route.id];
  invariant(routeToUpdate, "No route found in manifest");
  let routeUpdates = {};
  for (let lazyRouteProperty in lazyRoute) {
    let staticRouteValue = routeToUpdate[lazyRouteProperty];
    let isPropertyStaticallyDefined = staticRouteValue !== undefined && // This property isn't static since it should always be updated based
    // on the route updates
    lazyRouteProperty !== "hasErrorBoundary";
    warning(!isPropertyStaticallyDefined, 'Route "' + routeToUpdate.id + '" has a static property "' + lazyRouteProperty + '" defined but its lazy function is also returning a value for this property. ' + ('The lazy route property "' + lazyRouteProperty + '" will be ignored.'));
    if (!isPropertyStaticallyDefined && !immutableRouteKeys.has(lazyRouteProperty)) {
      routeUpdates[lazyRouteProperty] = lazyRoute[lazyRouteProperty];
    }
  }
  Object.assign(routeToUpdate, routeUpdates);
  Object.assign(routeToUpdate, _extends$2({}, mapRouteProperties(routeToUpdate), {
    lazy: undefined
  }));
}
async function defaultDataStrategy(_ref4) {
  let {
    matches
  } = _ref4;
  let matchesToLoad = matches.filter((m) => m.shouldLoad);
  let results = await Promise.all(matchesToLoad.map((m) => m.resolve()));
  return results.reduce((acc, result, i) => Object.assign(acc, {
    [matchesToLoad[i].route.id]: result
  }), {});
}
async function callDataStrategyImpl(dataStrategyImpl, type, state, request, matchesToLoad, matches, fetcherKey, manifest, mapRouteProperties, requestContext) {
  let loadRouteDefinitionsPromises = matches.map((m) => m.route.lazy ? loadLazyRouteModule(m.route, mapRouteProperties, manifest) : undefined);
  let dsMatches = matches.map((match, i) => {
    let loadRoutePromise = loadRouteDefinitionsPromises[i];
    let shouldLoad = matchesToLoad.some((m) => m.route.id === match.route.id);
    let resolve = async (handlerOverride) => {
      if (handlerOverride && request.method === "GET" && (match.route.lazy || match.route.loader)) {
        shouldLoad = true;
      }
      return shouldLoad ? callLoaderOrAction(type, request, match, loadRoutePromise, handlerOverride, requestContext) : Promise.resolve({
        type: ResultType.data,
        result: undefined
      });
    };
    return _extends$2({}, match, {
      shouldLoad,
      resolve
    });
  });
  let results = await dataStrategyImpl({
    matches: dsMatches,
    request,
    params: matches[0].params,
    fetcherKey,
    context: requestContext
  });
  try {
    await Promise.all(loadRouteDefinitionsPromises);
  } catch (e) {
  }
  return results;
}
async function callLoaderOrAction(type, request, match, loadRoutePromise, handlerOverride, staticContext) {
  let result;
  let onReject;
  let runHandler = (handler) => {
    let reject;
    let abortPromise = new Promise((_, r) => reject = r);
    onReject = () => reject();
    request.signal.addEventListener("abort", onReject);
    let actualHandler = (ctx) => {
      if (typeof handler !== "function") {
        return Promise.reject(new Error("You cannot call the handler for a route which defines a boolean " + ('"' + type + '" [routeId: ' + match.route.id + "]")));
      }
      return handler({
        request,
        params: match.params,
        context: staticContext
      }, ...ctx !== undefined ? [ctx] : []);
    };
    let handlerPromise = (async () => {
      try {
        let val = await (handlerOverride ? handlerOverride((ctx) => actualHandler(ctx)) : actualHandler());
        return {
          type: "data",
          result: val
        };
      } catch (e) {
        return {
          type: "error",
          result: e
        };
      }
    })();
    return Promise.race([handlerPromise, abortPromise]);
  };
  try {
    let handler = match.route[type];
    if (loadRoutePromise) {
      if (handler) {
        let handlerError;
        let [value] = await Promise.all([
          // If the handler throws, don't let it immediately bubble out,
          // since we need to let the lazy() execution finish so we know if this
          // route has a boundary that can handle the error
          runHandler(handler).catch((e) => {
            handlerError = e;
          }),
          loadRoutePromise
        ]);
        if (handlerError !== void 0) {
          throw handlerError;
        }
        result = value;
      } else {
        await loadRoutePromise;
        handler = match.route[type];
        if (handler) {
          result = await runHandler(handler);
        } else if (type === "action") {
          let url = new URL(request.url);
          let pathname = url.pathname + url.search;
          throw getInternalRouterError(405, {
            method: request.method,
            pathname,
            routeId: match.route.id
          });
        } else {
          return {
            type: ResultType.data,
            result: void 0
          };
        }
      }
    } else if (!handler) {
      let url = new URL(request.url);
      let pathname = url.pathname + url.search;
      throw getInternalRouterError(404, {
        pathname
      });
    } else {
      result = await runHandler(handler);
    }
    invariant(result.result !== void 0, "You defined " + (type === "action" ? "an action" : "a loader") + " for route " + ('"' + match.route.id + "\" but didn't return anything from your `" + type + "` ") + "function. Please return a value or `null`.");
  } catch (e) {
    return {
      type: ResultType.error,
      result: e
    };
  } finally {
    if (onReject) {
      request.signal.removeEventListener("abort", onReject);
    }
  }
  return result;
}
async function convertDataStrategyResultToDataResult(dataStrategyResult) {
  let {
    result,
    type
  } = dataStrategyResult;
  if (isResponse(result)) {
    let data2;
    try {
      let contentType = result.headers.get("Content-Type");
      if (contentType && /\bapplication\/json\b/.test(contentType)) {
        if (result.body == null) {
          data2 = null;
        } else {
          data2 = await result.json();
        }
      } else {
        data2 = await result.text();
      }
    } catch (e) {
      return {
        type: ResultType.error,
        error: e
      };
    }
    if (type === ResultType.error) {
      return {
        type: ResultType.error,
        error: new ErrorResponseImpl(result.status, result.statusText, data2),
        statusCode: result.status,
        headers: result.headers
      };
    }
    return {
      type: ResultType.data,
      data: data2,
      statusCode: result.status,
      headers: result.headers
    };
  }
  if (type === ResultType.error) {
    if (isDataWithResponseInit(result)) {
      var _result$init2;
      if (result.data instanceof Error) {
        var _result$init;
        return {
          type: ResultType.error,
          error: result.data,
          statusCode: (_result$init = result.init) == null ? undefined : _result$init.status
        };
      }
      result = new ErrorResponseImpl(((_result$init2 = result.init) == null ? undefined : _result$init2.status) || 500, undefined, result.data);
    }
    return {
      type: ResultType.error,
      error: result,
      statusCode: isRouteErrorResponse(result) ? result.status : undefined
    };
  }
  if (isDeferredData(result)) {
    var _result$init3, _result$init4;
    return {
      type: ResultType.deferred,
      deferredData: result,
      statusCode: (_result$init3 = result.init) == null ? undefined : _result$init3.status,
      headers: ((_result$init4 = result.init) == null ? undefined : _result$init4.headers) && new Headers(result.init.headers)
    };
  }
  if (isDataWithResponseInit(result)) {
    var _result$init5, _result$init6;
    return {
      type: ResultType.data,
      data: result.data,
      statusCode: (_result$init5 = result.init) == null ? undefined : _result$init5.status,
      headers: (_result$init6 = result.init) != null && _result$init6.headers ? new Headers(result.init.headers) : undefined
    };
  }
  return {
    type: ResultType.data,
    data: result
  };
}
function normalizeRelativeRoutingRedirectResponse(response, request, routeId, matches, basename, v7_relativeSplatPath) {
  let location = response.headers.get("Location");
  invariant(location, "Redirects returned/thrown from loaders/actions must have a Location header");
  if (!ABSOLUTE_URL_REGEX$1.test(location)) {
    let trimmedMatches = matches.slice(0, matches.findIndex((m) => m.route.id === routeId) + 1);
    location = normalizeTo(new URL(request.url), trimmedMatches, basename, true, location, v7_relativeSplatPath);
    response.headers.set("Location", location);
  }
  return response;
}
function normalizeRedirectLocation(location, currentUrl, basename) {
  if (ABSOLUTE_URL_REGEX$1.test(location)) {
    let normalizedLocation = location;
    let url = normalizedLocation.startsWith("//") ? new URL(currentUrl.protocol + normalizedLocation) : new URL(normalizedLocation);
    let isSameBasename = stripBasename(url.pathname, basename) != null;
    if (url.origin === currentUrl.origin && isSameBasename) {
      return url.pathname + url.search + url.hash;
    }
  }
  return location;
}
function createClientSideRequest(history, location, signal, submission) {
  let url = history.createURL(stripHashFromPath(location)).toString();
  let init = {
    signal
  };
  if (submission && isMutationMethod(submission.formMethod)) {
    let {
      formMethod,
      formEncType
    } = submission;
    init.method = formMethod.toUpperCase();
    if (formEncType === "application/json") {
      init.headers = new Headers({
        "Content-Type": formEncType
      });
      init.body = JSON.stringify(submission.json);
    } else if (formEncType === "text/plain") {
      init.body = submission.text;
    } else if (formEncType === "application/x-www-form-urlencoded" && submission.formData) {
      init.body = convertFormDataToSearchParams(submission.formData);
    } else {
      init.body = submission.formData;
    }
  }
  return new Request(url, init);
}
function convertFormDataToSearchParams(formData) {
  let searchParams = new URLSearchParams();
  for (let [key, value] of formData.entries()) {
    searchParams.append(key, typeof value === "string" ? value : value.name);
  }
  return searchParams;
}
function convertSearchParamsToFormData(searchParams) {
  let formData = new FormData();
  for (let [key, value] of searchParams.entries()) {
    formData.append(key, value);
  }
  return formData;
}
function processRouteLoaderData(matches, results, pendingActionResult, activeDeferreds, skipLoaderErrorBubbling) {
  let loaderData = {};
  let errors = null;
  let statusCode;
  let foundError = false;
  let loaderHeaders = {};
  let pendingError = pendingActionResult && isErrorResult(pendingActionResult[1]) ? pendingActionResult[1].error : undefined;
  matches.forEach((match) => {
    if (!(match.route.id in results)) {
      return;
    }
    let id = match.route.id;
    let result = results[id];
    invariant(!isRedirectResult(result), "Cannot handle redirect results in processLoaderData");
    if (isErrorResult(result)) {
      let error = result.error;
      if (pendingError !== undefined) {
        error = pendingError;
        pendingError = undefined;
      }
      errors = errors || {};
      {
        let boundaryMatch = findNearestBoundary(matches, id);
        if (errors[boundaryMatch.route.id] == null) {
          errors[boundaryMatch.route.id] = error;
        }
      }
      loaderData[id] = undefined;
      if (!foundError) {
        foundError = true;
        statusCode = isRouteErrorResponse(result.error) ? result.error.status : 500;
      }
      if (result.headers) {
        loaderHeaders[id] = result.headers;
      }
    } else {
      if (isDeferredResult(result)) {
        activeDeferreds.set(id, result.deferredData);
        loaderData[id] = result.deferredData.data;
        if (result.statusCode != null && result.statusCode !== 200 && !foundError) {
          statusCode = result.statusCode;
        }
        if (result.headers) {
          loaderHeaders[id] = result.headers;
        }
      } else {
        loaderData[id] = result.data;
        if (result.statusCode && result.statusCode !== 200 && !foundError) {
          statusCode = result.statusCode;
        }
        if (result.headers) {
          loaderHeaders[id] = result.headers;
        }
      }
    }
  });
  if (pendingError !== undefined && pendingActionResult) {
    errors = {
      [pendingActionResult[0]]: pendingError
    };
    loaderData[pendingActionResult[0]] = undefined;
  }
  return {
    loaderData,
    errors,
    statusCode: statusCode || 200,
    loaderHeaders
  };
}
function processLoaderData(state, matches, results, pendingActionResult, revalidatingFetchers, fetcherResults, activeDeferreds) {
  let {
    loaderData,
    errors
  } = processRouteLoaderData(
    matches,
    results,
    pendingActionResult,
    activeDeferreds);
  revalidatingFetchers.forEach((rf) => {
    let {
      key,
      match,
      controller
    } = rf;
    let result = fetcherResults[key];
    invariant(result, "Did not find corresponding fetcher result");
    if (controller && controller.signal.aborted) {
      return;
    } else if (isErrorResult(result)) {
      let boundaryMatch = findNearestBoundary(state.matches, match == null ? undefined : match.route.id);
      if (!(errors && errors[boundaryMatch.route.id])) {
        errors = _extends$2({}, errors, {
          [boundaryMatch.route.id]: result.error
        });
      }
      state.fetchers.delete(key);
    } else if (isRedirectResult(result)) {
      invariant(false, "Unhandled fetcher revalidation redirect");
    } else if (isDeferredResult(result)) {
      invariant(false, "Unhandled fetcher deferred data");
    } else {
      let doneFetcher = getDoneFetcher(result.data);
      state.fetchers.set(key, doneFetcher);
    }
  });
  return {
    loaderData,
    errors
  };
}
function mergeLoaderData(loaderData, newLoaderData, matches, errors) {
  let mergedLoaderData = _extends$2({}, newLoaderData);
  for (let match of matches) {
    let id = match.route.id;
    if (newLoaderData.hasOwnProperty(id)) {
      if (newLoaderData[id] !== undefined) {
        mergedLoaderData[id] = newLoaderData[id];
      }
    } else if (loaderData[id] !== undefined && match.route.loader) {
      mergedLoaderData[id] = loaderData[id];
    }
    if (errors && errors.hasOwnProperty(id)) {
      break;
    }
  }
  return mergedLoaderData;
}
function getActionDataForCommit(pendingActionResult) {
  if (!pendingActionResult) {
    return {};
  }
  return isErrorResult(pendingActionResult[1]) ? {
    // Clear out prior actionData on errors
    actionData: {}
  } : {
    actionData: {
      [pendingActionResult[0]]: pendingActionResult[1].data
    }
  };
}
function findNearestBoundary(matches, routeId) {
  let eligibleMatches = routeId ? matches.slice(0, matches.findIndex((m) => m.route.id === routeId) + 1) : [...matches];
  return eligibleMatches.reverse().find((m) => m.route.hasErrorBoundary === true) || matches[0];
}
function getShortCircuitMatches(routes) {
  let route = routes.length === 1 ? routes[0] : routes.find((r) => r.index || !r.path || r.path === "/") || {
    id: "__shim-error-route__"
  };
  return {
    matches: [{
      params: {},
      pathname: "",
      pathnameBase: "",
      route
    }],
    route
  };
}
function getInternalRouterError(status, _temp5) {
  let {
    pathname,
    routeId,
    method,
    type,
    message
  } = _temp5 === undefined ? {} : _temp5;
  let statusText = "Unknown Server Error";
  let errorMessage = "Unknown @remix-run/router error";
  if (status === 400) {
    statusText = "Bad Request";
    if (method && pathname && routeId) {
      errorMessage = "You made a " + method + ' request to "' + pathname + '" but ' + ('did not provide a `loader` for route "' + routeId + '", ') + "so there is no way to handle the request.";
    } else if (type === "defer-action") {
      errorMessage = "defer() is not supported in actions";
    } else if (type === "invalid-body") {
      errorMessage = "Unable to encode submission body";
    }
  } else if (status === 403) {
    statusText = "Forbidden";
    errorMessage = 'Route "' + routeId + '" does not match URL "' + pathname + '"';
  } else if (status === 404) {
    statusText = "Not Found";
    errorMessage = 'No route matches URL "' + pathname + '"';
  } else if (status === 405) {
    statusText = "Method Not Allowed";
    if (method && pathname && routeId) {
      errorMessage = "You made a " + method.toUpperCase() + ' request to "' + pathname + '" but ' + ('did not provide an `action` for route "' + routeId + '", ') + "so there is no way to handle the request.";
    } else if (method) {
      errorMessage = 'Invalid request method "' + method.toUpperCase() + '"';
    }
  }
  return new ErrorResponseImpl(status || 500, statusText, new Error(errorMessage), true);
}
function findRedirect(results) {
  let entries = Object.entries(results);
  for (let i = entries.length - 1; i >= 0; i--) {
    let [key, result] = entries[i];
    if (isRedirectResult(result)) {
      return {
        key,
        result
      };
    }
  }
}
function stripHashFromPath(path) {
  let parsedPath = typeof path === "string" ? parsePath(path) : path;
  return createPath(_extends$2({}, parsedPath, {
    hash: ""
  }));
}
function isHashChangeOnly(a, b) {
  if (a.pathname !== b.pathname || a.search !== b.search) {
    return false;
  }
  if (a.hash === "") {
    return b.hash !== "";
  } else if (a.hash === b.hash) {
    return true;
  } else if (b.hash !== "") {
    return true;
  }
  return false;
}
function isRedirectDataStrategyResultResult(result) {
  return isResponse(result.result) && redirectStatusCodes.has(result.result.status);
}
function isDeferredResult(result) {
  return result.type === ResultType.deferred;
}
function isErrorResult(result) {
  return result.type === ResultType.error;
}
function isRedirectResult(result) {
  return (result && result.type) === ResultType.redirect;
}
function isDataWithResponseInit(value) {
  return typeof value === "object" && value != null && "type" in value && "data" in value && "init" in value && value.type === "DataWithResponseInit";
}
function isDeferredData(value) {
  let deferred = value;
  return deferred && typeof deferred === "object" && typeof deferred.data === "object" && typeof deferred.subscribe === "function" && typeof deferred.cancel === "function" && typeof deferred.resolveData === "function";
}
function isResponse(value) {
  return value != null && typeof value.status === "number" && typeof value.statusText === "string" && typeof value.headers === "object" && typeof value.body !== "undefined";
}
function isValidMethod(method) {
  return validRequestMethods.has(method.toLowerCase());
}
function isMutationMethod(method) {
  return validMutationMethods.has(method.toLowerCase());
}
async function resolveNavigationDeferredResults(matches, results, signal, currentMatches, currentLoaderData) {
  let entries = Object.entries(results);
  for (let index = 0; index < entries.length; index++) {
    let [routeId, result] = entries[index];
    let match = matches.find((m) => (m == null ? undefined : m.route.id) === routeId);
    if (!match) {
      continue;
    }
    let currentMatch = currentMatches.find((m) => m.route.id === match.route.id);
    let isRevalidatingLoader = currentMatch != null && !isNewRouteInstance(currentMatch, match) && (currentLoaderData && currentLoaderData[match.route.id]) !== undefined;
    if (isDeferredResult(result) && isRevalidatingLoader) {
      await resolveDeferredData(result, signal, false).then((result2) => {
        if (result2) {
          results[routeId] = result2;
        }
      });
    }
  }
}
async function resolveFetcherDeferredResults(matches, results, revalidatingFetchers) {
  for (let index = 0; index < revalidatingFetchers.length; index++) {
    let {
      key,
      routeId,
      controller
    } = revalidatingFetchers[index];
    let result = results[key];
    let match = matches.find((m) => (m == null ? undefined : m.route.id) === routeId);
    if (!match) {
      continue;
    }
    if (isDeferredResult(result)) {
      invariant(controller, "Expected an AbortController for revalidating fetcher deferred result");
      await resolveDeferredData(result, controller.signal, true).then((result2) => {
        if (result2) {
          results[key] = result2;
        }
      });
    }
  }
}
async function resolveDeferredData(result, signal, unwrap) {
  if (unwrap === undefined) {
    unwrap = false;
  }
  let aborted = await result.deferredData.resolveData(signal);
  if (aborted) {
    return;
  }
  if (unwrap) {
    try {
      return {
        type: ResultType.data,
        data: result.deferredData.unwrappedData
      };
    } catch (e) {
      return {
        type: ResultType.error,
        error: e
      };
    }
  }
  return {
    type: ResultType.data,
    data: result.deferredData.data
  };
}
function hasNakedIndexQuery(search) {
  return new URLSearchParams(search).getAll("index").some((v) => v === "");
}
function getTargetMatch(matches, location) {
  let search = typeof location === "string" ? parsePath(location).search : location.search;
  if (matches[matches.length - 1].route.index && hasNakedIndexQuery(search || "")) {
    return matches[matches.length - 1];
  }
  let pathMatches = getPathContributingMatches(matches);
  return pathMatches[pathMatches.length - 1];
}
function getSubmissionFromNavigation(navigation) {
  let {
    formMethod,
    formAction,
    formEncType,
    text,
    formData,
    json: json3
  } = navigation;
  if (!formMethod || !formAction || !formEncType) {
    return;
  }
  if (text != null) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData: undefined,
      json: undefined,
      text
    };
  } else if (formData != null) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData,
      json: undefined,
      text: undefined
    };
  } else if (json3 !== undefined) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData: undefined,
      json: json3,
      text: undefined
    };
  }
}
function getLoadingNavigation(location, submission) {
  if (submission) {
    let navigation = {
      state: "loading",
      location,
      formMethod: submission.formMethod,
      formAction: submission.formAction,
      formEncType: submission.formEncType,
      formData: submission.formData,
      json: submission.json,
      text: submission.text
    };
    return navigation;
  } else {
    let navigation = {
      state: "loading",
      location,
      formMethod: undefined,
      formAction: undefined,
      formEncType: undefined,
      formData: undefined,
      json: undefined,
      text: undefined
    };
    return navigation;
  }
}
function getSubmittingNavigation(location, submission) {
  let navigation = {
    state: "submitting",
    location,
    formMethod: submission.formMethod,
    formAction: submission.formAction,
    formEncType: submission.formEncType,
    formData: submission.formData,
    json: submission.json,
    text: submission.text
  };
  return navigation;
}
function getLoadingFetcher(submission, data2) {
  if (submission) {
    let fetcher = {
      state: "loading",
      formMethod: submission.formMethod,
      formAction: submission.formAction,
      formEncType: submission.formEncType,
      formData: submission.formData,
      json: submission.json,
      text: submission.text,
      data: data2
    };
    return fetcher;
  } else {
    let fetcher = {
      state: "loading",
      formMethod: undefined,
      formAction: undefined,
      formEncType: undefined,
      formData: undefined,
      json: undefined,
      text: undefined,
      data: data2
    };
    return fetcher;
  }
}
function getSubmittingFetcher(submission, existingFetcher) {
  let fetcher = {
    state: "submitting",
    formMethod: submission.formMethod,
    formAction: submission.formAction,
    formEncType: submission.formEncType,
    formData: submission.formData,
    json: submission.json,
    text: submission.text,
    data: existingFetcher ? existingFetcher.data : undefined
  };
  return fetcher;
}
function getDoneFetcher(data2) {
  let fetcher = {
    state: "idle",
    formMethod: undefined,
    formAction: undefined,
    formEncType: undefined,
    formData: undefined,
    json: undefined,
    text: undefined,
    data: data2
  };
  return fetcher;
}
function restoreAppliedTransitions(_window, transitions) {
  try {
    let sessionPositions = _window.sessionStorage.getItem(TRANSITIONS_STORAGE_KEY);
    if (sessionPositions) {
      let json3 = JSON.parse(sessionPositions);
      for (let [k, v] of Object.entries(json3 || {})) {
        if (v && Array.isArray(v)) {
          transitions.set(k, new Set(v || []));
        }
      }
    }
  } catch (e) {
  }
}
function persistAppliedTransitions(_window, transitions) {
  if (transitions.size > 0) {
    let json3 = {};
    for (let [k, v] of transitions) {
      json3[k] = [...v];
    }
    try {
      _window.sessionStorage.setItem(TRANSITIONS_STORAGE_KEY, JSON.stringify(json3));
    } catch (error) {
      warning(false, "Failed to save applied view transitions in sessionStorage (" + error + ").");
    }
  }
}

/**
 * React Router v6.28.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends$1() {
  _extends$1 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}
const DataRouterContext = /* @__PURE__ */ reactExports.createContext(null);
const DataRouterStateContext = /* @__PURE__ */ reactExports.createContext(null);
const NavigationContext = /* @__PURE__ */ reactExports.createContext(null);
const LocationContext = /* @__PURE__ */ reactExports.createContext(null);
const RouteContext = /* @__PURE__ */ reactExports.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
const RouteErrorContext = /* @__PURE__ */ reactExports.createContext(null);
function useHref(to, _temp) {
  let {
    relative
  } = _temp === undefined ? {} : _temp;
  !useInRouterContext() ? invariant(false) : undefined;
  let {
    basename,
    navigator
  } = reactExports.useContext(NavigationContext);
  let {
    hash,
    pathname,
    search
  } = useResolvedPath(to, {
    relative
  });
  let joinedPathname = pathname;
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
  }
  return navigator.createHref({
    pathname: joinedPathname,
    search,
    hash
  });
}
function useInRouterContext() {
  return reactExports.useContext(LocationContext) != null;
}
function useLocation() {
  !useInRouterContext() ? invariant(false) : undefined;
  return reactExports.useContext(LocationContext).location;
}
function useIsomorphicLayoutEffect(cb) {
  let isStatic = reactExports.useContext(NavigationContext).static;
  if (!isStatic) {
    reactExports.useLayoutEffect(cb);
  }
}
function useNavigate() {
  let {
    isDataRoute
  } = reactExports.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
  !useInRouterContext() ? invariant(false) : undefined;
  let dataRouterContext = reactExports.useContext(DataRouterContext);
  let {
    basename,
    future,
    navigator
  } = reactExports.useContext(NavigationContext);
  let {
    matches
  } = reactExports.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches, future.v7_relativeSplatPath));
  let activeRef = reactExports.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = reactExports.useCallback(function(to, options) {
    if (options === undefined) {
      options = {};
    }
    if (!activeRef.current) return;
    if (typeof to === "number") {
      navigator.go(to);
      return;
    }
    let path = resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, options.relative === "path");
    if (dataRouterContext == null && basename !== "/") {
      path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
    }
    (!!options.replace ? navigator.replace : navigator.push)(path, options.state, options);
  }, [basename, navigator, routePathnamesJson, locationPathname, dataRouterContext]);
  return navigate;
}
const OutletContext = /* @__PURE__ */ reactExports.createContext(null);
function useOutlet(context) {
  let outlet = reactExports.useContext(RouteContext).outlet;
  if (outlet) {
    return /* @__PURE__ */ reactExports.createElement(OutletContext.Provider, {
      value: context
    }, outlet);
  }
  return outlet;
}
function useResolvedPath(to, _temp2) {
  let {
    relative
  } = _temp2 === undefined ? {} : _temp2;
  let {
    future
  } = reactExports.useContext(NavigationContext);
  let {
    matches
  } = reactExports.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches, future.v7_relativeSplatPath));
  return reactExports.useMemo(() => resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, relative === "path"), [to, routePathnamesJson, locationPathname, relative]);
}
function useRoutesImpl(routes, locationArg, dataRouterState, future) {
  !useInRouterContext() ? invariant(false) : undefined;
  let {
    navigator
  } = reactExports.useContext(NavigationContext);
  let {
    matches: parentMatches
  } = reactExports.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  routeMatch && routeMatch.route;
  let locationFromContext = useLocation();
  let location;
  {
    location = locationFromContext;
  }
  let pathname = location.pathname || "/";
  let remainingPathname = pathname;
  if (parentPathnameBase !== "/") {
    let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
    let segments = pathname.replace(/^\//, "").split("/");
    remainingPathname = "/" + segments.slice(parentSegments.length).join("/");
  }
  let matches = matchRoutes(routes, {
    pathname: remainingPathname
  });
  let renderedMatches = _renderMatches(matches && matches.map((match) => Object.assign({}, match, {
    params: Object.assign({}, parentParams, match.params),
    pathname: joinPaths([
      parentPathnameBase,
      // Re-encode pathnames that were decoded inside matchRoutes
      navigator.encodeLocation ? navigator.encodeLocation(match.pathname).pathname : match.pathname
    ]),
    pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([
      parentPathnameBase,
      // Re-encode pathnames that were decoded inside matchRoutes
      navigator.encodeLocation ? navigator.encodeLocation(match.pathnameBase).pathname : match.pathnameBase
    ])
  })), parentMatches, dataRouterState, future);
  return renderedMatches;
}
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error) ? error.status + " " + error.statusText : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = {
    padding: "0.5rem",
    backgroundColor: lightgrey
  };
  let devInfo = null;
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ reactExports.createElement("h3", {
    style: {
      fontStyle: "italic"
    }
  }, message), stack ? /* @__PURE__ */ reactExports.createElement("pre", {
    style: preStyles
  }, stack) : null, devInfo);
}
const defaultErrorElement = /* @__PURE__ */ reactExports.createElement(DefaultErrorComponent, null);
class RenderErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation
      };
    }
    return {
      error: props.error !== undefined ? props.error : state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Router caught the following error during render", error, errorInfo);
  }
  render() {
    return this.state.error !== undefined ? /* @__PURE__ */ reactExports.createElement(RouteContext.Provider, {
      value: this.props.routeContext
    }, /* @__PURE__ */ reactExports.createElement(RouteErrorContext.Provider, {
      value: this.state.error,
      children: this.props.component
    })) : this.props.children;
  }
}
function RenderedRoute(_ref) {
  let {
    routeContext,
    match,
    children
  } = _ref;
  let dataRouterContext = reactExports.useContext(DataRouterContext);
  if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }
  return /* @__PURE__ */ reactExports.createElement(RouteContext.Provider, {
    value: routeContext
  }, children);
}
function _renderMatches(matches, parentMatches, dataRouterState, future) {
  var _dataRouterState;
  if (parentMatches === undefined) {
    parentMatches = [];
  }
  if (dataRouterState === undefined) {
    dataRouterState = null;
  }
  if (future === undefined) {
    future = null;
  }
  if (matches == null) {
    var _future;
    if (!dataRouterState) {
      return null;
    }
    if (dataRouterState.errors) {
      matches = dataRouterState.matches;
    } else if ((_future = future) != null && _future.v7_partialHydration && parentMatches.length === 0 && !dataRouterState.initialized && dataRouterState.matches.length > 0) {
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }
  let renderedMatches = matches;
  let errors = (_dataRouterState = dataRouterState) == null ? undefined : _dataRouterState.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex((m) => m.route.id && (errors == null ? undefined : errors[m.route.id]) !== undefined);
    !(errorIndex >= 0) ? invariant(false) : undefined;
    renderedMatches = renderedMatches.slice(0, Math.min(renderedMatches.length, errorIndex + 1));
  }
  let renderFallback = false;
  let fallbackIndex = -1;
  if (dataRouterState && future && future.v7_partialHydration) {
    for (let i = 0; i < renderedMatches.length; i++) {
      let match = renderedMatches[i];
      if (match.route.HydrateFallback || match.route.hydrateFallbackElement) {
        fallbackIndex = i;
      }
      if (match.route.id) {
        let {
          loaderData,
          errors: errors2
        } = dataRouterState;
        let needsToRunLoader = match.route.loader && loaderData[match.route.id] === undefined && (!errors2 || errors2[match.route.id] === undefined);
        if (match.route.lazy || needsToRunLoader) {
          renderFallback = true;
          if (fallbackIndex >= 0) {
            renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
          } else {
            renderedMatches = [renderedMatches[0]];
          }
          break;
        }
      }
    }
  }
  return renderedMatches.reduceRight((outlet, match, index) => {
    let error;
    let shouldRenderHydrateFallback = false;
    let errorElement = null;
    let hydrateFallbackElement = null;
    if (dataRouterState) {
      error = errors && match.route.id ? errors[match.route.id] : undefined;
      errorElement = match.route.errorElement || defaultErrorElement;
      if (renderFallback) {
        if (fallbackIndex < 0 && index === 0) {
          shouldRenderHydrateFallback = true;
          hydrateFallbackElement = null;
        } else if (fallbackIndex === index) {
          shouldRenderHydrateFallback = true;
          hydrateFallbackElement = match.route.hydrateFallbackElement || null;
        }
      }
    }
    let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
    let getChildren = () => {
      let children;
      if (error) {
        children = errorElement;
      } else if (shouldRenderHydrateFallback) {
        children = hydrateFallbackElement;
      } else if (match.route.Component) {
        children = /* @__PURE__ */ reactExports.createElement(match.route.Component, null);
      } else if (match.route.element) {
        children = match.route.element;
      } else {
        children = outlet;
      }
      return /* @__PURE__ */ reactExports.createElement(RenderedRoute, {
        match,
        routeContext: {
          outlet,
          matches: matches2,
          isDataRoute: dataRouterState != null
        },
        children
      });
    };
    return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ reactExports.createElement(RenderErrorBoundary, {
      location: dataRouterState.location,
      revalidation: dataRouterState.revalidation,
      component: errorElement,
      error,
      children: getChildren(),
      routeContext: {
        outlet: null,
        matches: matches2,
        isDataRoute: true
      }
    }) : getChildren();
  }, null);
}
var DataRouterHook$1 = /* @__PURE__ */ function(DataRouterHook2) {
  DataRouterHook2["UseBlocker"] = "useBlocker";
  DataRouterHook2["UseRevalidator"] = "useRevalidator";
  DataRouterHook2["UseNavigateStable"] = "useNavigate";
  return DataRouterHook2;
}(DataRouterHook$1 || {});
var DataRouterStateHook$1 = /* @__PURE__ */ function(DataRouterStateHook2) {
  DataRouterStateHook2["UseBlocker"] = "useBlocker";
  DataRouterStateHook2["UseLoaderData"] = "useLoaderData";
  DataRouterStateHook2["UseActionData"] = "useActionData";
  DataRouterStateHook2["UseRouteError"] = "useRouteError";
  DataRouterStateHook2["UseNavigation"] = "useNavigation";
  DataRouterStateHook2["UseRouteLoaderData"] = "useRouteLoaderData";
  DataRouterStateHook2["UseMatches"] = "useMatches";
  DataRouterStateHook2["UseRevalidator"] = "useRevalidator";
  DataRouterStateHook2["UseNavigateStable"] = "useNavigate";
  DataRouterStateHook2["UseRouteId"] = "useRouteId";
  return DataRouterStateHook2;
}(DataRouterStateHook$1 || {});
function useDataRouterContext$1(hookName) {
  let ctx = reactExports.useContext(DataRouterContext);
  !ctx ? invariant(false) : undefined;
  return ctx;
}
function useDataRouterState(hookName) {
  let state = reactExports.useContext(DataRouterStateContext);
  !state ? invariant(false) : undefined;
  return state;
}
function useRouteContext(hookName) {
  let route = reactExports.useContext(RouteContext);
  !route ? invariant(false) : undefined;
  return route;
}
function useCurrentRouteId(hookName) {
  let route = useRouteContext();
  let thisRoute = route.matches[route.matches.length - 1];
  !thisRoute.route.id ? invariant(false) : undefined;
  return thisRoute.route.id;
}
function useLoaderData() {
  let state = useDataRouterState(DataRouterStateHook$1.UseLoaderData);
  let routeId = useCurrentRouteId(DataRouterStateHook$1.UseLoaderData);
  if (state.errors && state.errors[routeId] != null) {
    console.error("You cannot `useLoaderData` in an errorElement (routeId: " + routeId + ")");
    return undefined;
  }
  return state.loaderData[routeId];
}
function useRouteError() {
  var _state$errors;
  let error = reactExports.useContext(RouteErrorContext);
  let state = useDataRouterState(DataRouterStateHook$1.UseRouteError);
  let routeId = useCurrentRouteId(DataRouterStateHook$1.UseRouteError);
  if (error !== undefined) {
    return error;
  }
  return (_state$errors = state.errors) == null ? undefined : _state$errors[routeId];
}
function useNavigateStable() {
  let {
    router
  } = useDataRouterContext$1(DataRouterHook$1.UseNavigateStable);
  let id = useCurrentRouteId(DataRouterStateHook$1.UseNavigateStable);
  let activeRef = reactExports.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = reactExports.useCallback(function(to, options) {
    if (options === undefined) {
      options = {};
    }
    if (!activeRef.current) return;
    if (typeof to === "number") {
      router.navigate(to);
    } else {
      router.navigate(to, _extends$1({
        fromRouteId: id
      }, options));
    }
  }, [router, id]);
  return navigate;
}
const alreadyWarned = {};
function warnOnce(key, message) {
  if (!alreadyWarned[message]) {
    alreadyWarned[message] = true;
    console.warn(message);
  }
}
const logDeprecation = (flag, msg, link) => warnOnce(flag, "⚠️ React Router Future Flag Warning: " + msg + ". " + ("You can use the `" + flag + "` future flag to opt-in early. ") + ("For more information, see " + link + "."));
function logV6DeprecationWarnings(renderFuture, routerFuture) {
  if ((renderFuture == null ? undefined : renderFuture.v7_startTransition) === undefined) {
    logDeprecation("v7_startTransition", "React Router will begin wrapping state updates in `React.startTransition` in v7", "https://reactrouter.com/v6/upgrading/future#v7_starttransition");
  }
  if ((renderFuture == null ? undefined : renderFuture.v7_relativeSplatPath) === undefined && (!routerFuture || !routerFuture.v7_relativeSplatPath)) {
    logDeprecation("v7_relativeSplatPath", "Relative route resolution within Splat routes is changing in v7", "https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath");
  }
  if (routerFuture) {
    if (routerFuture.v7_fetcherPersist === undefined) {
      logDeprecation("v7_fetcherPersist", "The persistence behavior of fetchers is changing in v7", "https://reactrouter.com/v6/upgrading/future#v7_fetcherpersist");
    }
    if (routerFuture.v7_normalizeFormMethod === undefined) {
      logDeprecation("v7_normalizeFormMethod", "Casing of `formMethod` fields is being normalized to uppercase in v7", "https://reactrouter.com/v6/upgrading/future#v7_normalizeformmethod");
    }
    if (routerFuture.v7_partialHydration === undefined) {
      logDeprecation("v7_partialHydration", "`RouterProvider` hydration behavior is changing in v7", "https://reactrouter.com/v6/upgrading/future#v7_partialhydration");
    }
    if (routerFuture.v7_skipActionErrorRevalidation === undefined) {
      logDeprecation("v7_skipActionErrorRevalidation", "The revalidation behavior after 4xx/5xx `action` responses is changing in v7", "https://reactrouter.com/v6/upgrading/future#v7_skipactionerrorrevalidation");
    }
  }
}
function Route(_props) {
  invariant(false);
}
function Router(_ref5) {
  let {
    basename: basenameProp = "/",
    children = null,
    location: locationProp,
    navigationType = Action.Pop,
    navigator,
    static: staticProp = false,
    future
  } = _ref5;
  !!useInRouterContext() ? invariant(false) : undefined;
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = reactExports.useMemo(() => ({
    basename,
    navigator,
    static: staticProp,
    future: _extends$1({
      v7_relativeSplatPath: false
    }, future)
  }), [basename, future, navigator, staticProp]);
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = reactExports.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  if (locationContext == null) {
    return null;
  }
  return /* @__PURE__ */ reactExports.createElement(NavigationContext.Provider, {
    value: navigationContext
  }, /* @__PURE__ */ reactExports.createElement(LocationContext.Provider, {
    children,
    value: locationContext
  }));
}
new Promise(() => {
});
function createRoutesFromChildren(children, parentPath) {
  if (parentPath === undefined) {
    parentPath = [];
  }
  let routes = [];
  reactExports.Children.forEach(children, (element, index) => {
    if (!/* @__PURE__ */ reactExports.isValidElement(element)) {
      return;
    }
    let treePath = [...parentPath, index];
    if (element.type === reactExports.Fragment) {
      routes.push.apply(routes, createRoutesFromChildren(element.props.children, treePath));
      return;
    }
    !(element.type === Route) ? invariant(false) : undefined;
    !(!element.props.index || !element.props.children) ? invariant(false) : undefined;
    let route = {
      id: element.props.id || treePath.join("-"),
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      Component: element.props.Component,
      index: element.props.index,
      path: element.props.path,
      loader: element.props.loader,
      action: element.props.action,
      errorElement: element.props.errorElement,
      ErrorBoundary: element.props.ErrorBoundary,
      hasErrorBoundary: element.props.ErrorBoundary != null || element.props.errorElement != null,
      shouldRevalidate: element.props.shouldRevalidate,
      handle: element.props.handle,
      lazy: element.props.lazy
    };
    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children, treePath);
    }
    routes.push(route);
  });
  return routes;
}
function mapRouteProperties(route) {
  let updates = {
    // Note: this check also occurs in createRoutesFromChildren so update
    // there if you change this -- please and thank you!
    hasErrorBoundary: route.ErrorBoundary != null || route.errorElement != null
  };
  if (route.Component) {
    Object.assign(updates, {
      element: /* @__PURE__ */ reactExports.createElement(route.Component),
      Component: undefined
    });
  }
  if (route.HydrateFallback) {
    Object.assign(updates, {
      hydrateFallbackElement: /* @__PURE__ */ reactExports.createElement(route.HydrateFallback),
      HydrateFallback: undefined
    });
  }
  if (route.ErrorBoundary) {
    Object.assign(updates, {
      errorElement: /* @__PURE__ */ reactExports.createElement(route.ErrorBoundary),
      ErrorBoundary: undefined
    });
  }
  return updates;
}

/**
 * React Router DOM v6.28.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
const _excluded = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset", "viewTransition"], _excluded2 = ["aria-current", "caseSensitive", "className", "end", "style", "to", "viewTransition", "children"];
const REACT_ROUTER_VERSION = "6";
try {
  window.__reactRouterVersion = REACT_ROUTER_VERSION;
} catch (e) {
}
function createHashRouter(routes, opts) {
  return createRouter({
    basename: undefined ,
    future: _extends({}, undefined , {
      v7_prependBasename: true,
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }),
    history: createHashHistory({
      window: undefined 
    }),
    hydrationData: parseHydrationData(),
    routes,
    mapRouteProperties: mapRouteProperties,
    dataStrategy: undefined ,
    patchRoutesOnNavigation: undefined ,
    window: undefined 
  }).initialize();
}
function parseHydrationData() {
  var _window;
  let state = (_window = window) == null ? undefined : _window.__staticRouterHydrationData;
  if (state && state.errors) {
    state = _extends({}, state, {
      errors: deserializeErrors(state.errors)
    });
  }
  return state;
}
function deserializeErrors(errors) {
  if (!errors) return null;
  let entries = Object.entries(errors);
  let serialized = {};
  for (let [key, val] of entries) {
    if (val && val.__type === "RouteErrorResponse") {
      serialized[key] = new ErrorResponseImpl(val.status, val.statusText, val.data, val.internal === true);
    } else if (val && val.__type === "Error") {
      if (val.__subType) {
        let ErrorConstructor = window[val.__subType];
        if (typeof ErrorConstructor === "function") {
          try {
            let error = new ErrorConstructor(val.message);
            error.stack = "";
            serialized[key] = error;
          } catch (e) {
          }
        }
      }
      if (serialized[key] == null) {
        let error = new Error(val.message);
        error.stack = "";
        serialized[key] = error;
      }
    } else {
      serialized[key] = val;
    }
  }
  return serialized;
}
const ViewTransitionContext = /* @__PURE__ */ reactExports.createContext({
  isTransitioning: false
});
const FetchersContext = /* @__PURE__ */ reactExports.createContext(/* @__PURE__ */ new Map());
const START_TRANSITION = "startTransition";
const startTransitionImpl = React[START_TRANSITION];
const FLUSH_SYNC = "flushSync";
const flushSyncImpl = ReactDOM[FLUSH_SYNC];
function startTransitionSafe(cb) {
  if (startTransitionImpl) {
    startTransitionImpl(cb);
  } else {
    cb();
  }
}
function flushSyncSafe(cb) {
  if (flushSyncImpl) {
    flushSyncImpl(cb);
  } else {
    cb();
  }
}
class Deferred {
  constructor() {
    this.status = "pending";
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (value) => {
        if (this.status === "pending") {
          this.status = "resolved";
          resolve(value);
        }
      };
      this.reject = (reason) => {
        if (this.status === "pending") {
          this.status = "rejected";
          reject(reason);
        }
      };
    });
  }
}
function RouterProvider(_ref) {
  let {
    fallbackElement,
    router,
    future
  } = _ref;
  let [state, setStateImpl] = reactExports.useState(router.state);
  let [pendingState, setPendingState] = reactExports.useState();
  let [vtContext, setVtContext] = reactExports.useState({
    isTransitioning: false
  });
  let [renderDfd, setRenderDfd] = reactExports.useState();
  let [transition, setTransition] = reactExports.useState();
  let [interruption, setInterruption] = reactExports.useState();
  let fetcherData = reactExports.useRef(/* @__PURE__ */ new Map());
  let {
    v7_startTransition
  } = future || {};
  let optInStartTransition = reactExports.useCallback((cb) => {
    if (v7_startTransition) {
      startTransitionSafe(cb);
    } else {
      cb();
    }
  }, [v7_startTransition]);
  let setState = reactExports.useCallback((newState, _ref2) => {
    let {
      deletedFetchers,
      flushSync,
      viewTransitionOpts
    } = _ref2;
    deletedFetchers.forEach((key) => fetcherData.current.delete(key));
    newState.fetchers.forEach((fetcher, key) => {
      if (fetcher.data !== undefined) {
        fetcherData.current.set(key, fetcher.data);
      }
    });
    let isViewTransitionUnavailable = router.window == null || router.window.document == null || typeof router.window.document.startViewTransition !== "function";
    if (!viewTransitionOpts || isViewTransitionUnavailable) {
      if (flushSync) {
        flushSyncSafe(() => setStateImpl(newState));
      } else {
        optInStartTransition(() => setStateImpl(newState));
      }
      return;
    }
    if (flushSync) {
      flushSyncSafe(() => {
        if (transition) {
          renderDfd && renderDfd.resolve();
          transition.skipTransition();
        }
        setVtContext({
          isTransitioning: true,
          flushSync: true,
          currentLocation: viewTransitionOpts.currentLocation,
          nextLocation: viewTransitionOpts.nextLocation
        });
      });
      let t = router.window.document.startViewTransition(() => {
        flushSyncSafe(() => setStateImpl(newState));
      });
      t.finished.finally(() => {
        flushSyncSafe(() => {
          setRenderDfd(undefined);
          setTransition(undefined);
          setPendingState(undefined);
          setVtContext({
            isTransitioning: false
          });
        });
      });
      flushSyncSafe(() => setTransition(t));
      return;
    }
    if (transition) {
      renderDfd && renderDfd.resolve();
      transition.skipTransition();
      setInterruption({
        state: newState,
        currentLocation: viewTransitionOpts.currentLocation,
        nextLocation: viewTransitionOpts.nextLocation
      });
    } else {
      setPendingState(newState);
      setVtContext({
        isTransitioning: true,
        flushSync: false,
        currentLocation: viewTransitionOpts.currentLocation,
        nextLocation: viewTransitionOpts.nextLocation
      });
    }
  }, [router.window, transition, renderDfd, fetcherData, optInStartTransition]);
  reactExports.useLayoutEffect(() => router.subscribe(setState), [router, setState]);
  reactExports.useEffect(() => {
    if (vtContext.isTransitioning && !vtContext.flushSync) {
      setRenderDfd(new Deferred());
    }
  }, [vtContext]);
  reactExports.useEffect(() => {
    if (renderDfd && pendingState && router.window) {
      let newState = pendingState;
      let renderPromise = renderDfd.promise;
      let transition2 = router.window.document.startViewTransition(async () => {
        optInStartTransition(() => setStateImpl(newState));
        await renderPromise;
      });
      transition2.finished.finally(() => {
        setRenderDfd(undefined);
        setTransition(undefined);
        setPendingState(undefined);
        setVtContext({
          isTransitioning: false
        });
      });
      setTransition(transition2);
    }
  }, [optInStartTransition, pendingState, renderDfd, router.window]);
  reactExports.useEffect(() => {
    if (renderDfd && pendingState && state.location.key === pendingState.location.key) {
      renderDfd.resolve();
    }
  }, [renderDfd, transition, state.location, pendingState]);
  reactExports.useEffect(() => {
    if (!vtContext.isTransitioning && interruption) {
      setPendingState(interruption.state);
      setVtContext({
        isTransitioning: true,
        flushSync: false,
        currentLocation: interruption.currentLocation,
        nextLocation: interruption.nextLocation
      });
      setInterruption(undefined);
    }
  }, [vtContext.isTransitioning, interruption]);
  reactExports.useEffect(() => {
  }, []);
  let navigator = reactExports.useMemo(() => {
    return {
      createHref: router.createHref,
      encodeLocation: router.encodeLocation,
      go: (n) => router.navigate(n),
      push: (to, state2, opts) => router.navigate(to, {
        state: state2,
        preventScrollReset: opts == null ? undefined : opts.preventScrollReset
      }),
      replace: (to, state2, opts) => router.navigate(to, {
        replace: true,
        state: state2,
        preventScrollReset: opts == null ? undefined : opts.preventScrollReset
      })
    };
  }, [router]);
  let basename = router.basename || "/";
  let dataRouterContext = reactExports.useMemo(() => ({
    router,
    navigator,
    static: false,
    basename
  }), [router, navigator, basename]);
  let routerFuture = reactExports.useMemo(() => ({
    v7_relativeSplatPath: router.future.v7_relativeSplatPath
  }), [router.future.v7_relativeSplatPath]);
  reactExports.useEffect(() => logV6DeprecationWarnings(future, router.future), [future, router.future]);
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(DataRouterContext.Provider, {
    value: dataRouterContext
  }, /* @__PURE__ */ reactExports.createElement(DataRouterStateContext.Provider, {
    value: state
  }, /* @__PURE__ */ reactExports.createElement(FetchersContext.Provider, {
    value: fetcherData.current
  }, /* @__PURE__ */ reactExports.createElement(ViewTransitionContext.Provider, {
    value: vtContext
  }, /* @__PURE__ */ reactExports.createElement(Router, {
    basename,
    location: state.location,
    navigationType: state.historyAction,
    navigator,
    future: routerFuture
  }, state.initialized || router.future.v7_partialHydration ? /* @__PURE__ */ reactExports.createElement(MemoizedDataRoutes, {
    routes: router.routes,
    future: router.future,
    state
  }) : fallbackElement))))), null);
}
const MemoizedDataRoutes = /* @__PURE__ */ reactExports.memo(DataRoutes);
function DataRoutes(_ref3) {
  let {
    routes,
    future,
    state
  } = _ref3;
  return useRoutesImpl(routes, undefined, state, future);
}
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const Link = /* @__PURE__ */ reactExports.forwardRef(function LinkWithRef(_ref7, ref) {
  let {
    onClick,
    relative,
    reloadDocument,
    replace: replace2,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition
  } = _ref7, rest = _objectWithoutPropertiesLoose(_ref7, _excluded);
  let {
    basename
  } = reactExports.useContext(NavigationContext);
  let absoluteHref;
  let isExternal = false;
  if (typeof to === "string" && ABSOLUTE_URL_REGEX.test(to)) {
    absoluteHref = to;
    if (isBrowser) {
      try {
        let currentUrl = new URL(window.location.href);
        let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
        let path = stripBasename(targetUrl.pathname, basename);
        if (targetUrl.origin === currentUrl.origin && path != null) {
          to = path + targetUrl.search + targetUrl.hash;
        } else {
          isExternal = true;
        }
      } catch (e) {
      }
    }
  }
  let href = useHref(to, {
    relative
  });
  let internalOnClick = useLinkClickHandler(to, {
    replace: replace2,
    state,
    target,
    preventScrollReset,
    relative,
    viewTransition
  });
  function handleClick(event) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented) {
      internalOnClick(event);
    }
  }
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    /* @__PURE__ */ reactExports.createElement("a", _extends({}, rest, {
      href: absoluteHref || href,
      onClick: isExternal || reloadDocument ? onClick : handleClick,
      ref,
      target
    }))
  );
});
const NavLink = /* @__PURE__ */ reactExports.forwardRef(function NavLinkWithRef(_ref8, ref) {
  let {
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children
  } = _ref8, rest = _objectWithoutPropertiesLoose(_ref8, _excluded2);
  let path = useResolvedPath(to, {
    relative: rest.relative
  });
  let location = useLocation();
  let routerState = reactExports.useContext(DataRouterStateContext);
  let {
    navigator,
    basename
  } = reactExports.useContext(NavigationContext);
  let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useViewTransitionState(path) && viewTransition === true;
  let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
  let locationPathname = location.pathname;
  let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
    toPathname = toPathname.toLowerCase();
  }
  if (nextLocationPathname && basename) {
    nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
  }
  const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
  let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
  let renderProps = {
    isActive,
    isPending,
    isTransitioning
  };
  let ariaCurrent = isActive ? ariaCurrentProp : undefined;
  let className;
  if (typeof classNameProp === "function") {
    className = classNameProp(renderProps);
  } else {
    className = [classNameProp, isActive ? "active" : null, isPending ? "pending" : null, isTransitioning ? "transitioning" : null].filter(Boolean).join(" ");
  }
  let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
  return /* @__PURE__ */ reactExports.createElement(Link, _extends({}, rest, {
    "aria-current": ariaCurrent,
    className,
    ref,
    style,
    to,
    viewTransition
  }), typeof children === "function" ? children(renderProps) : children);
});
var DataRouterHook;
(function(DataRouterHook2) {
  DataRouterHook2["UseScrollRestoration"] = "useScrollRestoration";
  DataRouterHook2["UseSubmit"] = "useSubmit";
  DataRouterHook2["UseSubmitFetcher"] = "useSubmitFetcher";
  DataRouterHook2["UseFetcher"] = "useFetcher";
  DataRouterHook2["useViewTransitionState"] = "useViewTransitionState";
})(DataRouterHook || (DataRouterHook = {}));
var DataRouterStateHook;
(function(DataRouterStateHook2) {
  DataRouterStateHook2["UseFetcher"] = "useFetcher";
  DataRouterStateHook2["UseFetchers"] = "useFetchers";
  DataRouterStateHook2["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook || (DataRouterStateHook = {}));
function useDataRouterContext(hookName) {
  let ctx = reactExports.useContext(DataRouterContext);
  !ctx ? invariant(false) : undefined;
  return ctx;
}
function useLinkClickHandler(to, _temp) {
  let {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
    viewTransition
  } = _temp === undefined ? {} : _temp;
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, {
    relative
  });
  return reactExports.useCallback((event) => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault();
      let replace2 = replaceProp !== undefined ? replaceProp : createPath(location) === createPath(path);
      navigate(to, {
        replace: replace2,
        state,
        preventScrollReset,
        relative,
        viewTransition
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to, preventScrollReset, relative, viewTransition]);
}
function useViewTransitionState(to, opts) {
  if (opts === undefined) {
    opts = {};
  }
  let vtContext = reactExports.useContext(ViewTransitionContext);
  !(vtContext != null) ? invariant(false) : undefined;
  let {
    basename
  } = useDataRouterContext(DataRouterHook.useViewTransitionState);
  let path = useResolvedPath(to, {
    relative: opts.relative
  });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}

const icon = "/logo/icon-48.png";

var fetchRetry_umd = {exports: {}};

(function (module, exports) {
	(function(global, factory) {
	  module.exports = factory() ;
	})(commonjsGlobal, function() {
	  var fetchRetry = function(fetch, defaults) {
	    defaults = defaults || {};
	    if (typeof fetch !== "function") {
	      throw new ArgumentError("fetch must be a function");
	    }
	    if (typeof defaults !== "object") {
	      throw new ArgumentError("defaults must be an object");
	    }
	    if (defaults.retries !== undefined && !isPositiveInteger(defaults.retries)) {
	      throw new ArgumentError("retries must be a positive integer");
	    }
	    if (defaults.retryDelay !== undefined && !isPositiveInteger(defaults.retryDelay) && typeof defaults.retryDelay !== "function") {
	      throw new ArgumentError("retryDelay must be a positive integer or a function returning a positive integer");
	    }
	    if (defaults.retryOn !== undefined && !Array.isArray(defaults.retryOn) && typeof defaults.retryOn !== "function") {
	      throw new ArgumentError("retryOn property expects an array or function");
	    }
	    var baseDefaults = {
	      retries: 3,
	      retryDelay: 1e3,
	      retryOn: []
	    };
	    defaults = Object.assign(baseDefaults, defaults);
	    return function fetchRetry2(input, init) {
	      var retries = defaults.retries;
	      var retryDelay = defaults.retryDelay;
	      var retryOn = defaults.retryOn;
	      if (init && init.retries !== undefined) {
	        if (isPositiveInteger(init.retries)) {
	          retries = init.retries;
	        } else {
	          throw new ArgumentError("retries must be a positive integer");
	        }
	      }
	      if (init && init.retryDelay !== undefined) {
	        if (isPositiveInteger(init.retryDelay) || typeof init.retryDelay === "function") {
	          retryDelay = init.retryDelay;
	        } else {
	          throw new ArgumentError("retryDelay must be a positive integer or a function returning a positive integer");
	        }
	      }
	      if (init && init.retryOn) {
	        if (Array.isArray(init.retryOn) || typeof init.retryOn === "function") {
	          retryOn = init.retryOn;
	        } else {
	          throw new ArgumentError("retryOn property expects an array or function");
	        }
	      }
	      return new Promise(function(resolve, reject) {
	        var wrappedFetch = function(attempt) {
	          var _input = typeof Request !== "undefined" && input instanceof Request ? input.clone() : input;
	          fetch(_input, init).then(function(response) {
	            if (Array.isArray(retryOn) && retryOn.indexOf(response.status) === -1) {
	              resolve(response);
	            } else if (typeof retryOn === "function") {
	              try {
	                return Promise.resolve(retryOn(attempt, null, response)).then(function(retryOnResponse) {
	                  if (retryOnResponse) {
	                    retry(attempt, null, response);
	                  } else {
	                    resolve(response);
	                  }
	                }).catch(reject);
	              } catch (error) {
	                reject(error);
	              }
	            } else {
	              if (attempt < retries) {
	                retry(attempt, null, response);
	              } else {
	                resolve(response);
	              }
	            }
	          }).catch(function(error) {
	            if (typeof retryOn === "function") {
	              try {
	                Promise.resolve(retryOn(attempt, error, null)).then(function(retryOnResponse) {
	                  if (retryOnResponse) {
	                    retry(attempt, error, null);
	                  } else {
	                    reject(error);
	                  }
	                }).catch(function(error2) {
	                  reject(error2);
	                });
	              } catch (error2) {
	                reject(error2);
	              }
	            } else if (attempt < retries) {
	              retry(attempt, error, null);
	            } else {
	              reject(error);
	            }
	          });
	        };
	        function retry(attempt, error, response) {
	          var delay = typeof retryDelay === "function" ? retryDelay(attempt, error, response) : retryDelay;
	          setTimeout(function() {
	            wrappedFetch(++attempt);
	          }, delay);
	        }
	        wrappedFetch(0);
	      });
	    };
	  };
	  function isPositiveInteger(value) {
	    return Number.isInteger(value) && value >= 0;
	  }
	  function ArgumentError(message) {
	    this.name = "ArgumentError";
	    this.message = message;
	  }
	  return fetchRetry;
	}); 
} (fetchRetry_umd));

var fetchRetry_umdExports = fetchRetry_umd.exports;
const fr = /*@__PURE__*/getDefaultExportFromCjs(fetchRetry_umdExports);

const fetchRtry = fr(fetch);

const slugify = (text) => {
    // Normalize the text to remove diacritics and special characters
    const normalizedText = text.normalize('NFKD').replace(/[^\w\s-]/g, '').toLowerCase();
    // Replace spaces with dashes
    const slug = normalizedText.replace(/\s+/g, '-');
    // Remove any remaining non-alphanumeric characters except for dashes
    const finalSlug = slug.replace(/[^a-z0-9-]/g, '');
    // Remove leading and trailing dashes
    return finalSlug.replace(/^-+|-+$/g, '');
};
const isTimeExpired = (tmStamp,useMiliseconds=true) => {
    if(!useMiliseconds){
        return tmStamp <= (new Date).getTime()
    }
	let expDt = new Date(tmStamp * 1000); // Convert seconds to milliseconds
  	let currStamp = Date.now() / 1000; // Convert milliseconds to seconds
  	let currDt = new Date(currStamp * 1000);

  	return expDt <= currDt
};
const slugToTitle = (slug) => {
	var words = slug.split('-');
  	var titleCaseWords = words.map(function(word) {
    	return word.charAt(0).toUpperCase() + word.slice(1)
  	});
  	
  	return titleCaseWords.join(' ')
};

const getNText = (p,queries) => {
	let nd=p;
    let c=queries;
    let text="";
	if(Array.isArray(queries)){
		let maxLen = c.length - 1;
		let idx = 0;
		let cEl = nd;
		let breakTheLoop = false;

		for(let ic of c){
			let icEl = cEl.find(ic);
			if(icEl.length === 0 || breakTheLoop){
				break
			}

			if(idx >= maxLen){
				if(icEl.length > 0){
					text = icEl.text();
				}
			}else {
				cEl = icEl;
			}
			idx += 1;

		}
	}else {
		let cNd = nd.find(c);
		if(cNd.length > 0){
			text = cNd.text();
		}
	}

	return text
    
	
};
const getAuthors = async(doc,mAuthor,mCourse,course) => {
    let authors= mAuthor.getListByCourse(course);

    if(authors.length == 0){
        // authors=[]
        const [p,courseUrn] = getCourseXmlParentElement(doc);
        let authorEls=p.find("authors");
        if(authorEls.length == 0){
            authorEls= p.find("star_authorsv2");
        }
        
        for (const authorEl of authorEls){
            let authorUrn = jQuery$1(authorEl).text();
            let authorEntityEls=doc.find(`entityUrn:contains('${authorUrn}')`);
            authorEntityEls=authorEntityEls.filter((i,item)=> jQuery$1(item).text().trim().match(/urn:li:learningApiAuthor:/));
            if(authorEntityEls.length > 0){
                for(const authorEntityElem of authorEntityEls){
                    const authorEntityEl = jQuery$1(authorEntityElem);
                    const authorEntityUrn = authorEntityEl.text().trim();
                    if(authorEntityUrn.length > 0){
                        
                        if(authorEntityUrn == authorUrn){
                            let authorEntityElP = authorEntityEl.parent();
                            let slug = getNText(authorEntityElP,'slug');
                            let name=slugToTitle(slug);
                            let biography=getNText(authorEntityElP,['biographyV2','text']);
                            let shortBiography=getNText(authorEntityElP,['shortBiographyV2','text']);
                            let author = await mAuthor.create(name,slug,biography,shortBiography,course.id);
                            // let author = {
                            //     slug, name, biography, shortBiography
                            // }
                            if(author){
                                await mCourse.addAuthorId(course.id, author.id);
                            }
                            authors.push(author);
                            // m_author.addCourse(author,course)
                        }
                    }
                }
            }
        }
    }
        
            
    return authors
};
const getCourseInfo = async(doc,courseSlug,mCourse,mExerciseFile,mThumbnail,noCache=false) => {
    let course = null;
    if(!noCache){
        course = mCourse.getBySlug(courseSlug);

        if(course){
            course.exerciseFiles = mExerciseFile.getListByCourseId(course.id);
            // if()
            course.thumbnails = mThumbnail.getListByCourseId(course.id);
            return course
        }
    }
    // let course = null
	const [p,courseUrn] = getCourseXmlParentElement(doc);
	if(p){
		let courseSlugFound = p.find('slug:first').text();
		console.log(`course slug found : ${courseSlugFound}`);
		course = {
			url : `https://www.linkedin.com/learning/${courseSlug}`,
			slug : courseSlug,
			exerciseFiles : [],
			sourceCodeRepository : null,
			description : null,
			urn : courseUrn
		};
		course.title = p.find('title:first').text();
		course.visibility = p.find('visibility').text();

		let viewerCounts = p.find('viewerCounts');
		if(viewerCounts.length > 0){
			course.viewerCounts = parseInt(viewerCounts.find('total').text());
		}

		course.description = p.find('description').text();
		course.descriptionV2 = p.find('descriptionV2 text').text();
		if(course.descriptionV2){
			course.description = course.descriptionV2;
		}
        let descriptionV3 = p.find('descriptionV3 text');
        if(descriptionV3.length > 0){
            // console.log(descriptionV3.html())   
            // try{
                course.descriptionV3 = jQuery$1(descriptionV3[0].firstChild).text();
            	// course.descriptionV3 = descriptionV3[0].firstChild.innerText

            // }catch(e){
                // console.error(e)
            // }
        	if(course.descriptionV3){
				course.description = course.descriptionV3;
			}
        }
		let duration = p.find('duration');
		if(duration.length>0){
			course.duration = parseInt(p.find('duration').text());
		}

        // if(course.description){
        //     course.description = course.description.replace(/com.linkedin.learning.api.common.AttributedText/,'')
        // }
		let dificulty = p.find('dificulty');
		if(dificulty.length > 0){
			course.dificulty = dificulty.find('difficultylevel').text();
		}

        

        let sourceCodeRepo=p.find('sourceCodeRepository');
        if(sourceCodeRepo.length > 0){
        	// course.sourceCodeRepository = 
        	const repoUrl = sourceCodeRepo.text();
        	if(isValidUrl(repoUrl)){
        		course.sourceCodeRepository = repoUrl;
        	}
        	// console.log(sourceCodeRepo.html())
        }

        let tags = ["sizeInBytes","name","url"];
        let exerciseFilesNds = p.find('exerciseFiles');
        let exerciseFiles = [];

        if(exerciseFilesNds.length > 0){
            for(const exerciseFileElem of exerciseFilesNds){
                const exerciseFileElemNd = jQuery$1(exerciseFileElem);
                console.log(exerciseFileElemNd.html());
                const exerciseFileItem = {};
                for(let i in tags){
                    const tag = tags[i];
                    let exerciseFileNd = exerciseFileElemNd.find(tag);
                    if(exerciseFileNd.length>0){
                        const text = exerciseFileNd.text().trim();
                        

                        if(tag == 'sizeInBytes'){
                            exerciseFileItem[tag] = parseInt(text);
                        }else {
                            exerciseFileItem[tag] = text;
                        }
                    }
                }
                
                exerciseFiles.push(exerciseFileItem);
            }
            
        }
        // return
        const {title,slug,sourceCodeRepository,description,urn} = course;
        console.log(course);
        // exerciseFiles = course.exerciseFiles
		course = await mCourse.create(title,slug,course.duration,sourceCodeRepository,description,urn);
        course.exerciseFiles = [];
        if(exerciseFiles.length>0){
            for(let exIdx in exerciseFiles){
                try{
                    const exItem = exerciseFiles[exIdx];
                    if(exItem.name.length > 0){
                        // create(name,url,size,courseId)
                        const {sizeInBytes,name,url} = exItem;
                        const savedExerciseFile = await mExerciseFile.create(name,url,sizeInBytes,course.id);
                        course.exerciseFiles.push(savedExerciseFile);
                    }
                }catch(e){
                    // console.error(e)
                }
            }
            
            
        }
        // Get course thumbnails
        let thumbRootUrl = p.find('primaryThumbnail rootUrl:first').text().trim(); 
        let thumbRootUrlV2 = p.find('primaryThumbnailV2 rootUrl:first').text().trim(); 
        if(thumbRootUrlV2.length > 0){
            thumbRootUrl = thumbRootUrlV2;
        }
        const thumbs  = p.find('primaryThumbnail artifacts');
        const thumbV2s = p.find('primaryThumbnailV2 artifacts');
        console.log(thumbs,thumbRootUrl);
        console.log(thumbV2s,thumbRootUrlV2);
        const thumbnails = [];
        if(thumbs.length > 0){
            for(const artifactEl of thumbs){
                const artifact = el2Obj(artifactEl);
                if(artifact){
                    const thumbUrl = getThumbUrlFromArtifact(artifact, thumbRootUrl);
                    // console.log(thumbUrl)
                    const size = `${artifact.width}x${artifact.height}`;
                    const expiresAt = parseInt(artifact.expiresat);
                    const thumbnail = await mThumbnail.create(course.id, size, thumbUrl, expiresAt);
                    thumbnails.push(thumbnail);
                }
            }
        }else if(thumbV2s.length > 0){
            for(const artifactEl of thumbV2s){
                const artifact = el2Obj(artifactEl);
                if(artifact){
                    const thumbUrl = getThumbUrlFromArtifact(artifact, thumbRootUrlV2);
                    // console.log(thumbUrl)
                    const size = `${artifact.width}x${artifact.height}`;
                    const expiresAt = parseInt(artifact.expiresat);
                    const thumbnail = await mThumbnail.create(course.id, size, thumbUrl, expiresAt);
                    thumbnails.push(thumbnail);
                }
            }
        }
        course.thumbnails = thumbnails;
        return course
	}
	return null
};
const getCourseSections = async(p,doc,mSection,courseId) => {
	let sections = mSection.getListByCourseId(courseId);
    if (sections.length > 0){
        return sections
	}
    let courseSectionStars = p.find("contents");
    if(courseSectionStars.length == 0){
        courseSectionStars = p.find("contentsderived");
    }
    sections=[];
    for (const sectionStarEl of courseSectionStars){
		const sectionStar = jQuery$1(sectionStarEl).text().trim();
        let sectionNds = doc.find(`cachingKey:contains('${sectionStar}')`);
        // # print("213:%s" % section_star)
        if (sectionNds.length > 0){
            for(const sectionNdElem of sectionNds){
                const sectionNd = jQuery$1(sectionNdElem);
                const sectionNdStar = sectionNd.text().trim();
                if(sectionNdStar == sectionStar){

                    let sectionNdP= sectionNd.parent();
                    let sectionTitleEl=sectionNdP.find("title");
                    if(sectionTitleEl.length > 0){
                        const sectionTitle = sectionTitleEl.text();
                        // # print(section_title)
                        const sectionSlug=slugify(sectionTitle);
                        let section = {
                            title : sectionTitle,
                            itemStars : [],
                            slug : sectionSlug
                        };
                        let itemStarNds = sectionNdP.find("star_items");
                        if (itemStarNds.length == 0){
                            itemStarNds = sectionNdP.find("star_video");
                        }
                        // # item_stars=[]
                        if (itemStarNds.length > 0){
                            for(const itemStarEl of itemStarNds){
                                const itemStar = jQuery$1(itemStarEl).text().trim();
                                const skipPattern = "urn:li:learningApiTocItem:urn:li:learningApiAssessmen";
                                const matchSkipPattern = itemStar.match(skipPattern);
                                if(matchSkipPattern);else {
                                    if(itemStar.length > 0){
                                        section.itemStars.push(itemStar);
                                    }
                                }
                            }
                        }
                        const {title, itemStars, slug} = section;    
                        const row = await mSection.create(title, slug, courseId,itemStars);
                        sections.push(row);
                    }
                }
            }
		}
	}
    return sections
};
const isValidUrl = url => {
  var urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  return urlRegex.test(url);
};
const courseUrlFromSlug = (courseSlug) => {
	return `https://www.linkedin.com/learning/${courseSlug}`
};
const authorUrlFromSlug = (authorSlug) => {
    return `https://www.linkedin.com/learning/instructors/${authorSlug}`
};
// const getCourseXmlDoc = async(courseUrl, noCache=false) => {


// }
// const getCourseXmlDoc = async(tocSlug, tocUrl, noCache=false) => {

// }
const sanitizeKeys = (obj) => {
	if(Array.isArray(obj)){
	    return obj.map(item=> {
	        return typeof item === 'object'? sanitizeKeys(item) : item
	    })
	}

	let sanitizedObj = {};

	for (const key in obj) {
	    if (obj.hasOwnProperty(key)) {
	      let sanitizedKey = key.replace(/^\$/, '');
	      sanitizedKey = sanitizedKey.replace(/^\@/, '');
	      sanitizedKey = sanitizedKey.replace(/^\#/, '');
	      sanitizedKey = sanitizedKey.replace(/^\*/, 'star_');
	      sanitizedKey = /^\d/.test(sanitizedKey) ? `child_element_${sanitizedKey}` : sanitizedKey;
	       if (typeof obj[key] === 'object') {
	        sanitizedObj[sanitizedKey] = sanitizeKeys(obj[key]);
	      } else {
	        sanitizedObj[sanitizedKey] = obj[key];
	      }
	    }
	  }
	return sanitizedObj
};
const OBJtoXML = (obj) =>{
    var xml = '';
    for (var prop in obj) {
        xml += "<" + prop + ">";
        if(Array.isArray(obj[prop])) {
            for (var array of obj[prop]) {

                // A real botch fix here
                xml += "</" + prop + ">";
                xml += "<" + prop + ">";

                xml += OBJtoXML(new Object(array));
            }
        } else if (typeof obj[prop] == "object" && typeof obj[prop] !== "string") {
            xml += OBJtoXML(new Object(obj[prop]));
        } else {
            xml += obj[prop];
        }
        xml += "</" + prop + ">";
    }
    var xml = xml.replace(/<\/?[0-9]{1,}>/g,'');
    return xml
};
const convertJsonToXml = (schema) => {
	const row = sanitizeKeys({schema});
    const result = OBJtoXML({root:row});
    // console.log(result)
    return result
    // let options = {compact: true, ignoreComment: true, spaces: 4}
    // let result = xmlbuilder.json2xml(row, options)
    // return result
	/*Old Code*/
    /*const root = xmlbuilder.create('root');
	const convert = (obj, parent) => {
	  if(typeof obj === "string"){
	    parent.text(obj)
	    return
	  }  
	  for (const key in obj) {
	    if (obj.hasOwnProperty(key)) {
	      if (Array.isArray(obj[key])) {
	        obj[key].forEach((item) => {
	          const arrayElement = parent.ele(key);
	          convert(item, arrayElement);
	        });
	      } else if (typeof obj[key] === 'object') {
	        const child = parent.ele(key)
	        convert(obj[key], child)
	      } else {
	        try{
	            parent.ele(key).text(obj[key])
	        }catch(e){
	        }
	      }
	    }
	  }
	};

	convert(row, root)
	return root.end({ pretty: true })
    */
};
const parseJsonSchema = (responseText) => {
    jQuery$1.expr[':'].containsRegex = jQuery$1.expr.createPseudo(function (pattern) {
        var regex = new RegExp(pattern, 'i');
        return function (elem) {
            return regex.test(jQuery$1(elem).text())
        }
    });
    let errorMessage = null;
    const elDiv  = jQuery$1(`<div>${responseText}</div>`);
    
    
    const signInBtns = elDiv.find('a:containsRegex("sign in")');

    if(signInBtns.length > 0){
      errorMessage = "ERR_NO_LOGIN";
    }
    const elCodes = elDiv.find('code');
    let dataCodes = [];

    if(! errorMessage){
      for(let codeIndex in elCodes){
          let elCode = elCodes[codeIndex];
          try{
              if(elCode.id.match(/^bpr-guid/)){
                  dataCodes.push(JSON.parse(elCode.textContent));
              }
          }catch(e){}
      }
    }

    return [dataCodes,errorMessage]
};
const getTranscripts = async (vMetaDataNd,doc,toc,mTranscript) => {
	let transcripts = null;
    try{
        transcripts = mTranscript.getListByTocIdAsObject(toc.id);
    }catch(e){
        console.error(e);
    }

    if (transcripts) {
        console.log('transcripts_get_from_m_transcript');
        return transcripts
    }

    let pgTranscriptNds = [];
    if (vMetaDataNd) {
        pgTranscriptNds = vMetaDataNd.find("transcripts");
    }

    // let transcripts = null
    const tags = ["captionFormat", "isAutogenerated", "captionFile"];

    for (const pgTranscriptElem of pgTranscriptNds) {
		const pgTranscriptEl = jQuery$1(pgTranscriptElem);
        const locale = pgTranscriptEl.find("locale");

        if (locale.length>0) {
            const lang = locale.find("country");

            if (lang.length>0) {
                let langValue = lang.text().trim().toLowerCase();

                if (!transcripts) {
                    transcripts = {};
                }

                transcripts[langValue] = {
                    country: langValue
                };

                const langCountry = locale.find("lang");

                if (langCountry.length>0) {
                    transcripts[langValue]["lang"] = langCountry.text().trim();
                }

                for (const tag of tags) {
                    const tagNd = pgTranscriptEl.find(tag);

                    if (tagNd.length>0) {
                        let value = tagNd.text().trim();

                        if (tag === 'isAutogenerated') {
                            value = value === "true" ? 1 : 0;
                        }

                        transcripts[langValue][tag] = value;
                    }
                }

                // transcripts[langValue] = mTranscript.create({
                //     tocId: toc.id,
                //     lang: langValue,
                //     country: transcripts[langValue]["country"],
                //     fmt: transcripts[langValue]["captionFormat"],
                //     url: transcripts[langValue]["captionFile"],
                //     autoGenerated: transcripts[langValue]["isAutogenerated"]
                // })
                const transcript = {
                    lang: langValue,
                    country: transcripts[langValue]["country"],
                    fmt: transcripts[langValue]["captionFormat"],
                    url: transcripts[langValue]["captionFile"],
                    autoGenerated: transcripts[langValue]["isAutogenerated"]
                };
                const {  country, fmt, url, autoGenerated} = transcript;
                const row = await mTranscript.create(toc.id, langValue, country, fmt, url, autoGenerated);
				transcripts[langValue] = row;
            }
        }
    }

    return transcripts
};
const getStreamLocations = async(vMetaDataNd,toc,mStreamLocation) => {
	let streamLocations = mStreamLocation.getListByTocId(toc.id);

    if (streamLocations.length>0) {
        console.log('stream_locations_get_from_m_stream_location');
        return streamLocations
    }

    let pgStreamNds = [];
    if (vMetaDataNd) {
        pgStreamNds = vMetaDataNd.find("progressiveStreams");
    }

    // let streamLocations = null
    const tags = ["size", "bitRate", "width", "height"];

    if (pgStreamNds.length > 0) {
        for (const pgStreamElem of pgStreamNds) {
			const pgStreamEl = jQuery$1(pgStreamElem);
            let fmt = pgStreamEl.find("height");

            if (fmt.length>0) {
                fmt = fmt.text().trim();

                if (fmt === "0") {
                    fmt = "audio";
                }

                if (!streamLocations) {
                    streamLocations = {};
                }

                streamLocations[fmt] = {};
                const streamLoc = pgStreamEl.find("streamingLocations");

                if (streamLoc.length>0) {
                    const url = streamLoc.find("url");

                    if (url.length>0) {
                        streamLocations[fmt].url = url.text().trim();
                    }

                    const expiresAt = streamLoc.find("expiresAt");

                    if (expiresAt.length>0) {
                        streamLocations[fmt].expiresAt = parseInt(expiresAt.text().trim()) / 1000;
                    }

                    for (const tag of tags) {
                        const tagNd = streamLoc.find(tag);

                        if (tagNd.length>0) {
                            streamLocations[fmt][tag] = parseInt(tagNd.text().trim());
                        }
                    }

					const sLoc = {
                        fmt,
                        url: streamLocations[fmt].url,
                        expiresAt: streamLocations[fmt].expiresAt
					};
                    const row = await mStreamLocation.create(fmt, sLoc.url, toc.id, sLoc.expiresAt);
					streamLocations[fmt]=row;
                }
            }
        }
    }

    return streamLocations
};
const getCourseToc = async (itemStar,doc,mToc,mSection,section,courseSlug) => {
	let toc = mToc.getByItemStar(itemStar);
    if(toc){
        return toc
	}
    let entityNdP = getTocXmlParentElement(itemStar,doc);
    if(!entityNdP){
		return null
	}
    toc={
        streamLocations : null,
        transcripts : null
    };
    let tocSlugNd = entityNdP.find("slug");
    if(tocSlugNd.length > 0){
        let tocSlug = tocSlugNd.text();
        toc.slug = tocSlug;
        toc.url = `https://www.linkedin.com/learning/${courseSlug}/${tocSlug}`;
	}

    toc.title = entityNdP.find("title").text();
    

    toc.visibility = entityNdP.find("visibility").text(); 
    
    toc.duration = parseInt(entityNdP.find("duration").text());
    
    let vStatusUrn = entityNdP.find("star_lyndaVideoViewingStatus").text().trim();
    if(vStatusUrn.length == 0){
        vStatusUrn = entityNdP.find("star_interactionstatusv2").text().trim();
        
    }
    toc.vStatusUrn = vStatusUrn;
    
    const {title, slug, url, duration, captionUrl, captionFmt} = toc;
    const row = await mToc.create(title, slug, url, duration, captionUrl, captionFmt, section.id,itemStar,vStatusUrn);
    if(row){
        const {tocIds} = section;

        if(!tocIds.includes(row.id)){
            tocIds.push(row.id);
            await mSection.updateTocIds(section.id, tocIds);
        }
        section.tocIds = tocIds;
    }
    return row
};
const getTocXmlParentElement = (itemStar,doc) => {
    if(!doc){
        return null
    }
	let tocNd = doc.find(`cachingKey:contains('${itemStar}')`);
    let entityNdP=null;
    if(tocNd.length > 1){
        for(const tocNdElem of tocNd){
            const $tocNdElem = jQuery$1(tocNdElem);
            // const entityUrnNd = $tocNdElem.find("entityUrn")
            // if(entityUrnNd.length>0){
            //     entityUrn = entityUrnNd.text().trim()
            //     entityNdP = $tocNdElem.closest("included")
            //     break
            // }
            let tocNdP = $tocNdElem.parent();
            const urn =  $tocNdElem.text().trim();
            if(urn === itemStar){
                // console.log(tocNdP.html())

                let type = tocNdP.find(">type");
                if(type.length>0){
                    type = type.text().trim();
                    if(type === "com.linkedin.learning.api.deco.content.Video"){
                        tocNd = $tocNdElem.closest("included");
                        return tocNd
                    // break
                    }
                }
            }
        }
    }
    console.log(tocNd.html());
    if (tocNd.length >0){
        let tocNdP = tocNd.parent();
        let videoUrnNd = tocNdP.find("content");
        if (videoUrnNd.length > 0){
            videoUrnNd = videoUrnNd.find("video");
            if(videoUrnNd.length>0){
                const videoUrn = videoUrnNd.text().trim();
                let entityUrnNds = doc.find(`entityUrn:contains('${videoUrn}')`);
                if (entityUrnNds.length>0){
                    for(const entityUrnNd of entityUrnNds){
						const $entityUrnNd = jQuery$1(entityUrnNd);
						const text = $entityUrnNd.text().trim();
						// console.log(text)
						if(text == videoUrn){
							entityNdP = $entityUrnNd.closest("included");
						}
					}
				}
			}else {
				console.error(`could_not_find_video_urn: ${itemStar}`);
			}
		}else {
            console.error(`could_not_find_video_entity_urn : ${itemStar}`);
		}
        
	}else {
        console.error(`could_not_find_toc_nd : ${itemStar}`);
	}
	return entityNdP
};
const findElementContainsBeginWith = ($root,element,str) => {
    const $results = $root.find(`${element}:contains('${str}')`);
    const filteredResults = $results.filter((i,el)=>{
        const text=jQuery$1(el).text().trim();
        return text.startsWith(str)
    });
    return filteredResults
};
const getCourseXmlParentElement = (doc) => {
    if(!doc){
        return [null,null]
    }
	let p = null;
	let courseUrn = null;
	let courseUrnNd = findElementContainsBeginWith(doc,'star_elements','urn:li:learningApiCourse:');//doc.find(`star_elements:contains('urn:li:learningApiCourse:')`)
	// console.log(courseUrnNd)
	
	if(courseUrnNd.length == 0){
		courseUrnNd = doc.find("entityUrn");
	}
	if(courseUrnNd.length > 0){
		// for(let i in courseUrnNd ){
		// let courseUrnNdItem = $(courseUrnNd[i])
		courseUrn = courseUrnNd.text().trim();
        console.log(courseUrn);
		let entityUrnNd = findElementContainsBeginWith(doc,'entityUrn',courseUrn);
		for(const entityUrnNdItem of entityUrnNd ){
			if(jQuery$1(entityUrnNdItem).text().trim() == courseUrn){
				// console.log(entityUrnNdItem)
				p = jQuery$1(entityUrnNdItem).closest('included');
				break
			}
		}
		
		
	}
	return [p,courseUrn]
};
const getVideoMetaNd = (vStatusUrn, doc) =>{
    // benchmark('getVideoMetaNd', 'start')
    let vMetaDataNd = null;
    let vStatusLookups = doc.find(`star_lyndaVideoViewingStatus:contains('${vStatusUrn}')`);
    doc.find(`status:contains('429')`);
    const statusEls = doc.find('status');
    const statuses = [];
    
    for (const statusEl of statusEls) {
        statuses.push(parseInt(jQuery$1(statusEl).text()));
    }

    if (vStatusLookups.length == 0) {
        console.error('A');
        console.error(`could_not_find_v_status_lookup : ${vStatusUrn}`);
        vStatusUrn = vStatusUrn.replace('urn:li:lyndaVideoViewingStatus:', '');
        vStatusLookups = doc.find(`trackingUrn:contains('${vStatusUrn}')`);
    }

    if (vStatusLookups.length == 0) {
        console.error('B');
        console.error(`could_not_find_v_status_lookup : ${vStatusUrn}`);
        vStatusLookups = doc.find(`star_interactionstatusv2:contains('${vStatusUrn}')`);
    }
    let pos = -1;

    if (vStatusLookups.length > 0) {
        let breakTheLoop = false;

        for(const vStatusLookupEl of vStatusLookups) {
            const elNd = jQuery$1(vStatusLookupEl).parent();
            vMetaDataNd = elNd.find("presentation");

            if (vMetaDataNd.length == 0) {
                vMetaDataNd = elNd.find("presentationDerived");
            }

            pos = 0;

            if (vMetaDataNd.length>0) {
                pos += 1;
                vMetaDataNd = vMetaDataNd.find("videoPlay");

                if (vMetaDataNd.length > 0) {
                    pos += 1;
                    vMetaDataNd = vMetaDataNd.find("videoPlayMetadata");
                    breakTheLoop = true;
					statuses.push(200);
                }
            }

            if (breakTheLoop) {
                break
            }
        }
    }

    if (!vMetaDataNd) {
        console.error(`could_not_find_v_meta_data_nd_pos : ${pos}`);
        console.log("Try another method");
    }

    // const b = benchmark('getVideoMetaNd', 'end')
    // console.log(`getVideoMetaNd time elapsed:${b['elapsed_time']}\n`)
    return [vMetaDataNd, statuses]
};
/**
 * Convert child element tagname and text to obj prop val
*/
const el2Obj = (el)=>{
    const childrens=jQuery$1(el).children();
    if(childrens.length==0){
        return null
    }
    let obj = {};
    childrens.map((i,c)=>{
        const prop = c.tagName.toLocaleLowerCase();
        const value = jQuery$1(c).text().trim();
        obj[prop]=value;
    });
    return obj
};
const getThumbUrlFromArtifact = (artifact,rootUrl)=>{
    // console.log(artifact)
    const expired = isTimeExpired(parseInt(artifact.expiresat));
    if(expired){
        return null
    }
    return `${rootUrl}${artifact.fileidentifyingurlpathsegment}`
};

const Button = reactExports.forwardRef(({ title = "", label = null, onMouseOver = (f) => f, onMouseOut = (f) => f, disabled = false, loading = false, icon, className, caption, onClick }, ref) => {
  const btnCls = "inline-flex flex-shrink-0 justify-center items-center gap-2 p-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all text-xs dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { ref, title, onMouseOver: (e) => onMouseOver(e), onMouseOut: (e) => onMouseOut(e), disabled: loading || disabled, onClick: (e) => onClick(e), type: "button", className: ` ${btnCls} ${className}`, children: [
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-blue-600 rounded-full", role: "status", "aria-label": "loading", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Loading..." }) }) : "",
    icon && !loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: icon }) : "",
    caption ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: caption }) : ""
  ] }) });
});

/*
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
const stringToBoolean = (string) => {
  return string === "true" ? true : false;
};
const getClassProperty = (el, prop, val = "") => {
  return (window.getComputedStyle(el).getPropertyValue(prop) || val).replace(
    " ",
    ""
  );
};
const getClassPropertyAlt = (el, prop, val = "") => {
  let targetClass = "";
  el.classList.forEach((c) => {
    if (c.includes(prop)) {
      targetClass = c;
    }
  });
  return targetClass.match(/:(.*)]/) ? targetClass.match(/:(.*)]/)[1] : val;
};
const isIOS = () => {
  if (/iPad|iPhone|iPod/.test(navigator.platform)) {
    return true;
  } else {
    return navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
  }
};
const isIpadOS = () => {
  return navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
};
const isDirectChild = (parent, child) => {
  const children = parent.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i] === child) return true;
  }
  return false;
};
const isEnoughSpace = (el, toggle, preferredPosition = "auto", space = 10, wrapper = null) => {
  const referenceRect = toggle.getBoundingClientRect();
  const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : null;
  const viewportHeight = window.innerHeight;
  const spaceAbove = wrapperRect ? referenceRect.top - wrapperRect.top : referenceRect.top;
  const spaceBelow = (wrapper ? wrapperRect.bottom : viewportHeight) - referenceRect.bottom;
  const minimumSpaceRequired = el.clientHeight + space;
  if (preferredPosition === "bottom") {
    return spaceBelow >= minimumSpaceRequired;
  } else if (preferredPosition === "top") {
    return spaceAbove >= minimumSpaceRequired;
  } else {
    return spaceAbove >= minimumSpaceRequired || spaceBelow >= minimumSpaceRequired;
  }
};
const isFormElement = (target) => {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
};
const isParentOrElementHidden = (element) => {
  if (!element) return false;
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.display === "none") return true;
  return isParentOrElementHidden(element.parentElement);
};
const isJson = (str) => {
  if (typeof str !== "string") return false;
  const firstChar = str.trim()[0];
  const lastChar = str.trim().slice(-1);
  if (firstChar === "{" && lastChar === "}" || firstChar === "[" && lastChar === "]") {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};
const debounce$1 = (func, timeout = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(undefined, args);
    }, timeout);
  };
};
const dispatch = (evt, element, payload = null) => {
  const event = new CustomEvent(evt, {
    detail: { payload },
    bubbles: true,
    cancelable: true,
    composed: false
  });
  element.dispatchEvent(event);
};
const afterTransition = (el, callback) => {
  const handleEvent = () => {
    callback();
    el.removeEventListener("transitionend", handleEvent, true);
  };
  const computedStyle = window.getComputedStyle(el);
  const transitionDuration = computedStyle.getPropertyValue(
    "transition-duration"
  );
  const transitionProperty = computedStyle.getPropertyValue(
    "transition-property"
  );
  const hasTransition = transitionProperty !== "none" && parseFloat(transitionDuration) > 0;
  if (hasTransition) el.addEventListener("transitionend", handleEvent, true);
  else callback();
};
const htmlToElement = (html) => {
  const template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
};
const classToClassList = (classes, target, splitter = " ", action = "add") => {
  const classesToArray = classes.split(splitter);
  classesToArray.forEach(
    (cl) => action === "add" ? target.classList.add(cl) : target.classList.remove(cl)
  );
};
const menuSearchHistory = {
  historyIndex: -1,
  addHistory(index) {
    this.historyIndex = index;
  },
  existsInHistory(index) {
    return index > this.historyIndex;
  },
  clearHistory() {
    this.historyIndex = -1;
  }
};

/*
 * HSBasePlugin
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSBasePlugin {
  constructor(el, options, events) {
    this.el = el;
    this.options = options;
    this.events = events;
    this.el = el;
    this.options = options;
    this.events = {};
  }
  createCollection(collection, element) {
    collection.push({
      id: element?.el?.id || collection.length + 1,
      element
    });
  }
  fireEvent(evt, payload = null) {
    if (this.events.hasOwnProperty(evt)) return this.events[evt](payload);
  }
  on(evt, cb) {
    this.events[evt] = cb;
  }
}

/*
 * HSCopyMarkup
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSCopyMarkup extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-copy-markup");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.targetSelector = concatOptions?.targetSelector || null;
    this.wrapperSelector = concatOptions?.wrapperSelector || null;
    this.limit = concatOptions?.limit || null;
    this.items = [];
    if (this.targetSelector) this.init();
  }
  elementClick() {
    this.copy();
  }
  deleteItemButtonClick(item) {
    this.delete(item);
  }
  init() {
    this.createCollection(window.$hsCopyMarkupCollection, this);
    this.onElementClickListener = () => this.elementClick();
    this.setTarget();
    this.setWrapper();
    this.addPredefinedItems();
    this.el.addEventListener("click", this.onElementClickListener);
  }
  copy() {
    if (this.limit && this.items.length >= this.limit) return false;
    if (this.el.hasAttribute("disabled")) this.el.setAttribute("disabled", "");
    const copiedElement = this.target.cloneNode(true);
    this.addToItems(copiedElement);
    if (this.limit && this.items.length >= this.limit)
      this.el.setAttribute("disabled", "disabled");
    this.fireEvent("copy", copiedElement);
    dispatch("copy.hs.copyMarkup", copiedElement, copiedElement);
  }
  addPredefinedItems() {
    Array.from(this.wrapper.children).filter(
      (el) => !el.classList.contains("[--ignore-for-count]")
    ).forEach((el) => {
      this.addToItems(el);
    });
    if (this.limit && this.items.length >= this.limit)
      this.el.setAttribute("disabled", "disabled");
  }
  setTarget() {
    const target = typeof this.targetSelector === "string" ? document.querySelector(this.targetSelector).cloneNode(true) : this.targetSelector.cloneNode(true);
    target.removeAttribute("id");
    this.target = target;
  }
  setWrapper() {
    this.wrapper = typeof this.wrapperSelector === "string" ? document.querySelector(this.wrapperSelector) : this.wrapperSelector;
  }
  addToItems(item) {
    const deleteItemButton = item.querySelector(
      "[data-hs-copy-markup-delete-item]"
    );
    if (this.wrapper) this.wrapper.append(item);
    else this.el.before(item);
    if (deleteItemButton) {
      this.onDeleteItemButtonClickListener = () => this.deleteItemButtonClick(item);
      deleteItemButton.addEventListener(
        "click",
        this.onDeleteItemButtonClickListener
      );
    }
    this.items.push(item);
  }
  // Public methods
  delete(target) {
    const index = this.items.indexOf(target);
    if (index !== -1) this.items.splice(index, 1);
    target.remove();
    this.fireEvent("delete", target);
    dispatch("delete.hs.copyMarkup", target, target);
  }
  destroy() {
    const deleteItemButtons = this.wrapper.querySelectorAll(
      "[data-hs-copy-markup-delete-item]"
    );
    this.el.removeEventListener("click", this.onElementClickListener);
    if (deleteItemButtons.length) {
      deleteItemButtons.forEach(
        (el) => el.removeEventListener("click", this.onDeleteItemButtonClickListener)
      );
    }
    this.el.removeAttribute("disabled");
    this.target = null;
    this.wrapper = null;
    this.items = null;
    window.$hsCopyMarkupCollection = window.$hsCopyMarkupCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static method
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsCopyMarkupCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsCopyMarkupCollection) window.$hsCopyMarkupCollection = [];
    if (window.$hsCopyMarkupCollection)
      window.$hsCopyMarkupCollection = window.$hsCopyMarkupCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-copy-markup]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsCopyMarkupCollection.find(
        (elC) => elC?.element?.el === el
      )) {
        const data = el.getAttribute("data-hs-copy-markup");
        const options = data ? JSON.parse(data) : {};
        new HSCopyMarkup(el, options);
      }
    });
  }
}
window.addEventListener("load", () => {
  HSCopyMarkup.autoInit();
});
if (typeof window !== "undefined") {
  window.HSCopyMarkup = HSCopyMarkup;
}

/*
 * HSAccordion
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSAccordion extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.toggle = this.el.querySelector(".hs-accordion-toggle") || null;
    this.content = this.el.querySelector(".hs-accordion-content") || null;
    this.update();
    this.isToggleStopPropagated = stringToBoolean(
      getClassProperty(this.toggle, "--stop-propagation", "false") || "false"
    );
    if (this.toggle && this.content) this.init();
  }
  init() {
    this.createCollection(window.$hsAccordionCollection, this);
    this.onToggleClickListener = (evt) => this.toggleClick(evt);
    this.toggle.addEventListener("click", this.onToggleClickListener);
  }
  // Public methods
  toggleClick(evt) {
    if (this.isToggleStopPropagated) evt.stopPropagation();
    if (this.el.classList.contains("active")) {
      this.hide();
    } else {
      this.show();
    }
  }
  show() {
    if (this.group && !this.isAlwaysOpened && this.group.querySelector(":scope > .hs-accordion.active") && this.group.querySelector(":scope > .hs-accordion.active") !== this.el) {
      const currentlyOpened = window.$hsAccordionCollection.find(
        (el) => el.element.el === this.group.querySelector(":scope > .hs-accordion.active")
      );
      currentlyOpened.element.hide();
    }
    if (this.el.classList.contains("active")) return false;
    this.el.classList.add("active");
    if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
    this.content.style.display = "block";
    this.content.style.height = "0";
    setTimeout(() => {
      this.content.style.height = `${this.content.scrollHeight}px`;
      afterTransition(this.content, () => {
        this.content.style.display = "block";
        this.content.style.height = "";
        this.fireEvent("open", this.el);
        dispatch("open.hs.accordion", this.el, this.el);
      });
    });
  }
  hide() {
    if (!this.el.classList.contains("active")) return false;
    this.el.classList.remove("active");
    if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
    this.content.style.height = `${this.content.scrollHeight}px`;
    setTimeout(() => {
      this.content.style.height = "0";
    });
    afterTransition(this.content, () => {
      this.content.style.display = "none";
      this.content.style.height = "";
      this.fireEvent("close", this.el);
      dispatch("close.hs.accordion", this.el, this.el);
    });
  }
  update() {
    this.group = this.el.closest(".hs-accordion-group") || null;
    if (!this.group) return false;
    this.isAlwaysOpened = this.group.hasAttribute("data-hs-accordion-always-open") || false;
    window.$hsAccordionCollection.map((el) => {
      if (el.id === this.el.id) {
        el.element.group = this.group;
        el.element.isAlwaysOpened = this.isAlwaysOpened;
      }
      return el;
    });
  }
  destroy() {
    if (HSAccordion?.selectable?.length) {
      HSAccordion.selectable.forEach((item) => {
        item.listeners.forEach(({ el, listener }) => {
          el.removeEventListener("click", listener);
        });
      });
    }
    if (this.onToggleClickListener) {
      this.toggle.removeEventListener("click", this.onToggleClickListener);
    }
    this.toggle = null;
    this.content = null;
    this.group = null;
    this.onToggleClickListener = null;
    window.$hsAccordionCollection = window.$hsAccordionCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static findInCollection(target) {
    return window.$hsAccordionCollection.find((el) => {
      if (target instanceof HSAccordion) return el.element.el === target.el;
      else if (typeof target === "string") return el.element.el === document.querySelector(target);
      else return el.element.el === target;
    }) || null;
  }
  static autoInit() {
    if (!window.$hsAccordionCollection) window.$hsAccordionCollection = [];
    if (window.$hsAccordionCollection) {
      window.$hsAccordionCollection = window.$hsAccordionCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    }
    document.querySelectorAll(".hs-accordion:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsAccordionCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSAccordion(el);
    });
  }
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsAccordionCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static show(target) {
    const instance = HSAccordion.findInCollection(target);
    if (instance && instance.element.content.style.display !== "block") instance.element.show();
  }
  static hide(target) {
    const instance = HSAccordion.findInCollection(target);
    const style = instance ? window.getComputedStyle(instance.element.content) : null;
    if (instance && style.display !== "none") instance.element.hide();
  }
  static {
    this.onSelectableClick = (evt, item, el) => {
      evt.stopPropagation();
      HSAccordion.toggleSelected(item, el);
    };
  }
  static treeView() {
    if (!document.querySelectorAll(".hs-accordion-treeview-root").length)
      return false;
    this.selectable = [];
    document.querySelectorAll(".hs-accordion-treeview-root").forEach((el) => {
      const data = el?.getAttribute("data-hs-accordion-options");
      const options = data ? JSON.parse(data) : {};
      this.selectable.push({
        el,
        options: { ...options },
        listeners: []
      });
    });
    if (this.selectable.length)
      this.selectable.forEach((item) => {
        const { el } = item;
        el.querySelectorAll(".hs-accordion-selectable").forEach(
          (_el) => {
            const listener = (evt) => this.onSelectableClick(evt, item, _el);
            _el.addEventListener("click", listener);
            item.listeners.push({ el: _el, listener });
          }
        );
      });
  }
  static toggleSelected(root, item) {
    if (item.classList.contains("selected")) item.classList.remove("selected");
    else {
      root.el.querySelectorAll(".hs-accordion-selectable").forEach((el) => el.classList.remove("selected"));
      item.classList.add("selected");
    }
  }
  // Backward compatibility
  static on(evt, target, cb) {
    const instance = HSAccordion.findInCollection(target);
    if (instance) instance.element.events[evt] = cb;
  }
}
window.addEventListener("load", () => {
  HSAccordion.autoInit();
  if (document.querySelectorAll(".hs-accordion-treeview-root").length)
    HSAccordion.treeView();
});
if (typeof window !== "undefined") {
  window.HSAccordion = HSAccordion;
}

const POSITIONS = {
  auto: "auto",
  "auto-start": "auto-start",
  "auto-end": "auto-end",
  top: "top",
  "top-left": "top-start",
  "top-right": "top-end",
  bottom: "bottom",
  "bottom-left": "bottom-start",
  "bottom-right": "bottom-end",
  right: "right",
  "right-start": "right-start",
  "right-end": "right-end",
  left: "left",
  "left-start": "left-start",
  "left-end": "left-end"
};
const DROPDOWN_ACCESSIBILITY_KEY_SET = [
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowRight",
  "ArrowLeft",
  "Home",
  "End",
  "Enter"
];
const TABS_ACCESSIBILITY_KEY_SET = [
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "Home",
  "End"
];
const SELECT_ACCESSIBILITY_KEY_SET = [
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "Home",
  "End",
  "Escape",
  "Enter",
  "Space",
  "Tab"
];
const COMBO_BOX_ACCESSIBILITY_KEY_SET = [
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "Home",
  "End",
  "Escape",
  "Enter"
];
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
};

/*
 * HSCarousel
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSCarousel extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-carousel");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.currentIndex = concatOptions.currentIndex || 0;
    this.loadingClasses = concatOptions.loadingClasses ? `${concatOptions.loadingClasses}`.split(",") : null;
    this.dotsItemClasses = concatOptions.dotsItemClasses ? concatOptions.dotsItemClasses : null;
    this.isAutoHeight = typeof concatOptions.isAutoHeight !== "undefined" ? concatOptions.isAutoHeight : false;
    this.isAutoPlay = typeof concatOptions.isAutoPlay !== "undefined" ? concatOptions.isAutoPlay : false;
    this.isCentered = typeof concatOptions.isCentered !== "undefined" ? concatOptions.isCentered : false;
    this.isDraggable = typeof concatOptions.isDraggable !== "undefined" ? concatOptions.isDraggable : false;
    this.isInfiniteLoop = typeof concatOptions.isInfiniteLoop !== "undefined" ? concatOptions.isInfiniteLoop : false;
    this.isRTL = typeof concatOptions.isRTL !== "undefined" ? concatOptions.isRTL : false;
    this.isSnap = typeof concatOptions.isSnap !== "undefined" ? concatOptions.isSnap : false;
    this.hasSnapSpacers = typeof concatOptions.hasSnapSpacers !== "undefined" ? concatOptions.hasSnapSpacers : true;
    this.speed = concatOptions.speed || 4e3;
    this.updateDelay = concatOptions.updateDelay || 0;
    this.slidesQty = concatOptions.slidesQty || 1;
    this.loadingClassesRemove = this.loadingClasses?.[0] ? this.loadingClasses[0].split(" ") : "opacity-0";
    this.loadingClassesAdd = this.loadingClasses?.[1] ? this.loadingClasses[1].split(" ") : "";
    this.afterLoadingClassesAdd = this.loadingClasses?.[2] ? this.loadingClasses[2].split(" ") : "";
    this.container = this.el.querySelector(".hs-carousel") || null;
    this.inner = this.el.querySelector(".hs-carousel-body") || null;
    this.slides = this.el.querySelectorAll(".hs-carousel-slide") || [];
    this.prev = this.el.querySelector(".hs-carousel-prev") || null;
    this.next = this.el.querySelector(".hs-carousel-next") || null;
    this.dots = this.el.querySelector(".hs-carousel-pagination") || null;
    this.info = this.el.querySelector(".hs-carousel-info") || null;
    this.infoTotal = this?.info?.querySelector(".hs-carousel-info-total") || null;
    this.infoCurrent = this?.info?.querySelector(".hs-carousel-info-current") || null;
    this.sliderWidth = this.el.getBoundingClientRect().width;
    this.isDragging = false;
    this.dragStartX = null;
    this.initialTranslateX = null;
    this.touchX = {
      start: 0,
      end: 0
    };
    this.resizeContainer = document.querySelector("body");
    this.resizeContainerWidth = 0;
    this.init();
  }
  setIsSnap() {
    const containerRect = this.container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    let closestElement = null;
    let closestElementIndex = null;
    let closestDistance = Infinity;
    Array.from(this.inner.children).forEach((child) => {
      const childRect = child.getBoundingClientRect();
      const innerContainerRect = this.inner.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2 - innerContainerRect.left;
      const distance = Math.abs(
        containerCenter - (innerContainerRect.left + childCenter)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = child;
      }
    });
    if (closestElement) {
      closestElementIndex = Array.from(this.slides).findIndex(
        (el) => el === closestElement
      );
    }
    this.setIndex(closestElementIndex);
    if (this.dots) this.setCurrentDot();
  }
  prevClick() {
    this.goToPrev();
    if (this.isAutoPlay) {
      this.resetTimer();
      this.setTimer();
    }
  }
  nextClick() {
    this.goToNext();
    if (this.isAutoPlay) {
      this.resetTimer();
      this.setTimer();
    }
  }
  containerScroll() {
    clearTimeout(this.isScrolling);
    this.isScrolling = setTimeout(() => {
      this.setIsSnap();
    }, 100);
  }
  elementTouchStart(evt) {
    this.touchX.start = evt.changedTouches[0].screenX;
  }
  elementTouchEnd(evt) {
    this.touchX.end = evt.changedTouches[0].screenX;
    this.detectDirection();
  }
  innerMouseDown(evt) {
    this.handleDragStart(evt);
  }
  innerTouchStart(evt) {
    this.handleDragStart(evt);
  }
  documentMouseMove(evt) {
    this.handleDragMove(evt);
  }
  documentTouchMove(evt) {
    this.handleDragMove(evt);
  }
  documentMouseUp() {
    this.handleDragEnd();
  }
  documentTouchEnd() {
    this.handleDragEnd();
  }
  dotClick(ind) {
    this.goTo(ind);
    if (this.isAutoPlay) {
      this.resetTimer();
      this.setTimer();
    }
  }
  init() {
    this.createCollection(window.$hsCarouselCollection, this);
    if (this.inner) {
      this.calculateWidth();
      if (this.isDraggable && !this.isSnap) this.initDragHandling();
    }
    if (this.prev) {
      this.onPrevClickListener = () => this.prevClick();
      this.prev.addEventListener("click", this.onPrevClickListener);
    }
    if (this.next) {
      this.onNextClickListener = () => this.nextClick();
      this.next.addEventListener("click", this.onNextClickListener);
    }
    if (this.dots) this.initDots();
    if (this.info) this.buildInfo();
    if (this.slides.length) {
      this.addCurrentClass();
      if (!this.isInfiniteLoop) this.addDisabledClass();
      if (this.isAutoPlay) this.autoPlay();
    }
    setTimeout(() => {
      if (this.isSnap) this.setIsSnap();
      if (this.loadingClassesRemove) {
        if (typeof this.loadingClassesRemove === "string")
          this.inner.classList.remove(this.loadingClassesRemove);
        else this.inner.classList.remove(...this.loadingClassesRemove);
      }
      if (this.loadingClassesAdd) {
        if (typeof this.loadingClassesAdd === "string")
          this.inner.classList.add(this.loadingClassesAdd);
        else this.inner.classList.add(...this.loadingClassesAdd);
      }
      if (this.inner && this.afterLoadingClassesAdd) {
        setTimeout(() => {
          if (typeof this.afterLoadingClassesAdd === "string")
            this.inner.classList.add(this.afterLoadingClassesAdd);
          else this.inner.classList.add(...this.afterLoadingClassesAdd);
        });
      }
    }, 400);
    if (this.isSnap) {
      this.onContainerScrollListener = () => this.containerScroll();
      this.container.addEventListener("scroll", this.onContainerScrollListener);
    }
    this.el.classList.add("init");
    if (!this.isSnap) {
      this.onElementTouchStartListener = (evt) => this.elementTouchStart(evt);
      this.onElementTouchEndListener = (evt) => this.elementTouchEnd(evt);
      this.el.addEventListener("touchstart", this.onElementTouchStartListener);
      this.el.addEventListener("touchend", this.onElementTouchEndListener);
    }
    this.observeResize();
  }
  initDragHandling() {
    const scrollableElement = this.inner;
    this.onInnerMouseDownListener = (evt) => this.innerMouseDown(evt);
    this.onInnerTouchStartListener = (evt) => this.innerTouchStart(evt);
    this.onDocumentMouseMoveListener = (evt) => this.documentMouseMove(evt);
    this.onDocumentTouchMoveListener = (evt) => this.documentTouchMove(evt);
    this.onDocumentMouseUpListener = () => this.documentMouseUp();
    this.onDocumentTouchEndListener = () => this.documentTouchEnd();
    if (scrollableElement) {
      scrollableElement.addEventListener(
        "mousedown",
        this.onInnerMouseDownListener
      );
      scrollableElement.addEventListener(
        "touchstart",
        this.onInnerTouchStartListener,
        { passive: true }
      );
      document.addEventListener("mousemove", this.onDocumentMouseMoveListener);
      document.addEventListener("touchmove", this.onDocumentTouchMoveListener, {
        passive: false
      });
      document.addEventListener("mouseup", this.onDocumentMouseUpListener);
      document.addEventListener("touchend", this.onDocumentTouchEndListener);
    }
  }
  getTranslateXValue() {
    const transformMatrix = window.getComputedStyle(this.inner).transform;
    if (transformMatrix !== "none") {
      const matrixValues = transformMatrix.match(/matrix.*\((.+)\)/)?.[1].split(", ");
      if (matrixValues) {
        let translateX = parseFloat(
          matrixValues.length === 6 ? matrixValues[4] : matrixValues[12]
        );
        if (this.isRTL) translateX = -translateX;
        return isNaN(translateX) || translateX === 0 ? 0 : -translateX;
      }
    }
    return 0;
  }
  removeClickEventWhileDragging(evt) {
    evt.preventDefault();
  }
  handleDragStart(evt) {
    evt.preventDefault();
    this.isDragging = true;
    this.dragStartX = this.getEventX(evt);
    this.initialTranslateX = this.isRTL ? this.getTranslateXValue() : -this.getTranslateXValue();
    this.inner.classList.add("dragging");
  }
  handleDragMove(evt) {
    if (!this.isDragging) return;
    this.inner.querySelectorAll("a:not(.prevented-click)").forEach((el) => {
      el.classList.add("prevented-click");
      el.addEventListener("click", this.removeClickEventWhileDragging);
    });
    const currentX = this.getEventX(evt);
    let deltaX = currentX - this.dragStartX;
    if (this.isRTL) deltaX = -deltaX;
    const newTranslateX = this.initialTranslateX + deltaX;
    const newTranslateXFunc = () => {
      let calcWidth = this.sliderWidth * this.slides.length / this.getCurrentSlidesQty() - this.sliderWidth;
      const containerWidth = this.sliderWidth;
      const itemWidth = containerWidth / this.getCurrentSlidesQty();
      const centeredOffset = (containerWidth - itemWidth) / 2;
      const limitStart = this.isCentered ? centeredOffset : 0;
      if (this.isCentered) calcWidth = calcWidth + centeredOffset;
      const limitEnd = -calcWidth;
      if (this.isRTL) {
        if (newTranslateX < limitStart) return limitStart;
        if (newTranslateX > calcWidth) return limitEnd;
        else return -newTranslateX;
      } else {
        if (newTranslateX > limitStart) return limitStart;
        else if (newTranslateX < -calcWidth) return limitEnd;
        else return newTranslateX;
      }
    };
    this.setTranslate(newTranslateXFunc());
  }
  handleDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    const containerWidth = this.sliderWidth;
    const itemWidth = containerWidth / this.getCurrentSlidesQty();
    const currentTranslateX = this.getTranslateXValue();
    let closestIndex = Math.round(currentTranslateX / itemWidth);
    if (this.isRTL) closestIndex = Math.round(currentTranslateX / itemWidth);
    this.inner.classList.remove("dragging");
    setTimeout(() => {
      this.calculateTransform(closestIndex);
      if (this.dots) this.setCurrentDot();
      this.dragStartX = null;
      this.initialTranslateX = null;
      this.inner.querySelectorAll("a.prevented-click").forEach((el) => {
        el.classList.remove("prevented-click");
        el.removeEventListener("click", this.removeClickEventWhileDragging);
      });
    });
  }
  getEventX(event) {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }
  getCurrentSlidesQty() {
    if (typeof this.slidesQty === "object") {
      const windowWidth = document.body.clientWidth;
      let currentRes = 0;
      Object.keys(this.slidesQty).forEach((key) => {
        if (windowWidth >= (typeof key + 1 === "number" ? this.slidesQty[key] : BREAKPOINTS[key]))
          currentRes = this.slidesQty[key];
      });
      return currentRes;
    } else {
      return this.slidesQty;
    }
  }
  buildSnapSpacers() {
    const existingBefore = this.inner.querySelector(".hs-snap-before");
    const existingAfter = this.inner.querySelector(".hs-snap-after");
    if (existingBefore) existingBefore.remove();
    if (existingAfter) existingAfter.remove();
    const containerWidth = this.sliderWidth;
    const itemWidth = containerWidth / this.getCurrentSlidesQty();
    const spacerWidth = containerWidth / 2 - itemWidth / 2;
    const before = htmlToElement(
      `<div class="hs-snap-before" style="height: 100%; width: ${spacerWidth}px"></div>`
    );
    const after = htmlToElement(
      `<div class="hs-snap-after" style="height: 100%; width: ${spacerWidth}px"></div>`
    );
    this.inner.prepend(before);
    this.inner.appendChild(after);
  }
  initDots() {
    if (this.el.querySelectorAll(".hs-carousel-pagination-item").length)
      this.setDots();
    else this.buildDots();
    if (this.dots) this.setCurrentDot();
  }
  buildDots() {
    this.dots.innerHTML = "";
    const slidesQty = !this.isCentered && this.slidesQty ? this.slides.length - (this.getCurrentSlidesQty() - 1) : this.slides.length;
    for (let i = 0; i < slidesQty; i++) {
      const singleDot = this.buildSingleDot(i);
      this.dots.append(singleDot);
    }
  }
  setDots() {
    this.dotsItems = this.dots.querySelectorAll(".hs-carousel-pagination-item");
    this.dotsItems.forEach((dot, ind) => {
      const targetIndex = dot.getAttribute(
        "data-carousel-pagination-item-target"
      );
      this.singleDotEvents(dot, targetIndex ? +targetIndex : ind);
    });
  }
  goToCurrentDot() {
    const container = this.dots;
    const containerRect = container.getBoundingClientRect();
    const containerScrollLeft = container.scrollLeft;
    const containerScrollTop = container.scrollTop;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const item = this.dotsItems[this.currentIndex];
    const itemRect = item.getBoundingClientRect();
    const itemLeft = itemRect.left - containerRect.left + containerScrollLeft;
    const itemRight = itemLeft + item.clientWidth;
    const itemTop = itemRect.top - containerRect.top + containerScrollTop;
    const itemBottom = itemTop + item.clientHeight;
    let scrollLeft = containerScrollLeft;
    let scrollTop = containerScrollTop;
    if (itemLeft < containerScrollLeft || itemRight > containerScrollLeft + containerWidth) {
      scrollLeft = itemRight - containerWidth;
    }
    if (itemTop < containerScrollTop || itemBottom > containerScrollTop + containerHeight) {
      scrollTop = itemBottom - containerHeight;
    }
    container.scrollTo({
      left: scrollLeft,
      top: scrollTop,
      behavior: "smooth"
    });
  }
  buildInfo() {
    if (this.infoTotal) this.setInfoTotal();
    if (this.infoCurrent) this.setInfoCurrent();
  }
  setInfoTotal() {
    this.infoTotal.innerText = `${this.slides.length}`;
  }
  setInfoCurrent() {
    this.infoCurrent.innerText = `${this.currentIndex + 1}`;
  }
  buildSingleDot(ind) {
    const singleDot = htmlToElement("<span></span>");
    if (this.dotsItemClasses) classToClassList(this.dotsItemClasses, singleDot);
    this.singleDotEvents(singleDot, ind);
    return singleDot;
  }
  singleDotEvents(dot, ind) {
    this.onDotClickListener = () => this.dotClick(ind);
    dot.addEventListener("click", this.onDotClickListener);
  }
  observeResize() {
    const resizeObserver = new ResizeObserver(
      debounce$1((entries) => {
        for (let entry of entries) {
          const newWidth = entry.contentRect.width;
          if (newWidth !== this.resizeContainerWidth) {
            this.recalculateWidth();
            if (this.dots) this.initDots();
            this.addCurrentClass();
            this.resizeContainerWidth = newWidth;
          }
        }
      }, this.updateDelay)
    );
    resizeObserver.observe(this.resizeContainer);
  }
  calculateWidth() {
    if (!this.isSnap)
      this.inner.style.width = `${this.sliderWidth * this.slides.length / this.getCurrentSlidesQty()}px`;
    this.slides.forEach((el) => {
      el.style.width = `${this.sliderWidth / this.getCurrentSlidesQty()}px`;
    });
    this.calculateTransform();
  }
  addCurrentClass() {
    if (this.isSnap) {
      const itemsQty = Math.floor(this.getCurrentSlidesQty() / 2);
      for (let i = 0; i < this.slides.length; i++) {
        const slide = this.slides[i];
        if (i <= this.currentIndex + itemsQty && i >= this.currentIndex - itemsQty)
          slide.classList.add("active");
        else slide.classList.remove("active");
      }
    } else {
      const maxIndex = this.isCentered ? this.currentIndex + this.getCurrentSlidesQty() + (this.getCurrentSlidesQty() - 1) : this.currentIndex + this.getCurrentSlidesQty();
      this.slides.forEach((el, i) => {
        if (i >= this.currentIndex && i < maxIndex) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
    }
  }
  setCurrentDot() {
    const toggleDotActive = (el, i) => {
      let statement = false;
      const itemsQty = Math.floor(this.getCurrentSlidesQty() / 2);
      if (this.isSnap && !this.hasSnapSpacers) {
        statement = i === (this.getCurrentSlidesQty() % 2 === 0 ? this.currentIndex - itemsQty + 1 : this.currentIndex - itemsQty);
      } else statement = i === this.currentIndex;
      if (statement) el.classList.add("active");
      else el.classList.remove("active");
    };
    if (this.dotsItems)
      this.dotsItems.forEach((el, i) => toggleDotActive(el, i));
    else
      this.dots.querySelectorAll(":scope > *").forEach((el, i) => toggleDotActive(el, i));
  }
  setElementToDisabled(el) {
    el.classList.add("disabled");
    if (el.tagName === "BUTTON" || el.tagName === "INPUT")
      el.setAttribute("disabled", "disabled");
  }
  unsetElementToDisabled(el) {
    el.classList.remove("disabled");
    if (el.tagName === "BUTTON" || el.tagName === "INPUT")
      el.removeAttribute("disabled");
  }
  addDisabledClass() {
    if (!this.prev || !this.next) return false;
    const gapValue = getComputedStyle(this.inner).getPropertyValue("gap");
    const itemsQty = Math.floor(this.getCurrentSlidesQty() / 2);
    let currentIndex = 0;
    let maxIndex = 0;
    let statementPrev = false;
    let statementNext = false;
    if (this.isSnap) {
      currentIndex = this.currentIndex;
      maxIndex = this.hasSnapSpacers ? this.slides.length - 1 : this.slides.length - itemsQty - 1;
      statementPrev = this.hasSnapSpacers ? currentIndex === 0 : this.getCurrentSlidesQty() % 2 === 0 ? currentIndex - itemsQty < 0 : currentIndex - itemsQty === 0;
      statementNext = currentIndex >= maxIndex && this.container.scrollLeft + this.container.clientWidth + (parseFloat(gapValue) || 0) >= this.container.scrollWidth;
    } else {
      currentIndex = this.currentIndex;
      maxIndex = this.isCentered ? this.slides.length - this.getCurrentSlidesQty() + (this.getCurrentSlidesQty() - 1) : this.slides.length - this.getCurrentSlidesQty();
      statementPrev = currentIndex === 0;
      statementNext = currentIndex >= maxIndex;
    }
    if (statementPrev) {
      this.unsetElementToDisabled(this.next);
      this.setElementToDisabled(this.prev);
    } else if (statementNext) {
      this.unsetElementToDisabled(this.prev);
      this.setElementToDisabled(this.next);
    } else {
      this.unsetElementToDisabled(this.prev);
      this.unsetElementToDisabled(this.next);
    }
  }
  autoPlay() {
    this.setTimer();
  }
  setTimer() {
    this.timer = setInterval(() => {
      if (this.currentIndex === this.slides.length - 1) this.goTo(0);
      else this.goToNext();
    }, this.speed);
  }
  resetTimer() {
    clearInterval(this.timer);
  }
  detectDirection() {
    const { start, end } = this.touchX;
    if (end < start) this.goToNext();
    if (end > start) this.goToPrev();
  }
  calculateTransform(currentIdx) {
    if (currentIdx !== undefined) this.currentIndex = currentIdx;
    if (this.currentIndex > this.slides.length - this.getCurrentSlidesQty() && !this.isCentered)
      this.currentIndex = this.slides.length - this.getCurrentSlidesQty();
    const containerWidth = this.sliderWidth;
    const itemWidth = containerWidth / this.getCurrentSlidesQty();
    let translateX = this.currentIndex * itemWidth;
    if (this.isSnap && !this.isCentered) {
      if (this.container.scrollLeft < containerWidth && this.container.scrollLeft + itemWidth / 2 > containerWidth)
        this.container.scrollLeft = this.container.scrollWidth;
    }
    if (this.isCentered && !this.isSnap) {
      const centeredOffset = (containerWidth - itemWidth) / 2;
      if (this.currentIndex === 0) translateX = -centeredOffset;
      else if (this.currentIndex >= this.slides.length - this.getCurrentSlidesQty() + (this.getCurrentSlidesQty() - 1)) {
        const totalSlideWidth = this.slides.length * itemWidth;
        translateX = totalSlideWidth - containerWidth + centeredOffset;
      } else translateX = this.currentIndex * itemWidth - centeredOffset;
    }
    if (!this.isSnap)
      this.inner.style.transform = this.isRTL ? `translate(${translateX}px, 0px)` : `translate(${-translateX}px, 0px)`;
    if (this.isAutoHeight)
      this.inner.style.height = `${this.slides[this.currentIndex].clientHeight}px`;
    if (this.dotsItems) this.goToCurrentDot();
    this.addCurrentClass();
    if (!this.isInfiniteLoop) this.addDisabledClass();
    if (this.isSnap && this.hasSnapSpacers) this.buildSnapSpacers();
    if (this.infoCurrent) this.setInfoCurrent();
  }
  setTranslate(val) {
    this.inner.style.transform = this.isRTL ? `translate(${-val}px, 0px)` : `translate(${val}px, 0px)`;
  }
  setIndex(i) {
    this.currentIndex = i;
    this.addCurrentClass();
    if (!this.isInfiniteLoop) this.addDisabledClass();
  }
  // Public methods
  recalculateWidth() {
    this.sliderWidth = this.inner.parentElement.getBoundingClientRect().width;
    this.calculateWidth();
    if (this.sliderWidth !== this.inner.parentElement.getBoundingClientRect().width)
      this.recalculateWidth();
  }
  goToPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.slides.length - this.getCurrentSlidesQty();
    }
    if (this.isSnap) {
      const itemWidth = this.sliderWidth / this.getCurrentSlidesQty();
      this.container.scrollBy({
        left: Math.max(-this.container.scrollLeft, -itemWidth),
        behavior: "smooth"
      });
      this.addCurrentClass();
      if (!this.isInfiniteLoop) this.addDisabledClass();
    } else this.calculateTransform();
    if (this.dots) this.setCurrentDot();
  }
  goToNext() {
    const statement = this.isCentered ? this.slides.length - this.getCurrentSlidesQty() + (this.getCurrentSlidesQty() - 1) : this.slides.length - this.getCurrentSlidesQty();
    if (this.currentIndex < statement) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    if (this.isSnap) {
      const itemWidth = this.sliderWidth / this.getCurrentSlidesQty();
      const maxScrollLeft = this.container.scrollWidth - this.container.clientWidth;
      this.container.scrollBy({
        left: Math.min(itemWidth, maxScrollLeft - this.container.scrollLeft),
        behavior: "smooth"
      });
      this.addCurrentClass();
      if (!this.isInfiniteLoop) this.addDisabledClass();
    } else this.calculateTransform();
    if (this.dots) this.setCurrentDot();
  }
  goTo(i) {
    const currentIndex = this.currentIndex;
    this.currentIndex = i;
    if (this.isSnap) {
      const itemWidth = this.sliderWidth / this.getCurrentSlidesQty();
      const index = currentIndex > this.currentIndex ? currentIndex - this.currentIndex : this.currentIndex - currentIndex;
      const width = currentIndex > this.currentIndex ? -(itemWidth * index) : itemWidth * index;
      this.container.scrollBy({
        left: width,
        behavior: "smooth"
      });
      this.addCurrentClass();
      if (!this.isInfiniteLoop) this.addDisabledClass();
    } else this.calculateTransform();
    if (this.dots) this.setCurrentDot();
  }
  destroy() {
    if (this.loadingClassesAdd) {
      if (typeof this.loadingClassesAdd === "string")
        this.inner.classList.remove(this.loadingClassesAdd);
      else this.inner.classList.remove(...this.loadingClassesAdd);
    }
    if (this.inner && this.afterLoadingClassesAdd) {
      setTimeout(() => {
        if (typeof this.afterLoadingClassesAdd === "string")
          this.inner.classList.remove(this.afterLoadingClassesAdd);
        else this.inner.classList.remove(...this.afterLoadingClassesAdd);
      });
    }
    this.el.classList.remove("init");
    this.inner.classList.remove("dragging");
    this.slides.forEach((el) => el.classList.remove("active"));
    if (this?.dotsItems?.length)
      this.dotsItems.forEach((el) => el.classList.remove("active"));
    this.prev.classList.remove("disabled");
    this.next.classList.remove("disabled");
    this.inner.style.width = "";
    this.slides.forEach((el) => el.style.width = "");
    if (!this.isSnap) this.inner.style.transform = "";
    if (this.isAutoHeight) this.inner.style.height = "";
    this.prev.removeEventListener("click", this.onPrevClickListener);
    this.next.removeEventListener("click", this.onNextClickListener);
    this.container.removeEventListener(
      "scroll",
      this.onContainerScrollListener
    );
    this.el.removeEventListener("touchstart", this.onElementTouchStartListener);
    this.el.removeEventListener("touchend", this.onElementTouchEndListener);
    this.inner.removeEventListener("mousedown", this.onInnerMouseDownListener);
    this.inner.removeEventListener(
      "touchstart",
      this.onInnerTouchStartListener
    );
    document.removeEventListener("mousemove", this.onDocumentMouseMoveListener);
    document.removeEventListener("touchmove", this.onDocumentTouchMoveListener);
    document.removeEventListener("mouseup", this.onDocumentMouseUpListener);
    document.removeEventListener("touchend", this.onDocumentTouchEndListener);
    this.inner.querySelectorAll("a:not(.prevented-click)").forEach((el) => {
      el.classList.remove("prevented-click");
      el.removeEventListener("click", this.removeClickEventWhileDragging);
    });
    if (this?.dotsItems?.length || this.dots.querySelectorAll(":scope > *").length) {
      const dots = this?.dotsItems || this.dots.querySelectorAll(":scope > *");
      dots.forEach(
        (el) => el.removeEventListener("click", this.onDotClickListener)
      );
      this.dots.innerHTML = null;
    }
    this.inner.querySelector(".hs-snap-before").remove();
    this.inner.querySelector(".hs-snap-after").remove();
    this.dotsItems = null;
    this.isDragging = false;
    this.dragStartX = null;
    this.initialTranslateX = null;
    window.$hsCarouselCollection = window.$hsCarouselCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsCarouselCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsCarouselCollection) window.$hsCarouselCollection = [];
    if (window.$hsCarouselCollection)
      window.$hsCarouselCollection = window.$hsCarouselCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-carousel]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsCarouselCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSCarousel(el);
    });
  }
}
window.addEventListener("load", () => {
  HSCarousel.autoInit();
});
if (typeof window !== "undefined") {
  window.HSCarousel = HSCarousel;
}

/*
 * HSCollapse
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSCollapse extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.contentId = this.el.dataset.hsCollapse;
    this.content = document.querySelector(this.contentId);
    this.animationInProcess = false;
    if (this.content) this.init();
  }
  elementClick() {
    if (this.content.classList.contains("open")) {
      this.hide();
    } else {
      this.show();
    }
  }
  init() {
    this.createCollection(window.$hsCollapseCollection, this);
    this.onElementClickListener = () => this.elementClick();
    if (this?.el?.ariaExpanded) {
      if (this.el.classList.contains("open")) this.el.ariaExpanded = "true";
      else this.el.ariaExpanded = "false";
    }
    this.el.addEventListener("click", this.onElementClickListener);
  }
  hideAllMegaMenuItems() {
    this.content.querySelectorAll(".hs-mega-menu-content.block").forEach((el) => {
      el.classList.remove("block");
      el.classList.add("hidden");
    });
  }
  // Public methods
  show() {
    if (this.animationInProcess || this.el.classList.contains("open"))
      return false;
    this.animationInProcess = true;
    this.el.classList.add("open");
    if (this?.el?.ariaExpanded) this.el.ariaExpanded = "true";
    this.content.classList.add("open");
    this.content.classList.remove("hidden");
    this.content.style.height = "0";
    setTimeout(() => {
      this.content.style.height = `${this.content.scrollHeight}px`;
      this.fireEvent("beforeOpen", this.el);
      dispatch("beforeOpen.hs.collapse", this.el, this.el);
    });
    afterTransition(this.content, () => {
      this.content.style.height = "";
      this.fireEvent("open", this.el);
      dispatch("open.hs.collapse", this.el, this.el);
      this.animationInProcess = false;
    });
  }
  hide() {
    if (this.animationInProcess || !this.el.classList.contains("open"))
      return false;
    this.animationInProcess = true;
    this.el.classList.remove("open");
    if (this?.el?.ariaExpanded) this.el.ariaExpanded = "false";
    this.content.style.height = `${this.content.scrollHeight}px`;
    setTimeout(() => {
      this.content.style.height = "0";
    });
    this.content.classList.remove("open");
    afterTransition(this.content, () => {
      this.content.classList.add("hidden");
      this.content.style.height = "";
      this.fireEvent("hide", this.el);
      dispatch("hide.hs.collapse", this.el, this.el);
      this.animationInProcess = false;
    });
    if (this.content.querySelectorAll(".hs-mega-menu-content.block").length) {
      this.hideAllMegaMenuItems();
    }
  }
  destroy() {
    this.el.removeEventListener("click", this.onElementClickListener);
    this.content = null;
    this.animationInProcess = false;
    window.$hsCollapseCollection = window.$hsCollapseCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static findInCollection(target) {
    return window.$hsCollapseCollection.find((el) => {
      if (target instanceof HSCollapse) return el.element.el === target.el;
      else if (typeof target === "string") return el.element.el === document.querySelector(target);
      else return el.element.el === target;
    }) || null;
  }
  static getInstance(target, isInstance = false) {
    const elInCollection = window.$hsCollapseCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsCollapseCollection) window.$hsCollapseCollection = [];
    if (window.$hsCollapseCollection)
      window.$hsCollapseCollection = window.$hsCollapseCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(".hs-collapse-toggle:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsCollapseCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSCollapse(el);
    });
  }
  static show(target) {
    const instance = HSCollapse.findInCollection(target);
    if (instance && instance.element.content.classList.contains("hidden")) instance.element.show();
  }
  static hide(target) {
    const instance = HSCollapse.findInCollection(target);
    if (instance && !instance.element.content.classList.contains("hidden")) instance.element.hide();
  }
  // Backward compatibility
  static on(evt, target, cb) {
    const instance = HSCollapse.findInCollection(target);
    if (instance) instance.element.events[evt] = cb;
  }
}
window.addEventListener("load", () => {
  HSCollapse.autoInit();
});
if (typeof window !== "undefined") {
  window.HSCollapse = HSCollapse;
}

/*
 * HSComboBox
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSComboBox extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.isSearchLengthExceeded = false;
    const data = el.getAttribute("data-hs-combo-box");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.gap = 5;
    this.viewport = (typeof concatOptions?.viewport === "string" ? document.querySelector(concatOptions?.viewport) : concatOptions?.viewport) ?? null;
    this.preventVisibility = concatOptions?.preventVisibility ?? false;
    this.minSearchLength = concatOptions?.minSearchLength ?? 0;
    this.apiUrl = concatOptions?.apiUrl ?? null;
    this.apiDataPart = concatOptions?.apiDataPart ?? null;
    this.apiQuery = concatOptions?.apiQuery ?? null;
    this.apiSearchQuery = concatOptions?.apiSearchQuery ?? null;
    this.apiSearchPath = concatOptions?.apiSearchPath ?? null;
    this.apiSearchDefaultPath = concatOptions?.apiSearchDefaultPath ?? null;
    this.apiHeaders = concatOptions?.apiHeaders ?? {};
    this.apiGroupField = concatOptions?.apiGroupField ?? null;
    this.outputItemTemplate = concatOptions?.outputItemTemplate ?? `<div class="cursor-pointer py-2 px-4 w-full text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" data-hs-combo-box-output-item>
				<div class="flex justify-between items-center w-full">
					<span data-hs-combo-box-search-text></span>
					<span class="hidden hs-combo-box-selected:block">
						<svg class="shrink-0 size-3.5 text-blue-600 dark:text-blue-500" xmlns="http:.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</span>
				</div>
			</div>`;
    this.outputEmptyTemplate = concatOptions?.outputEmptyTemplate ?? `<div class="py-2 px-4 w-full text-sm text-gray-800 rounded-lg dark:bg-neutral-900 dark:text-neutral-200">Nothing found...</div>`;
    this.outputLoaderTemplate = concatOptions?.outputLoaderTemplate ?? `<div class="flex justify-center items-center py-2 px-4 text-sm text-gray-800 rounded-lg bg-white dark:bg-neutral-900 dark:text-neutral-200">
				<div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
					<span class="sr-only">Loading...</span>
				</div>
			</div>`;
    this.groupingType = concatOptions?.groupingType ?? null;
    this.groupingTitleTemplate = concatOptions?.groupingTitleTemplate ?? (this.groupingType === "default" ? `<div class="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-500"></div>` : `<button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold whitespace-nowrap rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"></button>`);
    this.tabsWrapperTemplate = concatOptions?.tabsWrapperTemplate ?? `<div class="overflow-x-auto p-4"></div>`;
    this.preventSelection = concatOptions?.preventSelection ?? false;
    this.preventAutoPosition = concatOptions?.preventAutoPosition ?? false;
    this.isOpenOnFocus = concatOptions?.isOpenOnFocus ?? false;
    this.input = this.el.querySelector("[data-hs-combo-box-input]") ?? null;
    this.output = this.el.querySelector("[data-hs-combo-box-output]") ?? null;
    this.itemsWrapper = this.el.querySelector("[data-hs-combo-box-output-items-wrapper]") ?? null;
    this.items = Array.from(this.el.querySelectorAll("[data-hs-combo-box-output-item]")) ?? [];
    this.tabs = [];
    this.toggle = this.el.querySelector("[data-hs-combo-box-toggle]") ?? null;
    this.toggleClose = this.el.querySelector("[data-hs-combo-box-close]") ?? null;
    this.toggleOpen = this.el.querySelector("[data-hs-combo-box-open]") ?? null;
    this.outputPlaceholder = null;
    this.selected = this.value = this.el.querySelector("[data-hs-combo-box-input]").value ?? "";
    this.currentData = null;
    this.isOpened = false;
    this.isCurrent = false;
    this.animationInProcess = false;
    this.selectedGroup = "all";
    this.init();
  }
  inputFocus() {
    if (!this.isOpened) {
      this.setResultAndRender();
      this.open();
    }
  }
  inputInput(evt) {
    const val = evt.target.value.trim();
    if (val.length <= this.minSearchLength) this.setResultAndRender("");
    else this.setResultAndRender(val);
    if (this.input.value !== "") this.el.classList.add("has-value");
    else this.el.classList.remove("has-value");
    if (!this.isOpened) this.open();
  }
  toggleClick() {
    if (this.isOpened) this.close();
    else this.open(this.toggle.getAttribute("data-hs-combo-box-toggle"));
  }
  toggleCloseClick() {
    this.close();
  }
  toggleOpenClick() {
    this.open();
  }
  init() {
    this.createCollection(window.$hsComboBoxCollection, this);
    this.build();
  }
  build() {
    this.buildInput();
    if (this.groupingType) this.setGroups();
    this.buildItems();
    if (this.preventVisibility) {
      if (!this.preventAutoPosition) this.recalculateDirection();
    }
    if (this.toggle) this.buildToggle();
    if (this.toggleClose) this.buildToggleClose();
    if (this.toggleOpen) this.buildToggleOpen();
  }
  getNestedProperty(obj, path) {
    return path.split(".").reduce((acc, key) => acc && acc[key], obj);
  }
  setValue(val, data = null) {
    this.selected = val;
    this.value = val;
    this.input.value = val;
    if (data) this.currentData = data;
    this.fireEvent("select", this.currentData);
    dispatch("select.hs.combobox", this.el, this.currentData);
  }
  setValueAndOpen(val) {
    this.value = val;
    if (this.items.length) {
      this.setItemsVisibility();
    }
  }
  setValueAndClear(val, data = null) {
    if (val) this.setValue(val, data);
    else this.setValue(this.selected, data);
    if (this.outputPlaceholder) this.destroyOutputPlaceholder();
  }
  setSelectedByValue(val) {
    this.items.forEach((el) => {
      if (this.isTextExists(el, val))
        el.classList.add("selected");
      else el.classList.remove("selected");
    });
  }
  setResultAndRender(value = "") {
    let _value = this.preventVisibility ? this.input.value : value;
    this.setResults(_value);
    if (this.apiSearchQuery || this.apiSearchPath || this.apiSearchDefaultPath) this.itemsFromJson();
    if (_value === "") this.isSearchLengthExceeded = true;
    else this.isSearchLengthExceeded = false;
  }
  setResults(val) {
    this.value = val;
    this.resultItems();
    if (this.hasVisibleItems()) this.destroyOutputPlaceholder();
    else this.buildOutputPlaceholder();
  }
  setGroups() {
    const groups = [];
    this.items.forEach((item) => {
      const { group } = JSON.parse(
        item.getAttribute("data-hs-combo-box-output-item")
      );
      if (!groups.some((el) => el?.name === group.name)) {
        groups.push(group);
      }
    });
    this.groups = groups;
  }
  setApiGroups(items) {
    const groups = [];
    items.forEach((item) => {
      const group = item[this.apiGroupField];
      if (!groups.some((el) => el.name === group)) {
        groups.push({
          name: group,
          title: group
        });
      }
    });
    this.groups = groups;
  }
  setItemsVisibility() {
    if (this.groupingType === "tabs" && this.selectedGroup !== "all") {
      this.items.forEach((item) => {
        item.style.display = "none";
      });
    }
    const items = this.groupingType === "tabs" ? this.selectedGroup === "all" ? this.items : this.items.filter((f) => {
      const { group } = JSON.parse(
        f.getAttribute("data-hs-combo-box-output-item")
      );
      return group.name === this.selectedGroup;
    }) : this.items;
    if (this.groupingType === "tabs" && this.selectedGroup !== "all") {
      items.forEach((item) => {
        item.style.display = "block";
      });
    }
    items.forEach((item) => {
      if (!this.isTextExistsAny(item, this.value))
        item.style.display = "none";
      else item.style.display = "block";
    });
    if (this.groupingType === "default") {
      this.output.querySelectorAll("[data-hs-combo-box-group-title]").forEach((el) => {
        const g = el.getAttribute("data-hs-combo-box-group-title");
        const items2 = this.items.filter((f) => {
          const { group } = JSON.parse(
            f.getAttribute("data-hs-combo-box-output-item")
          );
          return group.name === g && f.style.display === "block";
        });
        if (items2.length) el.style.display = "block";
        else el.style.display = "none";
      });
    }
  }
  isTextExists(el, val) {
    const lowerCased = val.map((v) => v.toLowerCase());
    return Array.from(
      el.querySelectorAll("[data-hs-combo-box-search-text]")
    ).some(
      (elI) => lowerCased.includes(
        elI.getAttribute("data-hs-combo-box-search-text").toLowerCase()
      )
    );
  }
  isTextExistsAny(el, val) {
    return Array.from(
      el.querySelectorAll("[data-hs-combo-box-search-text]")
    ).some(
      (elI) => elI.getAttribute("data-hs-combo-box-search-text").toLowerCase().includes(val.toLowerCase())
    );
  }
  hasVisibleItems() {
    return this.items.length ? this.items.some((el) => el.style.display === "block") : false;
  }
  valuesBySelector(el) {
    return Array.from(
      el.querySelectorAll("[data-hs-combo-box-search-text]")
    ).reduce(
      (acc, cur) => [
        ...acc,
        cur.getAttribute("data-hs-combo-box-search-text")
      ],
      []
    );
  }
  sortItems() {
    const compareFn = (i1, i2) => {
      const a = i1.querySelector("[data-hs-combo-box-value]").getAttribute("data-hs-combo-box-search-text");
      const b = i2.querySelector("[data-hs-combo-box-value]").getAttribute("data-hs-combo-box-search-text");
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
      return 0;
    };
    return this.items.sort(compareFn);
  }
  buildInput() {
    if (this.isOpenOnFocus) {
      this.onInputFocusListener = () => this.inputFocus();
      this.input.addEventListener("focus", this.onInputFocusListener);
    }
    this.onInputInputListener = debounce$1(
      (evt) => this.inputInput(evt)
    );
    this.input.addEventListener("input", this.onInputInputListener);
  }
  async buildItems() {
    this.output.role = "listbox";
    this.output.tabIndex = -1;
    this.output.ariaOrientation = "vertical";
    if (this.apiUrl) await this.itemsFromJson();
    else {
      if (this.itemsWrapper) this.itemsWrapper.innerHTML = "";
      else this.output.innerHTML = "";
      this.itemsFromHtml();
    }
    if (this.items[0].classList.contains("selected"))
      this.currentData = JSON.parse(this.items[0].getAttribute("data-hs-combo-box-item-stored-data"));
  }
  buildOutputLoader() {
    if (this.outputLoader) return false;
    this.outputLoader = htmlToElement(this.outputLoaderTemplate);
    if (this.items.length || this.outputPlaceholder) {
      this.outputLoader.style.position = "absolute";
      this.outputLoader.style.top = "0";
      this.outputLoader.style.bottom = "0";
      this.outputLoader.style.left = "0";
      this.outputLoader.style.right = "0";
      this.outputLoader.style.zIndex = "2";
    } else {
      this.outputLoader.style.position = "";
      this.outputLoader.style.top = "";
      this.outputLoader.style.bottom = "";
      this.outputLoader.style.left = "";
      this.outputLoader.style.right = "";
      this.outputLoader.style.zIndex = "";
      this.outputLoader.style.height = "30px";
    }
    this.output.append(this.outputLoader);
  }
  buildToggle() {
    if (this.isOpened) {
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
      if (this?.input?.ariaExpanded) this.input.ariaExpanded = "true";
    } else {
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
      if (this?.input?.ariaExpanded) this.input.ariaExpanded = "false";
    }
    this.onToggleClickListener = () => this.toggleClick();
    this.toggle.addEventListener("click", this.onToggleClickListener);
  }
  buildToggleClose() {
    this.onToggleCloseClickListener = () => this.toggleCloseClick();
    this.toggleClose.addEventListener("click", this.onToggleCloseClickListener);
  }
  buildToggleOpen() {
    this.onToggleOpenClickListener = () => this.toggleOpenClick();
    this.toggleOpen.addEventListener("click", this.onToggleOpenClickListener);
  }
  buildOutputPlaceholder() {
    if (!this.outputPlaceholder)
      this.outputPlaceholder = htmlToElement(this.outputEmptyTemplate);
    this.appendItemsToWrapper(this.outputPlaceholder);
  }
  destroyOutputLoader() {
    if (this.outputLoader) this.outputLoader.remove();
    this.outputLoader = null;
  }
  itemRender(item) {
    const val = item.querySelector("[data-hs-combo-box-value]").getAttribute("data-hs-combo-box-search-text");
    const data = JSON.parse(item.getAttribute("data-hs-combo-box-item-stored-data")) ?? null;
    if (this.itemsWrapper) this.itemsWrapper.append(item);
    else this.output.append(item);
    if (!this.preventSelection) {
      item.addEventListener("click", () => {
        this.close(val, data);
        this.setSelectedByValue(this.valuesBySelector(item));
      });
    }
  }
  plainRender(items) {
    items.forEach((item) => {
      this.itemRender(item);
    });
  }
  jsonItemsRender(items) {
    items.forEach((item, index) => {
      const newItem = htmlToElement(this.outputItemTemplate);
      newItem.setAttribute("data-hs-combo-box-item-stored-data", JSON.stringify(item));
      newItem.querySelectorAll("[data-hs-combo-box-output-item-field]").forEach((el) => {
        const value = this.getNestedProperty(item, el.getAttribute("data-hs-combo-box-output-item-field"));
        const hideIfEmpty = el.hasAttribute(
          "data-hs-combo-box-output-item-hide-if-empty"
        );
        el.textContent = value ?? "";
        if (!value && hideIfEmpty) el.style.display = "none";
      });
      newItem.querySelectorAll("[data-hs-combo-box-search-text]").forEach((el) => {
        const value = this.getNestedProperty(item, el.getAttribute("data-hs-combo-box-output-item-field"));
        el.setAttribute(
          "data-hs-combo-box-search-text",
          value ?? ""
        );
      });
      newItem.querySelectorAll("[data-hs-combo-box-output-item-attr]").forEach((el) => {
        const attributes = JSON.parse(
          el.getAttribute("data-hs-combo-box-output-item-attr")
        );
        attributes.forEach((attr) => {
          el.setAttribute(attr.attr, item[attr.valueFrom]);
        });
      });
      newItem.setAttribute("tabIndex", `${index}`);
      if (this.groupingType === "tabs" || this.groupingType === "default") {
        newItem.setAttribute(
          "data-hs-combo-box-output-item",
          `{"group": {"name": "${item[this.apiGroupField]}", "title": "${item[this.apiGroupField]}"}}`
        );
      }
      this.items = [...this.items, newItem];
      if (!this.preventSelection) {
        newItem.addEventListener("click", () => {
          this.close(
            newItem.querySelector("[data-hs-combo-box-value]").getAttribute("data-hs-combo-box-search-text"),
            JSON.parse(newItem.getAttribute("data-hs-combo-box-item-stored-data"))
          );
          this.setSelectedByValue(this.valuesBySelector(newItem));
        });
      }
      this.appendItemsToWrapper(newItem);
    });
  }
  groupDefaultRender() {
    this.groups.forEach((el) => {
      const title = htmlToElement(this.groupingTitleTemplate);
      title.setAttribute("data-hs-combo-box-group-title", el.name);
      title.classList.add("--exclude-accessibility");
      title.innerText = el.title;
      if (this.itemsWrapper) this.itemsWrapper.append(title);
      else this.output.append(title);
      const items = this.sortItems().filter((f) => {
        const { group } = JSON.parse(
          f.getAttribute("data-hs-combo-box-output-item")
        );
        return group.name === el.name;
      });
      this.plainRender(items);
    });
  }
  groupTabsRender() {
    const tabsScroll = htmlToElement(this.tabsWrapperTemplate);
    const tabsWrapper = htmlToElement(
      `<div class="flex flex-nowrap gap-x-2"></div>`
    );
    tabsScroll.append(tabsWrapper);
    this.output.insertBefore(tabsScroll, this.output.firstChild);
    const tabDef = htmlToElement(this.groupingTitleTemplate);
    tabDef.setAttribute("data-hs-combo-box-group-title", "all");
    tabDef.classList.add("--exclude-accessibility", "active");
    tabDef.innerText = "All";
    this.tabs = [...this.tabs, tabDef];
    tabsWrapper.append(tabDef);
    tabDef.addEventListener("click", () => {
      this.selectedGroup = "all";
      const selectedTab = this.tabs.find(
        (elI) => elI.getAttribute("data-hs-combo-box-group-title") === this.selectedGroup
      );
      this.tabs.forEach((el) => el.classList.remove("active"));
      selectedTab.classList.add("active");
      this.setItemsVisibility();
    });
    this.groups.forEach((el) => {
      const tab = htmlToElement(this.groupingTitleTemplate);
      tab.setAttribute("data-hs-combo-box-group-title", el.name);
      tab.classList.add("--exclude-accessibility");
      tab.innerText = el.title;
      this.tabs = [...this.tabs, tab];
      tabsWrapper.append(tab);
      tab.addEventListener("click", () => {
        this.selectedGroup = el.name;
        const selectedTab = this.tabs.find(
          (elI) => elI.getAttribute("data-hs-combo-box-group-title") === this.selectedGroup
        );
        this.tabs.forEach((el2) => el2.classList.remove("active"));
        selectedTab.classList.add("active");
        this.setItemsVisibility();
      });
    });
  }
  itemsFromHtml() {
    if (this.groupingType === "default") {
      this.groupDefaultRender();
    } else if (this.groupingType === "tabs") {
      const items = this.sortItems();
      this.groupTabsRender();
      this.plainRender(items);
    } else {
      const items = this.sortItems();
      this.plainRender(items);
    }
    this.setResults(this.input.value);
  }
  async itemsFromJson() {
    if (this.isSearchLengthExceeded) return false;
    this.buildOutputLoader();
    try {
      const query = `${this.apiQuery}`;
      let searchQuery;
      let searchPath;
      let url = this.apiUrl;
      if (!this.apiSearchQuery && this.apiSearchPath) {
        if (this.apiSearchDefaultPath && this.value === "") {
          searchPath = `/${this.apiSearchDefaultPath}`;
        } else {
          searchPath = `/${this.apiSearchPath}/${this.value.toLowerCase()}`;
        }
        if (this.apiSearchPath || this.apiSearchDefaultPath) {
          url += searchPath;
        }
      } else {
        searchQuery = `${this.apiSearchQuery}=${this.value.toLowerCase()}`;
        if (this.apiQuery && this.apiSearchQuery) {
          url += `?${searchQuery}&${query}`;
        } else if (this.apiQuery) {
          url += `?${query}`;
        } else if (this.apiSearchQuery) {
          url += `?${searchQuery}`;
        }
      }
      const res = await fetch(url, this.apiHeaders);
      let items = await res.json();
      if (this.apiDataPart) {
        items = items[this.apiDataPart];
      }
      if (this.apiSearchQuery || this.apiSearchPath) {
        this.items = [];
      }
      if (this.itemsWrapper) {
        this.itemsWrapper.innerHTML = "";
      } else {
        this.output.innerHTML = "";
      }
      if (this.groupingType === "tabs") {
        this.setApiGroups(items);
        this.groupTabsRender();
        this.jsonItemsRender(items);
      } else if (this.groupingType === "default") {
        this.setApiGroups(items);
        this.groups.forEach((el) => {
          const title = htmlToElement(this.groupingTitleTemplate);
          title.setAttribute("data-hs-combo-box-group-title", el.name);
          title.classList.add("--exclude-accessibility");
          title.innerText = el.title;
          const newItems = items.filter(
            (i) => i[this.apiGroupField] === el.name
          );
          if (this.itemsWrapper) this.itemsWrapper.append(title);
          else this.output.append(title);
          this.jsonItemsRender(newItems);
        });
      } else {
        this.jsonItemsRender(items);
      }
      this.setResults(this.input.value.length <= this.minSearchLength ? "" : this.input.value);
    } catch (err) {
      console.error(err);
      this.buildOutputPlaceholder();
    }
    this.destroyOutputLoader();
  }
  appendItemsToWrapper(item) {
    if (this.itemsWrapper) {
      this.itemsWrapper.append(item);
    } else {
      this.output.append(item);
    }
  }
  resultItems() {
    if (!this.items.length) return false;
    this.setItemsVisibility();
    this.setSelectedByValue([this.selected]);
  }
  destroyOutputPlaceholder() {
    if (this.outputPlaceholder) this.outputPlaceholder.remove();
    this.outputPlaceholder = null;
  }
  // Public methods
  getCurrentData() {
    return this.currentData;
  }
  setCurrent() {
    if (window.$hsComboBoxCollection.length) {
      window.$hsComboBoxCollection.map((el) => el.element.isCurrent = false);
      this.isCurrent = true;
    }
  }
  open(val) {
    if (this.animationInProcess) return false;
    if (typeof val !== "undefined") this.setValueAndOpen(val);
    if (this.preventVisibility) return false;
    this.animationInProcess = true;
    this.output.style.display = "block";
    if (!this.preventAutoPosition) this.recalculateDirection();
    setTimeout(() => {
      if (this?.input?.ariaExpanded) this.input.ariaExpanded = "true";
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
      this.el.classList.add("active");
      this.animationInProcess = false;
    });
    this.isOpened = true;
  }
  close(val, data = null) {
    if (this.animationInProcess) return false;
    if (this.preventVisibility) {
      this.setValueAndClear(val, data);
      if (this.input.value !== "") this.el.classList.add("has-value");
      else this.el.classList.remove("has-value");
      return false;
    }
    this.animationInProcess = true;
    if (this?.input?.ariaExpanded) this.input.ariaExpanded = "false";
    if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
    this.el.classList.remove("active");
    if (!this.preventAutoPosition) {
      this.output.classList.remove("bottom-full", "top-full");
      this.output.style.marginTop = "";
      this.output.style.marginBottom = "";
    }
    afterTransition(this.output, () => {
      this.output.style.display = "none";
      this.setValueAndClear(val, data || null);
      this.animationInProcess = false;
    });
    if (this.input.value !== "") this.el.classList.add("has-value");
    else this.el.classList.remove("has-value");
    this.isOpened = false;
  }
  recalculateDirection() {
    if (isEnoughSpace(
      this.output,
      this.input,
      "bottom",
      this.gap,
      this.viewport
    )) {
      this.output.classList.remove("bottom-full");
      this.output.style.marginBottom = "";
      this.output.classList.add("top-full");
      this.output.style.marginTop = `${this.gap}px`;
    } else {
      this.output.classList.remove("top-full");
      this.output.style.marginTop = "";
      this.output.classList.add("bottom-full");
      this.output.style.marginBottom = `${this.gap}px`;
    }
  }
  destroy() {
    this.input.removeEventListener("focus", this.onInputFocusListener);
    this.input.removeEventListener("input", this.onInputInputListener);
    this.toggle.removeEventListener("click", this.onToggleClickListener);
    if (this.toggleClose)
      this.toggleClose.removeEventListener(
        "click",
        this.onToggleCloseClickListener
      );
    if (this.toggleOpen)
      this.toggleOpen.removeEventListener(
        "click",
        this.onToggleOpenClickListener
      );
    this.el.classList.remove("has-value", "active");
    if (this.items.length)
      this.items.forEach((el) => {
        el.classList.remove("selected");
        el.style.display = "";
      });
    this.output.removeAttribute("role");
    this.output.removeAttribute("tabindex");
    this.output.removeAttribute("aria-orientation");
    if (this.outputLoader) {
      this.outputLoader.remove();
      this.outputLoader = null;
    }
    if (this.outputPlaceholder) {
      this.outputPlaceholder.remove();
      this.outputPlaceholder = null;
    }
    if (this.apiUrl) {
      this.output.innerHTML = "";
    }
    this.items = [];
    window.$hsComboBoxCollection = window.$hsComboBoxCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsComboBoxCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsComboBoxCollection) {
      window.$hsComboBoxCollection = [];
      window.addEventListener("click", (evt) => {
        const evtTarget = evt.target;
        HSComboBox.closeCurrentlyOpened(evtTarget);
      });
      document.addEventListener(
        "keydown",
        (evt) => HSComboBox.accessibility(evt)
      );
    }
    if (window.$hsComboBoxCollection)
      window.$hsComboBoxCollection = window.$hsComboBoxCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-combo-box]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsComboBoxCollection.find(
        (elC) => elC?.element?.el === el
      )) {
        const data = el.getAttribute("data-hs-combo-box");
        const options = data ? JSON.parse(data) : {};
        new HSComboBox(el, options);
      }
    });
  }
  static close(target) {
    const elInCollection = window.$hsComboBoxCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    if (elInCollection && elInCollection.element.isOpened) {
      elInCollection.element.close();
    }
  }
  static closeCurrentlyOpened(evtTarget = null) {
    if (!evtTarget.closest("[data-hs-combo-box].active")) {
      const currentlyOpened = window.$hsComboBoxCollection.filter((el) => el.element.isOpened) || null;
      if (currentlyOpened) {
        currentlyOpened.forEach((el) => {
          el.element.close();
        });
      }
    }
  }
  // Accessibility methods
  static getPreparedItems(isReversed = false, output) {
    if (!output) return null;
    const preparedItems = isReversed ? Array.from(
      output.querySelectorAll(":scope > *:not(.--exclude-accessibility)")
    ).filter((el) => el.style.display !== "none").reverse() : Array.from(
      output.querySelectorAll(":scope > *:not(.--exclude-accessibility)")
    ).filter((el) => el.style.display !== "none");
    const items = preparedItems.filter(
      (el) => !el.classList.contains("disabled")
    );
    return items;
  }
  static setHighlighted(prev, current, input) {
    current.focus();
    input.value = current.querySelector("[data-hs-combo-box-value]").getAttribute("data-hs-combo-box-search-text");
    if (prev) prev.classList.remove("hs-combo-box-output-item-highlighted");
    current.classList.add("hs-combo-box-output-item-highlighted");
  }
  static accessibility(evt) {
    const target = window.$hsComboBoxCollection.find(
      (el) => el.element.preventVisibility ? el.element.isCurrent : el.element.isOpened
    );
    if (target && COMBO_BOX_ACCESSIBILITY_KEY_SET.includes(evt.code) && !evt.metaKey) {
      switch (evt.code) {
        case "Escape":
          evt.preventDefault();
          this.onEscape();
          break;
        case "ArrowUp":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onArrow();
          break;
        case "ArrowDown":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onArrow(false);
          break;
        case "Home":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onStartEnd();
          break;
        case "End":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onStartEnd(false);
          break;
        case "Enter":
          evt.preventDefault();
          this.onEnter(evt);
          break;
      }
    }
  }
  static onEscape() {
    const target = window.$hsComboBoxCollection.find(
      (el) => !el.element.preventVisibility && el.element.isOpened
    );
    if (target) {
      target.element.close();
      target.element.input.blur();
    }
  }
  static onArrow(isArrowUp = true) {
    const target = window.$hsComboBoxCollection.find(
      (el) => el.element.preventVisibility ? el.element.isCurrent : el.element.isOpened
    );
    if (target) {
      const output = target.element.itemsWrapper ?? target.element.output;
      if (!output) return false;
      const items = HSComboBox.getPreparedItems(isArrowUp, output);
      const current = output.querySelector(
        ".hs-combo-box-output-item-highlighted"
      );
      let currentItem = null;
      if (!current)
        items[0].classList.add("hs-combo-box-output-item-highlighted");
      let currentInd = items.findIndex((el) => el === current);
      if (currentInd + 1 < items.length) currentInd++;
      currentItem = items[currentInd];
      HSComboBox.setHighlighted(current, currentItem, target.element.input);
    }
  }
  static onStartEnd(isStart = true) {
    const target = window.$hsComboBoxCollection.find(
      (el) => el.element.preventVisibility ? el.element.isCurrent : el.element.isOpened
    );
    if (target) {
      const output = target.element.itemsWrapper ?? target.element.output;
      if (!output) return false;
      const items = HSComboBox.getPreparedItems(isStart, output);
      const current = output.querySelector(
        ".hs-combo-box-output-item-highlighted"
      );
      if (items.length)
        HSComboBox.setHighlighted(
          current,
          items[0],
          target.element.input
        );
    }
  }
  static onEnter(evt) {
    const target = evt.target;
    const opened = window.$hsComboBoxCollection.find(
      (el) => !isParentOrElementHidden(el.element.el) && evt.target.closest("[data-hs-combo-box]") === el.element.el
    );
    const link = opened.element.el.querySelector(
      ".hs-combo-box-output-item-highlighted a"
    );
    if (target.hasAttribute("data-hs-combo-box-input")) {
      opened.element.close();
      target.blur();
    } else {
      if (!opened.element.preventSelection) {
        opened.element.setSelectedByValue(
          opened.element.valuesBySelector(evt.target)
        );
      }
      if (opened.element.preventSelection && link) {
        window.location.assign(link.getAttribute("href"));
      }
      opened.element.close(
        !opened.element.preventSelection ? evt.target.querySelector("[data-hs-combo-box-value]").getAttribute("data-hs-combo-box-search-text") : null,
        JSON.parse(evt.target.getAttribute("data-hs-combo-box-item-stored-data")) ?? null
      );
    }
  }
}
window.addEventListener("load", () => {
  HSComboBox.autoInit();
});
document.addEventListener("scroll", () => {
  if (!window.$hsComboBoxCollection) return false;
  const target = window.$hsComboBoxCollection.find((el) => el.element.isOpened);
  if (target && !target.element.preventAutoPosition)
    target.element.recalculateDirection();
});
if (typeof window !== "undefined") {
  window.HSComboBox = HSComboBox;
}

var top = 'top';
var bottom = 'bottom';
var right = 'right';
var left = 'left';
var auto = 'auto';
var basePlacements = [top, bottom, right, left];
var start = 'start';
var end = 'end';
var clippingParents = 'clippingParents';
var viewport = 'viewport';
var popper = 'popper';
var reference = 'reference';
var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []); // modifiers that need to read the DOM

var beforeRead = 'beforeRead';
var read = 'read';
var afterRead = 'afterRead'; // pure-logic modifiers

var beforeMain = 'beforeMain';
var main = 'main';
var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

var beforeWrite = 'beforeWrite';
var write = 'write';
var afterWrite = 'afterWrite';
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

function getNodeName(element) {
  return element ? (element.nodeName || '').toLowerCase() : null;
}

function getWindow(node) {
  if (node == null) {
    return window;
  }

  if (node.toString() !== '[object Window]') {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }

  return node;
}

function isElement(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}

function isShadowRoot(node) {
  // IE 11 has no ShadowRoot
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }

  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// and applies them to the HTMLElements such as popper and arrow

function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function (name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name]; // arrow is optional + virtual elements

    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    } // Flow doesn't support to extend this property, but it's the most
    // effective way to apply styles to an HTMLElement
    // $FlowFixMe[cannot-write]


    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function (name) {
      var value = attributes[name];

      if (value === false) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value === true ? '' : value);
      }
    });
  });
}

function effect$2(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: '0',
      top: '0',
      margin: '0'
    },
    arrow: {
      position: 'absolute'
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return function () {
    Object.keys(state.elements).forEach(function (name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

      var style = styleProperties.reduce(function (style, property) {
        style[property] = '';
        return style;
      }, {}); // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }

      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
} // eslint-disable-next-line import/no-unused-modules


const applyStyles$1 = {
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  effect: effect$2,
  requires: ['computeStyles']
};

function getBasePlacement(placement) {
  return placement.split('-')[0];
}

var max = Math.max;
var min = Math.min;
var round = Math.round;

function getUAString() {
  var uaData = navigator.userAgentData;

  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function (item) {
      return item.brand + "/" + item.version;
    }).join(' ');
  }

  return navigator.userAgent;
}

function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === undefined) {
    includeScale = false;
  }

  if (isFixedStrategy === undefined) {
    isFixedStrategy = false;
  }

  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;

  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }

  var _ref = isElement(element) ? getWindow(element) : window,
      visualViewport = _ref.visualViewport;

  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width: width,
    height: height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x: x,
    y: y
  };
}

// means it doesn't take into account transforms.

function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
  // Fixes https://github.com/popperjs/popper-core/issues/1223

  var width = element.offsetWidth;
  var height = element.offsetHeight;

  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }

  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }

  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: width,
    height: height
  };
}

function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

  if (parent.contains(child)) {
    return true;
  } // then fallback to custom implementation with Shadow DOM support
  else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;

      do {
        if (next && parent.isSameNode(next)) {
          return true;
        } // $FlowFixMe[prop-missing]: need a better way to handle this...


        next = next.parentNode || next.host;
      } while (next);
    } // Give up, the result is false


  return false;
}

function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}

function isTableElement(element) {
  return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
}

function getDocumentElement(element) {
  // $FlowFixMe[incompatible-return]: assume body is always available
  return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
  element.document) || window.document).documentElement;
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') {
    return element;
  }

  return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || ( // DOM Element detected
    isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element) // fallback

  );
}

function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle$1(element).position === 'fixed') {
    return null;
  }

  return element.offsetParent;
} // `.offsetParent` reports `null` for fixed elements, while absolute elements
// return the containing block


function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());

  if (isIE && isHTMLElement(element)) {
    // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
    var elementCss = getComputedStyle$1(element);

    if (elementCss.position === 'fixed') {
      return null;
    }
  }

  var currentNode = getParentNode(element);

  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }

  while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
    // create a containing block.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return null;
} // Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.


function getOffsetParent(element) {
  var window = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);

  while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
}

function getMainAxisFromPlacement(placement) {
  return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
}

function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function withinMaxClamp(min, value, max) {
  var v = within(min, value, max);
  return v > max ? max : v;
}

function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

function expandToHashMap(value, keys) {
  return keys.reduce(function (hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

var toPaddingObject = function toPaddingObject(padding, state) {
  padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
};

function arrow(_ref) {
  var _state$modifiersData$;

  var state = _ref.state,
      name = _ref.name,
      options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? 'height' : 'width';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === 'y' ? top : left;
  var maxProp = axis === 'y' ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  var startDiff = popperOffsets[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
  // outside of the popper bounds

  var min = paddingObject[minProp];
  var max = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset = within(min, center, max); // Prevents breaking syntax highlighting...

  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
}

function effect$1(_ref2) {
  var state = _ref2.state,
      options = _ref2.options;
  var _options$element = options.element,
      arrowElement = _options$element === undefined ? '[data-popper-arrow]' : _options$element;

  if (arrowElement == null) {
    return;
  } // CSS selector


  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);

    if (!arrowElement) {
      return;
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }

  state.elements.arrow = arrowElement;
} // eslint-disable-next-line import/no-unused-modules


const arrow$1 = {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow,
  effect: effect$1,
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow']
};

function getVariation(placement) {
  return placement.split('-')[1];
}

var unsetSides = {
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto'
}; // Round the offsets to the nearest suitable subpixel based on the DPR.
// Zooming can change the DPR, but it seems to report a value that will
// cleanly divide the values into the appropriate subpixels.

function roundOffsetsByDPR(_ref, win) {
  var x = _ref.x,
      y = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}

function mapToStyles(_ref2) {
  var _Object$assign2;

  var popper = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      variation = _ref2.variation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x,
      x = _offsets$x === undefined ? 0 : _offsets$x,
      _offsets$y = offsets.y,
      y = _offsets$y === undefined ? 0 : _offsets$y;

  var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
    x: x,
    y: y
  }) : {
    x: x,
    y: y
  };

  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty('x');
  var hasY = offsets.hasOwnProperty('y');
  var sideX = left;
  var sideY = top;
  var win = window;

  if (adaptive) {
    var offsetParent = getOffsetParent(popper);
    var heightProp = 'clientHeight';
    var widthProp = 'clientWidth';

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);

      if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


    offsetParent = offsetParent;

    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
      offsetParent[heightProp];
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }

    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
      offsetParent[widthProp];
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  var commonStyles = Object.assign({
    position: position
  }, adaptive && unsetSides);

  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x: x,
    y: y
  }, getWindow(popper)) : {
    x: x,
    y: y
  };

  x = _ref4.x;
  y = _ref4.y;

  if (gpuAcceleration) {
    var _Object$assign;

    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }

  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
}

function computeStyles(_ref5) {
  var state = _ref5.state,
      options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration,
      gpuAcceleration = _options$gpuAccelerat === undefined ? true : _options$gpuAccelerat,
      _options$adaptive = options.adaptive,
      adaptive = _options$adaptive === undefined ? true : _options$adaptive,
      _options$roundOffsets = options.roundOffsets,
      roundOffsets = _options$roundOffsets === undefined ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration: gpuAcceleration,
    isFixed: state.options.strategy === 'fixed'
  };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive: adaptive,
      roundOffsets: roundOffsets
    })));
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: 'absolute',
      adaptive: false,
      roundOffsets: roundOffsets
    })));
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-placement': state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


const computeStyles$1 = {
  name: 'computeStyles',
  enabled: true,
  phase: 'beforeWrite',
  fn: computeStyles,
  data: {}
};

var passive = {
  passive: true
};

function effect(_ref) {
  var state = _ref.state,
      instance = _ref.instance,
      options = _ref.options;
  var _options$scroll = options.scroll,
      scroll = _options$scroll === undefined ? true : _options$scroll,
      _options$resize = options.resize,
      resize = _options$resize === undefined ? true : _options$resize;
  var window = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

  if (scroll) {
    scrollParents.forEach(function (scrollParent) {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }

  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return function () {
    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.removeEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.removeEventListener('resize', instance.update, passive);
    }
  };
} // eslint-disable-next-line import/no-unused-modules


const eventListeners = {
  name: 'eventListeners',
  enabled: true,
  phase: 'write',
  fn: function fn() {},
  effect: effect,
  data: {}
};

var hash$1 = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash$1[matched];
  });
}

var hash = {
  start: 'end',
  end: 'start'
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function (matched) {
    return hash[matched];
  });
}

function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft: scrollLeft,
    scrollTop: scrollTop
  };
}

function getWindowScrollBarX(element) {
  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  // Popper 1 is broken in this case and never had a bug report so let's assume
  // it's not an issue. I don't think anyone ever specifies width on <html>
  // anyway.
  // Browsers where the left scrollbar doesn't cause an issue report `0` for
  // this (e.g. Edge 2019, IE11, Safari)
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

function getViewportRect(element, strategy) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;

  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();

    if (layoutViewport || !layoutViewport && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }

  return {
    width: width,
    height: height,
    x: x + getWindowScrollBarX(element),
    y: y
  };
}

// of the `<html>` and `<body>` rect bounds if horizontally scrollable

function getDocumentRect(element) {
  var _element$ownerDocumen;

  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? undefined : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;

  if (getComputedStyle$1(body || html).direction === 'rtl') {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }

  return {
    width: width,
    height: height,
    x: x,
    y: y
  };
}

function isScrollParent(element) {
  // Firefox wants us to check `-x` and `-y` variations as well
  var _getComputedStyle = getComputedStyle$1(element),
      overflow = _getComputedStyle.overflow,
      overflowX = _getComputedStyle.overflowX,
      overflowY = _getComputedStyle.overflowY;

  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return node.ownerDocument.body;
  }

  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }

  return getScrollParent(getParentNode(node));
}

/*
given a DOM element, return the list of all scroll parents, up the list of ancesors
until we get to the top window object. This list is what we attach scroll listeners
to, because if any of these parent elements scroll, we'll need to re-calculate the
reference element's position.
*/

function listScrollParents(element, list) {
  var _element$ownerDocumen;

  if (list === undefined) {
    list = [];
  }

  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? undefined : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
  updatedList.concat(listScrollParents(getParentNode(target)));
}

function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === 'fixed');
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}

function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
} // A "clipping parent" is an overflowable container with the characteristic of
// clipping (or hiding) overflowing elements with a position different from
// `initial`


function getClippingParents(element) {
  var clippingParents = listScrollParents(getParentNode(element));
  var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

  if (!isElement(clipperElement)) {
    return [];
  } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


  return clippingParents.filter(function (clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
  });
} // Gets the maximum area that the element is visible in due to any number of
// clipping parents


function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents[0];
  var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

function computeOffsets(_ref) {
  var reference = _ref.reference,
      element = _ref.element,
      placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference.x + reference.width / 2 - element.width / 2;
  var commonY = reference.y + reference.height / 2 - element.height / 2;
  var offsets;

  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference.y - element.height
      };
      break;

    case bottom:
      offsets = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;

    case right:
      offsets = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;

    case left:
      offsets = {
        x: reference.x - element.width,
        y: commonY
      };
      break;

    default:
      offsets = {
        x: reference.x,
        y: reference.y
      };
  }

  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

  if (mainAxis != null) {
    var len = mainAxis === 'y' ? 'height' : 'width';

    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;

      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
        break;
    }
  }

  return offsets;
}

function detectOverflow(state, options) {
  if (options === undefined) {
    options = {};
  }

  var _options = options,
      _options$placement = _options.placement,
      placement = _options$placement === undefined ? state.placement : _options$placement,
      _options$strategy = _options.strategy,
      strategy = _options$strategy === undefined ? state.strategy : _options$strategy,
      _options$boundary = _options.boundary,
      boundary = _options$boundary === undefined ? clippingParents : _options$boundary,
      _options$rootBoundary = _options.rootBoundary,
      rootBoundary = _options$rootBoundary === undefined ? viewport : _options$rootBoundary,
      _options$elementConte = _options.elementContext,
      elementContext = _options$elementConte === undefined ? popper : _options$elementConte,
      _options$altBoundary = _options.altBoundary,
      altBoundary = _options$altBoundary === undefined ? false : _options$altBoundary,
      _options$padding = _options.padding,
      padding = _options$padding === undefined ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement: placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
  // 0 or negative = within the clipping rect

  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

  if (elementContext === popper && offsetData) {
    var offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function (key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }

  return overflowOffsets;
}

function computeAutoPlacement(state, options) {
  if (options === undefined) {
    options = {};
  }

  var _options = options,
      placement = _options.placement,
      boundary = _options.boundary,
      rootBoundary = _options.rootBoundary,
      padding = _options.padding,
      flipVariations = _options.flipVariations,
      _options$allowedAutoP = _options.allowedAutoPlacements,
      allowedAutoPlacements = _options$allowedAutoP === undefined ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
    return getVariation(placement) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function (placement) {
    return allowedAutoPlacements.indexOf(placement) >= 0;
  });

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
  } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


  var overflows = allowedPlacements.reduce(function (acc, placement) {
    acc[placement] = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding
    })[getBasePlacement(placement)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function (a, b) {
    return overflows[a] - overflows[b];
  });
}

function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }

  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}

function flip(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;

  if (state.modifiersData[name]._skip) {
    return;
  }

  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === undefined ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === undefined ? true : _options$altAxis,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      _options$flipVariatio = options.flipVariations,
      flipVariations = _options$flipVariatio === undefined ? true : _options$flipVariatio,
      allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
    return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      flipVariations: flipVariations,
      allowedAutoPlacements: allowedAutoPlacements
    }) : placement);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements[0];

  for (var i = 0; i < placements.length; i++) {
    var placement = placements[i];

    var _basePlacement = getBasePlacement(placement);

    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? 'width' : 'height';
    var overflow = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      altBoundary: altBoundary,
      padding: padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }

    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];

    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }

    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }

    if (checks.every(function (check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }

    checksMap.set(placement, checks);
  }

  if (makeFallbackChecks) {
    // `2` may be desired in some cases – research later
    var numberOfChecks = flipVariations ? 3 : 1;

    var _loop = function _loop(_i) {
      var fittingPlacement = placements.find(function (placement) {
        var checks = checksMap.get(placement);

        if (checks) {
          return checks.slice(0, _i).every(function (check) {
            return check;
          });
        }
      });

      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };

    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);

      if (_ret === "break") break;
    }
  }

  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
} // eslint-disable-next-line import/no-unused-modules


const flip$1 = {
  name: 'flip',
  enabled: true,
  phase: 'main',
  fn: flip,
  requiresIfExists: ['offset'],
  data: {
    _skip: false
  }
};

function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === undefined) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }

  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}

function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function (side) {
    return overflow[side] >= 0;
  });
}

function hide(_ref) {
  var state = _ref.state,
      name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: 'reference'
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets: referenceClippingOffsets,
    popperEscapeOffsets: popperEscapeOffsets,
    isReferenceHidden: isReferenceHidden,
    hasPopperEscaped: hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped
  });
} // eslint-disable-next-line import/no-unused-modules


const hide$1 = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide
};

function distanceAndSkiddingToXY(placement, rects, offset) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

  var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
    placement: placement
  })) : offset,
      skidding = _ref[0],
      distance = _ref[1];

  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}

function offset(_ref2) {
  var state = _ref2.state,
      options = _ref2.options,
      name = _ref2.name;
  var _options$offset = options.offset,
      offset = _options$offset === undefined ? [0, 0] : _options$offset;
  var data = placements.reduce(function (acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement],
      x = _data$state$placement.x,
      y = _data$state$placement.y;

  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


const offset$1 = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

function popperOffsets(_ref) {
  var state = _ref.state,
      name = _ref.name;
  // Offsets are the actual position the popper needs to have to be
  // properly positioned near its reference element
  // This is the most basic placement, and will be adjusted by
  // the modifiers in the next step
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: 'absolute',
    placement: state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


const popperOffsets$1 = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

function getAltAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

function preventOverflow(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === undefined ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === undefined ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === undefined ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === undefined ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary: boundary,
    rootBoundary: rootBoundary,
    padding: padding,
    altBoundary: altBoundary
  });
  var basePlacement = getBasePlacement(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };

  if (!popperOffsets) {
    return;
  }

  if (checkMainAxis) {
    var _offsetModifierState$;

    var mainSide = mainAxis === 'y' ? top : left;
    var altSide = mainAxis === 'y' ? bottom : right;
    var len = mainAxis === 'y' ? 'height' : 'width';
    var offset = popperOffsets[mainAxis];
    var min$1 = offset + overflow[mainSide];
    var max$1 = offset - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
    // outside the reference bounds

    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
    // to include its full size in the calculation. If the reference is small
    // and near the edge of a boundary, the popper can overflow even if the
    // reference is not overflowing as well (e.g. virtual elements with no
    // width or height)

    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? undefined : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (checkAltAxis) {
    var _offsetModifierState$2;

    var _mainSide = mainAxis === 'x' ? top : left;

    var _altSide = mainAxis === 'x' ? bottom : right;

    var _offset = popperOffsets[altAxis];

    var _len = altAxis === 'y' ? 'height' : 'width';

    var _min = _offset + overflow[_mainSide];

    var _max = _offset - overflow[_altSide];

    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? undefined : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

    popperOffsets[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


const preventOverflow$1 = {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};

function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
} // Returns the composite rect of an element relative to its offsetParent.
// Composite means it takes into account transforms as well as layout.


function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === undefined) {
    isFixed = false;
  }

  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };

  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

function order(modifiers) {
  var map = new Map();
  var visited = new Set();
  var result = [];
  modifiers.forEach(function (modifier) {
    map.set(modifier.name, modifier);
  }); // On visiting object, check for its dependencies and visit them recursively

  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function (dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);

        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }

  modifiers.forEach(function (modifier) {
    if (!visited.has(modifier.name)) {
      // check for visited object
      sort(modifier);
    }
  });
  return result;
}

function orderModifiers(modifiers) {
  // order based on dependencies
  var orderedModifiers = order(modifiers); // order based on phase

  return modifierPhases.reduce(function (acc, phase) {
    return acc.concat(orderedModifiers.filter(function (modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

function debounce(fn) {
  var pending;
  return function () {
    if (!pending) {
      pending = new Promise(function (resolve) {
        Promise.resolve().then(function () {
          pending = undefined;
          resolve(fn());
        });
      });
    }

    return pending;
  };
}

function mergeByName(modifiers) {
  var merged = modifiers.reduce(function (merged, current) {
    var existing = merged[current.name];
    merged[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged;
  }, {}); // IE11 does not support Object.values

  return Object.keys(merged).map(function (key) {
    return merged[key];
  });
}

var DEFAULT_OPTIONS = {
  placement: 'bottom',
  modifiers: [],
  strategy: 'absolute'
};

function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return !args.some(function (element) {
    return !(element && typeof element.getBoundingClientRect === 'function');
  });
}

function popperGenerator(generatorOptions) {
  if (generatorOptions === undefined) {
    generatorOptions = {};
  }

  var _generatorOptions = generatorOptions,
      _generatorOptions$def = _generatorOptions.defaultModifiers,
      defaultModifiers = _generatorOptions$def === undefined ? [] : _generatorOptions$def,
      _generatorOptions$def2 = _generatorOptions.defaultOptions,
      defaultOptions = _generatorOptions$def2 === undefined ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper(reference, popper, options) {
    if (options === undefined) {
      options = defaultOptions;
    }

    var state = {
      placement: 'bottom',
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference,
        popper: popper
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state: state,
      setOptions: function setOptions(setOptionsAction) {
        var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options);
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        }; // Orders the modifiers based on their dependencies and `phase`
        // properties

        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

        state.orderedModifiers = orderedModifiers.filter(function (m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }

        var _state$elements = state.elements,
            reference = _state$elements.reference,
            popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
        // anymore

        if (!areValidElements(reference, popper)) {
          return;
        } // Store the reference and popper rects to be read by modifiers


        state.rects = {
          reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(popper)
        }; // Modifiers have the ability to reset the current update cycle. The
        // most common use case for this is the `flip` modifier changing the
        // placement, which then needs to re-run all the modifiers, because the
        // logic was previously ran for the previous placement and is therefore
        // stale/incorrect

        state.reset = false;
        state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
        // is filled with the initial data specified by the modifier. This means
        // it doesn't persist and is fresh on each update.
        // To ensure persistent data, use `${name}#persistent`

        state.orderedModifiers.forEach(function (modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });

        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }

          var _state$orderedModifie = state.orderedModifiers[index],
              fn = _state$orderedModifie.fn,
              _state$orderedModifie2 = _state$orderedModifie.options,
              _options = _state$orderedModifie2 === undefined ? {} : _state$orderedModifie2,
              name = _state$orderedModifie.name;

          if (typeof fn === 'function') {
            state = fn({
              state: state,
              options: _options,
              name: name,
              instance: instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce(function () {
        return new Promise(function (resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
      return instance;
    }

    instance.setOptions(options).then(function (state) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    }); // Modifiers have the ability to execute arbitrary code before the first
    // update cycle runs. They will be executed in the same order as the update
    // cycle. This is useful when a modifier adds some persistent data that
    // other modifiers need to use, but the modifier is run after the dependent
    // one.

    function runModifierEffects() {
      state.orderedModifiers.forEach(function (_ref) {
        var name = _ref.name,
            _ref$options = _ref.options,
            options = _ref$options === undefined ? {} : _ref$options,
            effect = _ref.effect;

        if (typeof effect === 'function') {
          var cleanupFn = effect({
            state: state,
            name: name,
            instance: instance,
            options: options
          });

          var noopFn = function noopFn() {};

          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function (fn) {
        return fn();
      });
      effectCleanupFns = [];
    }

    return instance;
  };
}

var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
var createPopper = /*#__PURE__*/popperGenerator({
  defaultModifiers: defaultModifiers
}); // eslint-disable-next-line import/no-unused-modules

/*
 * HSDropdown
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSDropdown extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.toggle = this.el.querySelector(":scope > .hs-dropdown-toggle") || this.el.querySelector(
      ":scope > .hs-dropdown-toggle-wrapper > .hs-dropdown-toggle"
    ) || this.el.children[0];
    this.closers = Array.from(this.el.querySelectorAll(":scope .hs-dropdown-close")) || null;
    this.menu = this.el.querySelector(":scope > .hs-dropdown-menu");
    this.eventMode = getClassProperty(this.el, "--trigger", "click");
    this.closeMode = getClassProperty(this.el, "--auto-close", "true");
    this.hasAutofocus = stringToBoolean(
      getClassProperty(this.el, "--has-autofocus", "true") || "true"
    );
    this.animationInProcess = false;
    this.onCloserClickListener = [];
    if (this.toggle && this.menu) this.init();
  }
  elementMouseEnter() {
    this.onMouseEnterHandler();
  }
  elementMouseLeave() {
    this.onMouseLeaveHandler();
  }
  toggleClick(evt) {
    this.onClickHandler(evt);
  }
  toggleContextMenu(evt) {
    evt.preventDefault();
    this.onContextMenuHandler(evt);
  }
  closerClick() {
    this.close();
  }
  init() {
    this.createCollection(window.$hsDropdownCollection, this);
    if (this.toggle.disabled) return false;
    if (this.toggle) this.buildToggle();
    if (this.menu) this.buildMenu();
    if (this.closers) this.buildClosers();
    if (!isIOS() && !isIpadOS()) {
      this.onElementMouseEnterListener = () => this.elementMouseEnter();
      this.onElementMouseLeaveListener = () => this.elementMouseLeave();
      this.el.addEventListener("mouseenter", this.onElementMouseEnterListener);
      this.el.addEventListener("mouseleave", this.onElementMouseLeaveListener);
    }
  }
  resizeHandler() {
    this.eventMode = getClassProperty(this.el, "--trigger", "click");
    this.closeMode = getClassProperty(this.el, "--auto-close", "true");
  }
  buildToggle() {
    if (this?.toggle?.ariaExpanded) {
      if (this.el.classList.contains("open")) this.toggle.ariaExpanded = "true";
      else this.toggle.ariaExpanded = "false";
    }
    if (this.eventMode === "contextmenu") {
      this.onToggleContextMenuListener = (evt) => this.toggleContextMenu(evt);
      this.toggle.addEventListener(
        "contextmenu",
        this.onToggleContextMenuListener
      );
    } else {
      this.onToggleClickListener = (evt) => this.toggleClick(evt);
      this.toggle.addEventListener("click", this.onToggleClickListener);
    }
  }
  buildMenu() {
    this.menu.role = this.menu.getAttribute("role") || "menu";
    const checkboxes = this.menu.querySelectorAll('[role="menuitemcheckbox"]');
    const radiobuttons = this.menu.querySelectorAll('[role="menuitemradio"]');
    checkboxes.forEach((el) => el.addEventListener("click", () => this.selectCheckbox(el)));
    radiobuttons.forEach((el) => el.addEventListener("click", () => this.selectRadio(el)));
  }
  buildClosers() {
    this.closers.forEach((el) => {
      this.onCloserClickListener.push({
        el,
        fn: () => this.closerClick()
      });
      el.addEventListener(
        "click",
        this.onCloserClickListener.find((closer) => closer.el === el).fn
      );
    });
  }
  getScrollbarSize() {
    let div = document.createElement("div");
    div.style.overflow = "scroll";
    div.style.width = "100px";
    div.style.height = "100px";
    document.body.appendChild(div);
    let scrollbarSize = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return scrollbarSize;
  }
  onContextMenuHandler(evt) {
    const virtualElement = {
      getBoundingClientRect: () => new DOMRect()
    };
    virtualElement.getBoundingClientRect = () => new DOMRect(evt.clientX, evt.clientY, 0, 0);
    HSDropdown.closeCurrentlyOpened();
    if (this.el.classList.contains("open") && !this.menu.classList.contains("hidden")) {
      this.close();
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    } else {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${this.getScrollbarSize()}px`;
      this.open(virtualElement);
    }
  }
  onClickHandler(evt) {
    if (this.el.classList.contains("open") && !this.menu.classList.contains("hidden")) {
      this.close();
    } else {
      this.open();
    }
  }
  onMouseEnterHandler() {
    if (this.eventMode !== "hover") return false;
    if (this.el._popper) this.forceClearState();
    if (!this.el.classList.contains("open") && this.menu.classList.contains("hidden")) {
      this.open();
    }
  }
  onMouseLeaveHandler() {
    if (this.eventMode !== "hover") return false;
    if (this.el.classList.contains("open") && !this.menu.classList.contains("hidden")) {
      this.close();
    }
  }
  destroyPopper() {
    const scope = (window.getComputedStyle(this.el).getPropertyValue("--scope") || "").replace(" ", "");
    this.menu.classList.remove("block");
    this.menu.classList.add("hidden");
    this.menu.style.inset = null;
    this.menu.style.position = null;
    if (this.el && this.el._popper) this.el._popper.destroy();
    if (scope === "window") this.el.appendChild(this.menu);
    this.animationInProcess = false;
  }
  absoluteStrategyModifiers() {
    return [
      {
        name: "applyStyles",
        fn: (data) => {
          const strategy = (window.getComputedStyle(this.el).getPropertyValue("--strategy") || "absolute").replace(" ", "");
          const adaptive = (window.getComputedStyle(this.el).getPropertyValue("--adaptive") || "adaptive").replace(" ", "");
          data.state.elements.popper.style.position = strategy;
          data.state.elements.popper.style.transform = adaptive === "adaptive" ? data.state.styles.popper.transform : null;
          data.state.elements.popper.style.top = null;
          data.state.elements.popper.style.bottom = null;
          data.state.elements.popper.style.left = null;
          data.state.elements.popper.style.right = null;
          data.state.elements.popper.style.margin = 0;
        }
      }
    ];
  }
  focusElement() {
    const input = this.menu.querySelector("[autofocus]");
    if (!input) return false;
    else input.focus();
  }
  setupPopper(target) {
    const _target = target || this.el;
    const placement = (window.getComputedStyle(this.el).getPropertyValue("--placement") || "").replace(" ", "");
    const flip = (window.getComputedStyle(this.el).getPropertyValue("--flip") || "true").replace(" ", "");
    const strategy = (window.getComputedStyle(this.el).getPropertyValue("--strategy") || "fixed").replace(" ", "");
    const offset = parseInt(
      (window.getComputedStyle(this.el).getPropertyValue("--offset") || "10").replace(" ", "")
    );
    const gpuAcceleration = (window.getComputedStyle(this.el).getPropertyValue("--gpu-acceleration") || "true").replace(" ", "");
    const popperInstance = createPopper(_target, this.menu, {
      placement: POSITIONS[placement] || "bottom-start",
      strategy,
      modifiers: [
        ...strategy !== "fixed" ? this.absoluteStrategyModifiers() : [],
        {
          name: "flip",
          enabled: flip === "true"
        },
        {
          name: "offset",
          options: {
            offset: [0, offset]
          }
        },
        {
          name: "computeStyles",
          options: {
            adaptive: strategy !== "fixed" ? false : true,
            gpuAcceleration: gpuAcceleration === "true"
          }
        }
      ]
    });
    return popperInstance;
  }
  selectCheckbox(target) {
    target.ariaChecked = target.ariaChecked === "true" ? "false" : "true";
  }
  selectRadio(target) {
    if (target.ariaChecked === "true") return false;
    const group = target.closest(".group");
    const items = group.querySelectorAll('[role="menuitemradio"]');
    const otherItems = Array.from(items).filter((el) => el !== target);
    otherItems.forEach((el) => {
      el.ariaChecked = "false";
    });
    target.ariaChecked = "true";
  }
  // Public methods
  calculatePopperPosition(target) {
    const popperInstance = this.setupPopper(target);
    popperInstance.forceUpdate();
    const popperPosition = popperInstance.state.placement;
    popperInstance.destroy();
    return popperPosition;
  }
  open(target) {
    if (this.el.classList.contains("open") || this.animationInProcess) return false;
    const _target = target || this.el;
    this.animationInProcess = true;
    const scope = (window.getComputedStyle(this.el).getPropertyValue("--scope") || "").replace(" ", "");
    const placement = (window.getComputedStyle(this.el).getPropertyValue("--placement") || "").replace(" ", "");
    const flip = (window.getComputedStyle(this.el).getPropertyValue("--flip") || "true").replace(" ", "");
    const strategy = (window.getComputedStyle(this.el).getPropertyValue("--strategy") || "fixed").replace(" ", "");
    const offset = parseInt(
      (window.getComputedStyle(this.el).getPropertyValue("--offset") || "10").replace(" ", "")
    );
    const gpuAcceleration = (window.getComputedStyle(this.el).getPropertyValue("--gpu-acceleration") || "true").replace(" ", "");
    if (scope === "window") document.body.appendChild(this.menu);
    if (strategy !== "static") {
      this.el._popper = createPopper(_target, this.menu, {
        placement: POSITIONS[placement] || "bottom-start",
        strategy,
        modifiers: [
          ...strategy !== "fixed" ? this.absoluteStrategyModifiers() : [],
          {
            name: "flip",
            enabled: flip === "true"
          },
          {
            name: "offset",
            options: {
              offset: [0, offset]
            }
          },
          {
            name: "computeStyles",
            options: {
              adaptive: strategy !== "fixed" ? false : true,
              gpuAcceleration: gpuAcceleration === "true" ? true : false
            }
          }
        ]
      });
    }
    this.menu.style.margin = null;
    this.menu.classList.remove("hidden");
    this.menu.classList.add("block");
    setTimeout(() => {
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
      this.el.classList.add("open");
      if (scope === "window") this.menu.classList.add("open");
      this.animationInProcess = false;
      if (this.hasAutofocus) this.focusElement();
      this.fireEvent("open", this.el);
      dispatch("open.hs.dropdown", this.el, this.el);
    });
  }
  close(isAnimated = true) {
    if (this.animationInProcess || !this.el.classList.contains("open"))
      return false;
    const scope = (window.getComputedStyle(this.el).getPropertyValue("--scope") || "").replace(" ", "");
    const clearAfterClose = () => {
      this.menu.style.margin = null;
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
      this.el.classList.remove("open");
      this.fireEvent("close", this.el);
      dispatch("close.hs.dropdown", this.el, this.el);
    };
    this.animationInProcess = true;
    if (scope === "window") this.menu.classList.remove("open");
    if (isAnimated) {
      const el = this.el.querySelector("[data-hs-dropdown-transition]") || this.menu;
      afterTransition(el, () => this.destroyPopper());
    } else this.destroyPopper();
    clearAfterClose();
  }
  forceClearState() {
    this.destroyPopper();
    this.menu.style.margin = null;
    this.el.classList.remove("open");
  }
  destroy() {
    if (!isIOS() && !isIpadOS()) {
      this.el.removeEventListener(
        "mouseenter",
        this.onElementMouseEnterListener
      );
      this.el.removeEventListener(
        "mouseleave",
        () => this.onElementMouseLeaveListener
      );
      this.onElementMouseEnterListener = null;
      this.onElementMouseLeaveListener = null;
    }
    this.toggle.removeEventListener("click", this.onToggleClickListener);
    this.onToggleClickListener = null;
    if (this.closers.length) {
      this.closers.forEach((el) => {
        el.removeEventListener(
          "click",
          this.onCloserClickListener.find((closer) => closer.el === el).fn
        );
      });
      this.onCloserClickListener = null;
    }
    this.el.classList.remove("open");
    this.destroyPopper();
    window.$hsDropdownCollection = window.$hsDropdownCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static findInCollection(target) {
    return window.$hsDropdownCollection.find((el) => {
      if (target instanceof HSDropdown) return el.element.el === target.el;
      else if (typeof target === "string") return el.element.el === document.querySelector(target);
      else return el.element.el === target;
    }) || null;
  }
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsDropdownCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsDropdownCollection) {
      window.$hsDropdownCollection = [];
      document.addEventListener(
        "keydown",
        (evt) => HSDropdown.accessibility(evt)
      );
      window.addEventListener("click", (evt) => {
        const evtTarget = evt.target;
        HSDropdown.closeCurrentlyOpened(evtTarget);
      });
      let prevWidth = window.innerWidth;
      window.addEventListener("resize", () => {
        if (window.innerWidth !== prevWidth) {
          prevWidth = innerWidth;
          HSDropdown.closeCurrentlyOpened(null, false);
        }
      });
    }
    if (window.$hsDropdownCollection)
      window.$hsDropdownCollection = window.$hsDropdownCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(".hs-dropdown:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsDropdownCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSDropdown(el);
    });
  }
  static open(target) {
    const instance = HSDropdown.findInCollection(target);
    if (instance && instance.element.menu.classList.contains("hidden")) instance.element.open();
  }
  static close(target) {
    const instance = HSDropdown.findInCollection(target);
    if (instance && !instance.element.menu.classList.contains("hidden")) instance.element.close();
  }
  // Accessibility methods
  static accessibility(evt) {
    this.history = menuSearchHistory;
    const target = window.$hsDropdownCollection.find(
      (el) => el.element.el.classList.contains("open")
    );
    if (target && (DROPDOWN_ACCESSIBILITY_KEY_SET.includes(evt.code) || evt.code.length === 4 && evt.code[evt.code.length - 1].match(/^[A-Z]*$/)) && !evt.metaKey && !target.element.menu.querySelector("input:focus") && !target.element.menu.querySelector("textarea:focus")) {
      switch (evt.code) {
        case "Escape":
          if (!target.element.menu.querySelector(".hs-select.active")) {
            evt.preventDefault();
            this.onEscape(evt);
          }
          break;
        case "Enter":
          if (!target.element.menu.querySelector(".hs-select button:focus") && !target.element.menu.querySelector(".hs-collapse-toggle:focus")) {
            this.onEnter(evt);
          }
          break;
        case "ArrowUp":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onArrow();
          break;
        case "ArrowDown":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onArrow(false);
          break;
        case "ArrowRight":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onArrowX(evt, "right");
          break;
        case "ArrowLeft":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onArrowX(evt, "left");
          break;
        case "Home":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onStartEnd();
          break;
        case "End":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onStartEnd(false);
          break;
        default:
          evt.preventDefault();
          this.onFirstLetter(evt.key);
          break;
      }
    }
  }
  static onEscape(evt) {
    const dropdown = evt.target.closest(".hs-dropdown.open");
    if (window.$hsDropdownCollection.find((el) => el.element.el === dropdown)) {
      const target = window.$hsDropdownCollection.find(
        (el) => el.element.el === dropdown
      );
      if (target) {
        target.element.close();
        target.element.toggle.focus();
      }
    } else {
      this.closeCurrentlyOpened();
    }
  }
  static onEnter(evt) {
    const target = evt.target;
    const { element } = window.$hsDropdownCollection.find(
      (el) => el.element.el === target.closest(".hs-dropdown")
    ) ?? null;
    if (element && target.classList.contains("hs-dropdown-toggle")) {
      evt.preventDefault();
      element.open();
    } else if (element && target.getAttribute("role") === "menuitemcheckbox") {
      element.selectCheckbox(target);
      element.close();
    } else if (element && target.getAttribute("role") === "menuitemradio") {
      element.selectRadio(target);
      element.close();
    } else {
      return false;
    }
  }
  static onArrow(isArrowUp = true) {
    const target = window.$hsDropdownCollection.find(
      (el) => el.element.el.classList.contains("open")
    );
    if (target) {
      const menu = target.element.menu;
      if (!menu) return false;
      const preparedLinks = isArrowUp ? Array.from(
        menu.querySelectorAll(
          'a:not([hidden]), .hs-dropdown > button:not([hidden]), [role="button"]:not([hidden]), [role^="menuitem"]:not([hidden])'
        )
      ).reverse() : Array.from(
        menu.querySelectorAll(
          'a:not([hidden]), .hs-dropdown > button:not([hidden]), [role="button"]:not([hidden]), [role^="menuitem"]:not([hidden])'
        )
      );
      const visiblePreparedLinks = Array.from(preparedLinks).filter((item) => {
        const el = item;
        return el.closest("[hidden]") === null && el.offsetParent !== null;
      });
      const links = visiblePreparedLinks.filter(
        (el) => !el.classList.contains("disabled")
      );
      const current = menu.querySelector(
        'a:focus, button:focus, [role="button"]:focus, [role^="menuitem"]:focus'
      );
      let currentInd = links.findIndex((el) => el === current);
      if (currentInd + 1 < links.length) {
        currentInd++;
      }
      links[currentInd].focus();
    }
  }
  static onArrowX(evt, direction) {
    const toggle = evt.target;
    const closestDropdown = toggle.closest(".hs-dropdown.open");
    const isRootDropdown = !!closestDropdown && !closestDropdown?.parentElement.closest(".hs-dropdown");
    const menuToOpen = HSDropdown.getInstance(
      toggle.closest(".hs-dropdown"),
      true
    ) ?? null;
    const firstLink = menuToOpen.element.menu.querySelector(
      'a, button, [role="button"], [role^="menuitem"]'
    );
    if (isRootDropdown && !toggle.classList.contains("hs-dropdown-toggle"))
      return false;
    const menuToClose = HSDropdown.getInstance(
      toggle.closest(".hs-dropdown.open"),
      true
    ) ?? null;
    if (menuToOpen.element.el.classList.contains("open") && menuToOpen.element.el._popper.state.placement.includes(direction)) {
      firstLink.focus();
      return false;
    }
    console.log(menuToOpen);
    const futurePosition = menuToOpen.element.calculatePopperPosition();
    if (isRootDropdown && !futurePosition.includes(direction)) return false;
    if (futurePosition.includes(direction) && toggle.classList.contains("hs-dropdown-toggle")) {
      menuToOpen.element.open();
      firstLink.focus();
    } else {
      menuToClose.element.close(false);
      menuToClose.element.toggle.focus();
    }
  }
  static onStartEnd(isStart = true) {
    const target = window.$hsDropdownCollection.find(
      (el) => el.element.el.classList.contains("open")
    );
    if (target) {
      const menu = target.element.menu;
      if (!menu) return false;
      const preparedLinks = isStart ? Array.from(
        menu.querySelectorAll(
          'a, button, [role="button"], [role^="menuitem"]'
        )
      ) : Array.from(
        menu.querySelectorAll(
          'a, button, [role="button"], [role^="menuitem"]'
        )
      ).reverse();
      const links = preparedLinks.filter(
        (el) => !el.classList.contains("disabled")
      );
      if (links.length) {
        links[0].focus();
      }
    }
  }
  static onFirstLetter(code) {
    const target = window.$hsDropdownCollection.find(
      (el) => el.element.el.classList.contains("open")
    );
    if (target) {
      const menu = target.element.menu;
      if (!menu) return false;
      const links = Array.from(
        menu.querySelectorAll('a, [role="button"], [role^="menuitem"]')
      );
      const getCurrentInd = () => links.findIndex(
        (el, i) => el.innerText.toLowerCase().charAt(0) === code.toLowerCase() && this.history.existsInHistory(i)
      );
      let currentInd = getCurrentInd();
      if (currentInd === -1) {
        this.history.clearHistory();
        currentInd = getCurrentInd();
      }
      if (currentInd !== -1) {
        links[currentInd].focus();
        this.history.addHistory(currentInd);
      }
    }
  }
  static closeCurrentlyOpened(evtTarget = null, isAnimated = true) {
    const parent = evtTarget && evtTarget.closest(".hs-dropdown") && evtTarget.closest(".hs-dropdown").parentElement.closest(".hs-dropdown") ? evtTarget.closest(".hs-dropdown").parentElement.closest(".hs-dropdown") : null;
    let currentlyOpened = parent ? window.$hsDropdownCollection.filter(
      (el) => el.element.el.classList.contains("open") && el.element.menu.closest(".hs-dropdown").parentElement.closest(".hs-dropdown") === parent
    ) : window.$hsDropdownCollection.filter(
      (el) => el.element.el.classList.contains("open")
    );
    if (evtTarget && evtTarget.closest(".hs-dropdown") && getClassPropertyAlt(evtTarget.closest(".hs-dropdown"), "--auto-close") === "inside") {
      currentlyOpened = currentlyOpened.filter(
        (el) => el.element.el !== evtTarget.closest(".hs-dropdown")
      );
    }
    if (currentlyOpened) {
      currentlyOpened.forEach((el) => {
        if (el.element.closeMode === "false" || el.element.closeMode === "outside")
          return false;
        el.element.close(isAnimated);
      });
    }
    if (currentlyOpened) {
      currentlyOpened.forEach((el) => {
        if (getClassPropertyAlt(el.element.el, "--trigger") !== "contextmenu")
          return false;
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      });
    }
  }
  // Backward compatibility
  static on(evt, target, cb) {
    const instance = HSDropdown.findInCollection(target);
    if (instance) instance.element.events[evt] = cb;
  }
}
window.addEventListener("load", () => {
  HSDropdown.autoInit();
});
window.addEventListener("resize", () => {
  if (!window.$hsDropdownCollection) window.$hsDropdownCollection = [];
  window.$hsDropdownCollection.forEach((el) => el.element.resizeHandler());
});
if (typeof window !== "undefined") {
  window.HSDropdown = HSDropdown;
}

/*
 * HSInputNumber
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSInputNumber extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    this.input = this.el.querySelector("[data-hs-input-number-input]") || null;
    this.increment = this.el.querySelector("[data-hs-input-number-increment]") || null;
    this.decrement = this.el.querySelector("[data-hs-input-number-decrement]") || null;
    if (this.input) this.checkIsNumberAndConvert();
    const data = this.el.dataset.hsInputNumber;
    const dataOptions = data ? JSON.parse(data) : { step: 1 };
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.minInputValue = "min" in concatOptions ? concatOptions.min : 0;
    this.maxInputValue = "max" in concatOptions ? concatOptions.max : null;
    this.step = "step" in concatOptions && concatOptions.step > 0 ? concatOptions.step : 1;
    this.init();
  }
  inputInput() {
    this.changeValue();
  }
  incrementClick() {
    this.changeValue("increment");
  }
  decrementClick() {
    this.changeValue("decrement");
  }
  init() {
    this.createCollection(window.$hsInputNumberCollection, this);
    if (this.input && this.increment) this.build();
  }
  checkIsNumberAndConvert() {
    const value = this.input.value.trim();
    const cleanedValue = this.cleanAndExtractNumber(value);
    if (cleanedValue !== null) {
      this.inputValue = cleanedValue;
      this.input.value = cleanedValue.toString();
    } else {
      this.inputValue = 0;
      this.input.value = "0";
    }
  }
  cleanAndExtractNumber(value) {
    const cleanedArray = [];
    let decimalFound = false;
    value.split("").forEach((char) => {
      if (char >= "0" && char <= "9") cleanedArray.push(char);
      else if (char === "." && !decimalFound) {
        cleanedArray.push(char);
        decimalFound = true;
      }
    });
    const cleanedValue = cleanedArray.join("");
    const number = parseFloat(cleanedValue);
    return isNaN(number) ? null : number;
  }
  build() {
    if (this.input) this.buildInput();
    if (this.increment) this.buildIncrement();
    if (this.decrement) this.buildDecrement();
    if (this.inputValue <= this.minInputValue) {
      this.inputValue = this.minInputValue;
      this.input.value = `${this.minInputValue}`;
    }
    if (this.inputValue <= this.minInputValue) this.changeValue();
    if (this.input.hasAttribute("disabled")) this.disableButtons();
  }
  buildInput() {
    this.onInputInputListener = () => this.inputInput();
    this.input.addEventListener("input", this.onInputInputListener);
  }
  buildIncrement() {
    this.onIncrementClickListener = () => this.incrementClick();
    this.increment.addEventListener("click", this.onIncrementClickListener);
  }
  buildDecrement() {
    this.onDecrementClickListener = () => this.decrementClick();
    this.decrement.addEventListener("click", this.onDecrementClickListener);
  }
  changeValue(event = "none") {
    const payload = { inputValue: this.inputValue };
    const minInputValue = this.minInputValue ?? Number.MIN_SAFE_INTEGER;
    const maxInputValue = this.maxInputValue ?? Number.MAX_SAFE_INTEGER;
    this.inputValue = isNaN(this.inputValue) ? 0 : this.inputValue;
    switch (event) {
      case "increment":
        const incrementedResult = this.inputValue + this.step;
        this.inputValue = incrementedResult >= minInputValue && incrementedResult <= maxInputValue ? incrementedResult : maxInputValue;
        this.input.value = this.inputValue.toString();
        break;
      case "decrement":
        const decrementedResult = this.inputValue - this.step;
        this.inputValue = decrementedResult >= minInputValue && decrementedResult <= maxInputValue ? decrementedResult : minInputValue;
        this.input.value = this.inputValue.toString();
        break;
      default:
        const defaultResult = isNaN(parseInt(this.input.value)) ? 0 : parseInt(this.input.value);
        this.inputValue = defaultResult >= maxInputValue ? maxInputValue : defaultResult <= minInputValue ? minInputValue : defaultResult;
        if (this.inputValue <= minInputValue)
          this.input.value = this.inputValue.toString();
        break;
    }
    payload.inputValue = this.inputValue;
    if (this.inputValue === minInputValue) {
      this.el.classList.add("disabled");
      if (this.decrement) this.disableButtons("decrement");
    } else {
      this.el.classList.remove("disabled");
      if (this.decrement) this.enableButtons("decrement");
    }
    if (this.inputValue === maxInputValue) {
      this.el.classList.add("disabled");
      if (this.increment) this.disableButtons("increment");
    } else {
      this.el.classList.remove("disabled");
      if (this.increment) this.enableButtons("increment");
    }
    this.fireEvent("change", payload);
    dispatch("change.hs.inputNumber", this.el, payload);
  }
  disableButtons(mode = "all") {
    if (mode === "all") {
      if (this.increment.tagName === "BUTTON" || this.increment.tagName === "INPUT")
        this.increment.setAttribute("disabled", "disabled");
      if (this.decrement.tagName === "BUTTON" || this.decrement.tagName === "INPUT")
        this.decrement.setAttribute("disabled", "disabled");
    } else if (mode === "increment") {
      if (this.increment.tagName === "BUTTON" || this.increment.tagName === "INPUT")
        this.increment.setAttribute("disabled", "disabled");
    } else if (mode === "decrement") {
      if (this.decrement.tagName === "BUTTON" || this.decrement.tagName === "INPUT")
        this.decrement.setAttribute("disabled", "disabled");
    }
  }
  enableButtons(mode = "all") {
    if (mode === "all") {
      if (this.increment.tagName === "BUTTON" || this.increment.tagName === "INPUT")
        this.increment.removeAttribute("disabled");
      if (this.decrement.tagName === "BUTTON" || this.decrement.tagName === "INPUT")
        this.decrement.removeAttribute("disabled");
    } else if (mode === "increment") {
      if (this.increment.tagName === "BUTTON" || this.increment.tagName === "INPUT")
        this.increment.removeAttribute("disabled");
    } else if (mode === "decrement") {
      if (this.decrement.tagName === "BUTTON" || this.decrement.tagName === "INPUT")
        this.decrement.removeAttribute("disabled");
    }
  }
  // Public methods
  destroy() {
    this.el.classList.remove("disabled");
    this.increment.removeAttribute("disabled");
    this.decrement.removeAttribute("disabled");
    this.input.removeEventListener("input", this.onInputInputListener);
    this.increment.removeEventListener("click", this.onIncrementClickListener);
    this.decrement.removeEventListener("click", this.onDecrementClickListener);
    window.$hsInputNumberCollection = window.$hsInputNumberCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Global method
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsInputNumberCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsInputNumberCollection) window.$hsInputNumberCollection = [];
    if (window.$hsInputNumberCollection)
      window.$hsInputNumberCollection = window.$hsInputNumberCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-input-number]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsInputNumberCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSInputNumber(el);
    });
  }
}
window.addEventListener("load", () => {
  HSInputNumber.autoInit();
});
if (typeof window !== "undefined") {
  window.HSInputNumber = HSInputNumber;
}

/*
 * HSLayoutSplitter
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSLayoutSplitter extends HSBasePlugin {
  static {
    this.isListenersInitialized = false;
  }
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-layout-splitter");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.horizontalSplitterClasses = concatOptions?.horizontalSplitterClasses || null;
    this.horizontalSplitterTemplate = concatOptions?.horizontalSplitterTemplate || "<div></div>";
    this.verticalSplitterClasses = concatOptions?.verticalSplitterClasses || null;
    this.verticalSplitterTemplate = concatOptions?.verticalSplitterTemplate || "<div></div>";
    this.isSplittersAddedManually = concatOptions?.isSplittersAddedManually ?? false;
    this.horizontalSplitters = [];
    this.horizontalControls = [];
    this.verticalSplitters = [];
    this.verticalControls = [];
    this.isDragging = false;
    this.activeSplitter = null;
    this.onControlPointerDownListener = [];
    this.init();
  }
  controlPointerDown(item) {
    this.isDragging = true;
    this.activeSplitter = item;
    this.onPointerDownHandler(item);
  }
  controlPointerUp() {
    this.isDragging = false;
    this.activeSplitter = null;
    this.onPointerUpHandler();
  }
  static {
    this.onDocumentPointerMove = (evt) => {
      const draggingElement = document.querySelector(
        ".hs-layout-splitter-control.dragging"
      );
      if (!draggingElement) return;
      const draggingInstance = HSLayoutSplitter.getInstance(
        draggingElement.closest("[data-hs-layout-splitter]"),
        true
      );
      if (!draggingInstance || !draggingInstance.element.isDragging) return;
      const activeSplitter = draggingInstance.element.activeSplitter;
      if (!activeSplitter) return;
      if (activeSplitter.direction === "vertical")
        draggingInstance.element.onPointerMoveHandler(
          evt,
          activeSplitter,
          "vertical"
        );
      else
        draggingInstance.element.onPointerMoveHandler(
          evt,
          activeSplitter,
          "horizontal"
        );
    };
  }
  static {
    this.onDocumentPointerUp = () => {
      const draggingElement = document.querySelector(
        ".hs-layout-splitter-control.dragging"
      );
      if (!draggingElement) return;
      const draggingInstance = HSLayoutSplitter.getInstance(
        draggingElement.closest("[data-hs-layout-splitter]"),
        true
      );
      if (draggingInstance) draggingInstance.element.controlPointerUp();
    };
  }
  init() {
    this.createCollection(window.$hsLayoutSplitterCollection, this);
    this.buildSplitters();
    if (!HSLayoutSplitter.isListenersInitialized) {
      document.addEventListener(
        "pointermove",
        HSLayoutSplitter.onDocumentPointerMove
      );
      document.addEventListener(
        "pointerup",
        HSLayoutSplitter.onDocumentPointerUp
      );
      HSLayoutSplitter.isListenersInitialized = true;
    }
  }
  buildSplitters() {
    this.buildHorizontalSplitters();
    this.buildVerticalSplitters();
  }
  buildHorizontalSplitters() {
    const groups = this.el.querySelectorAll(
      "[data-hs-layout-splitter-horizontal-group]"
    );
    if (groups.length) {
      groups.forEach((el) => {
        this.horizontalSplitters.push({
          el,
          items: Array.from(
            el.querySelectorAll(":scope > [data-hs-layout-splitter-item]")
          )
        });
      });
      this.updateHorizontalSplitter();
    }
  }
  buildVerticalSplitters() {
    const groups = this.el.querySelectorAll(
      "[data-hs-layout-splitter-vertical-group]"
    );
    if (groups.length) {
      groups.forEach((el) => {
        this.verticalSplitters.push({
          el,
          items: Array.from(
            el.querySelectorAll(":scope > [data-hs-layout-splitter-item]")
          )
        });
      });
      this.updateVerticalSplitter();
    }
  }
  buildControl(prev, next, direction = "horizontal") {
    let el;
    if (this.isSplittersAddedManually) {
      el = next?.previousElementSibling;
      if (!el) return false;
      el.style.display = "";
    } else {
      el = htmlToElement(direction === "horizontal" ? this.horizontalSplitterTemplate : this.verticalSplitterTemplate);
      classToClassList(direction === "horizontal" ? this.horizontalSplitterClasses : this.verticalSplitterClasses, el);
      el.classList.add("hs-layout-splitter-control");
    }
    const item = { el, direction, prev, next };
    if (direction === "horizontal") this.horizontalControls.push(item);
    else this.verticalControls.push(item);
    this.bindListeners(item);
    if (next && !this.isSplittersAddedManually) prev.insertAdjacentElement("afterend", el);
  }
  getSplitterItemParsedParam(item) {
    const param = item.getAttribute("data-hs-layout-splitter-item");
    return isJson(param) ? JSON.parse(param) : param;
  }
  getContainerSize(container, isHorizontal) {
    return isHorizontal ? container.getBoundingClientRect().width : container.getBoundingClientRect().height;
  }
  getMaxFlexSize(element, param, totalWidth) {
    const paramValue = this.getSplitterItemSingleParam(element, param);
    return typeof paramValue === "number" ? paramValue / 100 * totalWidth : 0;
  }
  updateHorizontalSplitter() {
    this.horizontalSplitters.forEach(({ items }) => {
      items.forEach((el) => {
        this.updateSingleSplitter(el);
      });
      items.forEach((el, index) => {
        if (index >= items.length - 1) this.buildControl(el, null);
        else this.buildControl(el, items[index + 1]);
      });
    });
  }
  updateSingleSplitter(el) {
    const param = el.getAttribute("data-hs-layout-splitter-item");
    const parsedParam = isJson(param) ? JSON.parse(param) : param;
    const width = isJson(param) ? parsedParam.dynamicSize : param;
    el.style.flex = `${width} 1 0`;
  }
  updateVerticalSplitter() {
    this.verticalSplitters.forEach(({ items }) => {
      items.forEach((el) => {
        this.updateSingleSplitter(el);
      });
      items.forEach((el, index) => {
        if (index >= items.length - 1) this.buildControl(el, null, "vertical");
        else this.buildControl(el, items[index + 1], "vertical");
      });
    });
  }
  updateSplitterItemParam(item, newSize) {
    const param = this.getSplitterItemParsedParam(item);
    const newSizeFixed = newSize.toFixed(1);
    const newParam = typeof param === "object" ? JSON.stringify({
      ...param,
      dynamicSize: +newSizeFixed
    }) : newSizeFixed;
    item.setAttribute(
      "data-hs-layout-splitter-item",
      newParam
    );
  }
  onPointerDownHandler(item) {
    const { el, prev, next } = item;
    el.classList.add("dragging");
    prev.classList.add("dragging");
    next.classList.add("dragging");
    document.body.style.userSelect = "none";
  }
  onPointerUpHandler() {
    document.body.style.userSelect = "";
  }
  onPointerMoveHandler(evt, item, direction) {
    const { prev, next } = item;
    const container = item.el.closest(
      direction === "horizontal" ? "[data-hs-layout-splitter-horizontal-group]" : "[data-hs-layout-splitter-vertical-group]"
    );
    const isHorizontal = direction === "horizontal";
    const totalSize = this.getContainerSize(container, isHorizontal);
    const availableSize = this.calculateAvailableSize(container, prev, next, isHorizontal, totalSize);
    const sizes = this.calculateResizedSizes(evt, prev, availableSize, isHorizontal);
    const adjustedSizes = this.enforceLimits(sizes, prev, next, totalSize, availableSize);
    this.applySizes(prev, next, adjustedSizes, totalSize);
  }
  bindListeners(item) {
    const { el } = item;
    this.onControlPointerDownListener.push({
      el,
      fn: () => this.controlPointerDown(item)
    });
    el.addEventListener(
      "pointerdown",
      this.onControlPointerDownListener.find((control) => control.el === el).fn
    );
  }
  calculateAvailableSize(container, prev, next, isHorizontal, totalSize) {
    const items = container.querySelectorAll(":scope > [data-hs-layout-splitter-item]");
    const otherSize = Array.from(items).reduce((sum, item) => {
      if (item === prev || item === next) return sum;
      const rect = item.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(item);
      return sum + (computedStyle.position === "fixed" ? 0 : isHorizontal ? rect.width : rect.height);
    }, 0);
    return totalSize - otherSize;
  }
  calculateResizedSizes(evt, prev, availableSize, isHorizontal) {
    const prevStart = isHorizontal ? prev.getBoundingClientRect().left : prev.getBoundingClientRect().top;
    let previousSize = Math.max(0, Math.min((isHorizontal ? evt.clientX : evt.clientY) - prevStart, availableSize));
    let nextSize = availableSize - previousSize;
    return { previousSize, nextSize };
  }
  enforceLimits(sizes, prev, next, totalSize, availableSize) {
    const prevMinSize = this.getMaxFlexSize(prev, "minSize", totalSize);
    const nextMinSize = this.getMaxFlexSize(next, "minSize", totalSize);
    const prevPreLimitSize = this.getMaxFlexSize(prev, "preLimitSize", totalSize);
    const nextPreLimitSize = this.getMaxFlexSize(next, "preLimitSize", totalSize);
    let { previousSize, nextSize } = sizes;
    if (nextSize < nextMinSize) {
      nextSize = nextMinSize;
      previousSize = availableSize - nextSize;
    } else if (previousSize < prevMinSize) {
      previousSize = prevMinSize;
      nextSize = availableSize - previousSize;
    }
    const payload = {
      prev,
      next,
      previousSize: previousSize.toFixed(),
      previousFlexSize: previousSize / totalSize * 100,
      previousPreLimitSize: prevPreLimitSize,
      previousPreLimitFlexSize: prevPreLimitSize / totalSize * 100,
      previousMinSize: prevMinSize,
      previousMinFlexSize: prevMinSize / totalSize * 100,
      nextSize: nextSize.toFixed(),
      nextFlexSize: nextSize / totalSize * 100,
      nextPreLimitSize,
      nextPreLimitFlexSize: nextPreLimitSize / totalSize * 100,
      nextMinSize,
      nextMinFlexSize: nextMinSize / totalSize * 100,
      static: {
        prev: {
          minSize: this.getSplitterItemSingleParam(prev, "minSize"),
          preLimitSize: this.getSplitterItemSingleParam(prev, "preLimitSize")
        },
        next: {
          minSize: this.getSplitterItemSingleParam(next, "minSize"),
          preLimitSize: this.getSplitterItemSingleParam(next, "preLimitSize")
        }
      }
    };
    if (nextSize < nextMinSize) {
      this.fireEvent("onNextLimit", payload);
      dispatch("onNextLimit.hs.layoutSplitter", this.el, payload);
    } else if (previousSize < prevMinSize) {
      this.fireEvent("onPrevLimit", payload);
      dispatch("onPrevLimit.hs.layoutSplitter", this.el, payload);
    }
    if (previousSize <= prevPreLimitSize) {
      this.fireEvent("onPrevPreLimit", payload);
      dispatch("onPrevPreLimit.hs.layoutSplitter", this.el, payload);
    }
    if (nextSize <= nextPreLimitSize) {
      this.fireEvent("onNextPreLimit", payload);
      dispatch("onNextPreLimit.hs.layoutSplitter", this.el, payload);
    }
    this.fireEvent("drag", payload);
    dispatch("drag.hs.layoutSplitter", this.el, payload);
    return { previousSize, nextSize };
  }
  applySizes(prev, next, sizes, totalSize) {
    const { previousSize, nextSize } = sizes;
    const prevPercent = previousSize / totalSize * 100;
    this.updateSplitterItemParam(prev, prevPercent);
    prev.style.flex = `${prevPercent.toFixed(1)} 1 0`;
    const nextPercent = nextSize / totalSize * 100;
    this.updateSplitterItemParam(next, nextPercent);
    next.style.flex = `${nextPercent.toFixed(1)} 1 0`;
  }
  // Public methods
  getSplitterItemSingleParam(item, name) {
    try {
      const param = this.getSplitterItemParsedParam(item);
      return param[name];
    } catch {
      console.log("There is no parameter with this name in the object.");
      return false;
    }
  }
  getData(el) {
    const container = el.closest("[data-hs-layout-splitter-horizontal-group], [data-hs-layout-splitter-vertical-group]");
    if (!container) {
      throw new Error("Element is not inside a valid layout splitter container.");
    }
    const isHorizontal = container.matches("[data-hs-layout-splitter-horizontal-group]");
    const totalSize = this.getContainerSize(container, isHorizontal);
    const dynamicFlexSize = this.getSplitterItemSingleParam(el, "dynamicSize") || 0;
    const minSize = this.getMaxFlexSize(el, "minSize", totalSize);
    const preLimitSize = this.getMaxFlexSize(el, "preLimitSize", totalSize);
    const dynamicSize = dynamicFlexSize / 100 * totalSize;
    const minFlexSize = minSize / totalSize * 100;
    const preLimitFlexSize = preLimitSize / totalSize * 100;
    return {
      el,
      dynamicSize: +dynamicSize.toFixed(),
      dynamicFlexSize,
      minSize: +minSize.toFixed(),
      minFlexSize,
      preLimitSize: +preLimitSize.toFixed(),
      preLimitFlexSize,
      static: {
        minSize: this.getSplitterItemSingleParam(el, "minSize") ?? null,
        preLimitSize: this.getSplitterItemSingleParam(el, "preLimitSize") ?? null
      }
    };
  }
  setSplitterItemSize(el, size) {
    this.updateSplitterItemParam(el, size);
    el.style.flex = `${size.toFixed(1)} 1 0`;
  }
  updateFlexValues(data) {
    let totalFlex = 0;
    const currentWidth = window.innerWidth;
    const getBreakpointValue = (breakpoints) => {
      const sortedBreakpoints = Object.keys(breakpoints).map(Number).sort((a, b) => a - b);
      for (let i = sortedBreakpoints.length - 1; i >= 0; i--) {
        if (currentWidth >= sortedBreakpoints[i]) {
          return breakpoints[sortedBreakpoints[i]];
        }
      }
      return 0;
    };
    data.forEach(({ id, breakpoints }) => {
      const item = document.getElementById(id);
      if (item) {
        const flexValue = getBreakpointValue(breakpoints);
        this.updateSplitterItemParam(item, flexValue);
        item.style.flex = `${flexValue.toFixed(1)} 1 0`;
        totalFlex += flexValue;
      }
    });
    if (totalFlex !== 100) {
      const scaleFactor = 100 / totalFlex;
      data.forEach(({ id }) => {
        const item = document.getElementById(id);
        if (item) {
          const currentFlex = parseFloat(item.style.flex.split(" ")[0]);
          const adjustedFlex = currentFlex * scaleFactor;
          this.updateSplitterItemParam(item, adjustedFlex);
          item.style.flex = `${adjustedFlex.toFixed(1)} 1 0`;
        }
      });
    }
  }
  destroy() {
    if (this.onControlPointerDownListener) {
      this.onControlPointerDownListener.forEach(({ el, fn }) => {
        el.removeEventListener("pointerdown", fn);
      });
      this.onControlPointerDownListener = null;
    }
    this.horizontalSplitters.forEach(({ items }) => {
      items.forEach((el) => {
        el.style.flex = "";
      });
    });
    this.verticalSplitters.forEach(({ items }) => {
      items.forEach((el) => {
        el.style.flex = "";
      });
    });
    this.horizontalControls.forEach(({ el }) => {
      if (this.isSplittersAddedManually) el.style.display = "none";
      else el.remove();
    });
    this.verticalControls.forEach(({ el }) => {
      if (this.isSplittersAddedManually) el.style.display = "none";
      else el.remove();
    });
    this.horizontalControls = [];
    this.verticalControls = [];
    window.$hsLayoutSplitterCollection = window.$hsLayoutSplitterCollection.filter(
      ({ element }) => element.el !== this.el
    );
    if (window.$hsLayoutSplitterCollection.length === 0 && HSLayoutSplitter.isListenersInitialized) {
      document.removeEventListener(
        "pointermove",
        HSLayoutSplitter.onDocumentPointerMove
      );
      document.removeEventListener(
        "pointerup",
        HSLayoutSplitter.onDocumentPointerUp
      );
      HSLayoutSplitter.isListenersInitialized = false;
    }
  }
  // Static method
  static findInCollection(target) {
    return window.$hsLayoutSplitterCollection.find((el) => {
      if (target instanceof HSLayoutSplitter) return el.element.el === target.el;
      else if (typeof target === "string") return el.element.el === document.querySelector(target);
      else return el.element.el === target;
    }) || null;
  }
  static autoInit() {
    if (!window.$hsLayoutSplitterCollection) {
      window.$hsLayoutSplitterCollection = [];
      window.addEventListener("pointerup", () => {
        if (!window.$hsLayoutSplitterCollection) return false;
        const draggingElement = document.querySelector(
          ".hs-layout-splitter-control.dragging"
        );
        const draggingSections = document.querySelectorAll(
          "[data-hs-layout-splitter-item].dragging"
        );
        if (!draggingElement) return false;
        const draggingInstance = HSLayoutSplitter.getInstance(
          draggingElement.closest("[data-hs-layout-splitter]"),
          true
        );
        draggingElement.classList.remove("dragging");
        draggingSections.forEach((el) => el.classList.remove("dragging"));
        draggingInstance.element.isDragging = false;
      });
    }
    if (window.$hsLayoutSplitterCollection)
      window.$hsLayoutSplitterCollection = window.$hsLayoutSplitterCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(
      "[data-hs-layout-splitter]:not(.--prevent-on-load-init)"
    ).forEach((el) => {
      if (!window.$hsLayoutSplitterCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSLayoutSplitter(el);
    });
  }
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsLayoutSplitterCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static on(evt, target, cb) {
    const instance = HSLayoutSplitter.findInCollection(target);
    if (instance) instance.element.events[evt] = cb;
  }
}
window.addEventListener("load", () => {
  HSLayoutSplitter.autoInit();
});
if (typeof window !== "undefined") {
  window.HSLayoutSplitter = HSLayoutSplitter;
}

/*
 * HSOverlay
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSOverlay extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.toggleButtons = Array.from(document.querySelectorAll(`[data-hs-overlay="#${this.el.id}"]`));
    const toggleDataOptions = this.collectToggleParameters(this.toggleButtons);
    const data = el.getAttribute("data-hs-overlay-options");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...toggleDataOptions,
      ...options
    };
    this.hiddenClass = concatOptions?.hiddenClass || "hidden";
    this.emulateScrollbarSpace = concatOptions?.emulateScrollbarSpace || false;
    this.isClosePrev = concatOptions?.isClosePrev ?? true;
    this.backdropClasses = concatOptions?.backdropClasses ?? "hs-overlay-backdrop transition duration fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-opacity-80 dark:bg-neutral-900";
    this.backdropParent = typeof concatOptions.backdropParent === "string" ? document.querySelector(concatOptions.backdropParent) : document.body;
    this.backdropExtraClasses = concatOptions?.backdropExtraClasses ?? "";
    this.moveOverlayToBody = concatOptions?.moveOverlayToBody || null;
    this.openNextOverlay = false;
    this.autoHide = null;
    this.initContainer = this.el?.parentElement || null;
    this.isCloseWhenClickInside = stringToBoolean(getClassProperty(this.el, "--close-when-click-inside", "false") || "false");
    this.isTabAccessibilityLimited = stringToBoolean(getClassProperty(this.el, "--tab-accessibility-limited", "true") || "true");
    this.isLayoutAffect = stringToBoolean(getClassProperty(this.el, "--is-layout-affect", "false") || "false");
    this.hasAutofocus = stringToBoolean(getClassProperty(this.el, "--has-autofocus", "true") || "true");
    this.hasAbilityToCloseOnBackdropClick = stringToBoolean(this.el.getAttribute("data-hs-overlay-keyboard") || "true");
    const autoCloseBreakpoint = getClassProperty(this.el, "--auto-close");
    const autoCloseEqualityType = getClassProperty(this.el, "--auto-close-equality-type");
    const openedBreakpoint = getClassProperty(this.el, "--opened");
    this.autoClose = !isNaN(+autoCloseBreakpoint) && isFinite(+autoCloseBreakpoint) ? +autoCloseBreakpoint : BREAKPOINTS[autoCloseBreakpoint] || null;
    this.autoCloseEqualityType = autoCloseEqualityType ?? null;
    this.openedBreakpoint = (!isNaN(+openedBreakpoint) && isFinite(+openedBreakpoint) ? +openedBreakpoint : BREAKPOINTS[openedBreakpoint]) || null;
    this.animationTarget = this?.el?.querySelector(".hs-overlay-animation-target") || this.el;
    this.onElementClickListener = [];
    this.init();
  }
  elementClick() {
    if (this.el.classList.contains("opened")) this.close();
    else this.open();
  }
  overlayClick(evt) {
    if (evt.target.id && `#${evt.target.id}` === this.el.id && this.isCloseWhenClickInside && this.hasAbilityToCloseOnBackdropClick) {
      this.close();
    }
  }
  backdropClick() {
    this.close();
  }
  init() {
    this.createCollection(window.$hsOverlayCollection, this);
    if (this.isLayoutAffect && this.openedBreakpoint) {
      const instance = HSOverlay.getInstance(this.el, true);
      HSOverlay.setOpened(
        this.openedBreakpoint,
        instance
      );
    }
    this.onOverlayClickListener = (evt) => this.overlayClick(evt);
    this.el.addEventListener("click", this.onOverlayClickListener);
    if (this.toggleButtons.length) this.buildToggleButtons();
  }
  buildToggleButtons() {
    this.toggleButtons.forEach((el) => {
      if (this.el.classList.contains("opened")) el.ariaExpanded = "true";
      else el.ariaExpanded = "false";
      this.onElementClickListener.push({
        el,
        fn: () => this.elementClick()
      });
      el.addEventListener("click", this.onElementClickListener.find((toggleButton) => toggleButton.el === el).fn);
    });
  }
  hideAuto() {
    const time = parseInt(getClassProperty(this.el, "--auto-hide", "0"));
    if (time) {
      this.autoHide = setTimeout(() => {
        this.close();
      }, time);
    }
  }
  checkTimer() {
    if (this.autoHide) {
      clearTimeout(this.autoHide);
      this.autoHide = null;
    }
  }
  buildBackdrop() {
    const overlayClasses = this.el.classList.value.split(" ");
    const overlayZIndex = parseInt(
      window.getComputedStyle(this.el).getPropertyValue("z-index")
    );
    const backdropId = this.el.getAttribute("data-hs-overlay-backdrop-container") || false;
    this.backdrop = document.createElement("div");
    let backdropClasses = `${this.backdropClasses} ${this.backdropExtraClasses}`;
    const closeOnBackdrop = getClassProperty(this.el, "--overlay-backdrop", "true") !== "static";
    const disableBackdrop = getClassProperty(this.el, "--overlay-backdrop", "true") === "false";
    this.backdrop.id = `${this.el.id}-backdrop`;
    if ("style" in this.backdrop)
      this.backdrop.style.zIndex = `${overlayZIndex - 1}`;
    for (const value of overlayClasses) {
      if (value.startsWith("hs-overlay-backdrop-open:") || value.includes(":hs-overlay-backdrop-open:")) {
        backdropClasses += ` ${value}`;
      }
    }
    if (disableBackdrop) return;
    if (backdropId) {
      this.backdrop = document.querySelector(backdropId).cloneNode(true);
      this.backdrop.classList.remove("hidden");
      backdropClasses = `${this.backdrop.classList.toString()}`;
      this.backdrop.classList.value = "";
    }
    if (closeOnBackdrop) {
      this.onBackdropClickListener = () => this.backdropClick();
      this.backdrop.addEventListener(
        "click",
        this.onBackdropClickListener,
        true
      );
    }
    this.backdrop.setAttribute("data-hs-overlay-backdrop-template", "");
    this.backdropParent.appendChild(this.backdrop);
    setTimeout(() => {
      this.backdrop.classList.value = backdropClasses;
    });
  }
  destroyBackdrop() {
    const backdrop = document.querySelector(
      `#${this.el.id}-backdrop`
    );
    if (!backdrop) return;
    if (this.openNextOverlay) {
      backdrop.style.transitionDuration = `${parseFloat(
        window.getComputedStyle(backdrop).transitionDuration.replace(/[^\d.-]/g, "")
      ) * 1.8}s`;
    }
    backdrop.classList.add("opacity-0");
    afterTransition(backdrop, () => {
      backdrop.remove();
    });
  }
  focusElement() {
    const input = this.el.querySelector("[autofocus]");
    if (!input) return false;
    else input.focus();
  }
  getScrollbarSize() {
    let div = document.createElement("div");
    div.style.overflow = "scroll";
    div.style.width = "100px";
    div.style.height = "100px";
    document.body.appendChild(div);
    let scrollbarSize = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return scrollbarSize;
  }
  collectToggleParameters(buttons) {
    let toggleData = {};
    buttons.forEach((el) => {
      const data = el.getAttribute("data-hs-overlay-options");
      const dataOptions = data ? JSON.parse(data) : {};
      toggleData = {
        ...toggleData,
        ...dataOptions
      };
    });
    return toggleData;
  }
  // Public methods
  open() {
    const openedOverlays = document.querySelectorAll(".hs-overlay.open");
    const currentlyOpened = window.$hsOverlayCollection.find(
      (el) => Array.from(openedOverlays).includes(el.element.el) && !el.element.isLayoutAffect
    );
    const toggles = document.querySelectorAll(
      `[data-hs-overlay="#${this.el.id}"]`
    );
    const disabledScroll = getClassProperty(this.el, "--body-scroll", "false") !== "true";
    if (this.isClosePrev && currentlyOpened) {
      this.openNextOverlay = true;
      return currentlyOpened.element.close().then(() => {
        this.open();
        this.openNextOverlay = false;
      });
    }
    if (disabledScroll) {
      document.body.style.overflow = "hidden";
      if (this.emulateScrollbarSpace)
        document.body.style.paddingRight = `${this.getScrollbarSize()}px`;
    }
    this.buildBackdrop();
    this.checkTimer();
    this.hideAuto();
    toggles.forEach((toggle) => {
      if (toggle.ariaExpanded) toggle.ariaExpanded = "true";
    });
    this.el.classList.remove(this.hiddenClass);
    this.el.setAttribute("aria-overlay", "true");
    this.el.setAttribute("tabindex", "-1");
    setTimeout(() => {
      if (this.el.classList.contains("opened")) return false;
      this.el.classList.add("open", "opened");
      if (this.isLayoutAffect) document.body.classList.add("hs-overlay-body-open");
      this.fireEvent("open", this.el);
      dispatch("open.hs.overlay", this.el, this.el);
      if (this.hasAutofocus) this.focusElement();
    }, 50);
  }
  close(forceClose = false) {
    if (this.isLayoutAffect)
      document.body.classList.remove("hs-overlay-body-open");
    const closeFn = (cb) => {
      if (this.el.classList.contains("open")) return false;
      const toggles = document.querySelectorAll(
        `[data-hs-overlay="#${this.el.id}"]`
      );
      toggles.forEach((toggle) => {
        if (toggle.ariaExpanded) toggle.ariaExpanded = "false";
      });
      this.el.classList.add(this.hiddenClass);
      this.destroyBackdrop();
      this.fireEvent("close", this.el);
      dispatch("close.hs.overlay", this.el, this.el);
      if (!document.querySelector(".hs-overlay.opened")) {
        document.body.style.overflow = "";
        if (this.emulateScrollbarSpace) document.body.style.paddingRight = "";
      }
      cb(this.el);
    };
    return new Promise((resolve) => {
      this.el.classList.remove("open", "opened");
      this.el.removeAttribute("aria-overlay");
      this.el.removeAttribute("tabindex");
      if (forceClose) closeFn(resolve);
      else afterTransition(this.animationTarget, () => closeFn(resolve));
    });
  }
  destroy() {
    this.el.classList.remove("open", "opened", this.hiddenClass);
    if (this.isLayoutAffect)
      document.body.classList.remove("hs-overlay-body-open");
    this.el.removeEventListener("click", this.onOverlayClickListener);
    if (this.onElementClickListener.length) {
      this.onElementClickListener.forEach(({ el, fn }) => {
        el.removeEventListener("click", fn);
      });
      this.onElementClickListener = null;
    }
    if (this.backdrop)
      this.backdrop.removeEventListener("click", this.onBackdropClickListener);
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    window.$hsOverlayCollection = window.$hsOverlayCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static findInCollection(target) {
    return window.$hsOverlayCollection.find((el) => {
      if (target instanceof HSOverlay) return el.element.el === target.el;
      else if (typeof target === "string") return el.element.el === document.querySelector(target);
      else return el.element.el === target;
    }) || null;
  }
  static getInstance(target, isInstance) {
    const _temp = typeof target === "string" ? document.querySelector(target) : target;
    const _target = _temp?.getAttribute("data-hs-overlay") ? _temp.getAttribute("data-hs-overlay") : target;
    const elInCollection = window.$hsOverlayCollection.find(
      (el) => el.element.el === (typeof _target === "string" ? document.querySelector(_target) : _target) || el.element.el === (typeof _target === "string" ? document.querySelector(_target) : _target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsOverlayCollection) {
      window.$hsOverlayCollection = [];
      document.addEventListener(
        "keydown",
        (evt) => HSOverlay.accessibility(evt)
      );
    }
    if (window.$hsOverlayCollection)
      window.$hsOverlayCollection = window.$hsOverlayCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(".hs-overlay:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsOverlayCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSOverlay(el);
    });
  }
  static open(target) {
    const instance = HSOverlay.findInCollection(target);
    if (instance && instance.element.el.classList.contains(instance.element.hiddenClass)) instance.element.open();
  }
  static close(target) {
    const instance = HSOverlay.findInCollection(target);
    if (instance && !instance.element.el.classList.contains(instance.element.hiddenClass)) instance.element.close();
  }
  static setOpened(breakpoint, el) {
    if (document.body.clientWidth >= breakpoint) {
      document.body.classList.add("hs-overlay-body-open");
      el.element.open();
    } else el.element.close(true);
  }
  // Accessibility methods
  static accessibility(evt) {
    const targets = window.$hsOverlayCollection.filter(
      (el) => el.element.el.classList.contains("open")
    );
    const target = targets[targets.length - 1];
    const focusableElements = target?.element?.el?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const notHiddenFocusableElements = [];
    if (focusableElements?.length)
      focusableElements.forEach((el) => {
        if (!isParentOrElementHidden(el)) notHiddenFocusableElements.push(el);
      });
    const basicCheck = target && !evt.metaKey;
    if (basicCheck && !target.element.isTabAccessibilityLimited && evt.code === "Tab")
      return false;
    if (basicCheck && notHiddenFocusableElements.length && evt.code === "Tab") {
      evt.preventDefault();
      this.onTab(target);
    }
    if (basicCheck && evt.code === "Escape") {
      evt.preventDefault();
      this.onEscape(target);
    }
  }
  static onEscape(target) {
    if (target && target.element.hasAbilityToCloseOnBackdropClick)
      target.element.close();
  }
  static onTab(target) {
    const overlayElement = target.element.el;
    const focusableElements = Array.from(
      overlayElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusableElements.length === 0) return false;
    const focusedElement = overlayElement.querySelector(":focus");
    if (focusedElement) {
      let foundCurrent = false;
      for (const element of focusableElements) {
        if (foundCurrent) {
          element.focus();
          return;
        }
        if (element === focusedElement) {
          foundCurrent = true;
        }
      }
      focusableElements[0].focus();
    } else {
      focusableElements[0].focus();
    }
  }
  // Backward compatibility
  static on(evt, target, cb) {
    const instance = HSOverlay.findInCollection(target);
    if (instance) instance.element.events[evt] = cb;
  }
}
const autoCloseResizeFn = () => {
  if (!window.$hsOverlayCollection.length || !window.$hsOverlayCollection.find((el) => el.element.autoClose))
    return false;
  const overlays = window.$hsOverlayCollection.filter(
    (el) => el.element.autoClose
  );
  overlays.forEach((overlay) => {
    const { autoCloseEqualityType, autoClose } = overlay.element;
    const condition = autoCloseEqualityType === "less-than" ? document.body.clientWidth <= autoClose : document.body.clientWidth >= autoClose;
    if (condition) {
      overlay.element.close(true);
    }
  });
};
const moveOverlayToBodyResizeFn = () => {
  if (!window.$hsOverlayCollection.length || !window.$hsOverlayCollection.find((el) => el.element.moveOverlayToBody))
    return false;
  const overlays = window.$hsOverlayCollection.filter(
    (el) => el.element.moveOverlayToBody
  );
  overlays.forEach((overlay) => {
    const resolution = overlay.element.moveOverlayToBody;
    const initPlace = overlay.element.initContainer;
    const newPlace = document.querySelector("body");
    const target = overlay.element.el;
    if (!initPlace && target) return false;
    if (document.body.clientWidth <= resolution && !isDirectChild(newPlace, target))
      newPlace.appendChild(target);
    else if (document.body.clientWidth > resolution && !initPlace.contains(target))
      initPlace.appendChild(target);
  });
};
const setOpenedResizeFn = () => {
  if (!window.$hsOverlayCollection.length || !window.$hsOverlayCollection.find((el) => el.element.autoClose))
    return false;
  const overlays = window.$hsOverlayCollection.filter(
    (el) => el.element.autoClose
  );
  overlays.forEach((overlay) => {
    const { autoCloseEqualityType, autoClose } = overlay.element;
    const condition = autoCloseEqualityType === "less-than" ? document.body.clientWidth <= autoClose : document.body.clientWidth >= autoClose;
    if (condition) {
      overlay.element.close(true);
    }
  });
};
const setBackdropZIndexResizeFn = () => {
  if (!window.$hsOverlayCollection.length || !window.$hsOverlayCollection.find((el) => el.element.el.classList.contains("opened")))
    return false;
  const overlays = window.$hsOverlayCollection.filter((el) => el.element.el.classList.contains("opened"));
  overlays.forEach((overlay) => {
    const overlayZIndex = parseInt(window.getComputedStyle(overlay.element.el).getPropertyValue("z-index"));
    const backdrop = document.querySelector(`#${overlay.element.el.id}-backdrop`);
    if (!backdrop) return false;
    const backdropZIndex = parseInt(window.getComputedStyle(backdrop).getPropertyValue("z-index"));
    if (overlayZIndex === backdropZIndex + 1) return false;
    if ("style" in backdrop) backdrop.style.zIndex = `${overlayZIndex - 1}`;
    document.body.classList.add("hs-overlay-body-open");
  });
};
window.addEventListener("load", () => {
  HSOverlay.autoInit();
  moveOverlayToBodyResizeFn();
});
window.addEventListener("resize", () => {
  autoCloseResizeFn();
  moveOverlayToBodyResizeFn();
  setOpenedResizeFn();
  setBackdropZIndexResizeFn();
});
if (typeof window !== "undefined") {
  window.HSOverlay = HSOverlay;
}

/*
 * HSPinInput
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSPinInput extends HSBasePlugin {
  elementInput(evt, index) {
    this.onInput(evt, index);
  }
  elementPaste(evt) {
    this.onPaste(evt);
  }
  elementKeydown(evt, index) {
    this.onKeydown(evt, index);
  }
  elementFocusin(index) {
    this.onFocusIn(index);
  }
  elementFocusout(index) {
    this.onFocusOut(index);
  }
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-pin-input");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.items = this.el.querySelectorAll("[data-hs-pin-input-item]");
    this.currentItem = null;
    this.currentValue = new Array(this.items.length).fill("");
    this.placeholders = [];
    this.availableCharsRE = new RegExp(
      concatOptions?.availableCharsRE || "^[a-zA-Z0-9]+$"
    );
    this.onElementInputListener = [];
    this.onElementPasteListener = [];
    this.onElementKeydownListener = [];
    this.onElementFocusinListener = [];
    this.onElementFocusoutListener = [];
    this.init();
  }
  init() {
    this.createCollection(window.$hsPinInputCollection, this);
    if (this.items.length) this.build();
  }
  build() {
    this.buildInputItems();
  }
  buildInputItems() {
    this.items.forEach((el, index) => {
      this.placeholders.push(el.getAttribute("placeholder") || "");
      if (el.hasAttribute("autofocus")) this.onFocusIn(index);
      this.onElementInputListener.push({
        el,
        fn: (evt) => this.elementInput(evt, index)
      });
      this.onElementPasteListener.push({
        el,
        fn: (evt) => this.elementPaste(evt)
      });
      this.onElementKeydownListener.push({
        el,
        fn: (evt) => this.elementKeydown(evt, index)
      });
      this.onElementFocusinListener.push({
        el,
        fn: () => this.elementFocusin(index)
      });
      this.onElementFocusoutListener.push({
        el,
        fn: () => this.elementFocusout(index)
      });
      el.addEventListener(
        "input",
        this.onElementInputListener.find((elI) => elI.el === el).fn
      );
      el.addEventListener(
        "paste",
        this.onElementPasteListener.find((elI) => elI.el === el).fn
      );
      el.addEventListener(
        "keydown",
        this.onElementKeydownListener.find((elI) => elI.el === el).fn
      );
      el.addEventListener(
        "focusin",
        this.onElementFocusinListener.find((elI) => elI.el === el).fn
      );
      el.addEventListener(
        "focusout",
        this.onElementFocusoutListener.find((elI) => elI.el === el).fn
      );
    });
  }
  checkIfNumber(value) {
    return value.match(this.availableCharsRE);
  }
  autoFillAll(text) {
    Array.from(text).forEach((n, i) => {
      if (!this?.items[i]) return false;
      this.items[i].value = n;
      this.items[i].dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  setCurrentValue() {
    this.currentValue = Array.from(this.items).map(
      (el) => el.value
    );
  }
  toggleCompleted() {
    if (!this.currentValue.includes("")) this.el.classList.add("active");
    else this.el.classList.remove("active");
  }
  onInput(evt, index) {
    const originalValue = evt.target.value;
    this.currentItem = evt.target;
    this.currentItem.value = "";
    this.currentItem.value = originalValue[originalValue.length - 1];
    if (!this.checkIfNumber(this.currentItem.value)) {
      this.currentItem.value = this.currentValue[index] || "";
      return false;
    }
    this.setCurrentValue();
    if (this.currentItem.value) {
      if (index < this.items.length - 1) this.items[index + 1].focus();
      if (!this.currentValue.includes("")) {
        const payload = { currentValue: this.currentValue };
        this.fireEvent("completed", payload);
        dispatch("completed.hs.pinInput", this.el, payload);
      }
      this.toggleCompleted();
    } else {
      if (index > 0) this.items[index - 1].focus();
    }
  }
  onKeydown(evt, index) {
    if (evt.key === "Backspace" && index > 0) {
      if (this.items[index].value === "") {
        this.items[index - 1].value = "";
        this.items[index - 1].focus();
      } else {
        this.items[index].value = "";
      }
    }
    this.setCurrentValue();
    this.toggleCompleted();
  }
  onFocusIn(index) {
    this.items[index].setAttribute("placeholder", "");
  }
  onFocusOut(index) {
    this.items[index].setAttribute("placeholder", this.placeholders[index]);
  }
  onPaste(evt) {
    evt.preventDefault();
    this.items.forEach((el) => {
      if (document.activeElement === el)
        this.autoFillAll(evt.clipboardData.getData("text"));
    });
  }
  // Public methods
  destroy() {
    this.el.classList.remove("active");
    if (this.items.length)
      this.items.forEach((el) => {
        el.removeEventListener(
          "input",
          this.onElementInputListener.find((elI) => elI.el === el).fn
        );
        el.removeEventListener(
          "paste",
          this.onElementPasteListener.find((elI) => elI.el === el).fn
        );
        el.removeEventListener(
          "keydown",
          this.onElementKeydownListener.find((elI) => elI.el === el).fn
        );
        el.removeEventListener(
          "focusin",
          this.onElementFocusinListener.find((elI) => elI.el === el).fn
        );
        el.removeEventListener(
          "focusout",
          this.onElementFocusoutListener.find((elI) => elI.el === el).fn
        );
      });
    this.items = null;
    this.currentItem = null;
    this.currentValue = null;
    window.$hsPinInputCollection = window.$hsPinInputCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static method
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsPinInputCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsPinInputCollection) window.$hsPinInputCollection = [];
    if (window.$hsPinInputCollection)
      window.$hsPinInputCollection = window.$hsPinInputCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-pin-input]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsPinInputCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSPinInput(el);
    });
  }
}
window.addEventListener("load", () => {
  HSPinInput.autoInit();
});
if (typeof window !== "undefined") {
  window.HSPinInput = HSPinInput;
}

/*
 * HSRemoveElement
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSRemoveElement extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-remove-element-options");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.removeTargetId = this.el.getAttribute("data-hs-remove-element");
    this.removeTarget = document.querySelector(this.removeTargetId);
    this.removeTargetAnimationClass = concatOptions?.removeTargetAnimationClass || "hs-removing";
    if (this.removeTarget) this.init();
  }
  elementClick() {
    this.remove();
  }
  init() {
    this.createCollection(window.$hsRemoveElementCollection, this);
    this.onElementClickListener = () => this.elementClick();
    this.el.addEventListener("click", this.onElementClickListener);
  }
  remove() {
    if (!this.removeTarget) return false;
    this.removeTarget.classList.add(this.removeTargetAnimationClass);
    afterTransition(
      this.removeTarget,
      () => setTimeout(() => this.removeTarget.remove())
    );
  }
  // Public methods
  destroy() {
    this.removeTarget.classList.remove(this.removeTargetAnimationClass);
    this.el.removeEventListener("click", this.onElementClickListener);
    window.$hsRemoveElementCollection = window.$hsRemoveElementCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static method
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsRemoveElementCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target) || el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsRemoveElementCollection)
      window.$hsRemoveElementCollection = [];
    if (window.$hsRemoveElementCollection)
      window.$hsRemoveElementCollection = window.$hsRemoveElementCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-remove-element]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsRemoveElementCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSRemoveElement(el);
    });
  }
}
window.addEventListener("load", () => {
  HSRemoveElement.autoInit();
});
if (typeof window !== "undefined") {
  window.HSRemoveElement = HSRemoveElement;
}

/*
 * HSScrollspy
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSScrollspy extends HSBasePlugin {
  constructor(el, options = {}) {
    super(el, options);
    this.activeSection = null;
    this.contentId = this.el.getAttribute("data-hs-scrollspy");
    this.content = document.querySelector(this.contentId);
    this.links = this.el.querySelectorAll("[href]");
    this.sections = [];
    this.scrollableId = this.el.getAttribute(
      "data-hs-scrollspy-scrollable-parent"
    );
    this.scrollable = this.scrollableId ? document.querySelector(this.scrollableId) : document;
    this.onLinkClickListener = [];
    this.init();
  }
  scrollableScroll(evt) {
    Array.from(this.sections).forEach((section) => {
      if (!section.getAttribute("id")) return false;
      this.update(evt, section);
    });
  }
  linkClick(evt, el) {
    evt.preventDefault();
    if (el.getAttribute("href") === "javascript:;") return false;
    this.scrollTo(el);
  }
  init() {
    this.createCollection(window.$hsScrollspyCollection, this);
    this.links.forEach((el) => {
      this.sections.push(
        this.scrollable.querySelector(el.getAttribute("href"))
      );
    });
    this.onScrollableScrollListener = (evt) => this.scrollableScroll(evt);
    this.scrollable.addEventListener("scroll", this.onScrollableScrollListener);
    this.links.forEach((el) => {
      this.onLinkClickListener.push({
        el,
        fn: (evt) => this.linkClick(evt, el)
      });
      el.addEventListener(
        "click",
        this.onLinkClickListener.find((link) => link.el === el).fn
      );
    });
  }
  update(evt, section) {
    const globalOffset = parseInt(
      getClassProperty(this.el, "--scrollspy-offset", "0")
    );
    const userOffset = parseInt(getClassProperty(section, "--scrollspy-offset")) || globalOffset;
    const scrollableParentOffset = evt.target === document ? 0 : parseInt(
      String(evt.target.getBoundingClientRect().top)
    );
    const topOffset = parseInt(String(section.getBoundingClientRect().top)) - userOffset - scrollableParentOffset;
    const height = section.offsetHeight;
    if (topOffset <= 0 && topOffset + height > 0) {
      if (this.activeSection === section) return false;
      this.links.forEach((el) => {
        el.classList.remove("active");
      });
      const current = this.el.querySelector(
        `[href="#${section.getAttribute("id")}"]`
      );
      if (current) {
        current.classList.add("active");
        const group = current.closest("[data-hs-scrollspy-group]");
        if (group) {
          const parentLink = group.querySelector("[href]");
          if (parentLink) parentLink.classList.add("active");
        }
      }
      this.activeSection = section;
    }
  }
  scrollTo(link) {
    const targetId = link.getAttribute("href");
    const target = document.querySelector(targetId);
    const globalOffset = parseInt(
      getClassProperty(this.el, "--scrollspy-offset", "0")
    );
    const userOffset = parseInt(getClassProperty(target, "--scrollspy-offset")) || globalOffset;
    const scrollableParentOffset = this.scrollable === document ? 0 : this.scrollable.offsetTop;
    const topOffset = target.offsetTop - userOffset - scrollableParentOffset;
    const view = this.scrollable === document ? window : this.scrollable;
    const scrollFn = () => {
      window.history.replaceState(null, null, link.getAttribute("href"));
      if ("scrollTo" in view) {
        view.scrollTo({
          top: topOffset,
          left: 0,
          behavior: "smooth"
        });
      }
    };
    const beforeScroll = this.fireEvent("beforeScroll", this.el);
    dispatch("beforeScroll.hs.scrollspy", this.el, this.el);
    if (beforeScroll instanceof Promise) beforeScroll.then(() => scrollFn());
    else scrollFn();
  }
  // Public methods
  destroy() {
    const activeLink = this.el.querySelector("[href].active");
    activeLink.classList.remove("active");
    this.scrollable.removeEventListener(
      "scroll",
      this.onScrollableScrollListener
    );
    if (this.onLinkClickListener.length)
      this.onLinkClickListener.forEach(({ el, fn }) => {
        el.removeEventListener("click", fn);
      });
    window.$hsScrollspyCollection = window.$hsScrollspyCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance = false) {
    const elInCollection = window.$hsScrollspyCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsScrollspyCollection) window.$hsScrollspyCollection = [];
    if (window.$hsScrollspyCollection)
      window.$hsScrollspyCollection = window.$hsScrollspyCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-scrollspy]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsScrollspyCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSScrollspy(el);
    });
  }
}
window.addEventListener("load", () => {
  HSScrollspy.autoInit();
});
if (typeof window !== "undefined") {
  window.HSScrollspy = HSScrollspy;
}

/*
 * HSSelect
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSSelect extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    this.optionId = 0;
    const data = el.getAttribute("data-hs-select");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.value = concatOptions?.value || this.el.value || null;
    this.placeholder = concatOptions?.placeholder || "Select...";
    this.hasSearch = concatOptions?.hasSearch || false;
    this.minSearchLength = concatOptions?.minSearchLength ?? 0;
    this.preventSearchFocus = concatOptions?.preventSearchFocus || false;
    this.mode = concatOptions?.mode || "default";
    this.viewport = typeof concatOptions?.viewport !== "undefined" ? document.querySelector(concatOptions?.viewport) : null;
    this.isOpened = Boolean(concatOptions?.isOpened) || false;
    this.isMultiple = this.el.hasAttribute("multiple") || false;
    this.isDisabled = this.el.hasAttribute("disabled") || false;
    this.selectedItems = [];
    this.apiUrl = concatOptions?.apiUrl || null;
    this.apiQuery = concatOptions?.apiQuery || null;
    this.apiOptions = concatOptions?.apiOptions || null;
    this.apiSearchQueryKey = concatOptions?.apiSearchQueryKey || null;
    this.apiDataPart = concatOptions?.apiDataPart || null;
    this.apiFieldsMap = concatOptions?.apiFieldsMap || null;
    this.apiIconTag = concatOptions?.apiIconTag || null;
    this.wrapperClasses = concatOptions?.wrapperClasses || null;
    this.toggleTag = concatOptions?.toggleTag || null;
    this.toggleClasses = concatOptions?.toggleClasses || null;
    this.toggleCountText = typeof concatOptions?.toggleCountText === undefined ? null : concatOptions.toggleCountText;
    this.toggleCountTextPlacement = concatOptions?.toggleCountTextPlacement || "postfix";
    this.toggleCountTextMinItems = concatOptions?.toggleCountTextMinItems || 1;
    this.toggleCountTextMode = concatOptions?.toggleCountTextMode || "countAfterLimit";
    this.toggleSeparators = {
      items: concatOptions?.toggleSeparators?.items || ", ",
      betweenItemsAndCounter: concatOptions?.toggleSeparators?.betweenItemsAndCounter || "and"
    };
    this.tagsItemTemplate = concatOptions?.tagsItemTemplate || null;
    this.tagsItemClasses = concatOptions?.tagsItemClasses || null;
    this.tagsInputId = concatOptions?.tagsInputId || null;
    this.tagsInputClasses = concatOptions?.tagsInputClasses || null;
    this.dropdownTag = concatOptions?.dropdownTag || null;
    this.dropdownClasses = concatOptions?.dropdownClasses || null;
    this.dropdownDirectionClasses = concatOptions?.dropdownDirectionClasses || null;
    this.dropdownSpace = concatOptions?.dropdownSpace || 10;
    this.dropdownPlacement = concatOptions?.dropdownPlacement || null;
    this.dropdownVerticalFixedPlacement = concatOptions?.dropdownVerticalFixedPlacement || null;
    this.dropdownScope = concatOptions?.dropdownScope || "parent";
    this.searchTemplate = concatOptions?.searchTemplate || null;
    this.searchWrapperTemplate = concatOptions?.searchWrapperTemplate || null;
    this.searchWrapperClasses = concatOptions?.searchWrapperClasses || "bg-white p-2 sticky top-0";
    this.searchId = concatOptions?.searchId || null;
    this.searchLimit = concatOptions?.searchLimit || Infinity;
    this.isSearchDirectMatch = typeof concatOptions?.isSearchDirectMatch !== "undefined" ? concatOptions?.isSearchDirectMatch : true;
    this.searchClasses = concatOptions?.searchClasses || "block w-[calc(100%-2rem)] text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 py-2 px-3 my-2 mx-4";
    this.searchPlaceholder = concatOptions?.searchPlaceholder || "Search...";
    this.searchNoResultTemplate = concatOptions?.searchNoResultTemplate || "<span></span>";
    this.searchNoResultText = concatOptions?.searchNoResultText || "No results found";
    this.searchNoResultClasses = concatOptions?.searchNoResultClasses || "px-4 text-sm text-gray-800 dark:text-neutral-200";
    this.optionAllowEmptyOption = typeof concatOptions?.optionAllowEmptyOption !== "undefined" ? concatOptions?.optionAllowEmptyOption : false;
    this.optionTemplate = concatOptions?.optionTemplate || null;
    this.optionTag = concatOptions?.optionTag || null;
    this.optionClasses = concatOptions?.optionClasses || null;
    this.extraMarkup = concatOptions?.extraMarkup || null;
    this.descriptionClasses = concatOptions?.descriptionClasses || null;
    this.iconClasses = concatOptions?.iconClasses || null;
    this.isAddTagOnEnter = concatOptions?.isAddTagOnEnter ?? true;
    this.animationInProcess = false;
    this.selectOptions = [];
    this.remoteOptions = [];
    this.tagsInputHelper = null;
    this.init();
  }
  wrapperClick(evt) {
    if (!evt.target.closest("[data-hs-select-dropdown]") && !evt.target.closest("[data-tag-value]")) {
      this.tagsInput.focus();
    }
  }
  toggleClick() {
    if (this.isDisabled) return false;
    this.toggleFn();
  }
  tagsInputFocus() {
    if (!this.isOpened) this.open();
  }
  tagsInputInput() {
    this.calculateInputWidth();
  }
  tagsInputInputSecond(evt) {
    this.searchOptions(evt.target.value);
  }
  tagsInputKeydown(evt) {
    if (evt.key === "Enter" && this.isAddTagOnEnter) {
      const val = evt.target.value;
      if (this.selectOptions.find((el) => el.val === val))
        return false;
      this.addSelectOption(val, val);
      this.buildOption(val, val);
      this.dropdown.querySelector(`[data-value="${val}"]`).click();
      this.resetTagsInputField();
    }
  }
  searchInput(evt) {
    const newVal = evt.target.value;
    if (this.apiUrl) this.remoteSearch(newVal);
    else this.searchOptions(newVal);
  }
  setValue(val) {
    this.value = val;
    this.clearSelections();
    if (Array.isArray(val)) {
      if (this.mode === "tags") {
        this.unselectMultipleItems();
        this.selectMultipleItems();
        this.selectedItems = [];
        const existingTags = this.wrapper.querySelectorAll("[data-tag-value]");
        existingTags.forEach((tag) => tag.remove());
        this.setTagsItems();
        this.reassignTagsInputPlaceholder(this.value.length ? "" : this.placeholder);
      } else {
        this.toggleTextWrapper.innerHTML = this.value.length ? this.stringFromValue() : this.placeholder;
        this.unselectMultipleItems();
        this.selectMultipleItems();
      }
    } else {
      this.setToggleTitle();
      if (this.toggle.querySelector("[data-icon]")) this.setToggleIcon();
      if (this.toggle.querySelector("[data-title]")) this.setToggleTitle();
      this.selectSingleItem();
    }
  }
  init() {
    this.createCollection(window.$hsSelectCollection, this);
    this.build();
  }
  build() {
    this.el.style.display = "none";
    if (this.el.children) {
      Array.from(this.el.children).filter((el) => this.optionAllowEmptyOption || !this.optionAllowEmptyOption && el.value && el.value !== "").forEach((el) => {
        const data = el.getAttribute("data-hs-select-option");
        this.selectOptions = [
          ...this.selectOptions,
          {
            title: el.textContent,
            val: el.value,
            disabled: el.disabled,
            options: data !== "undefined" ? JSON.parse(data) : null
          }
        ];
      });
    }
    if (this.isMultiple) {
      const selectedOptions = Array.from(this.el.children).filter(
        (el) => el.selected
      );
      if (selectedOptions) {
        const values = [];
        selectedOptions.forEach((el) => {
          values.push(el.value);
        });
        this.value = values;
      }
    }
    this.buildWrapper();
    if (this.mode === "tags") this.buildTags();
    else this.buildToggle();
    this.buildDropdown();
    if (this.extraMarkup) this.buildExtraMarkup();
  }
  buildWrapper() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("hs-select", "relative");
    if (this.mode === "tags") {
      this.onWrapperClickListener = (evt) => this.wrapperClick(evt);
      this.wrapper.addEventListener("click", this.onWrapperClickListener);
    }
    if (this.wrapperClasses)
      classToClassList(this.wrapperClasses, this.wrapper);
    this.el.before(this.wrapper);
    this.wrapper.append(this.el);
  }
  buildExtraMarkup() {
    const appendMarkup = (markup) => {
      const el = htmlToElement(markup);
      this.wrapper.append(el);
      return el;
    };
    const clickHandle = (el) => {
      if (!el.classList.contains("--prevent-click"))
        el.addEventListener("click", (evt) => {
          evt.stopPropagation();
          this.toggleFn();
        });
    };
    if (Array.isArray(this.extraMarkup)) {
      this.extraMarkup.forEach((el) => {
        const newEl = appendMarkup(el);
        clickHandle(newEl);
      });
    } else {
      const newEl = appendMarkup(this.extraMarkup);
      clickHandle(newEl);
    }
  }
  buildToggle() {
    let icon, title;
    this.toggleTextWrapper = document.createElement("span");
    this.toggleTextWrapper.classList.add("truncate");
    this.toggle = htmlToElement(this.toggleTag || "<div></div>");
    icon = this.toggle.querySelector("[data-icon]");
    title = this.toggle.querySelector("[data-title]");
    if (!this.isMultiple && icon) this.setToggleIcon();
    if (!this.isMultiple && title) this.setToggleTitle();
    if (this.isMultiple) {
      this.toggleTextWrapper.innerHTML = this.value.length ? this.stringFromValue() : this.placeholder;
    } else {
      this.toggleTextWrapper.innerHTML = this.getItemByValue(this.value)?.title || this.placeholder;
    }
    if (!title) this.toggle.append(this.toggleTextWrapper);
    if (this.toggleClasses) classToClassList(this.toggleClasses, this.toggle);
    if (this.isDisabled) this.toggle.classList.add("disabled");
    if (this.wrapper) this.wrapper.append(this.toggle);
    if (this.toggle?.ariaExpanded) {
      if (this.isOpened) this.toggle.ariaExpanded = "true";
      else this.toggle.ariaExpanded = "false";
    }
    this.onToggleClickListener = () => this.toggleClick();
    this.toggle.addEventListener("click", this.onToggleClickListener);
  }
  setToggleIcon() {
    const item = this.getItemByValue(this.value);
    const icon = this.toggle.querySelector("[data-icon]");
    if (icon) {
      icon.innerHTML = "";
      const img = htmlToElement(
        this.apiUrl && this.apiIconTag ? this.apiIconTag || "" : item?.options?.icon || ""
      );
      if (this.value && this.apiUrl && this.apiIconTag && item[this.apiFieldsMap.icon])
        img.src = item[this.apiFieldsMap.icon] || "";
      icon.append(img);
      if (!img) icon.classList.add("hidden");
      else icon.classList.remove("hidden");
    }
  }
  setToggleTitle() {
    const title = this.toggle.querySelector("[data-title]");
    if (title) {
      title.innerHTML = this.getItemByValue(this.value)?.title || this.placeholder;
      title.classList.add("truncate");
      this.toggle.append(title);
    }
  }
  buildTags() {
    if (this.isDisabled) this.wrapper.classList.add("disabled");
    this.buildTagsInput();
    this.setTagsItems();
  }
  reassignTagsInputPlaceholder(placeholder) {
    this.tagsInput.placeholder = placeholder;
    this.tagsInputHelper.innerHTML = placeholder;
    this.calculateInputWidth();
  }
  buildTagsItem(val) {
    const item = this.getItemByValue(val);
    let template, title, remove, icon;
    const newItem = document.createElement("div");
    newItem.setAttribute("data-tag-value", val);
    if (this.tagsItemClasses) classToClassList(this.tagsItemClasses, newItem);
    if (this.tagsItemTemplate) {
      template = htmlToElement(this.tagsItemTemplate);
      newItem.append(template);
    }
    if (item?.options?.icon || this.apiIconTag) {
      const img = htmlToElement(
        this.apiUrl && this.apiIconTag ? this.apiIconTag : item?.options?.icon
      );
      if (this.apiUrl && this.apiIconTag && item[this.apiFieldsMap.icon])
        img.src = item[this.apiFieldsMap.icon] || "";
      icon = template ? template.querySelector("[data-icon]") : document.createElement("span");
      icon.append(img);
      if (!template) newItem.append(icon);
    }
    if (template && template.querySelector("[data-icon]") && !item?.options?.icon && !this.apiUrl && !this.apiIconTag && !item[this.apiFieldsMap?.icon]) {
      template.querySelector("[data-icon]").classList.add("hidden");
    }
    title = template ? template.querySelector("[data-title]") : document.createElement("span");
    title.textContent = item.title || "";
    if (!template) newItem.append(title);
    if (template) {
      remove = template.querySelector("[data-remove]");
    } else {
      remove = document.createElement("span");
      remove.textContent = "X";
      newItem.append(remove);
    }
    remove.addEventListener("click", () => {
      this.value = this.value.filter((el) => el !== val);
      this.selectedItems = this.selectedItems.filter((el) => el !== val);
      if (!this.value.length)
        this.reassignTagsInputPlaceholder(this.placeholder);
      this.unselectMultipleItems();
      this.selectMultipleItems();
      newItem.remove();
      this.triggerChangeEventForNativeSelect();
    });
    this.wrapper.append(newItem);
  }
  getItemByValue(val) {
    const value = this.apiUrl ? this.remoteOptions.find(
      (el) => `${el[this.apiFieldsMap.val]}` === val || el[this.apiFieldsMap.title] === val
    ) : this.selectOptions.find((el) => el.val === val);
    return value;
  }
  setTagsItems() {
    if (this.value) {
      this.value.forEach((val) => {
        if (!this.selectedItems.includes(val)) this.buildTagsItem(val);
        this.selectedItems = !this.selectedItems.includes(val) ? [...this.selectedItems, val] : this.selectedItems;
      });
    }
  }
  buildTagsInput() {
    this.tagsInput = document.createElement("input");
    if (this.tagsInputId) this.tagsInput.id = this.tagsInputId;
    if (this.tagsInputClasses)
      classToClassList(this.tagsInputClasses, this.tagsInput);
    this.onTagsInputFocusListener = () => this.tagsInputFocus();
    this.onTagsInputInputListener = () => this.tagsInputInput();
    this.onTagsInputInputSecondListener = debounce$1(
      (evt) => this.tagsInputInputSecond(evt)
    );
    this.onTagsInputKeydownListener = (evt) => this.tagsInputKeydown(evt);
    this.tagsInput.addEventListener("focus", this.onTagsInputFocusListener);
    this.tagsInput.addEventListener("input", this.onTagsInputInputListener);
    this.tagsInput.addEventListener(
      "input",
      this.onTagsInputInputSecondListener
    );
    this.tagsInput.addEventListener("keydown", this.onTagsInputKeydownListener);
    this.wrapper.append(this.tagsInput);
    setTimeout(() => {
      this.adjustInputWidth();
      this.reassignTagsInputPlaceholder(
        this.value.length ? "" : this.placeholder
      );
    });
  }
  buildDropdown() {
    this.dropdown = htmlToElement(this.dropdownTag || "<div></div>");
    this.dropdown.setAttribute("data-hs-select-dropdown", "");
    if (this.dropdownScope === "parent") {
      this.dropdown.classList.add("absolute");
      if (!this.dropdownVerticalFixedPlacement) this.dropdown.classList.add("top-full");
    }
    this.dropdown.role = "listbox";
    this.dropdown.tabIndex = -1;
    this.dropdown.ariaOrientation = "vertical";
    if (!this.isOpened) this.dropdown.classList.add("hidden");
    if (this.dropdownClasses)
      classToClassList(this.dropdownClasses, this.dropdown);
    if (this.wrapper) this.wrapper.append(this.dropdown);
    if (this.dropdown && this.hasSearch) this.buildSearch();
    if (this.selectOptions)
      this.selectOptions.forEach(
        (props, i) => this.buildOption(
          props.title,
          props.val,
          props.disabled,
          props.selected,
          props.options,
          `${i}`
        )
      );
    if (this.apiUrl) this.optionsFromRemoteData();
    if (this.dropdownScope === "window") this.buildPopper();
  }
  buildPopper() {
    if (typeof Popper !== "undefined" && Popper.createPopper) {
      document.body.appendChild(this.dropdown);
      this.popperInstance = Popper.createPopper(
        this.mode === "tags" ? this.wrapper : this.toggle,
        this.dropdown,
        {
          placement: POSITIONS[this.dropdownPlacement] || "bottom",
          strategy: "fixed",
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 5]
              }
            }
          ]
        }
      );
    }
  }
  updateDropdownWidth() {
    const toggle = this.mode === "tags" ? this.wrapper : this.toggle;
    this.dropdown.style.width = `${toggle.clientWidth}px`;
  }
  buildSearch() {
    let input;
    this.searchWrapper = htmlToElement(
      this.searchWrapperTemplate || "<div></div>"
    );
    if (this.searchWrapperClasses)
      classToClassList(this.searchWrapperClasses, this.searchWrapper);
    input = this.searchWrapper.querySelector("[data-input]");
    const search = htmlToElement(
      this.searchTemplate || '<input type="text" />'
    );
    this.search = search.tagName === "INPUT" ? search : search.querySelector(":scope input");
    this.search.placeholder = this.searchPlaceholder;
    if (this.searchClasses) classToClassList(this.searchClasses, this.search);
    if (this.searchId) this.search.id = this.searchId;
    this.onSearchInputListener = debounce$1((evt) => this.searchInput(evt));
    this.search.addEventListener("input", this.onSearchInputListener);
    if (input) input.append(search);
    else this.searchWrapper.append(search);
    this.dropdown.append(this.searchWrapper);
  }
  buildOption(title, val, disabled = false, selected = false, options, index = "1", id) {
    let template = null;
    let titleWrapper = null;
    let iconWrapper = null;
    let descriptionWrapper = null;
    const option = htmlToElement(this.optionTag || "<div></div>");
    option.setAttribute("data-value", val);
    option.setAttribute("data-title-value", title);
    option.setAttribute("tabIndex", index);
    option.classList.add("cursor-pointer");
    option.setAttribute("data-id", id || `${this.optionId}`);
    if (!id) this.optionId++;
    if (disabled) option.classList.add("disabled");
    if (selected) {
      if (this.isMultiple) this.value = [...this.value, val];
      else this.value = val;
    }
    if (this.optionTemplate) {
      template = htmlToElement(this.optionTemplate);
      option.append(template);
    }
    if (template) {
      titleWrapper = template.querySelector("[data-title]");
      titleWrapper.textContent = title || "";
    } else {
      option.textContent = title || "";
    }
    if (options) {
      if (options.icon) {
        const img = htmlToElement(this.apiIconTag ?? options.icon);
        img.classList.add("max-w-full");
        if (this.apiUrl) {
          img.setAttribute("alt", title);
          img.setAttribute("src", options.icon);
        }
        if (template) {
          iconWrapper = template.querySelector("[data-icon]");
          iconWrapper.append(img);
        } else {
          const icon = htmlToElement("<div></div>");
          if (this.iconClasses) classToClassList(this.iconClasses, icon);
          icon.append(img);
          option.append(icon);
        }
      }
      if (options.description) {
        if (template) {
          descriptionWrapper = template.querySelector("[data-description]");
          if (descriptionWrapper)
            descriptionWrapper.append(options.description);
        } else {
          const description = htmlToElement("<div></div>");
          description.textContent = options.description;
          if (this.descriptionClasses)
            classToClassList(this.descriptionClasses, description);
          option.append(description);
        }
      }
    }
    if (template && template.querySelector("[data-icon]") && !options && !options?.icon) {
      template.querySelector("[data-icon]").classList.add("hidden");
    }
    if (this.value && (this.isMultiple ? this.value.includes(val) : this.value === val))
      option.classList.add("selected");
    if (!disabled)
      option.addEventListener("click", () => this.onSelectOption(val));
    if (this.optionClasses) classToClassList(this.optionClasses, option);
    if (this.dropdown) this.dropdown.append(option);
    if (selected) this.setNewValue();
  }
  buildOptionFromRemoteData(title, val, disabled = false, selected = false, index = "1", id, options) {
    if (index) {
      this.buildOption(title, val, disabled, selected, options, index, id);
    } else {
      alert(
        "ID parameter is required for generating remote options! Please check your API endpoint have it."
      );
    }
  }
  buildOptionsFromRemoteData(data) {
    data.forEach((el, i) => {
      let id = null;
      let title = "";
      let value = "";
      const options = {
        id: "",
        val: "",
        title: "",
        icon: null,
        description: null,
        rest: {}
      };
      Object.keys(el).forEach((key) => {
        if (el[this.apiFieldsMap.id]) id = el[this.apiFieldsMap.id];
        if (el[this.apiFieldsMap.val] || el[this.apiFieldsMap.title]) {
          value = el[this.apiFieldsMap.val] || el[this.apiFieldsMap.title];
        }
        if (el[this.apiFieldsMap.title])
          title = el[this.apiFieldsMap.title];
        if (el[this.apiFieldsMap.icon])
          options.icon = el[this.apiFieldsMap.icon];
        if (el[this.apiFieldsMap?.description])
          options.description = el[this.apiFieldsMap.description];
        options.rest[key] = el[key];
      });
      this.buildOriginalOption(
        title,
        `${value}`,
        id,
        false,
        false,
        options
      );
      this.buildOptionFromRemoteData(
        title,
        `${value}`,
        false,
        false,
        `${i}`,
        id,
        options
      );
    });
    this.sortElements(this.el, "option");
    this.sortElements(this.dropdown, "[data-value]");
  }
  async optionsFromRemoteData(val = "") {
    const res = await this.apiRequest(val);
    this.remoteOptions = res;
    if (res.length) this.buildOptionsFromRemoteData(this.remoteOptions);
    else console.log("There is no data were responded!");
  }
  async apiRequest(val = "") {
    try {
      let url = this.apiUrl;
      const search = this.apiSearchQueryKey ? `${this.apiSearchQueryKey}=${val.toLowerCase()}` : null;
      const query = `${this.apiQuery}`;
      const options = this.apiOptions || {};
      if (search) url += `?${search}`;
      if (this.apiQuery) url += `${search ? "&" : "?"}${query}`;
      const req = await fetch(url, options);
      const res = await req.json();
      return this.apiDataPart ? res[this.apiDataPart] : res;
    } catch (err) {
      console.error(err);
    }
  }
  sortElements(container, selector) {
    const items = Array.from(container.querySelectorAll(selector));
    items.sort((a, b) => {
      const isASelected = a.classList.contains("selected") || a.hasAttribute("selected");
      const isBSelected = b.classList.contains("selected") || b.hasAttribute("selected");
      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
      return 0;
    });
    items.forEach((item) => container.appendChild(item));
  }
  async remoteSearch(val) {
    if (val.length <= this.minSearchLength) {
      const res2 = await this.apiRequest("");
      this.remoteOptions = res2;
      Array.from(this.dropdown.querySelectorAll("[data-value]")).forEach((el) => el.remove());
      Array.from(this.el.querySelectorAll("option[value]")).forEach((el) => {
        el.remove();
      });
      if (res2.length) this.buildOptionsFromRemoteData(res2);
      else console.log("No data responded!");
      return false;
    }
    const res = await this.apiRequest(val);
    this.remoteOptions = res;
    let newIds = res.map((item) => `${item.id}`);
    let restOptions = null;
    const pseudoOptions = this.dropdown.querySelectorAll("[data-value]");
    const options = this.el.querySelectorAll("[data-hs-select-option]");
    options.forEach((el) => {
      const dataId = el.getAttribute("data-id");
      if (!newIds.includes(dataId) && !this.value?.includes(el.value))
        this.destroyOriginalOption(el.value);
    });
    pseudoOptions.forEach((el) => {
      const dataId = el.getAttribute("data-id");
      if (!newIds.includes(dataId) && !this.value?.includes(el.getAttribute("data-value")))
        this.destroyOption(el.getAttribute("data-value"));
      else newIds = newIds.filter((item) => item !== dataId);
    });
    restOptions = res.filter(
      (item) => newIds.includes(`${item.id}`)
    );
    if (restOptions.length) this.buildOptionsFromRemoteData(restOptions);
    else console.log("No data responded!");
  }
  destroyOption(val) {
    const option = this.dropdown.querySelector(`[data-value="${val}"]`);
    if (!option) return false;
    option.remove();
  }
  buildOriginalOption(title, val, id, disabled, selected, options) {
    const option = htmlToElement("<option></option>");
    option.setAttribute("value", val);
    if (disabled) option.setAttribute("disabled", "disabled");
    if (selected) option.setAttribute("selected", "selected");
    if (id) option.setAttribute("data-id", id);
    option.setAttribute("data-hs-select-option", JSON.stringify(options));
    option.innerText = title;
    this.el.append(option);
  }
  destroyOriginalOption(val) {
    const option = this.el.querySelector(`[value="${val}"]`);
    if (!option) return false;
    option.remove();
  }
  buildTagsInputHelper() {
    this.tagsInputHelper = document.createElement("span");
    this.tagsInputHelper.style.fontSize = window.getComputedStyle(
      this.tagsInput
    ).fontSize;
    this.tagsInputHelper.style.fontFamily = window.getComputedStyle(
      this.tagsInput
    ).fontFamily;
    this.tagsInputHelper.style.fontWeight = window.getComputedStyle(
      this.tagsInput
    ).fontWeight;
    this.tagsInputHelper.style.letterSpacing = window.getComputedStyle(
      this.tagsInput
    ).letterSpacing;
    this.tagsInputHelper.style.visibility = "hidden";
    this.tagsInputHelper.style.whiteSpace = "pre";
    this.tagsInputHelper.style.position = "absolute";
    this.wrapper.appendChild(this.tagsInputHelper);
  }
  calculateInputWidth() {
    this.tagsInputHelper.textContent = this.tagsInput.value || this.tagsInput.placeholder;
    const inputPadding = parseInt(window.getComputedStyle(this.tagsInput).paddingLeft) + parseInt(window.getComputedStyle(this.tagsInput).paddingRight);
    const inputBorder = parseInt(window.getComputedStyle(this.tagsInput).borderLeftWidth) + parseInt(window.getComputedStyle(this.tagsInput).borderRightWidth);
    const newWidth = this.tagsInputHelper.offsetWidth + inputPadding + inputBorder;
    const maxWidth = this.wrapper.offsetWidth - (parseInt(window.getComputedStyle(this.wrapper).paddingLeft) + parseInt(window.getComputedStyle(this.wrapper).paddingRight));
    this.tagsInput.style.width = `${Math.min(newWidth, maxWidth) + 2}px`;
  }
  adjustInputWidth() {
    this.buildTagsInputHelper();
    this.calculateInputWidth();
  }
  onSelectOption(val) {
    this.clearSelections();
    if (this.isMultiple) {
      this.value = this.value.includes(val) ? Array.from(this.value).filter((el) => el !== val) : [...Array.from(this.value), val];
      this.selectMultipleItems();
      this.setNewValue();
    } else {
      this.value = val;
      this.selectSingleItem();
      this.setNewValue();
    }
    this.fireEvent("change", this.value);
    if (this.mode === "tags") {
      const intersection = this.selectedItems.filter(
        (x) => !this.value.includes(x)
      );
      if (intersection.length) {
        intersection.forEach((el) => {
          this.selectedItems = this.selectedItems.filter((elI) => elI !== el);
          this.wrapper.querySelector(`[data-tag-value="${el}"]`).remove();
        });
      }
      this.resetTagsInputField();
    }
    if (!this.isMultiple) {
      if (this.toggle.querySelector("[data-icon]")) this.setToggleIcon();
      if (this.toggle.querySelector("[data-title]")) this.setToggleTitle();
      this.close(true);
    }
    if (!this.value.length && this.mode === "tags")
      this.reassignTagsInputPlaceholder(this.placeholder);
    if (this.isOpened && this.mode === "tags" && this.tagsInput)
      this.tagsInput.focus();
    this.triggerChangeEventForNativeSelect();
  }
  triggerChangeEventForNativeSelect() {
    const selectChangeEvent = new Event("change", { bubbles: true });
    this.el.dispatchEvent(selectChangeEvent);
    dispatch("change.hs.select", this.el, this.value);
  }
  addSelectOption(title, val, disabled, selected, options) {
    this.selectOptions = [
      ...this.selectOptions,
      {
        title,
        val,
        disabled,
        selected,
        options
      }
    ];
  }
  removeSelectOption(val, isArray = false) {
    const hasOption = !!this.selectOptions.some(
      (el) => el.val === val
    );
    if (!hasOption) return false;
    this.selectOptions = this.selectOptions.filter(
      (el) => el.val !== val
    );
    this.value = isArray ? this.value.filter((item) => item !== val) : val;
  }
  resetTagsInputField() {
    this.tagsInput.value = "";
    this.reassignTagsInputPlaceholder("");
    this.searchOptions("");
  }
  clearSelections() {
    Array.from(this.dropdown.children).forEach((el) => {
      if (el.classList.contains("selected")) el.classList.remove("selected");
    });
    Array.from(this.el.children).forEach((el) => {
      if (el.selected)
        el.selected = false;
    });
  }
  setNewValue() {
    if (this.mode === "tags") {
      this.setTagsItems();
    } else {
      if (this.value?.length) {
        this.toggleTextWrapper.innerHTML = this.stringFromValue();
      } else {
        this.toggleTextWrapper.innerHTML = this.placeholder;
      }
    }
  }
  stringFromValueBasic(options) {
    const value = [];
    let title = "";
    options.forEach((el) => {
      if (this.isMultiple) {
        if (this.value.includes(el.val)) value.push(el.title);
      } else {
        if (this.value === el.val) value.push(el.title);
      }
    });
    if (this.toggleCountText !== undefined && this.toggleCountText !== null && value.length >= this.toggleCountTextMinItems) {
      if (this.toggleCountTextMode === "nItemsAndCount") {
        const nItems = value.slice(0, this.toggleCountTextMinItems - 1);
        const tempTitle = [nItems.join(this.toggleSeparators.items)];
        const count = `${value.length - nItems.length}`;
        if (this?.toggleSeparators?.betweenItemsAndCounter)
          tempTitle.push(this.toggleSeparators.betweenItemsAndCounter);
        if (this.toggleCountText) {
          switch (this.toggleCountTextPlacement) {
            case "postfix-no-space":
              tempTitle.push(`${count}${this.toggleCountText}`);
              break;
            case "prefix-no-space":
              tempTitle.push(`${this.toggleCountText}${count}`);
              break;
            case "prefix":
              tempTitle.push(`${this.toggleCountText} ${count}`);
              break;
            default:
              tempTitle.push(`${count} ${this.toggleCountText}`);
              break;
          }
        }
        title = tempTitle.join(" ");
      } else {
        title = `${value.length} ${this.toggleCountText}`;
      }
    } else {
      title = value.join(this.toggleSeparators.items);
    }
    return title;
  }
  stringFromValueRemoteData() {
    const options = this.dropdown.querySelectorAll("[data-title-value]");
    const value = [];
    let title = "";
    options.forEach((el) => {
      const dataValue = el.getAttribute("data-value");
      const dataTitleValue = el.getAttribute("data-title-value");
      if (this.isMultiple) {
        if (this.value.includes(dataValue)) value.push(dataTitleValue);
      } else {
        if (this.value === dataValue) value.push(dataTitleValue);
      }
    });
    if (this.toggleCountText && this.toggleCountText !== "" && value.length >= this.toggleCountTextMinItems) {
      if (this.toggleCountTextMode === "nItemsAndCount") {
        const nItems = value.slice(0, this.toggleCountTextMinItems - 1);
        title = `${nItems.join(this.toggleSeparators.items)} ${this.toggleSeparators.betweenItemsAndCounter} ${value.length - nItems.length} ${this.toggleCountText}`;
      } else {
        title = `${value.length} ${this.toggleCountText}`;
      }
    } else {
      title = value.join(this.toggleSeparators.items);
    }
    return title;
  }
  stringFromValue() {
    const result = this.apiUrl ? this.stringFromValueRemoteData() : this.stringFromValueBasic(this.selectOptions);
    return result;
  }
  selectSingleItem() {
    const selectedOption = Array.from(this.el.children).find(
      (el) => this.value === el.value
    );
    selectedOption.selected = true;
    const selectedItem = Array.from(this.dropdown.children).find(
      (el) => this.value === el.getAttribute("data-value")
    );
    if (selectedItem) selectedItem.classList.add("selected");
  }
  selectMultipleItems() {
    Array.from(this.dropdown.children).filter((el) => this.value.includes(el.getAttribute("data-value"))).forEach((el) => el.classList.add("selected"));
    Array.from(this.el.children).filter((el) => this.value.includes(el.value)).forEach((el) => el.selected = true);
  }
  unselectMultipleItems() {
    Array.from(this.dropdown.children).forEach(
      (el) => el.classList.remove("selected")
    );
    Array.from(this.el.children).forEach(
      (el) => el.selected = false
    );
  }
  searchOptions(val) {
    if (val.length <= this.minSearchLength) {
      if (this.searchNoResult) {
        this.searchNoResult.remove();
        this.searchNoResult = null;
      }
      const options2 = this.dropdown.querySelectorAll("[data-value]");
      options2.forEach((el) => {
        el.classList.remove("hidden");
      });
      return false;
    }
    if (this.searchNoResult) {
      this.searchNoResult.remove();
      this.searchNoResult = null;
    }
    this.searchNoResult = htmlToElement(this.searchNoResultTemplate);
    this.searchNoResult.innerText = this.searchNoResultText;
    classToClassList(this.searchNoResultClasses, this.searchNoResult);
    const options = this.dropdown.querySelectorAll("[data-value]");
    let hasItems = false;
    let countLimit;
    if (this.searchLimit) countLimit = 0;
    options.forEach((el) => {
      const optionVal = el.getAttribute("data-title-value").toLocaleLowerCase();
      const directMatch = this.isSearchDirectMatch;
      let condition;
      if (directMatch) {
        condition = !optionVal.includes(val.toLowerCase()) || this.searchLimit && countLimit >= this.searchLimit;
      } else {
        const regexSafeVal = val ? val.split("").map((char) => /\w/.test(char) ? `${char}[\\W_]*` : "\\W*").join("") : "";
        const regex = new RegExp(regexSafeVal, "i");
        condition = !regex.test(optionVal.trim()) || this.searchLimit && countLimit >= this.searchLimit;
      }
      if (condition) {
        el.classList.add("hidden");
      } else {
        el.classList.remove("hidden");
        hasItems = true;
        if (this.searchLimit) countLimit++;
      }
    });
    if (!hasItems) this.dropdown.append(this.searchNoResult);
  }
  eraseToggleIcon() {
    const icon = this.toggle.querySelector("[data-icon]");
    if (icon) {
      icon.innerHTML = null;
      icon.classList.add("hidden");
    }
  }
  eraseToggleTitle() {
    const title = this.toggle.querySelector("[data-title]");
    if (title) {
      title.innerHTML = this.placeholder;
    } else {
      this.toggleTextWrapper.innerHTML = this.placeholder;
    }
  }
  toggleFn() {
    if (this.isOpened) this.close();
    else this.open();
  }
  // Public methods
  destroy() {
    if (this.wrapper)
      this.wrapper.removeEventListener("click", this.onWrapperClickListener);
    if (this.toggle)
      this.toggle.removeEventListener("click", this.onToggleClickListener);
    if (this.tagsInput) {
      this.tagsInput.removeEventListener(
        "focus",
        this.onTagsInputFocusListener
      );
      this.tagsInput.removeEventListener(
        "input",
        this.onTagsInputInputListener
      );
      this.tagsInput.removeEventListener(
        "input",
        this.onTagsInputInputSecondListener
      );
      this.tagsInput.removeEventListener(
        "keydown",
        this.onTagsInputKeydownListener
      );
    }
    if (this.search)
      this.search.removeEventListener("input", this.onSearchInputListener);
    const parent = this.el.parentElement.parentElement;
    this.el.classList.remove("hidden");
    this.el.style.display = "";
    parent.prepend(this.el);
    parent.querySelector(".hs-select").remove();
    this.wrapper = null;
  }
  open() {
    const currentlyOpened = window?.$hsSelectCollection?.find((el) => el.element.isOpened) || null;
    if (currentlyOpened) currentlyOpened.element.close();
    if (this.animationInProcess) return false;
    this.animationInProcess = true;
    if (this.dropdownScope === "window")
      this.dropdown.classList.add("invisible");
    this.dropdown.classList.remove("hidden");
    this.recalculateDirection();
    setTimeout(() => {
      if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "true";
      this.wrapper.classList.add("active");
      this.dropdown.classList.add("opened");
      if (this.dropdown.classList.contains("w-full") && this.dropdownScope === "window")
        this.updateDropdownWidth();
      if (this.popperInstance && this.dropdownScope === "window") {
        this.popperInstance.update();
        this.dropdown.classList.remove("invisible");
      }
      if (this.hasSearch && !this.preventSearchFocus) this.search.focus();
      this.animationInProcess = false;
    });
    this.isOpened = true;
  }
  close(forceFocus = false) {
    if (this.animationInProcess) return false;
    this.animationInProcess = true;
    if (this?.toggle?.ariaExpanded) this.toggle.ariaExpanded = "false";
    this.wrapper.classList.remove("active");
    this.dropdown.classList.remove("opened", "bottom-full", "top-full");
    if (this.dropdownDirectionClasses?.bottom)
      this.dropdown.classList.remove(this.dropdownDirectionClasses.bottom);
    if (this.dropdownDirectionClasses?.top)
      this.dropdown.classList.remove(this.dropdownDirectionClasses.top);
    this.dropdown.style.marginTop = "";
    this.dropdown.style.marginBottom = "";
    afterTransition(this.dropdown, () => {
      this.dropdown.classList.add("hidden");
      if (this.hasSearch) {
        this.search.value = "";
        this.search.dispatchEvent(new Event("input", { bubbles: true }));
        this.search.blur();
      }
      if (forceFocus) this.toggle.focus();
      this.animationInProcess = false;
    });
    this.dropdown.querySelector(".hs-select-option-highlighted")?.classList.remove("hs-select-option-highlighted");
    this.isOpened = false;
  }
  addOption(items) {
    let i = `${this.selectOptions.length}`;
    const addOption = (option) => {
      const { title, val, disabled, selected, options } = option;
      const hasOption = !!this.selectOptions.some(
        (el) => el.val === val
      );
      if (!hasOption) {
        this.addSelectOption(title, val, disabled, selected, options);
        this.buildOption(title, val, disabled, selected, options, i);
        this.buildOriginalOption(title, val, null, disabled, selected, options);
        if (selected && !this.isMultiple) this.onSelectOption(val);
      }
    };
    if (Array.isArray(items)) {
      items.forEach((option) => {
        addOption(option);
      });
    } else {
      addOption(items);
    }
  }
  removeOption(values) {
    const removeOption = (val, isArray = false) => {
      const hasOption = !!this.selectOptions.some(
        (el) => el.val === val
      );
      if (hasOption) {
        this.removeSelectOption(val, isArray);
        this.destroyOption(val);
        this.destroyOriginalOption(val);
        if (this.value === val) {
          this.value = null;
          this.eraseToggleTitle();
          this.eraseToggleIcon();
        }
      }
    };
    if (Array.isArray(values)) {
      values.forEach((val) => {
        removeOption(val, this.isMultiple);
      });
    } else {
      removeOption(values, this.isMultiple);
    }
    this.setNewValue();
  }
  recalculateDirection() {
    if (this?.dropdownVerticalFixedPlacement && (this.dropdown.classList.contains("bottom-full") || this.dropdown.classList.contains("top-full"))) return false;
    if (this?.dropdownVerticalFixedPlacement === "top") {
      this.dropdown.classList.add("bottom-full");
      this.dropdown.style.marginBottom = `${this.dropdownSpace}px`;
    } else if (this?.dropdownVerticalFixedPlacement === "bottom") {
      this.dropdown.classList.add("top-full");
      this.dropdown.style.marginTop = `${this.dropdownSpace}px`;
    } else if (isEnoughSpace(
      this.dropdown,
      this.toggle || this.tagsInput,
      "bottom",
      this.dropdownSpace,
      this.viewport
    )) {
      this.dropdown.classList.remove("bottom-full");
      if (this.dropdownDirectionClasses?.bottom)
        this.dropdown.classList.remove(this.dropdownDirectionClasses.bottom);
      this.dropdown.style.marginBottom = "";
      this.dropdown.classList.add("top-full");
      if (this.dropdownDirectionClasses?.top)
        this.dropdown.classList.add(this.dropdownDirectionClasses.top);
      this.dropdown.style.marginTop = `${this.dropdownSpace}px`;
    } else {
      this.dropdown.classList.remove("top-full");
      if (this.dropdownDirectionClasses?.top)
        this.dropdown.classList.remove(this.dropdownDirectionClasses.top);
      this.dropdown.style.marginTop = "";
      this.dropdown.classList.add("bottom-full");
      if (this.dropdownDirectionClasses?.bottom)
        this.dropdown.classList.add(this.dropdownDirectionClasses.bottom);
      this.dropdown.style.marginBottom = `${this.dropdownSpace}px`;
    }
  }
  // Static methods
  static findInCollection(target) {
    return window.$hsSelectCollection.find((el) => {
      if (target instanceof HSSelect) return el.element.el === target.el;
      else if (typeof target === "string") return el.element.el === document.querySelector(target);
      else return el.element.el === target;
    }) || null;
  }
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsSelectCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsSelectCollection) {
      window.$hsSelectCollection = [];
      window.addEventListener("click", (evt) => {
        const evtTarget = evt.target;
        HSSelect.closeCurrentlyOpened(evtTarget);
      });
      document.addEventListener(
        "keydown",
        (evt) => HSSelect.accessibility(evt)
      );
    }
    if (window.$hsSelectCollection)
      window.$hsSelectCollection = window.$hsSelectCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-select]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsSelectCollection.find(
        (elC) => elC?.element?.el === el
      )) {
        const data = el.getAttribute("data-hs-select");
        const options = data ? JSON.parse(data) : {};
        new HSSelect(el, options);
      }
    });
  }
  static open(target) {
    const instance = HSSelect.findInCollection(target);
    if (instance && !instance.element.isOpened) instance.element.open();
  }
  static close(target) {
    const instance = HSSelect.findInCollection(target);
    if (instance && instance.element.isOpened) instance.element.close();
  }
  static closeCurrentlyOpened(evtTarget = null) {
    if (!evtTarget.closest(".hs-select.active") && !evtTarget.closest("[data-hs-select-dropdown].opened")) {
      const currentlyOpened = window.$hsSelectCollection.filter((el) => el.element.isOpened) || null;
      if (currentlyOpened) currentlyOpened.forEach((el) => {
        el.element.close();
      });
    }
  }
  // Accessibility methods
  static accessibility(evt) {
    const target = window.$hsSelectCollection.find((el) => el.element.isOpened);
    if (target && SELECT_ACCESSIBILITY_KEY_SET.includes(evt.code) && !evt.metaKey) {
      switch (evt.code) {
        case "Escape":
          evt.preventDefault();
          this.onEscape();
          break;
        case "ArrowUp":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onArrow();
          break;
        case "ArrowDown":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onArrow(false);
          break;
        case "Tab":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onTab(evt.shiftKey);
          break;
        case "Home":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onStartEnd();
          break;
        case "End":
          evt.preventDefault();
          evt.stopImmediatePropagation();
          this.onStartEnd(false);
          break;
        case "Enter":
          evt.preventDefault();
          this.onEnter(evt);
          break;
        case "Space":
          evt.preventDefault();
          this.onEnter(evt);
          break;
      }
    }
  }
  static onEscape() {
    const target = window.$hsSelectCollection.find((el) => el.element.isOpened);
    if (target) target.element.close();
  }
  static onArrow(isArrowUp = true) {
    const target = window.$hsSelectCollection.find((el) => el.element.isOpened);
    if (target) {
      const dropdown = target.element.dropdown;
      if (!dropdown) return false;
      const preparedOptions = isArrowUp ? Array.from(
        dropdown.querySelectorAll(":scope > *:not(.hidden)")
      ).reverse() : Array.from(dropdown.querySelectorAll(":scope > *:not(.hidden)"));
      const options = preparedOptions.filter(
        (el) => !el.classList.contains("disabled")
      );
      const current = dropdown.querySelector(".hs-select-option-highlighted") || dropdown.querySelector(".selected");
      if (!current) options[0].classList.add("hs-select-option-highlighted");
      let currentInd = options.findIndex((el) => el === current);
      if (currentInd + 1 < options.length) {
        currentInd++;
      }
      options[currentInd].focus();
      if (current) current.classList.remove("hs-select-option-highlighted");
      options[currentInd].classList.add("hs-select-option-highlighted");
    }
  }
  static onTab(isArrowUp = true) {
    const target = window.$hsSelectCollection.find((el) => el.element.isOpened);
    if (target) {
      const dropdown = target.element.dropdown;
      if (!dropdown) return false;
      const preparedOptions = isArrowUp ? Array.from(
        dropdown.querySelectorAll(":scope >  *:not(.hidden)")
      ).reverse() : Array.from(dropdown.querySelectorAll(":scope >  *:not(.hidden)"));
      const options = preparedOptions.filter(
        (el) => !el.classList.contains("disabled")
      );
      const current = dropdown.querySelector(".hs-select-option-highlighted") || dropdown.querySelector(".selected");
      if (!current) options[0].classList.add("hs-select-option-highlighted");
      let currentInd = options.findIndex((el) => el === current);
      if (currentInd + 1 < options.length) {
        currentInd++;
      } else {
        if (current) current.classList.remove("hs-select-option-highlighted");
        target.element.close();
        target.element.toggle.focus();
        return false;
      }
      options[currentInd].focus();
      if (current) current.classList.remove("hs-select-option-highlighted");
      options[currentInd].classList.add("hs-select-option-highlighted");
    }
  }
  static onStartEnd(isStart = true) {
    const target = window.$hsSelectCollection.find((el) => el.element.isOpened);
    if (target) {
      const dropdown = target.element.dropdown;
      if (!dropdown) return false;
      const preparedOptions = isStart ? Array.from(dropdown.querySelectorAll(":scope >  *:not(.hidden)")) : Array.from(
        dropdown.querySelectorAll(":scope >  *:not(.hidden)")
      ).reverse();
      const options = preparedOptions.filter(
        (el) => !el.classList.contains("disabled")
      );
      const current = dropdown.querySelector(".hs-select-option-highlighted");
      if (options.length) {
        options[0].focus();
        if (current) current.classList.remove("hs-select-option-highlighted");
        options[0].classList.add("hs-select-option-highlighted");
      }
    }
  }
  static onEnter(evt) {
    const select = evt.target.previousSibling;
    if (window.$hsSelectCollection.find((el) => el.element.el === select)) {
      const opened = window.$hsSelectCollection.find(
        (el) => el.element.isOpened
      );
      const target = window.$hsSelectCollection.find(
        (el) => el.element.el === select
      );
      opened.element.close();
      target.element.open();
    } else {
      const target = window.$hsSelectCollection.find(
        (el) => el.element.isOpened
      );
      if (target)
        target.element.onSelectOption(
          evt.target.dataset.value || ""
        );
    }
  }
}
window.addEventListener("load", () => {
  HSSelect.autoInit();
});
document.addEventListener("scroll", () => {
  if (!window.$hsSelectCollection) return false;
  const target = window.$hsSelectCollection.find((el) => el.element.isOpened);
  if (target) target.element.recalculateDirection();
});
if (typeof window !== "undefined") {
  window.HSSelect = HSSelect;
}

/*
 * HSStepper
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSStepper extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-stepper");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.currentIndex = concatOptions?.currentIndex || 1;
    this.mode = concatOptions?.mode || "linear";
    this.isCompleted = typeof concatOptions?.isCompleted !== "undefined" ? concatOptions?.isCompleted : false;
    this.totalSteps = 1;
    this.navItems = [];
    this.contentItems = [];
    this.onNavItemClickListener = [];
    this.init();
  }
  navItemClick(item) {
    this.handleNavItemClick(item);
  }
  backClick() {
    this.handleBackButtonClick();
    if (this.mode === "linear") {
      const currentNavItem = this.navItems.find(
        ({ index }) => index === this.currentIndex
      );
      const currentContentItem = this.contentItems.find(
        ({ index }) => index === this.currentIndex
      );
      if (!currentNavItem || !currentContentItem) return;
      if (currentNavItem.isCompleted) {
        currentNavItem.isCompleted = false;
        currentNavItem.isSkip = false;
        currentNavItem.el.classList.remove("success", "skipped");
      }
      if (currentContentItem.isCompleted) {
        currentContentItem.isCompleted = false;
        currentContentItem.isSkip = false;
        currentContentItem.el.classList.remove("success", "skipped");
      }
      if (this.mode === "linear" && this.currentIndex !== this.totalSteps) {
        if (this.nextBtn) this.nextBtn.style.display = "";
        if (this.completeStepBtn) this.completeStepBtn.style.display = "";
      }
      this.showSkipButton();
      this.showFinishButton();
      this.showCompleteStepButton();
    }
  }
  nextClick() {
    this.fireEvent("beforeNext", this.currentIndex);
    dispatch("beforeNext.hs.stepper", this.el, this.currentIndex);
    if (this.getNavItem(this.currentIndex)?.isProcessed) {
      this.disableAll();
      return false;
    }
    this.goToNext();
  }
  skipClick() {
    this.handleSkipButtonClick();
    if (this.mode === "linear" && this.currentIndex === this.totalSteps) {
      if (this.nextBtn) this.nextBtn.style.display = "none";
      if (this.completeStepBtn) this.completeStepBtn.style.display = "none";
      if (this.finishBtn) this.finishBtn.style.display = "";
    }
  }
  completeStepBtnClick() {
    this.handleCompleteStepButtonClick();
  }
  finishBtnClick() {
    this.handleFinishButtonClick();
  }
  resetBtnClick() {
    this.handleResetButtonClick();
  }
  init() {
    this.createCollection(window.$hsStepperCollection, this);
    this.buildNav();
    this.buildContent();
    this.buildButtons();
    this.setTotalSteps();
  }
  getUncompletedSteps(inIncludedSkipped = false) {
    return this.navItems.filter(
      ({ isCompleted, isSkip }) => inIncludedSkipped ? !isCompleted || isSkip : !isCompleted && !isSkip
    );
  }
  setTotalSteps() {
    this.navItems.forEach((item) => {
      const { index } = item;
      if (index > this.totalSteps) this.totalSteps = index;
    });
  }
  // Nav
  buildNav() {
    this.el.querySelectorAll("[data-hs-stepper-nav-item]").forEach((el) => this.addNavItem(el));
    this.navItems.forEach((item) => this.buildNavItem(item));
  }
  buildNavItem(item) {
    const { index, isDisabled, el } = item;
    if (index === this.currentIndex) this.setCurrentNavItem();
    if (this.mode !== "linear" || isDisabled) {
      this.onNavItemClickListener.push({
        el,
        fn: () => this.navItemClick(item)
      });
      el.addEventListener(
        "click",
        this.onNavItemClickListener.find((navItem) => navItem.el === el).fn
      );
    }
  }
  addNavItem(el) {
    const {
      index,
      isFinal = false,
      isCompleted = false,
      isSkip = false,
      isOptional = false,
      isDisabled = false,
      isProcessed = false,
      hasError = false
    } = JSON.parse(el.getAttribute("data-hs-stepper-nav-item"));
    if (isCompleted) el.classList.add("success");
    if (isSkip) el.classList.add("skipped");
    if (isDisabled) {
      if (el.tagName === "BUTTON" || el.tagName === "INPUT")
        el.setAttribute("disabled", "disabled");
      el.classList.add("disabled");
    }
    if (hasError) el.classList.add("error");
    this.navItems.push({
      index,
      isFinal,
      isCompleted,
      isSkip,
      isOptional,
      isDisabled,
      isProcessed,
      hasError,
      el
    });
  }
  setCurrentNavItem() {
    this.navItems.forEach((item) => {
      const { index, el } = item;
      if (index === this.currentIndex) this.setCurrentNavItemActions(el);
      else this.unsetCurrentNavItemActions(el);
    });
  }
  setCurrentNavItemActions(el) {
    el.classList.add("active");
    this.fireEvent("active", this.currentIndex);
    dispatch("active.hs.stepper", this.el, this.currentIndex);
  }
  getNavItem(n = this.currentIndex) {
    return this.navItems.find(({ index }) => index === n);
  }
  setProcessedNavItemActions(item) {
    item.isProcessed = true;
    item.el.classList.add("processed");
  }
  setErrorNavItemActions(item) {
    item.hasError = true;
    item.el.classList.add("error");
  }
  unsetCurrentNavItemActions(el) {
    el.classList.remove("active");
  }
  handleNavItemClick(item) {
    const { index } = item;
    this.currentIndex = index;
    this.setCurrentNavItem();
    this.setCurrentContentItem();
    this.checkForTheFirstStep();
  }
  // Content
  buildContent() {
    this.el.querySelectorAll("[data-hs-stepper-content-item]").forEach((el) => this.addContentItem(el));
    this.navItems.forEach((item) => this.buildContentItem(item));
  }
  buildContentItem(item) {
    const { index } = item;
    if (index === this.currentIndex) this.setCurrentContentItem();
  }
  addContentItem(el) {
    const {
      index,
      isFinal = false,
      isCompleted = false,
      isSkip = false
    } = JSON.parse(el.getAttribute("data-hs-stepper-content-item"));
    if (isCompleted) el.classList.add("success");
    if (isSkip) el.classList.add("skipped");
    this.contentItems.push({
      index,
      isFinal,
      isCompleted,
      isSkip,
      el
    });
  }
  setCurrentContentItem() {
    if (this.isCompleted) {
      const finalContentItem = this.contentItems.find(({ isFinal }) => isFinal);
      const otherContentItems = this.contentItems.filter(
        ({ isFinal }) => !isFinal
      );
      finalContentItem.el.style.display = "";
      otherContentItems.forEach(({ el }) => el.style.display = "none");
      return false;
    }
    this.contentItems.forEach((item) => {
      const { index, el } = item;
      if (index === this.currentIndex) this.setCurrentContentItemActions(el);
      else this.unsetCurrentContentItemActions(el);
    });
  }
  hideAllContentItems() {
    this.contentItems.forEach(({ el }) => el.style.display = "none");
  }
  setCurrentContentItemActions(el) {
    el.style.display = "";
  }
  unsetCurrentContentItemActions(el) {
    el.style.display = "none";
  }
  disableAll() {
    const currentNavItem = this.getNavItem(this.currentIndex);
    currentNavItem.hasError = false;
    currentNavItem.isCompleted = false;
    currentNavItem.isDisabled = false;
    currentNavItem.el.classList.remove("error", "success");
    this.disableButtons();
  }
  disableNavItemActions(item) {
    item.isDisabled = true;
    item.el.classList.add("disabled");
  }
  enableNavItemActions(item) {
    item.isDisabled = false;
    item.el.classList.remove("disabled");
  }
  // Buttons
  buildButtons() {
    this.backBtn = this.el.querySelector("[data-hs-stepper-back-btn]");
    this.nextBtn = this.el.querySelector("[data-hs-stepper-next-btn]");
    this.skipBtn = this.el.querySelector("[data-hs-stepper-skip-btn]");
    this.completeStepBtn = this.el.querySelector(
      "[data-hs-stepper-complete-step-btn]"
    );
    this.finishBtn = this.el.querySelector("[data-hs-stepper-finish-btn]");
    this.resetBtn = this.el.querySelector("[data-hs-stepper-reset-btn]");
    this.buildBackButton();
    this.buildNextButton();
    this.buildSkipButton();
    this.buildCompleteStepButton();
    this.buildFinishButton();
    this.buildResetButton();
  }
  // back
  buildBackButton() {
    if (!this.backBtn) return;
    this.checkForTheFirstStep();
    this.onBackClickListener = () => this.backClick();
    this.backBtn.addEventListener("click", this.onBackClickListener);
  }
  handleBackButtonClick() {
    if (this.currentIndex === 1) return;
    if (this.mode === "linear") {
      this.removeOptionalClasses();
    }
    this.currentIndex--;
    if (this.mode === "linear") {
      this.removeOptionalClasses();
    }
    this.setCurrentNavItem();
    this.setCurrentContentItem();
    this.checkForTheFirstStep();
    if (this.completeStepBtn)
      this.changeTextAndDisableCompleteButtonIfStepCompleted();
    this.fireEvent("back", this.currentIndex);
    dispatch("back.hs.stepper", this.el, this.currentIndex);
  }
  checkForTheFirstStep() {
    if (this.currentIndex === 1) {
      this.setToDisabled(this.backBtn);
    } else {
      this.setToNonDisabled(this.backBtn);
    }
  }
  setToDisabled(el) {
    if (el.tagName === "BUTTON" || el.tagName === "INPUT")
      el.setAttribute("disabled", "disabled");
    el.classList.add("disabled");
  }
  setToNonDisabled(el) {
    if (el.tagName === "BUTTON" || el.tagName === "INPUT")
      el.removeAttribute("disabled");
    el.classList.remove("disabled");
  }
  // next
  buildNextButton() {
    if (!this.nextBtn) return;
    this.onNextClickListener = () => this.nextClick();
    this.nextBtn.addEventListener("click", this.onNextClickListener);
  }
  unsetProcessedNavItemActions(item) {
    item.isProcessed = false;
    item.el.classList.remove("processed");
  }
  handleNextButtonClick(infinite = true) {
    if (infinite) {
      if (this.currentIndex === this.totalSteps) this.currentIndex = 1;
      else this.currentIndex++;
    } else {
      const nonCompletedSteps = this.getUncompletedSteps();
      if (nonCompletedSteps.length === 1) {
        const { index } = nonCompletedSteps[0];
        this.currentIndex = index;
      } else {
        if (this.currentIndex === this.totalSteps) return;
        this.currentIndex++;
      }
    }
    if (this.mode === "linear") {
      this.removeOptionalClasses();
    }
    this.setCurrentNavItem();
    this.setCurrentContentItem();
    this.checkForTheFirstStep();
    if (this.completeStepBtn)
      this.changeTextAndDisableCompleteButtonIfStepCompleted();
    this.showSkipButton();
    this.showFinishButton();
    this.showCompleteStepButton();
    this.fireEvent("next", this.currentIndex);
    dispatch("next.hs.stepper", this.el, this.currentIndex);
  }
  removeOptionalClasses() {
    const currentNavItem = this.navItems.find(
      ({ index }) => index === this.currentIndex
    );
    const currentContentItem = this.contentItems.find(
      ({ index }) => index === this.currentIndex
    );
    currentNavItem.isSkip = false;
    currentNavItem.hasError = false;
    currentNavItem.isDisabled = false;
    currentContentItem.isSkip = false;
    currentNavItem.el.classList.remove("skipped", "success", "error");
    currentContentItem.el.classList.remove("skipped", "success", "error");
  }
  // skip
  buildSkipButton() {
    if (!this.skipBtn) return;
    this.showSkipButton();
    this.onSkipClickListener = () => this.skipClick();
    this.skipBtn.addEventListener("click", this.onSkipClickListener);
  }
  setSkipItem(n) {
    const targetNavItem = this.navItems.find(
      ({ index }) => index === (n || this.currentIndex)
    );
    const targetContentItem = this.contentItems.find(
      ({ index }) => index === (n || this.currentIndex)
    );
    if (!targetNavItem || !targetContentItem) return;
    this.setSkipItemActions(targetNavItem);
    this.setSkipItemActions(targetContentItem);
  }
  setSkipItemActions(item) {
    item.isSkip = true;
    item.el.classList.add("skipped");
  }
  showSkipButton() {
    if (!this.skipBtn) return;
    const { isOptional } = this.navItems.find(
      ({ index }) => index === this.currentIndex
    );
    if (isOptional) this.skipBtn.style.display = "";
    else this.skipBtn.style.display = "none";
  }
  handleSkipButtonClick() {
    this.setSkipItem();
    this.handleNextButtonClick();
    this.fireEvent("skip", this.currentIndex);
    dispatch("skip.hs.stepper", this.el, this.currentIndex);
  }
  // complete
  buildCompleteStepButton() {
    if (!this.completeStepBtn) return;
    this.completeStepBtnDefaultText = this.completeStepBtn.innerText;
    this.onCompleteStepBtnClickListener = () => this.completeStepBtnClick();
    this.completeStepBtn.addEventListener(
      "click",
      this.onCompleteStepBtnClickListener
    );
  }
  changeTextAndDisableCompleteButtonIfStepCompleted() {
    const currentNavItem = this.navItems.find(
      ({ index }) => index === this.currentIndex
    );
    const { completedText } = JSON.parse(
      this.completeStepBtn.getAttribute("data-hs-stepper-complete-step-btn")
    );
    if (!currentNavItem) return;
    if (currentNavItem.isCompleted) {
      this.completeStepBtn.innerText = completedText || this.completeStepBtnDefaultText;
      this.completeStepBtn.setAttribute("disabled", "disabled");
      this.completeStepBtn.classList.add("disabled");
    } else {
      this.completeStepBtn.innerText = this.completeStepBtnDefaultText;
      this.completeStepBtn.removeAttribute("disabled");
      this.completeStepBtn.classList.remove("disabled");
    }
  }
  setCompleteItem(n) {
    const targetNavItem = this.navItems.find(
      ({ index }) => index === (n || this.currentIndex)
    );
    const targetContentItem = this.contentItems.find(
      ({ index }) => index === (n || this.currentIndex)
    );
    if (!targetNavItem || !targetContentItem) return;
    this.setCompleteItemActions(targetNavItem);
    this.setCompleteItemActions(targetContentItem);
  }
  setCompleteItemActions(item) {
    item.isCompleted = true;
    item.el.classList.add("success");
  }
  showCompleteStepButton() {
    if (!this.completeStepBtn) return;
    const nonCompletedSteps = this.getUncompletedSteps();
    if (nonCompletedSteps.length === 1)
      this.completeStepBtn.style.display = "none";
    else this.completeStepBtn.style.display = "";
  }
  handleCompleteStepButtonClick() {
    this.setCompleteItem();
    this.fireEvent("complete", this.currentIndex);
    dispatch("complete.hs.stepper", this.el, this.currentIndex);
    this.handleNextButtonClick(false);
    this.showFinishButton();
    this.showCompleteStepButton();
    this.checkForTheFirstStep();
    if (this.completeStepBtn)
      this.changeTextAndDisableCompleteButtonIfStepCompleted();
    this.showSkipButton();
  }
  // finish
  buildFinishButton() {
    if (!this.finishBtn) return;
    if (this.isCompleted) {
      this.setCompleted();
    }
    this.onFinishBtnClickListener = () => this.finishBtnClick();
    this.finishBtn.addEventListener("click", this.onFinishBtnClickListener);
  }
  setCompleted() {
    this.el.classList.add("completed");
  }
  unsetCompleted() {
    this.el.classList.remove("completed");
  }
  showFinishButton() {
    if (!this.finishBtn) return;
    const nonCompletedSteps = this.getUncompletedSteps();
    if (nonCompletedSteps.length === 1) this.finishBtn.style.display = "";
    else this.finishBtn.style.display = "none";
  }
  handleFinishButtonClick() {
    const uncompletedSteps = this.getUncompletedSteps();
    const uncompletedOrSkipSteps = this.getUncompletedSteps(true);
    const { el } = this.contentItems.find(({ isFinal }) => isFinal);
    if (uncompletedSteps.length)
      uncompletedSteps.forEach(({ index }) => this.setCompleteItem(index));
    this.currentIndex = this.totalSteps;
    this.setCurrentNavItem();
    this.hideAllContentItems();
    const currentNavItem = this.navItems.find(
      ({ index }) => index === this.currentIndex
    );
    const currentNavItemEl = currentNavItem ? currentNavItem.el : null;
    currentNavItemEl.classList.remove("active");
    el.style.display = "block";
    if (this.backBtn) this.backBtn.style.display = "none";
    if (this.nextBtn) this.nextBtn.style.display = "none";
    if (this.skipBtn) this.skipBtn.style.display = "none";
    if (this.completeStepBtn) this.completeStepBtn.style.display = "none";
    if (this.finishBtn) this.finishBtn.style.display = "none";
    if (this.resetBtn) this.resetBtn.style.display = "";
    if (uncompletedOrSkipSteps.length <= 1) {
      this.isCompleted = true;
      this.setCompleted();
    }
    this.fireEvent("finish", this.currentIndex);
    dispatch("finish.hs.stepper", this.el, this.currentIndex);
  }
  // reset
  buildResetButton() {
    if (!this.resetBtn) return;
    this.onResetBtnClickListener = () => this.resetBtnClick();
    this.resetBtn.addEventListener("click", this.onResetBtnClickListener);
  }
  handleResetButtonClick() {
    if (this.backBtn) this.backBtn.style.display = "";
    if (this.nextBtn) this.nextBtn.style.display = "";
    if (this.completeStepBtn) {
      this.completeStepBtn.style.display = "";
      this.completeStepBtn.innerText = this.completeStepBtnDefaultText;
      this.completeStepBtn.removeAttribute("disabled");
      this.completeStepBtn.classList.remove("disabled");
    }
    if (this.resetBtn) this.resetBtn.style.display = "none";
    this.navItems.forEach((item) => {
      const { el } = item;
      item.isSkip = false;
      item.isCompleted = false;
      this.unsetCurrentNavItemActions(el);
      el.classList.remove("success", "skipped");
    });
    this.contentItems.forEach((item) => {
      const { el } = item;
      item.isSkip = false;
      item.isCompleted = false;
      this.unsetCurrentContentItemActions(el);
      el.classList.remove("success", "skipped");
    });
    this.currentIndex = 1;
    this.unsetCompleted();
    this.isCompleted = false;
    this.showSkipButton();
    this.setCurrentNavItem();
    this.setCurrentContentItem();
    this.showFinishButton();
    this.showCompleteStepButton();
    this.checkForTheFirstStep();
    this.fireEvent("reset", this.currentIndex);
    dispatch("reset.hs.stepper", this.el, this.currentIndex);
  }
  // Public methods
  setProcessedNavItem(n) {
    const targetNavItem = this.getNavItem(n);
    if (!targetNavItem) return;
    this.setProcessedNavItemActions(targetNavItem);
  }
  unsetProcessedNavItem(n) {
    const targetNavItem = this.getNavItem(n);
    if (!targetNavItem) return;
    this.unsetProcessedNavItemActions(targetNavItem);
  }
  goToNext() {
    if (this.mode === "linear") this.setCompleteItem();
    this.handleNextButtonClick(this.mode !== "linear");
    if (this.mode === "linear" && this.currentIndex === this.totalSteps) {
      if (this.nextBtn) this.nextBtn.style.display = "none";
      if (this.completeStepBtn) this.completeStepBtn.style.display = "none";
    }
  }
  disableButtons() {
    if (this.backBtn) this.setToDisabled(this.backBtn);
    if (this.nextBtn) this.setToDisabled(this.nextBtn);
  }
  enableButtons() {
    if (this.backBtn) this.setToNonDisabled(this.backBtn);
    if (this.nextBtn) this.setToNonDisabled(this.nextBtn);
  }
  setErrorNavItem(n) {
    const targetNavItem = this.getNavItem(n);
    if (!targetNavItem) return;
    this.setErrorNavItemActions(targetNavItem);
  }
  destroy() {
    this.el.classList.remove("completed");
    this.el.querySelectorAll("[data-hs-stepper-nav-item]").forEach((el) => {
      el.classList.remove("active", "success", "skipped", "disabled", "error");
      if (el.tagName === "BUTTON" || el.tagName === "INPUT")
        el.removeAttribute("disabled");
    });
    this.el.querySelectorAll("[data-hs-stepper-content-item]").forEach((el) => {
      el.classList.remove("success", "skipped");
    });
    if (this.backBtn) this.backBtn.classList.remove("disabled");
    if (this.nextBtn) this.nextBtn.classList.remove("disabled");
    if (this.completeStepBtn) this.completeStepBtn.classList.remove("disabled");
    if (this.backBtn) this.backBtn.style.display = "";
    if (this.nextBtn) this.nextBtn.style.display = "";
    if (this.skipBtn) this.skipBtn.style.display = "";
    if (this.finishBtn) this.finishBtn.style.display = "none";
    if (this.resetBtn) this.resetBtn.style.display = "none";
    if (this.onNavItemClickListener.length)
      this.onNavItemClickListener.forEach(({ el, fn }) => {
        el.removeEventListener("click", fn);
      });
    if (this.backBtn)
      this.backBtn.removeEventListener("click", this.onBackClickListener);
    if (this.nextBtn)
      this.nextBtn.removeEventListener("click", this.onNextClickListener);
    if (this.skipBtn)
      this.skipBtn.removeEventListener("click", this.onSkipClickListener);
    if (this.completeStepBtn)
      this.completeStepBtn.removeEventListener(
        "click",
        this.onCompleteStepBtnClickListener
      );
    if (this.finishBtn)
      this.finishBtn.removeEventListener(
        "click",
        this.onFinishBtnClickListener
      );
    if (this.resetBtn)
      this.resetBtn.removeEventListener("click", this.onResetBtnClickListener);
    window.$hsStepperCollection = window.$hsStepperCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsStepperCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsStepperCollection) window.$hsStepperCollection = [];
    if (window.$hsStepperCollection)
      window.$hsStepperCollection = window.$hsStepperCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-stepper]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsStepperCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSStepper(el);
    });
  }
}
window.addEventListener("load", () => {
  HSStepper.autoInit();
});
if (typeof window !== "undefined") {
  window.HSStepper = HSStepper;
}

/*
 * HSStrongPassword
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSStrongPassword extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    this.isOpened = false;
    this.strength = 0;
    this.passedRules = /* @__PURE__ */ new Set();
    const data = el.getAttribute("data-hs-strong-password");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.target = concatOptions?.target ? typeof concatOptions?.target === "string" ? document.querySelector(concatOptions.target) : concatOptions.target : null;
    this.hints = concatOptions?.hints ? typeof concatOptions?.hints === "string" ? document.querySelector(concatOptions.hints) : concatOptions.hints : null;
    this.stripClasses = concatOptions?.stripClasses || null;
    this.minLength = concatOptions?.minLength || 6;
    this.mode = concatOptions?.mode || "default";
    this.popoverSpace = concatOptions?.popoverSpace || 10;
    this.checksExclude = concatOptions?.checksExclude || [];
    this.availableChecks = [
      "lowercase",
      "uppercase",
      "numbers",
      "special-characters",
      "min-length"
    ].filter((el2) => !this.checksExclude.includes(el2));
    this.specialCharactersSet = concatOptions?.specialCharactersSet || "!\"#$%&'()*+,-./:;<=>?@[\\\\\\]^_`{|}~";
    if (this.target) this.init();
  }
  targetInput(evt) {
    this.setStrength(evt.target.value);
  }
  targetFocus() {
    this.isOpened = true;
    this.hints.classList.remove("hidden");
    this.hints.classList.add("block");
    this.recalculateDirection();
  }
  targetBlur() {
    this.isOpened = false;
    this.hints.classList.remove(
      "block",
      "bottom-full",
      "top-full"
    );
    this.hints.classList.add("hidden");
    this.hints.style.marginTop = "";
    this.hints.style.marginBottom = "";
  }
  targetInputSecond() {
    this.setWeaknessText();
  }
  targetInputThird() {
    this.setRulesText();
  }
  init() {
    this.createCollection(window.$hsStrongPasswordCollection, this);
    if (this.availableChecks.length) this.build();
  }
  build() {
    this.buildStrips();
    if (this.hints) this.buildHints();
    this.setStrength(this.target.value);
    this.onTargetInputListener = (evt) => this.targetInput(evt);
    this.target.addEventListener(
      "input",
      this.onTargetInputListener
    );
  }
  buildStrips() {
    this.el.innerHTML = "";
    if (this.stripClasses) {
      for (let i = 0; i < this.availableChecks.length; i++) {
        const newStrip = htmlToElement("<div></div>");
        classToClassList(this.stripClasses, newStrip);
        this.el.append(newStrip);
      }
    }
  }
  buildHints() {
    this.weakness = this.hints.querySelector(
      "[data-hs-strong-password-hints-weakness-text]"
    ) || null;
    this.rules = Array.from(
      this.hints.querySelectorAll(
        "[data-hs-strong-password-hints-rule-text]"
      )
    ) || null;
    this.rules.forEach((rule) => {
      const ruleValue = rule.getAttribute(
        "data-hs-strong-password-hints-rule-text"
      );
      if (this.checksExclude?.includes(ruleValue)) rule.remove();
    });
    if (this.weakness) this.buildWeakness();
    if (this.rules) this.buildRules();
    if (this.mode === "popover") {
      this.onTargetFocusListener = () => this.targetFocus();
      this.onTargetBlurListener = () => this.targetBlur();
      this.target.addEventListener(
        "focus",
        this.onTargetFocusListener
      );
      this.target.addEventListener(
        "blur",
        this.onTargetBlurListener
      );
    }
  }
  buildWeakness() {
    this.checkStrength(this.target.value);
    this.setWeaknessText();
    this.onTargetInputSecondListener = () => setTimeout(() => this.targetInputSecond());
    this.target.addEventListener(
      "input",
      this.onTargetInputSecondListener
    );
  }
  buildRules() {
    this.setRulesText();
    this.onTargetInputThirdListener = () => setTimeout(() => this.targetInputThird());
    this.target.addEventListener(
      "input",
      this.onTargetInputThirdListener
    );
  }
  setWeaknessText() {
    const weaknessText = this.weakness.getAttribute(
      "data-hs-strong-password-hints-weakness-text"
    );
    const weaknessTextToJson = JSON.parse(weaknessText);
    this.weakness.textContent = weaknessTextToJson[this.strength];
  }
  setRulesText() {
    this.rules.forEach((rule) => {
      const ruleValue = rule.getAttribute(
        "data-hs-strong-password-hints-rule-text"
      );
      this.checkIfPassed(rule, this.passedRules.has(ruleValue));
    });
  }
  togglePopover() {
    const popover = this.el.querySelector(".popover");
    if (popover) popover.classList.toggle("show");
  }
  checkStrength(val) {
    const passedRules = /* @__PURE__ */ new Set();
    const regexps = {
      lowercase: /[a-z]+/,
      uppercase: /[A-Z]+/,
      numbers: /[0-9]+/,
      "special-characters": new RegExp(`[${this.specialCharactersSet}]`)
    };
    let strength = 0;
    if (this.availableChecks.includes("lowercase") && val.match(regexps["lowercase"])) {
      strength += 1;
      passedRules.add("lowercase");
    }
    if (this.availableChecks.includes("uppercase") && val.match(regexps["uppercase"])) {
      strength += 1;
      passedRules.add("uppercase");
    }
    if (this.availableChecks.includes("numbers") && val.match(regexps["numbers"])) {
      strength += 1;
      passedRules.add("numbers");
    }
    if (this.availableChecks.includes("special-characters") && val.match(regexps["special-characters"])) {
      strength += 1;
      passedRules.add("special-characters");
    }
    if (this.availableChecks.includes("min-length") && val.length >= this.minLength) {
      strength += 1;
      passedRules.add("min-length");
    }
    if (!val.length) {
      strength = 0;
    }
    if (strength === this.availableChecks.length)
      this.el.classList.add("accepted");
    else this.el.classList.remove("accepted");
    this.strength = strength;
    this.passedRules = passedRules;
    return {
      strength: this.strength,
      rules: this.passedRules
    };
  }
  checkIfPassed(el, isRulePassed = false) {
    const check = el.querySelector("[data-check]");
    const uncheck = el.querySelector("[data-uncheck]");
    if (isRulePassed) {
      el.classList.add("active");
      check.classList.remove("hidden");
      uncheck.classList.add("hidden");
    } else {
      el.classList.remove("active");
      check.classList.add("hidden");
      uncheck.classList.remove("hidden");
    }
  }
  setStrength(val) {
    const { strength, rules } = this.checkStrength(val);
    const payload = {
      strength,
      rules
    };
    this.hideStrips(strength);
    this.fireEvent("change", payload);
    dispatch("change.hs.strongPassword", this.el, payload);
  }
  hideStrips(qty) {
    Array.from(this.el.children).forEach((el, i) => {
      if (i < qty) el.classList.add("passed");
      else el.classList.remove("passed");
    });
  }
  // Public methods
  recalculateDirection() {
    if (isEnoughSpace(
      this.hints,
      this.target,
      "bottom",
      this.popoverSpace
    )) {
      this.hints.classList.remove("bottom-full");
      this.hints.classList.add("top-full");
      this.hints.style.marginBottom = "";
      this.hints.style.marginTop = `${this.popoverSpace}px`;
    } else {
      this.hints.classList.remove("top-full");
      this.hints.classList.add("bottom-full");
      this.hints.style.marginTop = "";
      this.hints.style.marginBottom = `${this.popoverSpace}px`;
    }
  }
  destroy() {
    this.target.removeEventListener(
      "input",
      this.onTargetInputListener
    );
    this.target.removeEventListener(
      "focus",
      this.onTargetFocusListener
    );
    this.target.removeEventListener(
      "blur",
      this.onTargetBlurListener
    );
    this.target.removeEventListener(
      "input",
      this.onTargetInputSecondListener
    );
    this.target.removeEventListener(
      "input",
      this.onTargetInputThirdListener
    );
    window.$hsStrongPasswordCollection = window.$hsStrongPasswordCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsStrongPasswordCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsStrongPasswordCollection)
      window.$hsStrongPasswordCollection = [];
    if (window.$hsStrongPasswordCollection)
      window.$hsStrongPasswordCollection = window.$hsStrongPasswordCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(
      "[data-hs-strong-password]:not(.--prevent-on-load-init)"
    ).forEach((el) => {
      if (!window.$hsStrongPasswordCollection.find(
        (elC) => elC?.element?.el === el
      )) {
        const data = el.getAttribute("data-hs-strong-password");
        const options = data ? JSON.parse(data) : {};
        new HSStrongPassword(el, options);
      }
    });
  }
}
window.addEventListener("load", () => {
  HSStrongPassword.autoInit();
});
document.addEventListener("scroll", () => {
  if (!window.$hsStrongPasswordCollection) return false;
  const target = window.$hsStrongPasswordCollection.find(
    (el) => el.element.isOpened
  );
  if (target) target.element.recalculateDirection();
});
if (typeof window !== "undefined") {
  window.HSStrongPassword = HSStrongPassword;
}

/*
 * HSTabs
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSTabs extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.toggles = this.el.querySelectorAll("[data-hs-tab]");
    this.extraToggleId = this.el.getAttribute("data-hs-tab-select");
    this.extraToggle = document.querySelector(this.extraToggleId);
    this.current = Array.from(this.toggles).find(
      (el2) => el2.classList.contains("active")
    );
    this.currentContentId = this.current.getAttribute("data-hs-tab");
    this.currentContent = document.querySelector(this.currentContentId);
    this.prev = null;
    this.prevContentId = null;
    this.prevContent = null;
    this.eventType = "click";
    this.onToggleClickListener = [];
    this.init();
  }
  toggleClick(el) {
    this.open(el);
  }
  extraToggleChange(evt) {
    this.change(evt);
  }
  init() {
    this.createCollection(window.$hsTabsCollection, this);
    this.toggles.forEach((el) => {
      this.onToggleClickListener.push({
        el,
        fn: () => this.toggleClick(el)
      });
      el.addEventListener(
        this.eventType,
        this.onToggleClickListener.find((toggle) => toggle.el === el).fn
      );
    });
    if (this.extraToggle) {
      this.onExtraToggleChangeListener = (evt) => this.extraToggleChange(evt);
      this.extraToggle.addEventListener(
        "change",
        this.onExtraToggleChangeListener
      );
    }
  }
  open(el) {
    this.prev = this.current;
    this.prevContentId = this.currentContentId;
    this.prevContent = this.currentContent;
    this.current = el;
    this.currentContentId = this.current.getAttribute("data-hs-tab");
    this.currentContent = document.querySelector(this.currentContentId);
    if (this?.prev?.ariaSelected) this.prev.ariaSelected = "false";
    this.prev.classList.remove("active");
    this.prevContent.classList.add("hidden");
    if (this?.current?.ariaSelected) this.current.ariaSelected = "true";
    this.current.classList.add("active");
    this.currentContent.classList.remove("hidden");
    this.fireEvent("change", {
      el,
      prev: this.prevContentId,
      current: this.currentContentId
    });
    dispatch("change.hs.tab", el, {
      el,
      prev: this.prevContentId,
      current: this.currentContentId
    });
  }
  change(evt) {
    const toggle = document.querySelector(
      `[data-hs-tab="${evt.target.value}"]`
    );
    if (toggle) toggle.click();
  }
  // Public methods
  destroy() {
    this.toggles.forEach((el) => {
      el.removeEventListener(
        this.eventType,
        this.onToggleClickListener.find((toggle) => toggle.el === el).fn
      );
    });
    this.onToggleClickListener = [];
    if (this.extraToggle)
      this.extraToggle.removeEventListener(
        "change",
        this.onExtraToggleChangeListener
      );
    window.$hsTabsCollection = window.$hsTabsCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsTabsCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsTabsCollection) {
      window.$hsTabsCollection = [];
      document.addEventListener("keydown", (evt) => HSTabs.accessibility(evt));
    }
    if (window.$hsTabsCollection)
      window.$hsTabsCollection = window.$hsTabsCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(
      '[role="tablist"]:not(select):not(.--prevent-on-load-init)'
    ).forEach((el) => {
      if (!window.$hsTabsCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSTabs(el);
    });
  }
  static open(target) {
    const elInCollection = window.$hsTabsCollection.find(
      (el) => Array.from(el.element.toggles).includes(
        typeof target === "string" ? document.querySelector(target) : target
      )
    );
    const targetInCollection = Array.from(elInCollection.element.toggles).find(
      (el) => el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    if (targetInCollection && !targetInCollection.classList.contains("active"))
      elInCollection.element.open(targetInCollection);
  }
  // Accessibility methods
  static accessibility(evt) {
    const target = document.querySelector("[data-hs-tab]:focus");
    if (target && TABS_ACCESSIBILITY_KEY_SET.includes(evt.code) && !evt.metaKey) {
      const isVertical = target.closest('[role="tablist"]').getAttribute("data-hs-tabs-vertical");
      evt.preventDefault();
      switch (evt.code) {
        case (isVertical === "true" ? "ArrowUp" : "ArrowLeft"):
          this.onArrow();
          break;
        case (isVertical === "true" ? "ArrowDown" : "ArrowRight"):
          this.onArrow(false);
          break;
        case "Home":
          this.onStartEnd();
          break;
        case "End":
          this.onStartEnd(false);
          break;
      }
    }
  }
  static onArrow(isOpposite = true) {
    const target = document.querySelector("[data-hs-tab]:focus").closest('[role="tablist"]');
    const targetInCollection = window.$hsTabsCollection.find(
      (el) => el.element.el === target
    );
    if (targetInCollection) {
      const toggles = isOpposite ? Array.from(targetInCollection.element.toggles).reverse() : Array.from(targetInCollection.element.toggles);
      const focused = toggles.find((el) => document.activeElement === el);
      let focusedInd = toggles.findIndex((el) => el === focused);
      focusedInd = focusedInd + 1 < toggles.length ? focusedInd + 1 : 0;
      toggles[focusedInd].focus();
      toggles[focusedInd].click();
    }
  }
  static onStartEnd(isOpposite = true) {
    const target = document.querySelector("[data-hs-tab]:focus").closest('[role="tablist"]');
    const targetInCollection = window.$hsTabsCollection.find(
      (el) => el.element.el === target
    );
    if (targetInCollection) {
      const toggles = isOpposite ? Array.from(targetInCollection.element.toggles) : Array.from(targetInCollection.element.toggles).reverse();
      if (toggles.length) {
        toggles[0].focus();
        toggles[0].click();
      }
    }
  }
  // Backward compatibility
  static on(evt, target, cb) {
    const elInCollection = window.$hsTabsCollection.find(
      (el) => Array.from(el.element.toggles).includes(
        typeof target === "string" ? document.querySelector(target) : target
      )
    );
    if (elInCollection) elInCollection.element.events[evt] = cb;
  }
}
window.addEventListener("load", () => {
  HSTabs.autoInit();
});
if (typeof window !== "undefined") {
  window.HSTabs = HSTabs;
}

/*
 * HSTextareaAutoHeight
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSTextareaAutoHeight extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-copy-markup");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.defaultHeight = concatOptions?.defaultHeight || 0;
    this.init();
  }
  elementInput() {
    this.textareaSetHeight(3);
  }
  init() {
    this.createCollection(window.$hsTextareaAutoHeightCollection, this);
    this.setAutoHeight();
  }
  setAutoHeight() {
    if (this.isParentHidden()) this.callbackAccordingToType();
    else this.textareaSetHeight(3);
    this.onElementInputListener = () => this.elementInput();
    this.el.addEventListener("input", this.onElementInputListener);
  }
  textareaSetHeight(offsetTop = 0) {
    this.el.style.height = "auto";
    this.el.style.height = this.checkIfOneLine() && this.defaultHeight ? `${this.defaultHeight}px` : `${this.el.scrollHeight + offsetTop}px`;
  }
  checkIfOneLine() {
    const clientHeight = this.el.clientHeight;
    const scrollHeight = this.el.scrollHeight;
    if (scrollHeight > clientHeight) return false;
    else return true;
  }
  isParentHidden() {
    return this.el.closest(".hs-overlay.hidden") || this.el.closest('[role="tabpanel"].hidden') || this.el.closest(".hs-collapse.hidden");
  }
  parentType() {
    if (this.el.closest(".hs-collapse")) return "collapse";
    else if (this.el.closest(".hs-overlay")) return "overlay";
    else if (this.el.closest('[role="tabpanel"]')) return "tabs";
    else return false;
  }
  callbackAccordingToType() {
    if (this.parentType() === "tabs") {
      const tabId = this.el.closest('[role="tabpanel"]')?.id;
      const tab = document.querySelector(`[data-hs-tab="#${tabId}"]`);
      const tabs = tab.closest('[role="tablist"]');
      const { element } = window.HSTabs.getInstance(tabs, true) || null;
      element.on("change", (payload) => {
        const textareas = document.querySelectorAll(`${payload.current} [data-hs-textarea-auto-height]`);
        if (!textareas.length) return false;
        textareas.forEach((el) => {
          const instance = window.HSTextareaAutoHeight.getInstance(el, true) || null;
          if (instance) instance.element.textareaSetHeight(3);
        });
      });
    } else if (this.parentType() === "collapse") {
      const collapseId = this.el.closest(".hs-collapse").id;
      const { element } = window.HSCollapse.getInstance(
        `[data-hs-collapse="#${collapseId}"]`,
        true
      );
      element.on("beforeOpen", () => {
        if (!this.el) return false;
        this.textareaSetHeight(3);
      });
    } else if (this.parentType() === "overlay") {
      const { element } = window.HSOverlay.getInstance(
        this.el.closest(".hs-overlay"),
        true
      );
      element.on("open", () => {
        if (!this.el) return false;
        this.textareaSetHeight(3);
      });
    } else return false;
  }
  // Public methods
  destroy() {
    this.el.removeEventListener("input", this.onElementInputListener);
    window.$hsTextareaAutoHeightCollection = window.$hsTextareaAutoHeightCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static method
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsTextareaAutoHeightCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsTextareaAutoHeightCollection)
      window.$hsTextareaAutoHeightCollection = [];
    if (window.$hsTextareaAutoHeightCollection)
      window.$hsTextareaAutoHeightCollection = window.$hsTextareaAutoHeightCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(
      "[data-hs-textarea-auto-height]:not(.--prevent-on-load-init)"
    ).forEach((el) => {
      if (!window.$hsTextareaAutoHeightCollection.find(
        (elC) => elC?.element?.el === el
      )) {
        const data = el.getAttribute("data-hs-textarea-auto-height");
        const options = data ? JSON.parse(data) : {};
        new HSTextareaAutoHeight(el, options);
      }
    });
  }
}
window.addEventListener("load", () => {
  HSTextareaAutoHeight.autoInit();
});
if (typeof window !== "undefined") {
  window.HSTextareaAutoHeight = HSTextareaAutoHeight;
}

/*
 * HSThemeSwitch
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSThemeSwitch extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-theme-switch");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.theme = concatOptions?.theme || localStorage.getItem("hs_theme") || "default";
    this.type = concatOptions?.type || "change";
    this.themeSet = ["light", "dark", "default"];
    this.init();
  }
  elementChange(evt) {
    const theme = evt.target.checked ? "dark" : "default";
    this.setAppearance(theme);
    this.toggleObserveSystemTheme();
  }
  elementClick(theme) {
    this.setAppearance(theme);
    this.toggleObserveSystemTheme();
  }
  init() {
    this.createCollection(window.$hsThemeSwitchCollection, this);
    if (this.theme !== "default") this.setAppearance();
    if (this.type === "click") this.buildSwitchTypeOfClick();
    else this.buildSwitchTypeOfChange();
  }
  buildSwitchTypeOfChange() {
    this.el.checked = this.theme === "dark";
    this.toggleObserveSystemTheme();
    this.onElementChangeListener = (evt) => this.elementChange(evt);
    this.el.addEventListener("change", this.onElementChangeListener);
  }
  buildSwitchTypeOfClick() {
    const theme = this.el.getAttribute("data-hs-theme-click-value");
    this.toggleObserveSystemTheme();
    this.onElementClickListener = () => this.elementClick(theme);
    this.el.addEventListener("click", this.onElementClickListener);
  }
  setResetStyles() {
    const style = document.createElement("style");
    style.innerText = `*{transition: unset !important;}`;
    style.setAttribute("data-hs-appearance-onload-styles", "");
    document.head.appendChild(style);
    return style;
  }
  addSystemThemeObserver() {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches }) => {
      if (matches) this.setAppearance("dark", false);
      else this.setAppearance("default", false);
    });
  }
  removeSystemThemeObserver() {
    window.matchMedia("(prefers-color-scheme: dark)").removeEventListener;
  }
  toggleObserveSystemTheme() {
    if (localStorage.getItem("hs_theme") === "auto")
      this.addSystemThemeObserver();
    else this.removeSystemThemeObserver();
  }
  // Public methods
  setAppearance(theme = this.theme, isSaveToLocalStorage = true, isSetDispatchEvent = true) {
    const html = document.querySelector("html");
    const resetStyles = this.setResetStyles();
    if (isSaveToLocalStorage) localStorage.setItem("hs_theme", theme);
    if (theme === "auto")
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default";
    html.classList.remove("light", "dark", "default", "auto");
    html.classList.add(theme);
    setTimeout(() => resetStyles.remove());
    if (isSetDispatchEvent)
      window.dispatchEvent(
        new CustomEvent("on-hs-appearance-change", { detail: theme })
      );
  }
  destroy() {
    if (this.type === "change")
      this.el.removeEventListener("change", this.onElementChangeListener);
    if (this.type === "click")
      this.el.removeEventListener("click", this.onElementClickListener);
    window.$hsThemeSwitchCollection = window.$hsThemeSwitchCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsThemeSwitchCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsThemeSwitchCollection) window.$hsThemeSwitchCollection = [];
    if (window.$hsThemeSwitchCollection)
      window.$hsThemeSwitchCollection = window.$hsThemeSwitchCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-theme-switch]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsThemeSwitchCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSThemeSwitch(el, { type: "change" });
    });
    document.querySelectorAll(
      "[data-hs-theme-click-value]:not(.--prevent-on-load-init)"
    ).forEach((el) => {
      if (!window.$hsThemeSwitchCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSThemeSwitch(el, { type: "click" });
    });
  }
}
window.addEventListener("load", () => {
  HSThemeSwitch.autoInit();
});
if (window.$hsThemeSwitchCollection) {
  window.addEventListener(
    "on-hs-appearance-change",
    (evt) => {
      window.$hsThemeSwitchCollection.forEach((el) => {
        el.element.el.checked = evt.detail === "dark";
      });
    }
  );
}
if (typeof window !== "undefined") {
  window.HSThemeSwitch = HSThemeSwitch;
}

/*
 * HSToggleCount
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSToggleCount extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-toggle-count");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.target = concatOptions?.target ? typeof concatOptions?.target === "string" ? document.querySelector(concatOptions.target) : concatOptions.target : null;
    this.min = concatOptions?.min || 0;
    this.max = concatOptions?.max || 0;
    this.duration = concatOptions?.duration || 700;
    this.isChecked = this.target.checked || false;
    if (this.target) this.init();
  }
  toggleChange() {
    this.isChecked = !this.isChecked;
    this.toggle();
  }
  init() {
    this.createCollection(window.$hsToggleCountCollection, this);
    if (this.isChecked) this.el.innerText = String(this.max);
    this.onToggleChangeListener = () => this.toggleChange();
    this.target.addEventListener("change", this.onToggleChangeListener);
  }
  toggle() {
    if (this.isChecked) this.countUp();
    else this.countDown();
  }
  animate(from, to) {
    let startTimestamp = 0;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min(
        (timestamp - startTimestamp) / this.duration,
        1
      );
      this.el.innerText = String(Math.floor(progress * (to - from) + from));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }
  // Public methods
  countUp() {
    this.animate(this.min, this.max);
  }
  countDown() {
    this.animate(this.max, this.min);
  }
  destroy() {
    this.target.removeEventListener("change", this.onToggleChangeListener);
    window.$hsToggleCountCollection = window.$hsToggleCountCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsToggleCountCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsToggleCountCollection) window.$hsToggleCountCollection = [];
    if (window.$hsToggleCountCollection)
      window.$hsToggleCountCollection = window.$hsToggleCountCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-toggle-count]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsToggleCountCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSToggleCount(el);
    });
  }
}
window.addEventListener("load", () => {
  HSToggleCount.autoInit();
});
if (typeof window !== "undefined") {
  window.HSToggleCount = HSToggleCount;
}

/*
 * HSTogglePassword
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSTogglePassword extends HSBasePlugin {
  constructor(el, options) {
    super(el, options);
    const data = el.getAttribute("data-hs-toggle-password");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    const targets = [];
    if (concatOptions?.target && typeof concatOptions?.target === "string") {
      const ids = concatOptions?.target.split(",");
      ids.forEach((id) => {
        targets.push(document.querySelector(id));
      });
    } else if (concatOptions?.target && typeof concatOptions?.target === "object") {
      concatOptions.target.forEach(
        (el2) => targets.push(document.querySelector(el2))
      );
    } else {
      concatOptions.target.forEach(
        (el2) => targets.push(el2)
      );
    }
    this.target = targets;
    this.isShown = this.el.hasAttribute("type") ? this.el.checked : false;
    this.eventType = isFormElement(this.el) ? "change" : "click";
    this.isMultiple = this.target.length > 1 && !!this.el.closest("[data-hs-toggle-password-group]");
    if (this.target) this.init();
  }
  elementAction() {
    if (this.isShown) {
      this.hide();
    } else {
      this.show();
    }
    this.fireEvent("toggle", this.target);
    dispatch("toggle.hs.toggle-select", this.el, this.target);
  }
  init() {
    this.createCollection(window.$hsTogglePasswordCollection, this);
    if (!this.isShown) {
      this.hide();
    } else {
      this.show();
    }
    this.onElementActionListener = () => this.elementAction();
    this.el.addEventListener(this.eventType, this.onElementActionListener);
  }
  getMultipleToggles() {
    const group = this.el.closest("[data-hs-toggle-password-group]");
    const toggles = group.querySelectorAll("[data-hs-toggle-password]");
    const togglesInCollection = [];
    toggles.forEach((el) => {
      togglesInCollection.push(
        HSTogglePassword.getInstance(el)
      );
    });
    return togglesInCollection;
  }
  // Public methods
  show() {
    if (this.isMultiple) {
      const toggles = this.getMultipleToggles();
      toggles.forEach(
        (el) => el ? el.isShown = true : false
      );
      this.el.closest("[data-hs-toggle-password-group]").classList.add("active");
    } else {
      this.isShown = true;
      this.el.classList.add("active");
    }
    this.target.forEach((el) => {
      el.type = "text";
    });
  }
  hide() {
    if (this.isMultiple) {
      const toggles = this.getMultipleToggles();
      toggles.forEach(
        (el) => el ? el.isShown = false : false
      );
      this.el.closest("[data-hs-toggle-password-group]").classList.remove("active");
    } else {
      this.isShown = false;
      this.el.classList.remove("active");
    }
    this.target.forEach((el) => {
      el.type = "password";
    });
  }
  destroy() {
    if (this.isMultiple) {
      this.el.closest("[data-hs-toggle-password-group]").classList.remove("active");
    } else {
      this.el.classList.remove("active");
    }
    this.target.forEach((el) => {
      el.type = "password";
    });
    this.el.removeEventListener(this.eventType, this.onElementActionListener);
    this.isShown = false;
    window.$hsTogglePasswordCollection = window.$hsTogglePasswordCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsTogglePasswordCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element : null;
  }
  static autoInit() {
    if (!window.$hsTogglePasswordCollection)
      window.$hsTogglePasswordCollection = [];
    if (window.$hsTogglePasswordCollection)
      window.$hsTogglePasswordCollection = window.$hsTogglePasswordCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(
      "[data-hs-toggle-password]:not(.--prevent-on-load-init)"
    ).forEach((el) => {
      if (!window.$hsTogglePasswordCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSTogglePassword(el);
    });
  }
}
window.addEventListener("load", () => {
  HSTogglePassword.autoInit();
});
if (typeof window !== "undefined") {
  window.HSTogglePassword = HSTogglePassword;
}

/*
 * HSTooltip
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSTooltip extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    if (this.el) {
      this.toggle = this.el.querySelector(".hs-tooltip-toggle") || this.el;
      this.content = this.el.querySelector(".hs-tooltip-content");
      this.eventMode = getClassProperty(this.el, "--trigger") || "hover";
      this.preventPopper = getClassProperty(
        this.el,
        "--prevent-popper",
        "false"
      );
      this.placement = getClassProperty(this.el, "--placement");
      this.strategy = getClassProperty(
        this.el,
        "--strategy"
      );
      this.scope = getClassProperty(this.el, "--scope") || "parent";
    }
    if (this.el && this.toggle && this.content) this.init();
  }
  toggleClick() {
    this.click();
  }
  toggleFocus() {
    this.focus();
  }
  toggleMouseEnter() {
    this.enter();
  }
  toggleMouseLeave() {
    this.leave();
  }
  toggleHandle() {
    this.hide();
    this.toggle.removeEventListener("click", this.onToggleHandleListener, true);
    this.toggle.removeEventListener("blur", this.onToggleHandleListener, true);
  }
  init() {
    this.createCollection(window.$hsTooltipCollection, this);
    if (this.eventMode === "click") {
      this.onToggleClickListener = () => this.toggleClick();
      this.toggle.addEventListener("click", this.onToggleClickListener);
    } else if (this.eventMode === "focus") {
      this.onToggleFocusListener = () => this.toggleFocus();
      this.toggle.addEventListener("click", this.onToggleFocusListener);
    } else if (this.eventMode === "hover") {
      this.onToggleMouseEnterListener = () => this.toggleMouseEnter();
      this.onToggleMouseLeaveListener = () => this.toggleMouseLeave();
      this.toggle.addEventListener(
        "mouseenter",
        this.onToggleMouseEnterListener
      );
      this.toggle.addEventListener(
        "mouseleave",
        this.onToggleMouseLeaveListener
      );
    }
    if (this.preventPopper === "false") this.buildPopper();
  }
  enter() {
    this._show();
  }
  leave() {
    this.hide();
  }
  click() {
    if (this.el.classList.contains("show")) return false;
    this._show();
    this.onToggleHandleListener = () => {
      setTimeout(() => this.toggleHandle());
    };
    this.toggle.addEventListener("click", this.onToggleHandleListener, true);
    this.toggle.addEventListener("blur", this.onToggleHandleListener, true);
  }
  focus() {
    this._show();
    const handle = () => {
      this.hide();
      this.toggle.removeEventListener("blur", handle, true);
    };
    this.toggle.addEventListener("blur", handle, true);
  }
  buildPopper() {
    if (this.scope === "window") document.body.appendChild(this.content);
    this.popperInstance = createPopper(this.toggle, this.content, {
      placement: POSITIONS[this.placement] || "top",
      strategy: this.strategy || "fixed",
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 5]
          }
        }
      ]
    });
  }
  _show() {
    this.content.classList.remove("hidden");
    if (this.scope === "window") this.content.classList.add("show");
    if (this.preventPopper === "false") {
      this.popperInstance.setOptions((options) => ({
        ...options,
        modifiers: [
          ...options.modifiers,
          {
            name: "eventListeners",
            enabled: true
          }
        ]
      }));
      this.popperInstance.update();
    }
    setTimeout(() => {
      this.el.classList.add("show");
      this.fireEvent("show", this.el);
      dispatch("show.hs.tooltip", this.el, this.el);
    });
  }
  // Public methods
  show() {
    switch (this.eventMode) {
      case "click":
        this.click();
        break;
      case "focus":
        this.focus();
        break;
      default:
        this.enter();
        break;
    }
    this.toggle.focus();
    this.toggle.style.outline = "none";
  }
  hide() {
    this.el.classList.remove("show");
    if (this.scope === "window") this.content.classList.remove("show");
    if (this.preventPopper === "false") {
      this.popperInstance.setOptions((options) => ({
        ...options,
        modifiers: [
          ...options.modifiers,
          {
            name: "eventListeners",
            enabled: false
          }
        ]
      }));
    }
    this.fireEvent("hide", this.el);
    dispatch("hide.hs.tooltip", this.el, this.el);
    afterTransition(this.content, () => {
      if (this.el.classList.contains("show")) return false;
      this.content.classList.add("hidden");
      this.toggle.style.outline = "";
    });
  }
  destroy() {
    this.el.classList.remove("show");
    this.content.classList.add("hidden");
    if (this.eventMode === "click") {
      this.toggle.removeEventListener("click", this.onToggleClickListener);
    } else if (this.eventMode === "focus") {
      this.toggle.removeEventListener("click", this.onToggleFocusListener);
    } else if (this.eventMode === "hover") {
      this.toggle.removeEventListener(
        "mouseenter",
        this.onToggleMouseEnterListener
      );
      this.toggle.removeEventListener(
        "mouseleave",
        this.onToggleMouseLeaveListener
      );
    }
    this.toggle.removeEventListener("click", this.onToggleHandleListener, true);
    this.toggle.removeEventListener("blur", this.onToggleHandleListener, true);
    this.popperInstance.destroy();
    this.popperInstance = null;
    window.$hsTooltipCollection = window.$hsTooltipCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static findInCollection(target) {
    return window.$hsTooltipCollection.find((el) => {
      if (target instanceof HSTooltip) return el.element.el === target.el;
      else if (typeof target === "string") return el.element.el === document.querySelector(target);
      else return el.element.el === target;
    }) || null;
  }
  static getInstance(target, isInstance = false) {
    const elInCollection = window.$hsTooltipCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsTooltipCollection) window.$hsTooltipCollection = [];
    if (window.$hsTooltipCollection)
      window.$hsTooltipCollection = window.$hsTooltipCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll(".hs-tooltip:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsTooltipCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSTooltip(el);
    });
  }
  static show(target) {
    const instance = HSTooltip.findInCollection(target);
    if (instance) instance.element.show();
  }
  static hide(target) {
    const instance = HSTooltip.findInCollection(target);
    if (instance) instance.element.hide();
  }
  // Backward compatibility
  static on(evt, target, cb) {
    const instance = HSTooltip.findInCollection(target);
    if (instance) instance.element.events[evt] = cb;
  }
}
window.addEventListener("load", () => {
  HSTooltip.autoInit();
});
if (typeof window !== "undefined") {
  window.HSTooltip = HSTooltip;
}

/*
 * HSTreeView
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSTreeView extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.items = [];
    const data = el.getAttribute("data-hs-tree-view");
    const dataOptions = data ? JSON.parse(data) : {};
    const concatOptions = {
      ...dataOptions,
      ...options
    };
    this.controlBy = concatOptions?.controlBy || "button";
    this.autoSelectChildren = concatOptions?.autoSelectChildren || false;
    this.isIndeterminate = concatOptions?.isIndeterminate || true;
    this.onElementClickListener = [];
    this.onControlChangeListener = [];
    this.init();
  }
  static {
    this.group = 0;
  }
  elementClick(evt, el, data) {
    evt.stopPropagation();
    if (el.classList.contains("disabled")) return false;
    if (!evt.metaKey && !evt.shiftKey) this.unselectItem(data);
    this.selectItem(el, data);
    this.fireEvent("click", {
      el,
      data
    });
    dispatch("click.hs.treeView", this.el, {
      el,
      data
    });
  }
  controlChange(el, data) {
    if (this.autoSelectChildren) {
      this.selectItem(el, data);
      if (data.isDir) this.selectChildren(el, data);
      this.toggleParent(el);
    } else this.selectItem(el, data);
  }
  init() {
    this.createCollection(window.$hsTreeViewCollection, this);
    HSTreeView.group += 1;
    this.initItems();
  }
  initItems() {
    this.el.querySelectorAll("[data-hs-tree-view-item]").forEach((el, ind) => {
      const data = JSON.parse(el.getAttribute("data-hs-tree-view-item"));
      if (!el.id) el.id = `tree-view-item-${HSTreeView.group}-${ind}`;
      const concatData = {
        ...data,
        id: data.id ?? el.id,
        path: this.getPath(el),
        isSelected: data.isSelected ?? false
      };
      this.items.push(concatData);
      if (this.controlBy === "checkbox") this.controlByCheckbox(el, concatData);
      else this.controlByButton(el, concatData);
    });
  }
  controlByButton(el, data) {
    this.onElementClickListener.push({
      el,
      fn: (evt) => this.elementClick(evt, el, data)
    });
    el.addEventListener(
      "click",
      this.onElementClickListener.find((elI) => elI.el === el).fn
    );
  }
  controlByCheckbox(el, data) {
    const control = el.querySelector(`input[value="${data.value}"]`);
    if (!!control) {
      this.onControlChangeListener.push({
        el: control,
        fn: () => this.controlChange(el, data)
      });
      control.addEventListener(
        "change",
        this.onControlChangeListener.find((elI) => elI.el === control).fn
      );
    }
  }
  getItem(id) {
    return this.items.find((el) => el.id === id);
  }
  getPath(el) {
    const path = [];
    let parent = el.closest("[data-hs-tree-view-item]");
    while (!!parent) {
      const data = JSON.parse(parent.getAttribute("data-hs-tree-view-item"));
      path.push(data.value);
      parent = parent.parentElement?.closest("[data-hs-tree-view-item]");
    }
    return path.reverse().join("/");
  }
  unselectItem(exception = null) {
    let selectedItems = this.getSelectedItems();
    if (exception)
      selectedItems = selectedItems.filter((el) => el.id !== exception.id);
    if (selectedItems.length) {
      selectedItems.forEach((el) => {
        const selectedElement = document.querySelector(`#${el.id}`);
        selectedElement.classList.remove("selected");
        this.changeItemProp(el.id, "isSelected", false);
      });
    }
  }
  selectItem(el, data) {
    if (data.isSelected) {
      el.classList.remove("selected");
      this.changeItemProp(data.id, "isSelected", false);
    } else {
      el.classList.add("selected");
      this.changeItemProp(data.id, "isSelected", true);
    }
  }
  selectChildren(el, data) {
    const items = el.querySelectorAll("[data-hs-tree-view-item]");
    Array.from(items).filter((elI) => !elI.classList.contains("disabled")).forEach((elI) => {
      const initialItemData = elI.id ? this.getItem(elI.id) : null;
      if (!initialItemData) return false;
      if (data.isSelected) {
        elI.classList.add("selected");
        this.changeItemProp(initialItemData.id, "isSelected", true);
      } else {
        elI.classList.remove("selected");
        this.changeItemProp(initialItemData.id, "isSelected", false);
      }
      const currentItemData = this.getItem(elI.id);
      const control = elI.querySelector(
        `input[value="${currentItemData.value}"]`
      );
      if (this.isIndeterminate) control.indeterminate = false;
      if (currentItemData.isSelected) control.checked = true;
      else control.checked = false;
    });
  }
  toggleParent(el) {
    let parent = el.parentElement?.closest("[data-hs-tree-view-item]");
    while (!!parent) {
      const items = parent.querySelectorAll(
        "[data-hs-tree-view-item]:not(.disabled)"
      );
      const data = JSON.parse(parent.getAttribute("data-hs-tree-view-item"));
      const control = parent.querySelector(
        `input[value="${data.value}"]`
      );
      let hasUnchecked = false;
      let checkedItems = 0;
      items.forEach((elI) => {
        const dataI = this.getItem(elI.id);
        if (dataI.isSelected) checkedItems += 1;
        if (!dataI.isSelected) hasUnchecked = true;
      });
      if (hasUnchecked) {
        parent.classList.remove("selected");
        this.changeItemProp(parent.id, "isSelected", false);
        control.checked = false;
      } else {
        parent.classList.add("selected");
        this.changeItemProp(parent.id, "isSelected", true);
        control.checked = true;
      }
      if (this.isIndeterminate) {
        if (checkedItems > 0 && checkedItems < items.length)
          control.indeterminate = true;
        else control.indeterminate = false;
      }
      parent = parent.parentElement?.closest("[data-hs-tree-view-item]");
    }
  }
  // Public methods
  update() {
    this.items.map((el) => {
      const selector = document.querySelector(`#${el.id}`);
      if (el.path !== this.getPath(selector)) el.path = this.getPath(selector);
      return el;
    });
  }
  getSelectedItems() {
    return this.items.filter((el) => el.isSelected);
  }
  changeItemProp(id, prop, val) {
    this.items.map((el) => {
      if (el.id === id) el[prop] = val;
      return el;
    });
  }
  destroy() {
    this.onElementClickListener.forEach(({ el, fn }) => {
      el.removeEventListener("click", fn);
    });
    if (this.onControlChangeListener.length)
      this.onElementClickListener.forEach(({ el, fn }) => {
        el.removeEventListener("change", fn);
      });
    this.unselectItem();
    this.items = [];
    window.$hsTreeViewCollection = window.$hsTreeViewCollection.filter(
      ({ element }) => element.el !== this.el
    );
    HSTreeView.group -= 1;
  }
  // Static methods
  static findInCollection(target) {
    return window.$hsTreeViewCollection.find((el) => {
      if (target instanceof HSTreeView) return el.element.el === target.el;
      else if (typeof target === "string") return el.element.el === document.querySelector(target);
      else return el.element.el === target;
    }) || null;
  }
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsTreeViewCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsTreeViewCollection) window.$hsTreeViewCollection = [];
    if (window.$hsTreeViewCollection)
      window.$hsTreeViewCollection = window.$hsTreeViewCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-tree-view]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsTreeViewCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSTreeView(el);
    });
  }
  // Backward compatibility
  static on(evt, target, cb) {
    const instance = HSTreeView.findInCollection(target);
    console.log(1);
    if (instance) instance.element.events[evt] = cb;
  }
}
window.addEventListener("load", () => {
  HSTreeView.autoInit();
});
if (typeof window !== "undefined") {
  window.HSTreeView = HSTreeView;
}

/*
 * HSDataTable
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSDataTable extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    const columnDefs = [];
    Array.from(this.el.querySelectorAll("thead th, thead td")).forEach(
      (th, ind) => {
        if (th.classList.contains("--exclude-from-ordering"))
          columnDefs.push({
            targets: ind,
            orderable: false
          });
      }
    );
    const data = this.el.getAttribute("data-hs-datatable");
    const dataOptions = data ? JSON.parse(data) : {};
    this.concatOptions = {
      searching: true,
      lengthChange: false,
      order: [],
      columnDefs: [...columnDefs],
      ...dataOptions,
      ...options
    };
    this.table = this.el.querySelector("table");
    this.searches = Array.from(this.el.querySelectorAll("[data-hs-datatable-search]")) ?? null;
    this.pageEntitiesList = Array.from(this.el.querySelectorAll("[data-hs-datatable-page-entities]")) ?? null;
    this.pagingList = Array.from(this.el.querySelectorAll("[data-hs-datatable-paging]")) ?? null;
    this.pagingPagesList = Array.from(this.el.querySelectorAll("[data-hs-datatable-paging-pages]")) ?? null;
    this.pagingPrevList = Array.from(this.el.querySelectorAll("[data-hs-datatable-paging-prev]")) ?? null;
    this.pagingNextList = Array.from(this.el.querySelectorAll("[data-hs-datatable-paging-next]")) ?? null;
    this.infoList = Array.from(this.el.querySelectorAll("[data-hs-datatable-info]")) ?? null;
    if (this.concatOptions?.rowSelectingOptions)
      this.rowSelectingAll = (this.concatOptions?.rowSelectingOptions?.selectAllSelector ? document.querySelector(
        this.concatOptions?.rowSelectingOptions?.selectAllSelector
      ) : document.querySelector("[data-hs-datatable-row-selecting-all]")) ?? null;
    if (this.concatOptions?.rowSelectingOptions)
      this.rowSelectingIndividual = this.concatOptions?.rowSelectingOptions?.individualSelector ?? "[data-hs-datatable-row-selecting-individual]" ?? null;
    if (this.pageEntitiesList.length) this.concatOptions.pageLength = parseInt(this.pageEntitiesList[0].value);
    this.maxPagesToShow = 3;
    this.isRowSelecting = !!this.concatOptions?.rowSelectingOptions;
    this.pageBtnClasses = this.concatOptions?.pagingOptions?.pageBtnClasses ?? null;
    this.onSearchInputListener = [];
    this.onPageEntitiesChangeListener = [];
    this.onSinglePagingClickListener = [];
    this.onPagingPrevClickListener = [];
    this.onPagingNextClickListener = [];
    this.init();
  }
  init() {
    this.createCollection(window.$hsDataTableCollection, this);
    this.initTable();
    if (this.searches.length) this.initSearch();
    if (this.pageEntitiesList.length) this.initPageEntities();
    if (this.pagingList.length) this.initPaging();
    if (this.pagingPagesList.length) this.buildPagingPages();
    if (this.pagingPrevList.length) this.initPagingPrev();
    if (this.pagingNextList.length) this.initPagingNext();
    if (this.infoList.length) this.initInfo();
    if (this.isRowSelecting) this.initRowSelecting();
  }
  initTable() {
    this.dataTable = new DataTable(this.table, this.concatOptions);
    if (this.isRowSelecting) this.triggerChangeEventToRow();
    this.dataTable.on("draw", () => {
      if (this.isRowSelecting) this.updateSelectAllCheckbox();
      if (this.isRowSelecting) this.triggerChangeEventToRow();
      this.updateInfo();
      this.pagingPagesList.forEach((el) => this.updatePaging(el));
    });
  }
  searchInput(evt) {
    this.onSearchInput(evt.target.value);
  }
  pageEntitiesChange(evt) {
    this.onEntitiesChange(parseInt(evt.target.value), evt.target);
  }
  pagingPrevClick() {
    this.onPrevClick();
  }
  pagingNextClick() {
    this.onNextClick();
  }
  rowSelectingAllChange() {
    this.onSelectAllChange();
  }
  singlePagingClick(count) {
    this.onPageClick(count);
  }
  // Search
  initSearch() {
    this.searches.forEach((el) => {
      this.onSearchInputListener.push({
        el,
        fn: debounce$1((evt) => this.searchInput(evt))
      });
      el.addEventListener("input", this.onSearchInputListener.find((search) => search.el === el).fn);
    });
  }
  onSearchInput(val) {
    this.dataTable.search(val).draw();
  }
  // Page entities
  initPageEntities() {
    this.pageEntitiesList.forEach((el) => {
      this.onPageEntitiesChangeListener.push({
        el,
        fn: (evt) => this.pageEntitiesChange(evt)
      });
      el.addEventListener("change", this.onPageEntitiesChangeListener.find((pageEntity) => pageEntity.el === el).fn);
    });
  }
  onEntitiesChange(entities, target) {
    const otherEntities = this.pageEntitiesList.filter((el) => el !== target);
    if (otherEntities.length) otherEntities.forEach((el) => {
      if (window.HSSelect) {
        const hsSelectInstance = window.HSSelect.getInstance(el, true);
        if (hsSelectInstance) hsSelectInstance.element.setValue(`${entities}`);
      } else el.value = `${entities}`;
    });
    this.dataTable.page.len(entities).draw();
  }
  // Info
  initInfo() {
    this.infoList.forEach((el) => {
      this.initInfoFrom(el);
      this.initInfoTo(el);
      this.initInfoLength(el);
    });
  }
  initInfoFrom(el) {
    const infoFrom = el.querySelector("[data-hs-datatable-info-from]") ?? null;
    const { start } = this.dataTable.page.info();
    if (infoFrom) infoFrom.innerText = `${start + 1}`;
  }
  initInfoTo(el) {
    const infoTo = el.querySelector("[data-hs-datatable-info-to]") ?? null;
    const { end } = this.dataTable.page.info();
    if (infoTo) infoTo.innerText = `${end}`;
  }
  initInfoLength(el) {
    const infoLength = el.querySelector("[data-hs-datatable-info-length]") ?? null;
    const { recordsTotal } = this.dataTable.page.info();
    if (infoLength) infoLength.innerText = `${recordsTotal}`;
  }
  updateInfo() {
    this.initInfo();
  }
  // Paging
  initPaging() {
    this.pagingList.forEach((el) => this.hidePagingIfSinglePage(el));
  }
  hidePagingIfSinglePage(el) {
    const { pages } = this.dataTable.page.info();
    if (pages < 2) {
      el.classList.add("hidden");
      el.style.display = "none";
    } else {
      el.classList.remove("hidden");
      el.style.display = "";
    }
  }
  initPagingPrev() {
    this.pagingPrevList.forEach((el) => {
      this.onPagingPrevClickListener.push({
        el,
        fn: () => this.pagingPrevClick()
      });
      el.addEventListener("click", this.onPagingPrevClickListener.find((pagingPrev) => pagingPrev.el === el).fn);
    });
  }
  onPrevClick() {
    this.dataTable.page("previous").draw("page");
  }
  disablePagingArrow(el, statement) {
    if (statement) {
      el.classList.add("disabled");
      el.setAttribute("disabled", "disabled");
    } else {
      el.classList.remove("disabled");
      el.removeAttribute("disabled");
    }
  }
  initPagingNext() {
    this.pagingNextList.forEach((el) => {
      this.onPagingNextClickListener.push({
        el,
        fn: () => this.pagingNextClick()
      });
      el.addEventListener("click", this.onPagingNextClickListener.find((pagingNext) => pagingNext.el === el).fn);
    });
  }
  onNextClick() {
    this.dataTable.page("next").draw("page");
  }
  buildPagingPages() {
    this.pagingPagesList.forEach((el) => this.updatePaging(el));
  }
  updatePaging(pagingPages) {
    const { page, pages, length } = this.dataTable.page.info();
    const totalRecords = this.dataTable.rows({ search: "applied" }).count();
    const totalPages = Math.ceil(totalRecords / length);
    const currentPage = page + 1;
    let startPage = Math.max(1, currentPage - Math.floor(this.maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + (this.maxPagesToShow - 1));
    if (endPage - startPage + 1 < this.maxPagesToShow) {
      startPage = Math.max(1, endPage - this.maxPagesToShow + 1);
    }
    pagingPages.innerHTML = "";
    if (startPage > 1) {
      this.buildPagingPage(1, pagingPages);
      if (startPage > 2) pagingPages.appendChild(htmlToElement(`<span class="ellipsis">...</span>`));
    }
    for (let i = startPage; i <= endPage; i++) {
      this.buildPagingPage(i, pagingPages);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pagingPages.appendChild(htmlToElement(`<span class="ellipsis">...</span>`));
      this.buildPagingPage(totalPages, pagingPages);
    }
    this.pagingPrevList.forEach((el) => this.disablePagingArrow(el, page === 0));
    this.pagingNextList.forEach((el) => this.disablePagingArrow(el, page === pages - 1));
    this.pagingList.forEach((el) => this.hidePagingIfSinglePage(el));
  }
  buildPagingPage(counter, target) {
    const { page } = this.dataTable.page.info();
    const pageEl = htmlToElement(`<button type="button"></button>`);
    pageEl.innerText = `${counter}`;
    pageEl.setAttribute("data-page", `${counter}`);
    if (this.pageBtnClasses) classToClassList(this.pageBtnClasses, pageEl);
    if (page === counter - 1) pageEl.classList.add("active");
    this.onSinglePagingClickListener.push({
      el: pageEl,
      fn: () => this.singlePagingClick(counter)
    });
    pageEl.addEventListener("click", this.onSinglePagingClickListener.find((singlePaging) => singlePaging.el === pageEl).fn);
    target.append(pageEl);
  }
  onPageClick(counter) {
    this.dataTable.page(counter - 1).draw("page");
  }
  // Select row
  initRowSelecting() {
    this.onRowSelectingAllChangeListener = () => this.rowSelectingAllChange();
    this.rowSelectingAll.addEventListener(
      "change",
      this.onRowSelectingAllChangeListener
    );
  }
  triggerChangeEventToRow() {
    this.table.querySelectorAll(`tbody ${this.rowSelectingIndividual}`).forEach((el) => {
      el.addEventListener("change", () => {
        this.updateSelectAllCheckbox();
      });
    });
  }
  onSelectAllChange() {
    let isChecked = this.rowSelectingAll.checked;
    const visibleRows = Array.from(
      this.dataTable.rows({ page: "current", search: "applied" }).nodes()
    );
    visibleRows.forEach((el) => {
      const checkbox = el.querySelector(this.rowSelectingIndividual);
      if (checkbox) checkbox.checked = isChecked;
    });
    this.updateSelectAllCheckbox();
  }
  updateSelectAllCheckbox() {
    const searchRelatedItems = this.dataTable.rows({ search: "applied" }).count();
    if (!searchRelatedItems) {
      this.rowSelectingAll.checked = false;
      return false;
    }
    let isChecked = true;
    const visibleRows = Array.from(
      this.dataTable.rows({
        page: "current",
        search: "applied"
      }).nodes()
    );
    visibleRows.forEach((el) => {
      const checkbox = el.querySelector(this.rowSelectingIndividual);
      if (checkbox && !checkbox.checked) {
        isChecked = false;
        return false;
      }
    });
    this.rowSelectingAll.checked = isChecked;
  }
  // Public methods
  destroy() {
    if (this.searches) {
      this.onSearchInputListener.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    }
    if (this.pageEntitiesList) this.onPageEntitiesChangeListener.forEach(({ el, fn }) => el.removeEventListener("change", fn));
    if (this.pagingPagesList.length) {
      this.onSinglePagingClickListener.forEach(({ el, fn }) => el.removeEventListener("click", fn));
      this.pagingPagesList.forEach((el) => el.innerHTML = "");
    }
    if (this.pagingPrevList.length) this.onPagingPrevClickListener.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    if (this.pagingNextList.length) this.onPagingNextClickListener.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    if (this.rowSelectingAll)
      this.rowSelectingAll.removeEventListener(
        "change",
        this.onRowSelectingAllChangeListener
      );
    this.dataTable.destroy();
    this.rowSelectingAll = null;
    this.rowSelectingIndividual = null;
    window.$hsDataTableCollection = window.$hsDataTableCollection.filter(({ element }) => element.el !== this.el);
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsDataTableCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsDataTableCollection) window.$hsDataTableCollection = [];
    if (window.$hsDataTableCollection)
      window.$hsDataTableCollection = window.$hsDataTableCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-datatable]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsDataTableCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSDataTable(el);
    });
  }
}
window.addEventListener("load", () => {
  if (document.querySelectorAll(
    "[data-hs-datatable]:not(.--prevent-on-load-init)"
  ).length) {
    if (typeof jQuery === "undefined")
      console.error(
        "HSDataTable: jQuery is not available, please add it to the page."
      );
    if (typeof DataTable === "undefined")
      console.error(
        "HSDataTable: DataTable is not available, please add it to the page."
      );
  }
  if (typeof DataTable !== "undefined" && typeof jQuery !== "undefined")
    HSDataTable.autoInit();
});
if (typeof window !== "undefined") {
  window.HSDataTable = HSDataTable;
}

/*
 * HSFileUpload
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
if (typeof Dropzone !== "undefined") Dropzone.autoDiscover = false;
class HSFileUpload extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    this.extensions = {};
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    const data = this.el.getAttribute("data-hs-file-upload");
    const dataOptions = data ? JSON.parse(data) : {};
    this.previewTemplate = this.el.querySelector("[data-hs-file-upload-preview]")?.innerHTML || `<div class="p-3 bg-white border border-solid border-gray-300 rounded-xl dark:bg-neutral-800 dark:border-neutral-600">
			<div class="mb-2 flex justify-between items-center">
				<div class="flex items-center gap-x-3">
					<span class="size-8 flex justify-center items-center border border-gray-200 text-gray-500 rounded-lg dark:border-neutral-700 dark:text-neutral-500" data-hs-file-upload-file-icon></span>
					<div>
						<p class="text-sm font-medium text-gray-800 dark:text-white">
							<span class="truncate inline-block max-w-[300px] align-bottom" data-hs-file-upload-file-name></span>.<span data-hs-file-upload-file-ext></span>
						</p>
						<p class="text-xs text-gray-500 dark:text-neutral-500" data-hs-file-upload-file-size></p>
					</div>
				</div>
				<div class="inline-flex items-center gap-x-2">
					<button type="button" class="text-gray-500 hover:text-gray-800 dark:text-neutral-500 dark:hover:text-neutral-200" data-hs-file-upload-remove>
						<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
					</button>
				</div>
			</div>
			<div class="flex items-center gap-x-3 whitespace-nowrap">
				<div class="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" data-hs-file-upload-progress-bar>
					<div class="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition-all duration-500 hs-file-upload-complete:bg-green-600 dark:bg-blue-500" style="width: 0" data-hs-file-upload-progress-bar-pane></div>
				</div>
				<div class="w-10 text-end">
					<span class="text-sm text-gray-800 dark:text-white">
						<span data-hs-file-upload-progress-bar-value>0</span>%
					</span>
				</div>
			</div>
		</div>`;
    this.extensions = _.merge(
      {
        default: {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
          class: "size-5"
        },
        xls: {
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0243 1.43996H7.08805C6.82501 1.43996 6.57277 1.54445 6.38677 1.73043C6.20077 1.91642 6.09631 2.16868 6.09631 2.43171V6.64796L15.0243 11.856L19.4883 13.7398L23.9523 11.856V6.64796L15.0243 1.43996Z" fill="#21A366"></path><path d="M6.09631 6.64796H15.0243V11.856H6.09631V6.64796Z" fill="#107C41"></path><path d="M22.9605 1.43996H15.0243V6.64796H23.9523V2.43171C23.9523 2.16868 23.8478 1.91642 23.6618 1.73043C23.4758 1.54445 23.2235 1.43996 22.9605 1.43996Z" fill="#33C481"></path><path d="M15.0243 11.856H6.09631V21.2802C6.09631 21.5433 6.20077 21.7955 6.38677 21.9815C6.57277 22.1675 6.82501 22.272 7.08805 22.272H22.9606C23.2236 22.272 23.4759 22.1675 23.6618 21.9815C23.8478 21.7955 23.9523 21.5433 23.9523 21.2802V17.064L15.0243 11.856Z" fill="#185C37"></path><path d="M15.0243 11.856H23.9523V17.064H15.0243V11.856Z" fill="#107C41"></path><path opacity="0.1" d="M12.5446 5.15996H6.09631V19.296H12.5446C12.8073 19.2952 13.0591 19.1904 13.245 19.0046C13.4308 18.8188 13.5355 18.567 13.5363 18.3042V6.1517C13.5355 5.88892 13.4308 5.63712 13.245 5.4513C13.0591 5.26548 12.8073 5.16074 12.5446 5.15996Z" fill="black"></path><path opacity="0.2" d="M11.8006 5.90396H6.09631V20.04H11.8006C12.0633 20.0392 12.3151 19.9344 12.501 19.7486C12.6868 19.5628 12.7915 19.311 12.7923 19.0482V6.8957C12.7915 6.6329 12.6868 6.38114 12.501 6.19532C12.3151 6.0095 12.0633 5.90475 11.8006 5.90396Z" fill="black"></path><path opacity="0.2" d="M11.8006 5.90396H6.09631V18.552H11.8006C12.0633 18.5512 12.3151 18.4464 12.501 18.2606C12.6868 18.0748 12.7915 17.823 12.7923 17.5602V6.8957C12.7915 6.6329 12.6868 6.38114 12.501 6.19532C12.3151 6.0095 12.0633 5.90475 11.8006 5.90396Z" fill="black"></path><path opacity="0.2" d="M11.0566 5.90396H6.09631V18.552H11.0566C11.3193 18.5512 11.5711 18.4464 11.757 18.2606C11.9428 18.0748 12.0475 17.823 12.0483 17.5602V6.8957C12.0475 6.6329 11.9428 6.38114 11.757 6.19532C11.5711 6.0095 11.3193 5.90475 11.0566 5.90396Z" fill="black"></path><path d="M1.13604 5.90396H11.0566C11.3195 5.90396 11.5718 6.00842 11.7578 6.19442C11.9438 6.38042 12.0483 6.63266 12.0483 6.8957V16.8162C12.0483 17.0793 11.9438 17.3315 11.7578 17.5175C11.5718 17.7035 11.3195 17.808 11.0566 17.808H1.13604C0.873012 17.808 0.620754 17.7035 0.434765 17.5175C0.248775 17.3315 0.144287 17.0793 0.144287 16.8162V6.8957C0.144287 6.63266 0.248775 6.38042 0.434765 6.19442C0.620754 6.00842 0.873012 5.90396 1.13604 5.90396Z" fill="#107C41"></path><path d="M2.77283 15.576L5.18041 11.8455L2.9752 8.13596H4.74964L5.95343 10.5071C6.06401 10.7318 6.14015 10.8994 6.18185 11.01H6.19745C6.27683 10.8305 6.35987 10.6559 6.44669 10.4863L7.73309 8.13596H9.36167L7.09991 11.8247L9.41897 15.576H7.68545L6.29489 12.972C6.22943 12.861 6.17387 12.7445 6.12899 12.6238H6.10817C6.06761 12.7419 6.01367 12.855 5.94748 12.9608L4.51676 15.576H2.77283Z" fill="white"></path></svg>',
          class: "size-5"
        },
        doc: {
          icon: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.6141 1.91994H9.45071C9.09999 1.91994 8.76367 2.05926 8.51567 2.30725C8.26767 2.55523 8.12839 2.89158 8.12839 3.24228V8.86395L20.0324 12.3359L31.9364 8.86395V3.24228C31.9364 2.89158 31.797 2.55523 31.549 2.30725C31.3011 2.05926 30.9647 1.91994 30.6141 1.91994Z" fill="#41A5EE"></path><path d="M31.9364 8.86395H8.12839V15.8079L20.0324 19.2799L31.9364 15.8079V8.86395Z" fill="#2B7CD3"></path><path d="M31.9364 15.8079H8.12839V22.7519L20.0324 26.2239L31.9364 22.7519V15.8079Z" fill="#185ABD"></path><path d="M31.9364 22.752H8.12839V28.3736C8.12839 28.7244 8.26767 29.0607 8.51567 29.3087C8.76367 29.5567 9.09999 29.696 9.45071 29.696H30.6141C30.9647 29.696 31.3011 29.5567 31.549 29.3087C31.797 29.0607 31.9364 28.7244 31.9364 28.3736V22.752Z" fill="#103F91"></path><path opacity="0.1" d="M16.7261 6.87994H8.12839V25.7279H16.7261C17.0764 25.7269 17.4121 25.5872 17.6599 25.3395C17.9077 25.0917 18.0473 24.756 18.0484 24.4056V8.20226C18.0473 7.8519 17.9077 7.51616 17.6599 7.2684C17.4121 7.02064 17.0764 6.88099 16.7261 6.87994Z" class="fill-black dark:fill-neutral-200" fill="currentColor"></path><path opacity="0.2" d="M15.7341 7.87194H8.12839V26.7199H15.7341C16.0844 26.7189 16.4201 26.5792 16.6679 26.3315C16.9157 26.0837 17.0553 25.748 17.0564 25.3976V9.19426C17.0553 8.84386 16.9157 8.50818 16.6679 8.26042C16.4201 8.01266 16.0844 7.87299 15.7341 7.87194Z" class="fill-black dark:fill-neutral-200" fill="currentColor"></path><path opacity="0.2" d="M15.7341 7.87194H8.12839V24.7359H15.7341C16.0844 24.7349 16.4201 24.5952 16.6679 24.3475C16.9157 24.0997 17.0553 23.764 17.0564 23.4136V9.19426C17.0553 8.84386 16.9157 8.50818 16.6679 8.26042C16.4201 8.01266 16.0844 7.87299 15.7341 7.87194Z" class="fill-black dark:fill-neutral-200" fill="currentColor"></path><path opacity="0.2" d="M14.7421 7.87194H8.12839V24.7359H14.7421C15.0924 24.7349 15.4281 24.5952 15.6759 24.3475C15.9237 24.0997 16.0633 23.764 16.0644 23.4136V9.19426C16.0633 8.84386 15.9237 8.50818 15.6759 8.26042C15.4281 8.01266 15.0924 7.87299 14.7421 7.87194Z" class="fill-black dark:fill-neutral-200" fill="currentColor"></path><path d="M1.51472 7.87194H14.7421C15.0927 7.87194 15.4291 8.01122 15.6771 8.25922C15.925 8.50722 16.0644 8.84354 16.0644 9.19426V22.4216C16.0644 22.7723 15.925 23.1087 15.6771 23.3567C15.4291 23.6047 15.0927 23.7439 14.7421 23.7439H1.51472C1.16401 23.7439 0.827669 23.6047 0.579687 23.3567C0.3317 23.1087 0.192383 22.7723 0.192383 22.4216V9.19426C0.192383 8.84354 0.3317 8.50722 0.579687 8.25922C0.827669 8.01122 1.16401 7.87194 1.51472 7.87194Z" fill="#185ABD"></path><path d="M12.0468 20.7679H10.2612L8.17801 13.9231L5.99558 20.7679H4.20998L2.22598 10.8479H4.01158L5.40038 17.7919L7.48358 11.0463H8.97161L10.9556 17.7919L12.3444 10.8479H14.0308L12.0468 20.7679Z" fill="white"></path></svg>',
          class: "size-5"
        },
        zip: {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v18"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="20" r="2"/><path d="M10 7V6"/><path d="M10 12v-1"/><path d="M10 18v-2"/></svg>',
          class: "size-5"
        }
      },
      dataOptions.extensions
    );
    this.singleton = dataOptions.singleton;
    this.concatOptions = {
      clickable: this.el.querySelector(
        "[data-hs-file-upload-trigger]"
      ),
      previewsContainer: this.el.querySelector(
        "[data-hs-file-upload-previews]"
      ),
      addRemoveLinks: false,
      previewTemplate: this.previewTemplate,
      autoHideTrigger: false,
      ...dataOptions,
      ...options
    };
    this.onReloadButtonClickListener = [];
    this.onTempFileInputChangeListener = [];
    this.init();
  }
  tempFileInputChange(event, file) {
    const input = event.target;
    const newFile = input.files?.[0];
    if (newFile) {
      const dzNewFile = newFile;
      dzNewFile.status = Dropzone.ADDED;
      dzNewFile.accepted = true;
      dzNewFile.previewElement = file.previewElement;
      dzNewFile.previewTemplate = file.previewTemplate;
      dzNewFile.previewsContainer = file.previewsContainer;
      this.dropzone.removeFile(file);
      this.dropzone.addFile(dzNewFile);
    }
  }
  reloadButtonClick(evt, file) {
    evt.preventDefault();
    evt.stopPropagation();
    const tempFileInput = document.createElement("input");
    tempFileInput.type = "file";
    this.onTempFileInputChangeListener.push({
      el: tempFileInput,
      fn: (event) => this.tempFileInputChange(event, file)
    });
    tempFileInput.click();
    tempFileInput.addEventListener(
      "change",
      this.onTempFileInputChangeListener.find((el) => el.el === tempFileInput).fn
    );
  }
  init() {
    this.createCollection(window.$hsFileUploadCollection, this);
    this.initDropzone();
  }
  initDropzone() {
    const clear = this.el.querySelector(
      "[data-hs-file-upload-clear]"
    );
    const pseudoTriggers = Array.from(
      this.el.querySelectorAll("[data-hs-file-upload-pseudo-trigger]")
    );
    this.dropzone = new Dropzone(this.el, this.concatOptions);
    this.dropzone.on("addedfile", (file) => this.onAddFile(file));
    this.dropzone.on("removedfile", () => this.onRemoveFile());
    this.dropzone.on(
      "uploadprogress",
      (file, progress) => this.onUploadProgress(file, progress)
    );
    this.dropzone.on("complete", (file) => this.onComplete(file));
    if (clear)
      clear.onclick = () => {
        if (this.dropzone.files.length) this.dropzone.removeAllFiles(true);
      };
    if (pseudoTriggers.length)
      pseudoTriggers.forEach((el) => {
        el.onclick = () => {
          if (this.concatOptions?.clickable)
            (this.concatOptions?.clickable).click();
        };
      });
  }
  // Public methods
  destroy() {
    this.onTempFileInputChangeListener.forEach((el) => {
      el.el.removeEventListener("change", el.fn);
    });
    this.onTempFileInputChangeListener = null;
    this.onReloadButtonClickListener.forEach((el) => {
      el.el.removeEventListener("click", el.fn);
    });
    this.onReloadButtonClickListener = null;
    this.dropzone.destroy();
    window.$hsFileUploadCollection = window.$hsFileUploadCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  onAddFile(file) {
    const { previewElement } = file;
    const reloadButton = file.previewElement.querySelector(
      "[data-hs-file-upload-reload]"
    );
    if (!previewElement) return false;
    if (this.singleton && this.dropzone.files.length > 1)
      this.dropzone.removeFile(this.dropzone.files[0]);
    if (reloadButton) {
      this.onReloadButtonClickListener.push({
        el: reloadButton,
        fn: (evt) => this.reloadButtonClick(evt, file)
      });
      reloadButton.addEventListener(
        "click",
        this.onReloadButtonClickListener.find((el) => el.el === reloadButton).fn
      );
    }
    this.previewAccepted(file);
  }
  previewAccepted(file) {
    const { previewElement } = file;
    const fileInfo = this.splitFileName(file.name);
    const fileName = previewElement.querySelector(
      "[data-hs-file-upload-file-name]"
    );
    const fileExt = previewElement.querySelector(
      "[data-hs-file-upload-file-ext]"
    );
    const fileSize = previewElement.querySelector(
      "[data-hs-file-upload-file-size]"
    );
    const fileIcon = previewElement.querySelector(
      "[data-hs-file-upload-file-icon]"
    );
    const trigger = this.el.querySelector(
      "[data-hs-file-upload-trigger]"
    );
    const preview = previewElement.querySelector(
      "[data-dz-thumbnail]"
    );
    const remove = previewElement.querySelector(
      "[data-hs-file-upload-remove]"
    );
    if (fileName) fileName.textContent = fileInfo.name;
    if (fileExt) fileExt.textContent = fileInfo.extension;
    if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
    if (preview) {
      if (file.type.includes("image/")) preview.classList.remove("hidden");
      else this.setIcon(fileInfo.extension, fileIcon);
    }
    if (this.dropzone.files.length > 0 && this.concatOptions.autoHideTrigger)
      trigger.style.display = "none";
    if (remove) remove.onclick = () => this.dropzone.removeFile(file);
  }
  onRemoveFile() {
    const trigger = this.el.querySelector(
      "[data-hs-file-upload-trigger]"
    );
    if (this.dropzone.files.length === 0 && this.concatOptions.autoHideTrigger)
      trigger.style.display = "";
  }
  onUploadProgress(file, progress) {
    const { previewElement } = file;
    if (!previewElement) return false;
    const progressBar = previewElement.querySelector(
      "[data-hs-file-upload-progress-bar]"
    );
    const progressBarPane = previewElement.querySelector(
      "[data-hs-file-upload-progress-bar-pane]"
    );
    const progressBarValue = previewElement.querySelector(
      "[data-hs-file-upload-progress-bar-value]"
    );
    const currentProgress = Math.floor(progress);
    if (progressBar)
      progressBar.setAttribute("aria-valuenow", `${currentProgress}`);
    if (progressBarPane) progressBarPane.style.width = `${currentProgress}%`;
    if (progressBarValue) progressBarValue.innerText = `${currentProgress}`;
  }
  onComplete(file) {
    const { previewElement } = file;
    if (!previewElement) return false;
    previewElement.classList.add("complete");
  }
  setIcon(ext, file) {
    const icon = this.createIcon(ext);
    file.append(icon);
  }
  createIcon(ext) {
    const icon = this.extensions[ext]?.icon ? htmlToElement(this.extensions[ext].icon) : htmlToElement(this.extensions.default.icon);
    classToClassList(
      this.extensions[ext]?.class ? this.extensions[ext].class : this.extensions.default.class,
      icon
    );
    return icon;
  }
  formatFileSize(size) {
    if (size < 1024) {
      return size.toFixed(2) + " B";
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + " KB";
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + " MB";
    } else if (size < 1024 * 1024 * 1024 * 1024) {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    } else {
      return (size / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB";
    }
  }
  splitFileName(file) {
    let dotIndex = file.lastIndexOf(".");
    if (dotIndex == -1) return { name: file, extension: "" };
    return {
      name: file.substring(0, dotIndex),
      extension: file.substring(dotIndex + 1)
    };
  }
  // Static methods
  static getInstance(target, isInstance) {
    const elInCollection = window.$hsFileUploadCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsFileUploadCollection) window.$hsFileUploadCollection = [];
    if (window.$hsFileUploadCollection)
      window.$hsFileUploadCollection = window.$hsFileUploadCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-file-upload]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsFileUploadCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSFileUpload(el);
    });
  }
}
window.addEventListener("load", () => {
  if (document.querySelectorAll(
    "[data-hs-file-upload]:not(.--prevent-on-load-init)"
  ).length) {
    if (typeof _ === "undefined")
      console.error(
        "HSFileUpload: Lodash is not available, please add it to the page."
      );
    if (typeof Dropzone === "undefined")
      console.error(
        "HSFileUpload: Dropzone is not available, please add it to the page."
      );
  }
  if (typeof _ !== "undefined" && typeof Dropzone !== "undefined") {
    HSFileUpload.autoInit();
  }
});
if (typeof window !== "undefined") {
  window.HSFileUpload = HSFileUpload;
}

/*
 * HSRangeSlider
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
class HSRangeSlider extends HSBasePlugin {
  constructor(el, options, events) {
    super(el, options, events);
    const data = el.getAttribute("data-hs-range-slider");
    const dataOptions = data ? JSON.parse(data) : {};
    this.concatOptions = {
      ...dataOptions,
      ...options,
      cssClasses: {
        ...noUiSlider.cssClasses,
        ...this.processClasses(dataOptions.cssClasses)
      }
    };
    this.init();
  }
  get formattedValue() {
    const values = this.el.noUiSlider.get();
    if (Array.isArray(values) && this.format) {
      const updateValues = [];
      values.forEach((val) => {
        updateValues.push(this.format.to(val));
      });
      return updateValues;
    } else if (this.format) {
      return this.format.to(values);
    } else {
      return values;
    }
  }
  processClasses(cl) {
    const mergedClasses = {};
    Object.keys(cl).forEach((key) => {
      if (key) mergedClasses[key] = `${noUiSlider.cssClasses[key]} ${cl[key]}`;
    });
    return mergedClasses;
  }
  init() {
    this.createCollection(window.$hsRangeSliderCollection, this);
    if (typeof this.concatOptions?.formatter === "object" ? this.concatOptions?.formatter?.type === "thousandsSeparatorAndDecimalPoints" : this.concatOptions?.formatter === "thousandsSeparatorAndDecimalPoints")
      this.thousandsSeparatorAndDecimalPointsFormatter();
    else if (typeof this.concatOptions?.formatter === "object" ? this.concatOptions?.formatter?.type === "integer" : this.concatOptions?.formatter === "integer")
      this.integerFormatter();
    else if (typeof this.concatOptions?.formatter === "object" && (this.concatOptions?.formatter?.prefix || this.concatOptions?.formatter?.postfix))
      this.prefixOrPostfixFormatter();
    noUiSlider.create(this.el, this.concatOptions);
    if (this.concatOptions.disabled) this.setDisabled();
  }
  formatValue(val) {
    let result = "";
    if (typeof this.concatOptions?.formatter === "object") {
      if (this.concatOptions?.formatter?.prefix)
        result += this.concatOptions?.formatter?.prefix;
      result += val;
      if (this.concatOptions?.formatter?.postfix)
        result += this.concatOptions?.formatter?.postfix;
    } else result += val;
    return result;
  }
  integerFormatter() {
    this.format = {
      to: (val) => this.formatValue(Math.round(val)),
      from: (val) => Math.round(+val)
    };
    if (this.concatOptions?.tooltips) this.concatOptions.tooltips = this.format;
  }
  prefixOrPostfixFormatter() {
    this.format = {
      to: (val) => this.formatValue(val),
      from: (val) => +val
    };
    if (this.concatOptions?.tooltips) this.concatOptions.tooltips = this.format;
  }
  thousandsSeparatorAndDecimalPointsFormatter() {
    this.format = {
      to: (val) => this.formatValue(
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(val)
      ),
      from: (val) => parseFloat(val.replace(/,/g, ""))
    };
    if (this.concatOptions?.tooltips) this.concatOptions.tooltips = this.format;
  }
  setDisabled() {
    this.el.setAttribute("disabled", "disabled");
    this.el.classList.add("disabled");
  }
  // Public methods
  destroy() {
    this.el.noUiSlider.destroy();
    this.format = null;
    window.$hsRangeSliderCollection = window.$hsRangeSliderCollection.filter(
      ({ element }) => element.el !== this.el
    );
  }
  // Static methods
  static getInstance(target, isInstance = false) {
    const elInCollection = window.$hsRangeSliderCollection.find(
      (el) => el.element.el === (typeof target === "string" ? document.querySelector(target) : target)
    );
    return elInCollection ? isInstance ? elInCollection : elInCollection.element.el : null;
  }
  static autoInit() {
    if (!window.$hsRangeSliderCollection) window.$hsRangeSliderCollection = [];
    if (window.$hsRangeSliderCollection)
      window.$hsRangeSliderCollection = window.$hsRangeSliderCollection.filter(
        ({ element }) => document.contains(element.el)
      );
    document.querySelectorAll("[data-hs-range-slider]:not(.--prevent-on-load-init)").forEach((el) => {
      if (!window.$hsRangeSliderCollection.find(
        (elC) => elC?.element?.el === el
      ))
        new HSRangeSlider(el);
    });
  }
}
window.addEventListener("load", () => {
  HSRangeSlider.autoInit();
});
if (typeof window !== "undefined") {
  window.HSRangeSlider = HSRangeSlider;
}

/*
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
const COLLECTIONS = [
  {
    key: "copy-markup",
    fn: HSCopyMarkup,
    collection: "$hsCopyMarkupCollection"
  },
  { key: "accordion", fn: HSAccordion, collection: "$hsAccordionCollection" },
  { key: "carousel", fn: HSCarousel, collection: "$hsCarouselCollection" },
  { key: "collapse", fn: HSCollapse, collection: "$hsCollapseCollection" },
  { key: "combobox", fn: HSComboBox, collection: "$hsComboBoxCollection" },
  { key: "datatable", fn: HSDataTable, collection: "$hsDataTableCollection" },
  { key: "dropdown", fn: HSDropdown, collection: "$hsDropdownCollection" },
  {
    key: "file-upload",
    fn: HSFileUpload,
    collection: "$hsFileUploadCollection"
  },
  {
    key: "input-number",
    fn: HSInputNumber,
    collection: "$hsInputNumberCollection"
  },
  {
    key: "layout-splitter",
    fn: HSLayoutSplitter,
    collection: "$hsLayoutSplitterCollection"
  },
  { key: "overlay", fn: HSOverlay, collection: "$hsOverlayCollection" },
  { key: "pin-input", fn: HSPinInput, collection: "$hsPinInputCollection" },
  {
    key: "range-slider",
    fn: HSRangeSlider,
    collection: "$hsRangeSliderCollection"
  },
  {
    key: "remove-element",
    fn: HSRemoveElement,
    collection: "$hsRemoveElementCollection"
  },
  { key: "scrollspy", fn: HSScrollspy, collection: "$hsScrollspyCollection" },
  { key: "select", fn: HSSelect, collection: "$hsSelectCollection" },
  { key: "stepper", fn: HSStepper, collection: "$hsStepperCollection" },
  {
    key: "strong-password",
    fn: HSStrongPassword,
    collection: "$hsStrongPasswordCollection"
  },
  { key: "tabs", fn: HSTabs, collection: "$hsTabsCollection" },
  {
    key: "textarea-auto-height",
    fn: HSTextareaAutoHeight,
    collection: "$hsTextareaAutoHeightCollection"
  },
  {
    key: "theme-switch",
    fn: HSThemeSwitch,
    collection: "$hsThemeSwitchCollection"
  },
  {
    key: "toggle-count",
    fn: HSToggleCount,
    collection: "$hsToggleCountCollection"
  },
  {
    key: "toggle-password",
    fn: HSTogglePassword,
    collection: "$hsTogglePasswordCollection"
  },
  { key: "tooltip", fn: HSTooltip, collection: "$hsTooltipCollection" },
  { key: "tree-view", fn: HSTreeView, collection: "$hsTreeViewCollection" }
];

/*
 * HSStaticMethods
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
const HSStaticMethods = {
  getClassProperty,
  afterTransition,
  autoInit(collection = "all") {
    if (collection === "all") {
      COLLECTIONS.forEach(({ fn }) => {
        fn?.autoInit();
      });
    } else {
      COLLECTIONS.forEach(({ key, fn }) => {
        if (collection.includes(key)) fn?.autoInit();
      });
    }
  },
  cleanCollection(name = "all") {
    if (name === "all") {
      COLLECTIONS.forEach(({ collection }) => {
        if (window[collection] instanceof Array) {
          window[collection] = [];
        }
      });
    } else {
      COLLECTIONS.forEach(({ key, collection }) => {
        if (name.includes(key) && window[collection] instanceof Array) {
          window[collection] = [];
        }
      });
    }
  }
};
if (typeof window !== "undefined") {
  window.HSStaticMethods = HSStaticMethods;
}

/*
 * @version: 2.7.0
 * @author: Preline Labs Ltd.
 * @license: Licensed under MIT and Preline UI Fair Use License (https://preline.co/docs/license.html)
 * Copyright 2024 Preline Labs Ltd.
 */
if (typeof DataTable !== "undefined" && typeof jQuery !== "undefined")
  require("./plugins/datatable").default;
if (typeof _ !== "undefined" && typeof Dropzone !== "undefined")
  require("./plugins/file-upload").default;
if (typeof noUiSlider !== "undefined")
  require("./plugins/range-slider").default;

class CheckBox extends reactExports.Component {
  ckRef = reactExports.createRef(null);
  onCheckChange(e) {
    const { onChange } = this.props;
    if (this.ckRef.current && typeof onChange === "function") {
      onChange(this.ckRef.current.checked);
    }
  }
  componentDidMount() {
    if (this.ckRef.current) {
      this.ckRef.current.checked = Boolean(this.props.checked);
    }
  }
  componentWillReceiveProps(a, b) {
    let np = typeof b.checked != "undefined" ? b : a;
    if (this.ckRef.current) {
      this.ckRef.current.checked = np.checked;
    }
  }
  render() {
    const { id, checked, label, className, tabIndex } = this.props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex ${className}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { tabIndex, ref: this.ckRef, onChange: (e) => this.onCheckChange(e), type: "checkbox", className: "shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800", id }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "hs-default-checkbox", className: "text-sm text-gray-500 ms-3 dark:text-gray-400", children: label })
    ] }) });
  }
}

const AdvancedSelect = ({ data, captionSuffix = "", label = "", selected = "", onSelect, disableSuffixPattern = null }) => {
  const cls0 = "cls-0 relative  w-full";
  const cls1 = `cls-1 hidden ${slugify$1(label)}`;
  const cls2 = "cls-2 absolute top-1/2 end-3 -translate-y-1/2";
  const cls3 = "cls-3 flex-shrink-0 w-3.5 h-3.5 text-gray-500 dark:text-gray-500";
  const onSelectChange = (selected2) => {
    onSelect(selected2);
  };
  reactExports.useEffect(() => {
    HSSelect.autoInit();
    setTimeout(() => {
      setTimeout(() => {
        HSSelect.getInstance(`#dd_${slugify$1(label)}`).on("change", onSelectChange);
      }, 512);
    }, 512);
  }, [data]);
  let dspRegex = null;
  if (disableSuffixPattern) {
    dspRegex = new RegExp(disableSuffixPattern);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cls0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "select",
      {
        id: `dd_${slugify$1(label)}`,
        defaultValue: selected,
        "data-hs-select": '{\n      "placeholder": "Select option...",\n      "toggleTag": "<button type=\\"button\\" ></button>",\n      "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 px-4 pe-9 flex text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 before:absolute before:inset-0 before:z-[1] dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600",\n      "dropdownClasses": "advanced-select mt-2 z-50 w-full max-h-[200px] p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto dark:bg-slate-900 dark:border-gray-700",\n      "optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-200 dark:focus:bg-slate-800",\n      "optionTemplate": "<div class=\\"advanced-select-option flex justify-between items-center w-full\\"><span data-title></span><span class=\\"hidden hs-selected:block\\"><svg class=\\"flex-shrink-0 w-3.5 h-3.5 text-blue-600 dark:text-blue-500\\" xmlns=\\"http:.w3.org/2000/svg\\" width=  \\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" strokeWidth=\\"2\\" strokeLinecap=\\"round\\" strokeLinejoin=\\"round\\"><polyline points=\\"20 6 9 17 4 12\\"/></svg></span></div>"\n    }',
        className: cls1,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { defaultValue: "", children: [
            " ",
            label,
            " "
          ] }),
          data.map((item, index) => {
            let value = item;
            let caption = `${item}${captionSuffix}`;
            if (disableSuffixPattern) {
              if (dspRegex.test(value)) {
                caption = `${item}`;
              }
            }
            if (typeof item == "object" && item !== null) {
              value = item.value;
              caption = `${item.text}${captionSuffix}`;
              if (disableSuffixPattern) {
                if (dspRegex.test(value)) {
                  caption = `${item.text}`;
                }
              }
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value, onClick: (e) => console.log(e), children: [
              " ",
              caption,
              " "
            ] }, index);
          })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cls2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: cls3, children: [
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m7 15 5 5 5-5", children: " " }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m7 9 5-5 5 5", children: " " }),
      " "
    ] }) })
  ] }) });
};

const delayFn = makeDelay(256);
class UiConfig extends LsConfig {
  defaultTheme = "default-theme.css";
  hiddenSidebar_callback_keys = [];
  reloadSidebar_callback_keys = [];
  onResize_callback_keys = [];
  constructor() {
    const config_key = "llfetcher_ui_config";
    super(config_key);
    this.setData("defaultTheme", this.defaultTheme);
  }
  reloadSidebar() {
    const $main_content = jQuery$1("#root");
    $main_content.trigger("reloadSidebar");
  }
  /**
   * set sidebar hidden or shown
   * */
  setHiddenSidebarStatus(status = true) {
    const $main_content = jQuery$1("#root");
    $main_content.prop("hideSidebar", status);
    $main_content.trigger("hideSidebar");
    this.setData("hideSidebar", status);
  }
  /**
   * get sidebar hidden or shown status
   * */
  getHiddenSidebarStatus() {
    return this.getData("hideSidebar");
  }
  /**
       * apply callback handler on event sidebar hidden or shown change
       * @param {function} setHideSidebar hook state function
       * @param {function} callback function to run after event fired
       * @param {string} callback_key identifier for eliminate duplication
       * 
       * @example
       * function Component(){
       * 	const [hideSidebar,setHideSidebar] = useState(false)
          useEffect(()=>{
              config.getUiConfig().applyHiddenSidebarStatus(setHideSidebar,(status)=>{
                console.log(status)
                setHideSidebar(status)
              },'template')
            },[])
       * }
        * */
  windowSize = { width: 0, height: 0 };
  triggerResize = false;
  unsetResizeEvent(callback_key) {
    const index = this.onResize_callback_keys.indexOf(callback_key);
    if (index > -1) {
      this.onResize_callback_keys.splice(index, 1);
    }
  }
  applyResizeEvent(callback, callback_key) {
    if (typeof callback === "function") {
      if (!this.onResize_callback_keys.includes(callback_key)) {
        const $main_content = jQuery$1("#root");
        const $win = jQuery$1(window);
        this.windowSize.width = $win.width();
        this.windowSize.height = $win.height();
        $win.on("resize", () => {
          const $uWin = jQuery$1(window);
          const oW = this.windowSize.width;
          const oH = this.windowSize.height;
          const nW = $uWin.width();
          const nH = $uWin.height();
          if (oW != nW || oH != nH || this.triggerResize) {
            this.windowSize.width = nW;
            this.windowSize.height = nH;
            const viewPortSize = {
              width: $main_content.width(),
              height: $main_content.height()
            };
            const windowSize = this.windowSize;
            delayFn(() => {
              callback(viewPortSize, windowSize, $main_content);
            });
          }
        });
        setTimeout(() => {
          this.triggerResize = true;
          jQuery$1(window).trigger("resize");
        }, 1e3);
        this.onResize_callback_keys.push(callback_key);
      }
    }
  }
  applyHiddenSidebarStatus(setHideSidebar, callback, callback_key) {
    setHideSidebar(this.getHiddenSidebarStatus());
    if (typeof callback === "function") {
      if (!this.hiddenSidebar_callback_keys.includes(callback_key)) {
        const $main_content = jQuery$1("#root");
        $main_content.on("hideSidebar", () => {
          callback($main_content.prop("hideSidebar"));
        });
        this.hiddenSidebar_callback_keys.push(callback_key);
      }
    }
  }
  applyReloadSidebar(callback, callback_key) {
    if (typeof callback == "function") {
      if (!this.reloadSidebar_callback_keys.includes(callback_key)) {
        const $main_content = jQuery$1("#root");
        $main_content.on("reloadSidebar", () => {
          console.log(this.reloadSidebar_callback_keys);
          callback();
        });
        this.reloadSidebar_callback_keys.push(callback_key);
      }
    }
  }
}

/**
 * AppConfig
 * class for storing Application Config and state
 * */
class AppConfig {
  mode = "development"
  // host 			= null
  // api_endpoint	= null;
  // push_endpoint 	= null;
  // tts_endpoint 	= null;
  // messaging_endpoint = null;
  appId = "llfetcher-chrome-ext-30"

  uiConfig = null
  // versionConfig = null

  static instance = null
  /**
   * get singleton instance */
  static getInstance() {
    if (AppConfig.instance instanceof AppConfig) ; else {
      AppConfig.instance = AppConfig.factory();
    }

    return AppConfig.instance
  }
  /**
   * singleton factory*/
  static factory() {
    return new AppConfig()
  }
  /**
   * @constructor
   * */
  constructor() {
    this.uiConfig = new UiConfig();
    // this.versionConfig = new VersionConfig()
  }
  getAppId() {
    return this.appId
  }
  /**
   * get UiConfig instance
   * @return {UiConfig} */
  getUiConfig() {
    return this.uiConfig
  }
}

export { AdvancedSelect as A, Button as B, CheckBox as C, Route as D, AppConfig as E, HSDropdown as H, Link as L, NavLink as N, QueueResult as Q, RouterProvider as R, Store as S, getCourseInfo as a, getCourseXmlParentElement as b, convertJsonToXml as c, getCourseSections as d, getCourseToc as e, fetchRtry as f, getAuthors as g, getVideoMetaNd as h, icon as i, getStreamLocations as j, getTranscripts as k, courseUrlFromSlug as l, makeDelay as m, isTimeExpired as n, QueueState as o, parseJsonSchema as p, QueueData as q, authorUrlFromSlug as r, useLoaderData as s, useOutlet as t, useLocation as u, slugify$1 as v, slugToTitle as w, useRouteError as x, createHashRouter as y, createRoutesFromChildren as z };
