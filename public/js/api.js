// The Api module is designed to handle all interactions with the server

var Api = (function() {
	var requestPayload;
	var responsePayload;
	var messageEndpoint = '/api/message';

	// Publicly accessible methods defined
	return {
		sendRequest : sendRequest,
		buildOrderTable : buildOrderTable,

		// The request/response getters/setters are defined here to prevent
		// internal methods
		// from calling the methods without any of the callbacks that are added
		// elsewhere.
		getRequestPayload : function() {
			return requestPayload;
		},
		setRequestPayload : function(newPayloadStr) {
			// requestPayload = JSON.parse(newPayloadStr);
			requestPayload = newPayloadStr;
		},
		getResponsePayload : function() {
			return responsePayload;
		},
		setResponsePayload : function(newPayloadStr) {
			// responsePayload = JSON.parse(newPayloadStr);
			responsePayload = newPayloadStr;
		}
	};

	// Send a message request to the server
	function sendRequest(text, context) {
		// Build request payload
		var payloadToWatson = {};
		if (text) {
			payloadToWatson.input = {
				text : text
			};
		}
		if (context) {
			payloadToWatson.context = context;
		}

		// Built http request
		var http = new XMLHttpRequest();
		http.open('POST', messageEndpoint, true);
		http.setRequestHeader('Content-type', 'application/json');
		http.onreadystatechange = function() {
			if (http.readyState === 4 && http.status === 200
					&& http.responseText) {
				var response = JSON.parse(http.responseText);
				context = response.context;
				response.context.Username = localStorage.getItem('username');
				Api.setResponsePayload(response);
			}
		};

		var params = JSON.stringify(payloadToWatson);
		// Stored in variable (publicly visible through Api.getRequestPayload)
		// to be used throughout the application
		if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
			Api.setRequestPayload(params);
		}

		// Send request
		http.send(params);
	}

	function buildOrderTable(newPayload) {
		var txt = "<table class='w3-table-all'><thead><tr><th>Product Code</th><th>Product Name</th></tr></thead><tbody>";
		for (var i = 0; i < newPayload.orderTable.length; i++) {
			if (newPayload.orderTable[i].PRODUCT != null
					&& newPayload.orderTable[i].PRODUCT_DESC) {
				txt += "<tr><td>" + newPayload.orderTable[i].PRODUCT + "</td>"
						+ "<td>" + newPayload.orderTable[i].PRODUCT_DESC
						+ "</td></tr>";
			}
		}
		txt += "</tbody></table>";
		document.getElementById("table4").innerHTML = txt;
		document.getElementById("table4").style.display = "block";

	}
}());
