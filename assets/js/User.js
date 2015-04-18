"use strict";

angular.module('User', [])

.factory('User', function (Caller, $q) {
  // this is jwt token
  // client just has to keep it
  // and sends it to the sever on every request
  var token = null;

  return {
    GetToken: function () {
      return token;
    },

    Login: function (req) {
      var deferred = $q.defer();

      // hash the password first!
      // hash with sha256 (sha2)
      var hasher = new Hashes.SHA256
      req.password = hasher.b64(req.password)

      Caller.Call('user.login', req, function (res) {
        if (res.success === true) {
          // save return token
          token = res._token;
          deferred.resolve(res);
        }
        else {
          deferred.reject(res);
        }
      });

      return deferred.promise;
    },

    Register: function (req) {
      var deferred = $q.defer();

      // hash the password first!
      // hash with sha256 (sha2)
      var hasher = new Hashes.SHA256
      req.password = hasher.b64(req.password)

      Caller.Call('user.register', req, function (res) {
        if (res.success === true) {
          // clear token
          token = null;
          deferred.resolve(res);
        }
        else {
          deferred.reject(res);
        }
      });

      return deferred.promise;
    },

    Join: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token;
      Caller.Call('user.join', req, function (res) {
        if (res.success === true) {
          deferred.resolve(res);
        }
        else {
          deferred.reject(res);
        }
      });

      return deferred.promise;
    },

    Leave: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token;
      Caller.Call('user.leave', req, function (res) {
        if (res.success === true) {
          deferred.resolve(res);
        }
        else {
          deferred.reject(res);
        }
      });

      return deferred.promise;
    },

    Pause: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token;
      Caller.Call('user.pause', req, function (res) {
        if (res.success === true) {
          deferred.resolve(res);
        }
        else {
          deferred.reject(res);
        }
      });

      return deferred.promise;
    },

    Logout: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token;
      Caller.Call('user.logout', req, function (res) {
        if (res.success === true) {
          deferred.resolve(res);
        }
        else {
          deferred.reject(res);
        }
      });

      return deferred.promise;
    }
  }
})
