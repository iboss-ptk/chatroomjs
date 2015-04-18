"use strict";

angular.module('Message', [])

.factory('Message', function (User, Caller, $q) {
  return {
    Send: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = User.GetToken();
      Caller.Call('message.send', req, function (res) {
        if (res.success === true) {
          deferred.resolve(res);
        }
        else {
          deferred.reject(res);
        }
      });

      return deferred.promise;
    },

    GetUnread: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = User.GetToken();
      Caller.Call('message.get_unread', req, function (res) {
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
