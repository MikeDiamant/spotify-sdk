'use strict';

import Factory from './Factory';

var singleton = Symbol();
var singletonEnforcer = Symbol();

class Client {
    
    constructor(enforcer) {
        this._token = null;
        this._clientId = null;
        this._secretId = null;
        this._scopes = null;
        this._redirect_uri = null;
        
        if (enforcer != singletonEnforcer) {
            throw "Cannot construct singleton";   
        }
    }

    static get instance() {
        if(!this[singleton]) {
          this[singleton] = new Client(singletonEnforcer);
        }
        return this[singleton];
    }

    set settings(settings) {
        this._token = settings.token;
        this._clientId = settings.clientId;
        this._secretId = settings.secretId;
        this._scopes = settings.scopes;
        this._redirect_uri = settings.redirect_uri;
    }

    set token(data) {
        this._token = data;
    }

    get token() {
        return this._token;
    }
    
    login() {
        return new Promise((resolve, reject) => {
            let url_login = 'https://accounts.spotify.com/en/authorize?response_type=token&client_id='+
                this._clientId+'&redirect_uri='+encodeURIComponent(this._redirect_uri)+
                ( this._scopes ? '&scope=' + encodeURIComponent( this._scopes) : '');
            resolve(url_login);
        });
    }

    request(url, method, body) {
        return this.fetch(url, method, body).then((data) => {
            return Factory(data);
        }.bind(this));
    }

    toQueryString(obj) {
      var str = [];
      for(var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join("&");
    }


    fetch(endpoint, method, body) {
        let _headers = { 'Accept': 'application/json'};
        let _url;
        let _body;

        if (this._token) {
            _headers.Authorization = `Bearer ${this._token}`;
        }

        if (endpoint.indexOf('https') > -1) {
            _url = endpoint;
        } else {
            _url = `https://api.spotify.com/v1${endpoint}`;
        }

        if (method === 'GET') {
            if (body) {
                let separator = _url.indexOf('?') !== -1 ? "&" : "?";
                _url = _url+separator+this.toQueryString(body);
            }
        } else {
            _body = JSON.stringify(body);
        }

        return fetch(_url, {
            method: method || 'GET',
            headers: _headers,
            body: _body
        }).then((response) => {
            return response.json();
        });
    };
}

export default Client;