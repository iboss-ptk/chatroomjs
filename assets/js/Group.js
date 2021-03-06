"use strict";

angular.module('Group', [])

.factory('Group', function (User, Caller, $q) {
  return {
    Create: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = User.GetToken();
      Caller.Call('group.create', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    }
  }
})
