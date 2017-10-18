var NinjaAjax = function(settings){
	this.async = true;
	this.type = 'POST';
	this.cache = false;
	this.requestDataType = 'JSON';
	this.requestContentType = true;
	this.requestProcessData = true;
	this.requestHeaders = [];
	this.parseResponse = true;
	this.error = false;
	this.onBeforeSend = undefined;
	this.onStatusChanged = undefined;
	this.onSuccess = undefined;
	this.onError = undefined;
	this.onDone = undefined;

	this.name = name;
	this.response = undefined;
	this.responseDate = undefined;
	this.sent = false;
	this.sendDate = undefined;
};

NinjaAjax.prototype = {
	create: function(){
		return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	},

	bindSettings: function(settings){
		Ninja.prototype.extend(this, settings);
	},

	addHeader: function(name, data){
		this.requestHeaders.push({name: name, data: data});
	},

	setRequestHeaders: function(request){
		request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		if(!this.cache){ request.setRequestHeader('Cache-Control', 'no-cache'); }


		if(this.requestContentType){
			var contentType = this.requestDataType === 'JSON' ? 'application/json' : 'application/x-www-form-urlencoded';
			request.setRequestHeader('Content-Type', contentType);
		}

		if(this.requestHeaders && this.requestHeaders.length > 0){
			for(var i = 0, len = this.requestHeaders.length; i < len; i++){
				var header = this.requestHeaders[i];
				request.setRequestHeader(header.name, header.data);
			}
		}
	},

	post: function(url, data, onSuccess, onError, settings){
		this.send(url, 'POST', data, onSuccess, onError, settings);
	},

	get: function(url, data, onSuccess, onError, settings){
		this.send(url, 'GET', data, onSuccess, onError, settings);
	},

	put: function(url, data, onSuccess, onError, settings){
		this.send(url, 'PUT', data, onSuccess, onError, settings);
	},

	delete: function(url, data, onSuccess, onError, settings){
		this.send(url, 'DELETE', data, onSuccess, onError, settings);
	},

	send: function(url, type, data, onSuccess, onError, settings){
		var ref = this;
		var request = ref.create();

		if(!request){ return; }
		if(!url){ return; }
		if(settings){ ref.bindSettings(settings); }

		if(!data){ data = ref.data; }
		if(!type){ type = ref.type.toUpperCase(); }
		if(!onSuccess){ onSuccess = ref.onSuccess; }
		if(!onError){ onError = ref.onError; }
		if(this.requestDataType === 'JSON' && this.requestProcessData && typeof data !== 'string'){ data = JSON.stringify(data);}

		request.open(type, url, ref.async);
		this.setRequestHeaders(request);

		request.onreadystatechange = function(){
			if(ref.onStatusChanged){
				ref.onStatusChanged(request.readyState, request.status);
			}

			try{
				if(request.readyState === 4){
					if(request.status === 200){
						var response = request.responseText;

						if(ref.requestIsResponseJson(request) && ref.parseResponse){ response = JSON.parse(response); }
						ref.response = response;
						ref.responseDate = new Date();
						if(onSuccess){ onSuccess(response);}
						ref.error = false;
						if(ref.onDone){ ref.onDone(response, ref.error); }
					}else{
						throw 'There was a problem with the request.';
					}
				}
			}catch(e){
				ref.error = true;
				ref.response = e;
				if(onError){ onError(e); }
				if(ref.onDone){ ref.onDone(e, ref.error); }
			}
		};


		if(ref.onBeforeSend){ ref.onBeforeSend(); }
		if(type === 'POST' || type === 'PUT'){
			request.send(data);
		}else{
			request.send();
		}
		ref.sent = true;
		ref.sendDate = new Date();
	},

	requestIsResponseJson: function(request){
		if(!request){ return; }
		var contentType = request.getResponseHeader('content-type');
		return contentType && contentType.indexOf('application/json') != -1;
	}
};
