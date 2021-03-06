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
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    GetUnread: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = User.GetToken();
      Caller.Call('message.get_unread', req, function (res) {
        console.log('unread:', res);
        if (res.success === true) {
          console.log(res.unread_msg);
          deferred.resolve(res.unread_msg);
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    }
  }
})
