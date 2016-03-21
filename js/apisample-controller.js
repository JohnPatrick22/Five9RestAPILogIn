/**
 * apisample-controller.js
 * 
 * UI View Controller class for the ApiBasicSample application.  
 */

apisampleController = function() {
	var _clientPage;
	var _initialized = false;
	
	// API parameters and defaults
	var _agentun = "";	
	var _agentpwd = "";	
	var _uiurlentry = "";	
	var _apiserviceurl = "";
	
	function initUiText() {
		console.log("initUiText: Initializing UI text boxes...");
		
		// Load the parameters from persistent storage
		loadUiParams();
		
		// Load the UI Text Boxes
    	$("#agentun").val(_agentun);
    	$("#agentpwd").val(_agentpwd);
    	$("#f9apiuri").val(_uiurlentry);
	}
	
	function updateUrls() {
		_apiserviceurl = "https://" + _uiurlentry;
	}
	
	function loadUiText() {
		console.log("loadUiText: Loading variables from UI text boxes...");
		// Update the local variables from the UI Text Boxes
    	_agentun = $("#agentun").val();
		_agentpwd = $("#agentpwd").val();
		_uiurlentry = $("#f9apiuri").val();
		
		// Save parameters to persistent storage
		storeUiParams();
		
		updateUrls();
	}
	
	function storeUiParams() {
		$.cookie("agentun", _agentun);
		$.cookie("uiurl", _uiurlentry);
	}
	
	function loadUiParams() {
		_agentun = $.cookie("agentun");
		_uiurlentry = $.cookie("uiurl");
	}
	
	 /**********************************************************
     * Controller Class Factory
    **********************************************************/
    return {
		init : function (page) {
			if (!_initialized) {
				console.log("init: Initializing the Controller...");
				_clientPage = page;
				initUiText();
				updateUrls();
				wschannel.init(_clientPage);
				
				_initialized = true;
			} else {
				console.log("init: Controller already initialized...");
			}
			
			/**********************************************************
		     * UI Action Support Functions
		    **********************************************************/
		    $(_clientPage).find('#btnAuthenticate').click(function(evt) {
		    	console.log("init: Log in to the server...");
		    	loadUiText();
		    	five9restapi.sendAuthLoginReq(_apiserviceurl, _agentun, _agentpwd);
		    });
		    
		    $(_clientPage).find('#btnGetMetadata').click(function(evt){
		    	console.log("init: Send GetMetadata request the server...");
		    	five9restapi.sendGetMetadataReq();
		    });
			
			$(_clientPage).find('#btnLogout').click(function(evt) {
		    	console.log("init: Logging out from server ...");
		        five9restapi.sendAuthLogoutReq();
		    });
			
		}
    };
} ();
