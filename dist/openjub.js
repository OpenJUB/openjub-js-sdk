/*! openjub-js-sdk - v0.0.1 - 2015-03-08 */
"use strict";
// Source: src/00_preamble.js
(function(exports, isBrowser){
  var JUB = {};

// Source: src/01_index.js
/**
  * Namespace for all OpenJUB related functions.
  * @namespace JUB
  */

// Source: src/02_utils.js
/**
  * Namespace for Utility functions.
  * @namespace JUB.utils
  */

JUB.utils = {};

/** Turns the argument into a function.
  * @function JUB.utils.makeFunction
  * @static
  * @param {object} obj - Object to turn into a function.
  * @returns {function}
  */
JUB.utils.makeFunction = function(obj){

  //if it is already a function, return it.
  if(typeof obj === 'function'){
    return obj;
  }

  //else return a lambda style function that just returns obj
  return function(){
    return obj;
  };
}

/** Sets a cookie (if possible).
  * @function JUB.utils.setCookie
  * @static
  * @param {string} name - Name of cookie to get.
  * @param {string} value - Value to set cookie to.
  * @returns {string} the value of the cookie.
  */
JUB.utils.setCookie = function(name, value){

  //we only need to do things if we are in the browser.
  if(isBrowser){
    //adapted from http://www.w3schools.com/js/js_cookies.asp

    //the cookie should expire in one day.
    var d = new Date();
    d.setTime(d.getTime() + (1*24*60*60*1000));

    //build the cookie string.
    var expires = 'expires='+d.toUTCString();
    document.cookie = name + '=' + value + '; ' + expires;

    //return the set value.
    return value;
  } else {
    return undefined;
  }

}

/** Deletes a cookie (if possible).
  * @function JUB.utils.deleteCookie
  * @static
  * @param {string} name - Name of cookie to delete.
  */
JUB.utils.deleteCookie = function(name){

  //we only need to do things if we are in the browser.
  if(isBrowser){
    //adapted from http://www.w3schools.com/js/js_cookies.asp

    //just set the cookie to expire a long time ago.
    document.cookie = name + '=' + '; expires=Thu, 01 Jan 1970 00:00:00 UTC';

    return undefined;
  } else {
    return undefined;
  }

}

/** Gets a cookie (if available).
  * @function JUB.utils.getCookie
  * @static
  * @param {string} name - Name of cookie to get.
  * @returns {string} the value of the cookie.
  */
JUB.utils.getCookie = function(name){

  //if we are the browser, we should search
  if(isBrowser){
    //adapted from http://www.w3schools.com/js/js_cookies.asp

    //we want to search for something.
    name = name + '=';

    //so split the document cookie
    var ca = document.cookie.split(';');

    //and go through it.
    for(var i=0; i<ca.length; i++) {
      //until we find the cookie.
      var c = ca[i];
      while (c.charAt(0)===' '){
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0){
        return c.substring(name.length,c.length);
      }
    }

    return undefined;
  } else {
    //we do not have that functionality
    return undefined;
  }
}

// Source: src/requests/00_index.js
/**
  * Helper namespace for Request functions.
  * @namespace JUB.requests
  */
JUB.requests = {}

/**
 * Calback for requests.
 * @callback JUB.requests~callback
 * @param {number} status_code - The status code returned by the server.
 * @param {object} content - The JSON content of the message.
 */

/**
  * Makes a JSONP GET request.
  * @function JUB.requests.get
  * @param {string} url - URL to send request to.
  * @param {object} query - GET Query parameters to send along with the request.
  * @param {JUB.requests~callback} callback - Callback once the request finishes.
  */
JUB.requests.get = function(url, query, callback){
  if(isBrowser){
    return JUB.requests.browser.get(url, query, callback);
  } else {
    return JUB.requests.node.get(url, query, callback);
  }
}

/**
  * Makes a JSONP POST request.
  * @function JUB.requests.post
  * @param {string} url - URL to send request to.
  * @param {object} query - GET Query parameters to send along with the request.
  * @param {object} post_query - POST parameters to send along with the request.
  * @param {JUB.requests~callback} callback - Callback once the request finishes.
  */
JUB.requests.post = function(url, query, post_query, callback){
  if(isBrowser){
    return JUB.requests.browser.post(url, query, post_query, callback);
  } else {
    return JUB.requests.node.post(url, query, post_query, callback);
  }
}

/**
  * Joins a hostname and a url.
  * @function JUB.requests.joinURL
  * @param {string} base - Base url to start with.
  * @param {string} url - URL on the server.
  * @returns {string} - The full url.
  */
JUB.requests.joinURL = function(base, url){

  //http base
  var base_http = 'http://';

  //the base url for https
  var base_https = 'https://';


  //if we do not start, default to https.
  if(base.substring(0, base_https.length) !== base_https && base.substring(0, base_http.length) !== base_http){
    base = base_https + base;
  }

  //do not end the base with a slash
  if(base[base.length - 1] === '/'){
    base = base.substring(0, base.length - 1);
  }

  //the url should start with a /
  if(url[0] !== '/'){
    url = '/' + url;
  }

  //return the base + url.
  return base + url;
}

/**
  * Build the full GET URL given a query and a url.
  * @function JUB.requests.buildGETUrl
  * @param {string} url - Base url to start with.
  * @param {object[]} query - GET query parameters.
  * @returns {string} - The full URL
  */
JUB.requests.buildGETUrl = function(url, query){

  //extract the parameters from the url itself.
  var parameters = JUB.requests.extractGetParams(url);

  //and remove them from the url
  url = url.split('?')[0];

  //the query string
  var query_string = '';


  //overwrite the parameters with the query
  for(var key in query){
    if(query.hasOwnProperty(key)){
      parameters[key] = query[key];
    }
  }

  //build the query string
  for(var key in parameters){
    if(query.hasOwnProperty(key)){
      if(typeof query[key] !== 'undefined'){
        //encode this component
        query_string += encodeURIComponent(key)+'='+encodeURIComponent(query[key])+'&';
      }
    }
  }

  //prepend the question mark
  //and remove the last character if we need it.
  if(query_string !== ''){
    query_string = '?'+query_string.substring(0, query_string.length - 1);
  }

  //return the full query string.
  return url + query_string;
}

/**
  * Extracts GET parameters from a url.
  * @function JUB.requests.extractGetParams
  * @param {string} url - URL to extract parameters from.
  * @returns {object} - A JSON-style object for the parameters.
  */
JUB.requests.extractGetParams = function(url){
  var results = {};

  //we need to check that we have a questionmark.
  if(url.indexOf('?') !== -1){

    //so split by it.
    var params = url.split('?');

    //remove the normal url.
    params.shift();

    //join it back together and find the parameters.
    params = params.join('?');
    params = params.split('&');

    //go over them.
    for(var i=0; i<params.length;i++){

      //split this parameter by equality.
      var parameter = params[i].split('=');

      //get the name
      var name = unescape(parameter.shift());

      //get the value
      var value = unescape(parameter.join('='));

      //only store the first instance.
      if(!results.hasOwnProperty(name)){
          results[name] = value;
      }
    }
  }

  //and return the results.
  return results;

}

// Source: src/requests/01_browser.js
/**
  * Browser implementations of request functions.
  * @namespace JUB.requests.browser
  */
JUB.requests.browser = {}

/**
  * Makes a JSONP GET request from within the browser.
  * @function JUB.requests.browser.get
  * @param {string} url - URL to send request to.
  * @param {object} query - GET Query parameters to send along with the request.
  * @param {JUB.requests~callback} callback - Callback once the request finishes.
  */
JUB.requests.browser.get = function(url, query, callback){

  //build the full url.
  url = JUB.requests.buildGETUrl(url, query);

  //send the request for jsonp
  jQuery.ajax(url, {
    dataType: 'json'
  })
  .always(function(data, statusText, xhr){
    //make sure we have everything
    if(statusText !== 'success'){
      xhr = data;
    }

    //call the callback
    callback(xhr.status, xhr.responseJSON);
  });
}

/**
  * Makes a JSONP POST request from within the browser.
  * @function JUB.requests.browser.post
  * @param {string} url - URL to send request to.
  * @param {object} query - GET Query parameters to send along with the request.
  * @param {object} post_query - POST parameters to send along with the request.
  * @param {JUB.requests~callback} callback - Callback once the request finishes.
  */
JUB.requests.browser.post = function(url, query, post_query, callback){

  //build the full url.
  url = JUB.requests.buildGETUrl(url, query);

  //send the POST request
  jQuery.ajax(url, {
    type: 'POST',
    data: post_query,
    dataType: 'json'
  })
  .always(function(data, statusText, xhr){
    //make sure we have everything
    if(statusText !== 'success'){
      xhr = data;
    }

    //call the callback
    callback(xhr.status, xhr.responseJSON);
  });
}

// Source: src/requests/02_node.js
/**
  * Node implementations of request functions.
  * @namespace JUB.requests.node
  */
JUB.requests.node = {}

/**
  * Makes a JSONP GET request from node.
  * @function JUB.requests.node.get
  * @param {string} url - URL to send request to.
  * @param {object} query - GET Query parameters to send along with the request.
  * @param {JUB.requests~callback} callback - Callback once the request finishes.
  */
JUB.requests.node.get = function(url, query, callback){
  //TODO: Stuff
}

/**
  * Makes a JSONP POST request from node.
  * @function JUB.requests.node.post
  * @param {string} url - URL to send request to.
  * @param {object} query - GET Query parameters to send along with the request.
  * @param {object} post_query - POST parameters to send along with the request.
  * @param {JUB.requests~callback} callback - Callback once the request finishes.
  */
JUB.requests.node.post = function(url, query, post_query, callback){
  //TODO: Stuff
}

// Source: src/client/00_index.js
/**
  * Creates a new OpenJUB client.
  * @class JUB.Client
  * @param {string} server - The full adress of the OpenJUB server. Has to include protocol, port and may not have a trailing slash.
  * @param {JUB.client~callback} callback - Called when the client is ready. Contains status information.
  */
JUB.Client = function(server, callback){

  //make sure callback is a function
  callback = JUB.utils.makeFunction(callback);

  /**
    * The server this JUB client is connected to.
    * @type {string}
    * @property JUB.Client#server
    */
  this.server = server;

  /**
    * The token used for authentication.
    * @type {string}
    * @property JUB.Client#token
    */
  this.token = JUB.utils.getCookie("JUB_token");

  /**
    * Name of the currently signed in user. 
    * @type {string}
    * @property JUB.Client#user
    */
  this.user = undefined;

  //check for the status to get a token.
  this.status(function(error, data){
    callback();
  });
}

/**
 * Callback for OpenJUB requests.
 * @callback JUB.client~callback
 * @param {string|undefined} error - An error message if something went wrong or undefined otherwise.
 * @param {object} data - Data sent back from OpenJUB.
 */


//Test function. TODO: Remove me.

JUB.test = function(error, data){console.log("error", error, "data", data); }

// Source: src/client/01_auth.js

/**
  * Signs in using the specefied credentials.
  * @function JUB.Client#signin
  * @instance
  * @param {string} username - Username to authenticate with.
  * @param {string} passsword - Password to authenticate with.
  * @param {JUB.client~callback} callback - Callback once signed in.
  */
JUB.Client.prototype.signin = function(username, password, callback){

  //reference to this and a proper function
  var me = this;
  callback = JUB.utils.makeFunction(callback);

  JUB.requests.post(JUB.requests.joinURL(this.server, '/auth/signin'), {}, {
    "username": username,
    "password": password
  }, function(code, data){
    //are we successfull.
    if(code === 200){
      //store the token.
      me.token = data.token;
      JUB.utils.setCookie("JUB_token", me.token);

      callback(undefined, data);
    } else {
      //we have an error
      callback(data['error']);
    }
  });
}

/**
  * Signs out of a session.
  * @function JUB.Client#signout
  * @instance
  * @param {JUB.client~callback} callback - Callback once signed out.
  */
JUB.Client.prototype.signout = function(callback){

  //reference to this and a proper function
  var me = this;
  callback = JUB.utils.makeFunction(callback);

  JUB.requests.get(JUB.requests.joinURL(this.server, '/auth/signout'), {
    'token': this.token
  }, function(code, data){
    //are we successfull?
    if(code === 200){
      //clear token and user. 
      me.token = undefined;
      me.user = undefined;
      JUB.utils.deleteCookie("JUB_token");

      callback(undefined, data);
    } else {
      //we have an error
      callback(data['error']);
    }
  });
}

/**
  * Gets the current status.
  * @function JUB.Client#status
  * @instance
  * @param {JUB.client~callback} callback - Status callback.
  */
JUB.Client.prototype.status = function(callback){

  //reference to this and a proper function
  var me = this;
  callback = JUB.utils.makeFunction(callback);

  JUB.requests.get(JUB.requests.joinURL(this.server, '/auth/status'), {
    'token': this.token
  }, function(code, data){
    //are we successfull?
    if(code === 200){

      if(!data.user){


        //clear token and user
        me.token = undefined;
        me.user = undefined;
        JUB.utils.deleteCookie("JUB_token");

        //and here goes the callback
        //so soon because we do not have a user.
        callback(undefined, data);

        return;
      }

      //store the token if we got it.
      if(data.token){
        me.token = data.token;
        me.user = data.user;
        JUB.utils.setCookie("JUB_token", me.token);
      }

      //and here goes the callback
      callback(undefined, data);
    } else {
      //we have an error
      callback(data['error']);
    }
  });
}

/**
  * Checks if the client is on campus.
  * @function JUB.Client#isOnCampus
  * @instance
  * @param {JUB.client~callback} callback - Status callback.
  */
JUB.Client.prototype.isOnCampus = function(callback){

  //reference to this and a proper function
  var me = this;
  callback = JUB.utils.makeFunction(callback);

  JUB.requests.get(JUB.requests.joinURL(this.server, '/auth/isoncampus'), {},
  function(code, data){
    //are we successfull?
    if(code === 200){
      callback(undefined, data);
    } else {
      //we have an error
      callback(data['error']);
    }
  });
}

/**
  * Opens a new window to allow for authentication of the user.
  * Not supported in node.
  * @function JUB.Client#authenticate
  * @instance
  * @param {JUB.client~callback} callback - Callback once token is ready.
  */
JUB.Client.prototype.authenticate = function(callback){

  //if we are node, exit
  if(!isBrowser){
    return;
  }

  //have a reference to me
  var me = this;


  var _handleMessage = function(e){
    //return unless it is the right message
    if(e.origin !== me.server){
      return;
    }

    //remove the event handler.
    window.removeEventListener(_handleMessage);

    //read the data correctly
    var token = (typeof e.data === 'string'?JSON.parse(e.data):e.data).token;

    //store the token
    me.token = token;

    //and call the status
    me.status(callback);
  }



  //listen to events.
  window.addEventListener('message', _handleMessage);

  //open the window for authentication.
  window.open(
    JUB.requests.joinURL(this.server, '/view/login'),
    '_blank',
    'width=500, height=400, resizeable=no, toolbar=no, scrollbar=no, location=no'
  );
}

// Source: src/client/02_user.js
/**
  * Gets info about the current user.
  * @param {string[]} fields - Fields to return.
  * @function JUB.Client#getMe
  * @instance
  * @param {JUB.client~callback} [callback] - Callback
  */
JUB.Client.prototype.getMe = function(fields, callback){

  //reference to this and a proper function
  var me = this;
  callback = JUB.utils.makeFunction(callback);

  //if we do not have fields, reset them.
  if(fields && fields.length == 0){
    fields = undefined;
  }

  //and make the request
  JUB.requests.get(JUB.requests.joinURL(this.server, '/user/me'), {
    'token': this.token,
    'fields': fields,
  }, function(code, data){
    //are we successfull?
    if(code === 200){
      callback(undefined, data);
    } else {

      //check the status if we had an error.
      me.status(function(){
        //we have an error
        callback(data['error']);
      });

    }
  });
}

JUB.Client.prototype.amIAGoat = function(callback){

  //reference to this and a proper function
  var me = this;
  callback = JUB.utils.makeFunction(callback);

  JUB.requests.get(JUB.requests.joinURL(this.server, '/user/me/isagoat'), {},
  function(code, data){
    //are we successfull?
    if(code === 200){
      callback(undefined, data);
    } else {
      //check the status if we had an error.
      me.status(function(){
        //we have an error
        callback(data['error']);
      });
    }
  });
}

/**
  * Gets a user by id.
  * @param {string} id - Id of user to find.
  * @param {string[]} fields - Fields to return.
  * @function JUB.Client#getUserById
  * @instance
  * @param {JUB.client~callback} [callback] - Callback
  */
JUB.Client.prototype.getUserById = function(id, fields, callback){

  var me = this;

  //if we do not have fields, reset them.
  if(fields && fields.length == 0){
    fields = undefined;
  }

  //and make the request
  JUB.requests.get(JUB.requests.joinURL(this.server, '/user/id/'+id), {
    'token': this.token,
    'fields': fields,
  }, function(code, data){
    //are we successfull?
    if(code === 200){
      callback(undefined, data);
    } else {
      //check the status if we had an error.
      me.status(function(){
        //we have an error
        callback(data['error']);
      });
    }
  });
}

/**
  * Gets a user by name.
  * @param {string} username - Username of user to find.
  * @param {string[]} fields - Fields to return.
  * @function JUB.Client#getUserByName
  * @instance
  * @param {JUB.client~callback} [callback] - Callback
  */
JUB.Client.prototype.getUserByName = function(username, fields, callback){

  var me = this; 

  //if we do not have fields, reset them.
  if(fields && fields.length == 0){
    fields = undefined;
  }

  //and make the request
  JUB.requests.get(JUB.requests.joinURL(this.server, '/user/name/'+username), {
    'token': this.token,
    'fields': fields,
  }, function(code, data){
    //are we successfull?
    if(code === 200){
      callback(undefined, data);
    } else {
      //check the status if we had an error.
      me.status(function(){
        //we have an error
        callback(data['error']);
      });
    }
  });
}

// Source: src/client/03_query.js
/**
  * Looks up users using a machine-readable query.
  * @param {string[]} fields - Fields to return.
  * @param {number} [limit] - Limit of results to send.
  * @param {number} [skip] - Skip of results to send.
  * @param {JUB.client~requestCallback} [callback] - Callback
  * @function JUB.Client#query
  * @instance
  */
JUB.Client.prototype.query = function(query, fields, limit, skip, callback){

  //this is me.
  var me = this;

  //if we skipped limit, skip
  if(typeof limit === 'function'){
    callback = limit;
    limit = undefined;
    skip = undefined;
  }

  //Make sure its a function.
  callback = JUB.utils.makeFunction(callback);

  //if we do not have fields, reset them.
  if(fields && fields.length == 0){
    fields = undefined;
  }

  JUB.requests.get(JUB.requests.joinURL(this.server, 'query/'+escape(query)), {
    'fields': fields,
    'limit': limit,
    'skip': skip,
    'token': this.token
  },
  function(code, data){
    //are we successfull?
    if(code === 200){
      //Make a new query result.
      callback(undefined, new JUB.queryResult(data, query, me));
    } else {
      //check the status if we had an error.
      me.status(function(){
        //we have an error
        callback(data['error']);
      });
    }
  });
}

/**
 * Callback for OpenJUB requests.
 * @callback JUB.client~requestCallback
 * @param {string|undefined} error - An error message if something went wrong or undefined otherwise.
 * @param {JUB.queryResult} result - Query result sent back from OpenJUB.
 */

 /**
   * Represents a query result.
   * @param {object} data - raw json data result.
   * @param {string} query - The original query.
   * @param {JUB.Client} client - Client the result was originally made with.
   * @function JUB.queryResult
   * @class
   */
JUB.queryResult = function(data, query, client){
  /**
    * Client the result was originally made with.
    * @type {JUB.client}
    * @property JUB.queryResult#client
    */
  this.client = client;

  /**
    * The original query.
    * @type {string}
    * @property JUB.queryResult#query
    */
  this.query = query;

  /**
    * raw json data result.
    * @type {object}
    * @property JUB.queryResult#_data
    */
  this._data = data;

  /**
    * JSON-style results of the query.
    * @type {object[]}
    * @property JUB.queryResult#data
    */
  this.data = data.data;
}

/**
  * Gets the next page of the result.
  * @param {JUB.client~requestCallback} [callback] - Callback
  * @function JUB.queryResult#next
  * @instance
  */
JUB.queryResult.prototype.next = function(callback){
  var params = JUB.requests.extractGetParams(this._data.next);

  //extract the parameters
  params.fields = params.fields?params.fields.split(","):undefined;
  params.limit = parseInt(params.limit) || undefined;
  params.skip = parseInt(params.skip) || undefined;

  //and send the next result.
  return this.client.query(this.query, params.fields, params.limit, params.skip, callback);
}

/**
  * Gets the previous page of the result.
  * @param {JUB.client~requestCallback} [callback] - Callback
  * @function JUB.queryResult#prev
  * @instance
  */
JUB.queryResult.prototype.prev = function(callback){
  var params = JUB.requests.extractGetParams(this._data.prev);

  //extract the parameters
  params.fields = params.fields?params.fields.split(","):undefined;
  params.limit = parseInt(params.limit) || undefined;
  params.skip = parseInt(params.skip) || undefined;

  //and send the prev result.
  return this.client.query(this.query, params.fields, params.limit, params.skip, callback);
}

// Source: src/client/04_search.js
/**
  * Looks up users using a search
  * @param {string[]} fields - Fields to return.
  * @param {number} [limit] - Limit of results to send.
  * @param {number} [skip] - Skip of results to send.
  * @param {JUB.client~requestCallback} [callback] - Callback
  * @function JUB.Client#search
  * @instance
  */
JUB.Client.prototype.search = function(search, fields, limit, skip, callback){

  //this is me.
  var me = this;

  //if we skipped limit, skip
  if(typeof limit === 'function'){
    callback = limit;
    limit = undefined;
    skip = undefined;
  }

  //Make sure its a function.
  callback = JUB.utils.makeFunction(callback);

  //if we do not have fields, reset them.
  if(fields && fields.length == 0){
    fields = undefined;
  }

  JUB.requests.get(JUB.requests.joinURL(this.server, 'search/'+escape(search)), {
    'fields': fields,
    'limit': limit,
    'skip': skip,
    'token': this.token
  },
  function(code, data){
    //are we successfull?
    if(code === 200){
      //Make a new search result.
      callback(undefined, new JUB.searchResult(data, search, me));
    } else {
      //check the status if we had an error.
      me.status(function(){
        //we have an error
        callback(data['error']);
      });
    }
  });
}

/**
 * Callback for OpenJUB requests.
 * @callback JUB.client~requestCallback
 * @param {string|undefined} error - An error message if something went wrong or undefined otherwise.
 * @param {JUB.searchResult} result - search result sent back from OpenJUB.
 */

 /**
   * Represents a search result.
   * @param {object} data - raw json data result.
   * @param {string} search - The original search.
   * @param {JUB.Client} client - Client the result was originally made with.
   * @function JUB.searchResult
   * @class
   */
JUB.searchResult = function(data, search, client){
  /**
    * Client the result was originally made with.
    * @type {JUB.client}
    * @property JUB.searchResult#client
    */
  this.client = client;

  /**
    * The original search.
    * @type {string}
    * @property JUB.searchResult#search
    */
  this.search = search;

  /**
    * raw json data result.
    * @type {object}
    * @property JUB.searchResult#_data
    */
  this._data = data;

  /**
    * JSON-style results of the search.
    * @type {object[]}
    * @property JUB.searchResult#data
    */
  this.data = data.data;
}

/**
  * Gets the next page of the result.
  * @param {JUB.client~requestCallback} [callback] - Callback
  * @function JUB.searchResult#next
  * @instance
  */
JUB.searchResult.prototype.next = function(callback){
  var params = JUB.requests.extractGetParams(this._data.next);

  //extract the parameters
  params.fields = params.fields?params.fields.split(","):undefined;
  params.limit = parseInt(params.limit) || undefined;
  params.skip = parseInt(params.skip) || undefined;

  //and send the next result.
  return this.client.search(this.search, params.fields, params.limit, params.skip, callback);
}

/**
  * Gets the previous page of the result.
  * @param {JUB.client~requestCallback} [callback] - Callback
  * @function JUB.searchResult#prev
  * @instance
  */
JUB.searchResult.prototype.prev = function(callback){
  var params = JUB.requests.extractGetParams(this._data.prev);

  //extract the parameters
  params.fields = params.fields?params.fields.split(","):undefined;
  params.limit = parseInt(params.limit) || undefined;
  params.skip = parseInt(params.skip) || undefined;

  //and send the prev result.
  return this.client.search(this.search, params.fields, params.limit, params.skip, callback);
}

// Source: src/99_postamble.js
  //export JUB. 
  exports.JUB = JUB;
})(
  (typeof exports === 'undefined')?window:exports,
  typeof exports === 'undefined'
);
