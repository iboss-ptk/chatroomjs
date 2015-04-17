"use strict";

angular.module('app', [
  'btford.socket-io' ])

.factory('socket', function (socketFactory) {
  return socketFactory();
})

.factory('Caller', function (socket) {
  var runningId = 1;
  function GetUniqueId() {
    return '_' + runningId;
  }

  return {
    Call: function (event, data, callback) {
      var returnEvent = GetUniqueId();
      // append _event to the request
      data._event = returnEvent;
      // emit
      socket.emit(event, data);
      // wait for the return
      // send it to callback function
      socket.once(returnEvent, function (res) {
        callback(res);
      });
    }
  }
})

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

.factory('Group', function (User, Caller, $q) {
  return {
    Create: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = User.GetToken();
      Caller.Call('group.create', req, function (res) {
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

.controller('TestCtrl', function ($scope, socket) {
  var s = $scope;

  socket.on('connection', function () {
    console.log('conn!!', 'aoeuaoeu');
  });
})
