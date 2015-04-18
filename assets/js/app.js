"use strict";

angular.module('app', [
  'ui.router',
  'btford.socket-io',
  // Routing
  'routing',
  // Directives
  'directives',
  // Models
  'User',
  'Group',
  'Message',
  // Pages
  'LoginCtrl',
  'RegisterCtrl',
  'GroupsCtrl',
])

.run(
  function (
    $rootScope,
    $state,
    ROLES,
    User
  ) {

    // this block of code controls the routing's permission
    $rootScope.$on('$stateChangeStart', function (event, next, current) {
      // no authorization section mentioned
      if (!next.authorized) {
        return;
      }

      // read each restriction of the next page
      var myRole = User.GetToken() === null ? ROLES.guest : ROLES.member;
      next.restrictions.forEach(function (each) {
        if ((each.authorized & myRole) === 0) {
          // access denied
          // follow the 'no' part (if any)
          if (each.no) {
            // stop going
            event.preventDefault();
            // change to this route
            $state.go(each.no);
          }
        }
        else {
          // access granted
          // follow the 'yes' part (if any)
          if (each.yes) {
            // stop going
            event.preventDefault();
            // change to this route
            $state.go(each.yes);
          }
        }
      });
    });
  }
)

.factory('socket', function (socketFactory) {
  return socketFactory();
})

.factory('Caller', function (socket) {
  // create a unique string by keeping adding up the running_id
  var runningId = 0;
  function GetUniqueId() {
    runningId += 1;
    return '_event_' + runningId;
  }

  return {
    // this method automate socket emit and socket once
    // for requesting
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
