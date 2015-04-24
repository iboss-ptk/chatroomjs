"use strict";

angular.module('User', [])

.factory('User', function (Caller, $q) {
  // storage namespace
  var namespace = '_chatroomjs_';
  // browser's storage
  // localStorage is key, value and string based
  var storage = localStorage;

  // password salt
  // even an intruder knows this (and he will)
  // he has no choice but to use brute-force or dictionary attack
  // but not rainbow table :D
  // ::please don't change this!
  var salt = '927RV6ggf7loy13U';

  // Token encapsulation
  var token = (function () {
    // this is jwt token
    // client just has to keep it
    // and sends it to the sever on every request
    var jwtToken = null;
    // check local storage for old token
    var storedToken = storage[namespace + 'token'];
    if (storedToken) {
      jwtToken = storedToken;
      console.log('stored token:', storedToken);
    }

    return {
      Get: function () { return jwtToken; },
      Set: function (_token) {
        // upadet both jwtToken and Local Storage Token
        jwtToken = _token;
        storage[namespace + 'token'] = _token;
      },
    }
  }());

  var UserObj = (function() {
    var UserObj = null;
    // check local storage for old UserObj
    var storedUserObj = storage[namespace + 'UserObj'];
    if (typeof token.Get() === 'string'
      && storedUserObj
      // this for bug fix
      && storedUserObj !== 'undefined'
      ) {
      UserObj = JSON.parse(storedUserObj);
      console.log('stored userobj:', UserObj);
    }

    return {
      Get: function () { return UserObj; },
      Set: function (_UserObj) {
        // verify that _UserObj is an object
        if (typeof _UserObj !== 'object' || _UserObj === null) {
          console.log("User Object will not be set, because it's empty");
          return ;
        }
        // update both in mem and in local storage
        UserObj = _UserObj;
        storage[namespace + 'UserObj'] = JSON.stringify(UserObj);
        console.log('stored use has been set: ', JSON.stringify(UserObj));
      },
      Unset: function() {
        // remove UserObj from webstorage
        storage.removeItem(namespace + 'UserObj');
      },
    }
  }());

  return {
    GetToken: function () {
      return token.Get();
    },

    GetUserObj: function () {
      return UserObj.Get();
    },

    Login: function (req) {
      var deferred = $q.defer();

      // hash the password first!
      // hash with sha256 (sha2)
      var hasher = new Hashes.SHA256
      // salt the password
      var salted = req.password + salt;
      // encode in base64
      req.password = hasher.b64(salted);

      Caller.Call('user.login', req, function (res) {
        if (res.success === true) {
          // save return token
          token.Set(res._token);
          // save return UserObj
          UserObj.Set(res.UserObj);

          deferred.resolve(res.UserObj);
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Register: function (req) {
      var deferred = $q.defer();

      // hash the password first!
      // hash with sha256 (sha2)
      var hasher = new Hashes.SHA256
      // salt the password
      var salted = req.password + salt;
      // password is hashed in base64 format
      req.password = hasher.b64(salted);

      Caller.Call('user.register', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Join: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token.Get();
      Caller.Call('user.join', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Leave: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token.Get();
      Caller.Call('user.leave', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Pause: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token.Get();
      Caller.Call('user.pause', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Logout: function () {
      var deferred = $q.defer();
      // fabricate the request
      var req = {
        _token: token.Get(),
      };
      Caller.Call('user.logout', req, function (res) {
        if (res.success === true) {
          // clear token
          token.Set(null);
          // clear UserObj
          UserObj.Unset();

          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    GetGroup: function () {
      var deferred = $q.defer();
      // fabricate the request
      var req = {
        _token: token.Get(),
      };

      Caller.Call('user.get_group', req, function (res) {
        if (res.success === true) {
          deferred.resolve(res.GroupObjList);
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },
  }
})
