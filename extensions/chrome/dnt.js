// Copyright (c) 2012 CJ Barker. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

// general DNT setting 0|1
var dntKey    = "dnt_active";
var dntValue  = "0";
var dntLoaded = false;

function save(key, value) {
    if (key == dntKey && value == dntValue) {
    	console.log("Key and value has not changed - will not save");
	return;
    }
    localStorage.setItem(key, value);
    dntLoaded = false;
    console.log("saved "+key+" : " + value);
}

function get(key) {
   return get(key, null);
}

function get(key, value) {
    if (key === dntKey && dntLoaded) {
       console.log("key ["+dntKey+"] already loaded with value ["+dntValue+"]");
       value = dntValue;
       return value;
    }

    if (key === null) {
       console.log("key ["+key+"] not found - returning default value ["+value+"]");
       return value;
    }

    value = localStorage.getItem(key);
    console.log("Received local storage key: "+key+" value: "+value);
    dntLoaded = (key === dntKey) ? true : false;
    if (dntLoaded) {
    	dntValue = value;
    }
    return value;
}

// handle intercepting HTTP request headers
var requestFilter = {
    urls: [ "<all_urls>" ]
  },
  extraInfoSpec = ['requestHeaders','blocking'],

  handler = function( details ) {

    dntSetting = get(dntKey);

    if (typeof dntSetting == 'undefined' || dntSetting == null) {
        console.log("Not DNT set - will default to disabled");
	dntSetting = '0';
        save(dntKey, dntSetting);
    }

    console.log("Received DNT setting: "+dntSetting);
   
    var headers = details.requestHeaders, blockingResponse = {};
    var hdrLen = headers.length
    var index = -1;

    //console.log("Received headers...");

    for( var i=0; i < hdrLen; i++) {
      if ( headers[i].name == 'DNT' ) {
	 index = i;
	 console.log("Found existing DNT header");
         console.log(headers[i].name + ":" + headers[i].value);
	 if (headers[i].value == dntSetting) {
	    console.log("DNT header exists - nothing changed");
	    blockingResponse.requestHeaders = headers;
	    return blockingResponse;
	 }
         break;
      }
    }

    if (index == -1) {
	console.log("Did not find DNT...will add it to index: "+index);
	headers.push({"name":"DNT", "value":dntSetting});
    }
    else {
        headers[index].name = "DNT";
        headers[index].value = dntSetting;
	console.log("Found DNT header just updated existing header setting.");
    }

    console.log("Header added DNT:"+dntSetting);

    blockingResponse.requestHeaders = headers;

    return blockingResponse;
  };

chrome.webRequest.onBeforeSendHeaders.addListener( handler, requestFilter, extraInfoSpec );

function updateIcon() {
    var iconPath = null;
    if (dntSetting === "1") {
        iconPath = "./images/icon48_red.png";
    }
    else {
        iconPath = "./images/icon48_grey.png";
    }
    chrome.browserAction.setIcon({path:iconPath});
}

function toggleDnt() {
    dntSetting = get(dntKey, "0");
    console.log("Toggle - Received DNT value: "+dntSetting);

    if (dntSetting === "0") {
        dntSetting = "1";
    }
    else {
        dntSetting = "0";
    }

    save(dntKey, dntSetting);

    console.log("Saved DNT value: "+dntSetting);

    updateIcon();
}

chrome.browserAction.onClicked.addListener(toggleDnt);
toggleDnt();

