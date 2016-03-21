/**
 * five9restapi.js
 * 
 * Five9 REST API helper class.  This class contains functions that implement the
 * API calls for the Five9 REST API service.  This class also handles the authentication
 * parameters necessary to work in a cross origin topology.   
 */

five9restapi = function() {
	var _uiurl = "";
	var _uiport;
	var _loginurl = "";
	var _loginport;
	var _apiurl = "";
	var _apiport;
	var _tokenId;
	var _orgId;
	var _userId;
	var _authCookieBody;
	var _clientPage;
	
	/**********************************************************
     * Utility functions
    **********************************************************/
	/**
	 * setF9Cookies()
	 * 
	 * Sets the cookies that are required for cross origin authentication with
	 * the API Server.  The values of these cookies are derived from the response 
	 * of the auth/login API call.  
	 */
	function setF9Cookies() {
		$.cookie('f9-authToken', _tokenId, {path:'/', domain:'five9.com'});
		$.cookie('f9-agentId', _userId, {path:'/', domain:'five9.com'});
		$.cookie('f9-tenantId', _orgId, {path:'/', domain:'five9.com'});
		
		// Create the Authentication cookie from the tokenId returned in the auth/login request
		_authCookieBody = 'Bearer-'+ _tokenId;
		$.cookie("Authorization", _authCookieBody,  {path:'/', domain:'five9.com'});
		console.log("setF9Cookies: Setting the auth cookie to... " + _authCookieBody);
		  
		// Print out all cookies..
		console.log("setF9Cookies: cookie list = " + JSON.stringify($.cookie()));
	}
	
	/**
	 * deleteF9Cookies()
	 * 
	 * Deletes the cookies that were created as part of the auth/login process. 
	 */
	function deleteF9Cookies() {
		$.removeCookie('f9-authToken');
	    $.removeCookie('f9-agentId');
	    $.removeCookie('f9-tenantId');
	    $.removeCookie("Authorization");
	    
	    console.log("deleteF9Cookies: cookie list = " + JSON.stringify($.cookie()));
	}
	
	/**
	 * extractAuthLoginRespParams()
	 * 
	 * Extract the URLs and authorization information from the /auth/login response JSON. 
	 */
	function extractAuthLoginRespParams(json) {
		_apiurl = json.metadata.dataCenters[0].apiUrls[0].host;
        _apiport = json.metadata.dataCenters[0].apiUrls[0].port;
        
        _tokenId = json.tokenId;
        _orgId = json.orgId;
        _userId = json.userId;
        
        console.log("extractAuthLoginRespParams: apiurl = " + _apiurl);
	}
	
	
	
	/**********************************************************
     * Authentication
    **********************************************************/
	/**
	 * sendAuthLoginReq()
	 * 
	 * Accepts the API URL and Agent credentials.  Issues an auth/login request to the
	 * API Server.  When the response is received, the information in the response json
	 * is extracted for use in subsequent API requests. A WebSocket connection is opened to
	 * accept event messages from the service.  
	 */
	function sendAuthLoginReq(urlin, un, pw) {
		var path = "/appsvcs/rs/svc/auth/login";
		var requestUrl = urlin + path;
		
		console.log("sendAuthLoginReq: ..." + requestUrl);
		
		var msgBody = JSON.stringify({"passwordCredentials":{"username":un,"password":pw},"appKey":"web-ui","policy":"ForceIn"});
		
		$.ajax({
            type: "POST",
            url: requestUrl,
            dataType: "json",
            contentType: "application/json",
            data: msgBody,
            success: function (json, status, xhr) {  
            	console.log("sendAuthLoginReq: Done... " + status);
            	// Got a successful response
            	console.log("Got response..." + JSON.stringify(json));
            	wschannel.showWsMessage("auth/login response: " + JSON.stringify(json));
            	
            	// Extract the Five9 Server URLs for subsequent requests
            	extractAuthLoginRespParams(json);
            	
            	// Set the authentication cookies to be used in subsequent API requests
            	setF9Cookies();
            	
                // Open the Websocket to receive Events
                wschannel.startWsChannel(_apiurl);
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        });
	}
	
	/**
	 * sendAuthLogoutReq()
	 * 
	 * Issues an auth/logout request to the API Server.   
	 */
	function sendAuthLogoutReq () {
		// Formulate the Request URL
		var path = "/appsvcs/rs/svc/auth/logout";
		
		var requestUrl = "https://"+ _apiurl + ":"+ _apiport + path;
		console.log("sendAuthLogoutReq: Sending Logout request to: " + requestUrl);
		
		$.ajax({
            type: "POST",
            url: requestUrl,
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            cache: false,
            success: function (json) {  
            	console.log("sendAuthLogoutReq: Log out successful");
            	wschannel.showWsMessage("auth/logout response: Log out successful");
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        });
		
	}
	
	/**********************************************************
     * Metadata retrieval
    **********************************************************/
	/**
	 * sendGetMetadataReq()
	 * 
	 * Sends an auth/metadata request to the API Server.  
	 */
	function sendGetMetadataReq () {
		var path = "/appsvcs/rs/svc/auth/metadata";
		var requestUrl = "https://" + _apiurl + ":" + _apiport + path;
		
		console.log("sendGetMetadataReq: Sending request to: " + requestUrl);
		
		setF9Cookies();
		
		// Print out all cookies..
    	console.log("sendGetMetadataReq: cookie = " + JSON.stringify($.cookie()));
    	
		$.ajax({
            type: "GET",
            url: requestUrl,
            cache: false,
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: function (json) {  
            	console.log("sendGetMetadataReq: Got response: " + JSON.stringify(json));
            	wschannel.showWsMessage("auth/metadata response: " + JSON.stringify(json));
            	
            	// Extract the Five9 Server URLs for subsequent requests
            	extractAuthLoginRespParams(json);
            	
            	// Set the authentication cookies to be used in subsequent API requests
            	setF9Cookies();
            	
                // Open the Websocket to receive Events
                wschannel.startWsChannel(_apiurl);
            	
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        });
	}
	

	/**********************************************************
     * Class Factory
    **********************************************************/
    return {
    	init: function(page) {
    		console.log("init: five9restapi is initialized...");
    		_clientPage = page;
    	},
    	sendAuthLoginReq: sendAuthLoginReq,
    	sendAuthLogoutReq: sendAuthLogoutReq,
    	sendGetMetadataReq: sendGetMetadataReq
    };
} ();