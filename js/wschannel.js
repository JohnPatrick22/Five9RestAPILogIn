/**
 * wschannel.js
 * 
 * WebSocket implementation class.  This class manages the WebSocket connection to 
 * the Five9 Service.  All messages received over this socket are displayed to the
 * web page Log frame.    
 */

wschannel = function () {
	var _clientPage;
	var _ws;
	var _connState = false;	
	
	/**********************************************************
     * Websocket handler
    **********************************************************/
   function startWsChannel (url){
	   if ('WebSocket' in window){
		   var wsurl = "wss://" + url +"/appsvcs/ws";
			showWsMessage("wschannel: Connecting to " + wsurl);
			 
			// Print out all cookies..
		  	console.log("startWsChannel: cookie list = " + JSON.stringify($.cookie()));
		  	
			_ws = new window.WebSocket(wsurl);
			
			_ws.onopen = function(evt){
			   /*Send a small message to the console once the connection is established */
			   console.log('startWsChannel: Connected to: ' + evt.currentTarget.URL);
			   _connState = true;
			};
			_ws.onclose = function(){
			   console.log('startWsChannel: Connection closed');
			   showWsMessage("wschannel: Connection closed");
			   _connState = false;
			};
			
			_ws.onmessage = function(evt) {
				showWsMessage("wschannel: Message = " + evt.data);
			};
			
			_ws.onerror = function(error){
			   console.log('startWsChannel: Error detected: ' + error.data);
			   showWsMessage("wschannel: WS Error =  " + error.data);
			   _connState = false;
			};
		} else {
		   /*WebSockets are not supported. Try a fallback method like long-polling etc*/
			console.log("startWsChannel: Websocket is NOT supported...");
		}
	};
	
	function closeWsConnection () {
		if (_connState)
			_ws.close();
	};
	
	/**********************************************************
     * Utility function to show messages on Web Page
    **********************************************************/
    function showWsMessage(msg) {
    	$(".logContainer")
           .prepend("<div class=''>" + msg + "</div>");
    	$(".logContainer")
        .prepend("<div class=''>" + "------------------------------------------------------------" + "</div>");
    }
    
    
    /**********************************************************
     * Class Factory
    **********************************************************/
   return {
		init: function(page) {
			_clientPage = page;
		},
		startWsChannel: startWsChannel,
		closeWsConnection: closeWsConnection,
		showWsMessage: showWsMessage
	};
}();
