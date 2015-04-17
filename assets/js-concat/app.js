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

"use strict";

angular.module('GroupsCtrl', [])

.controller('GroupsCtrl',
  function (
    $scope
  , $state
  , User
  , Group) {

    var s = $scope;

    s.err = {}

  }
)

"use strict";

angular.module('LoginCtrl', [])

.controller('LoginCtrl',
  function (
    $scope
  , $state
  , User) {

    var s = $scope;

    s.err = {}

    s.Login = function (username, password) {
      // clear error
      s.err = {}
      // validate
      if (!username) {
        s.err.username = true;
        return;
      }

      if (!password) {
        s.err.password = true;
        return;
      }
      // make request
      User.Login({
        username: username,
        password: password,
      })
        .then(function (res) {
          // login success
          // redirect to groups
          console.log('res', res);
        }, function (err) {
          // login error
          console.log('err', err);
          // show error
          s.err.username = s.err.password = true
        });
    }

    s.Register = function () {
      // redirect to register
      $state.go('register');
    }
  }
)

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

"use strict";

angular.module('RegisterCtrl', [])

.controller('RegisterCtrl',
  function (
    $scope
  , $state
  , User) {
    var s = $scope;

    s.err = {}

    s.Login = function () {
      // redirect to login
      $state.go('login');
    }

    s.Register = function (username, password, disp_name) {
      // clear error
      s.err = {}
      // validate
      if (!username) {
        s.err.username = true;
        return;
      }

      if (!password) {
        s.err.password = true;
        return;
      }

      if (!disp_name) {
        s.err.disp_name = true;
        return;
      }
      // make request
      User.Register({
        username: username,
        password: password,
        disp_name: disp_name,
      })
        .then(function (res) {
          // register success
        }, function (err) {
          // register err
          err.err_msg.forEach(function (val) {
            // each err
            switch (val) {
              case 'duplicated_username':
                // do something here
                s.err.username = true;
                break;
            }
          });
        })
    }
  }
)

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

"use strict";

angular.module('directives', [])

.directive('verticalMiddle', function () {
  return {
    restrict: 'EA',
    templateUrl: '/html/vertical-middle.html',
    transclude: true,
    link: function (scope, element, attrs) {
      var $element = $(element);

      var height = $element.height() + 'px';
      console.log('height', height);
      $element.css({
        'line-height': height,
        'height': height
      });

      $element.children('.vertical-middle').css({
        'display': 'inline-block',
        'line-height': 'normal',
        'vertical-align': 'middle',
        'width': '100%',
        'max-height': '100%'
      });

      $element.find('.vertical-middle-content').css({
        'max-height': '100%'
      });
    }
  }
})

.directive('listColumn', function () {
  return {
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var $window = $(window);
      var $element = $(element);
      var $mainNav = $('#main-nav');

      $window.resize(function () {
        var availWidth = $window.width() - $mainNav.width();
        console.log('width', availWidth);
        $element.attr('style', 'width:' + availWidth + 'px !important');
      })
        // trigger window resize
        .resize();
    }
  }
})

// var socket = io();
// var offset = 0;
// var h = 0;
// var sentmsg = ''; // to be change later


// var name = prompt("your name");
// socket.emit('addUser', name);

// var room = prompt("select room");
// socket.emit('addRoom', room);

// function scrollToBottom() {
//   var h = $('#msgpane')[0].scrollHeight;
//   $('#msgpane').animate({ scrollTop: h }, 100);
// }

// $('form').submit(function(){
//   if (!$('#m').val().trim()){
//     return false;
//   }
//   socket.emit('chatmsg', $('#m').val());
//   sentmsg = $('#m').val();
//   $('#m').val('');
//   $('#m').focus();
//   return false;
// });


// socket.on('chatmsg', function(msg){
//   if (sentmsg == msg) {
//     $('#messages').append($('<div>').text(msg).addClass('mymsg'));
//   } else {
//     $('#messages').append($('<div>').text(msg));
//   }
//   $('#messages').append('<br>');
//   scrollToBottom();
// });

"use strict";

angular.module('routing', [])

.constant('ROLES', {
  guest: parseInt('01', 2),
  member: parseInt('10', 2),
})

.config(
  function (
    $stateProvider,
    $urlRouterProvider,
    ROLES
  ) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'html/login.html',
        controller: 'LoginCtrl',
      })
      .state('register', {
        url: '/register',
        templateUrl: 'html/register.html',
        controller: 'RegisterCtrl',
      })
      .state('groups', {
        url: '/groups',
        templateUrl: 'html/groups.html',
        controller: 'GroupsCtrl',
        // restrict that only members can get access
        // to this page
        // restrictions: [
        //   { authorized: ROLES.member,
        //     // if the user is not member, go to 'login' state
        //     no: 'login' }
        // ]
      })
      .state('chat', {
        url: '/chat/:groupId',
        templateUrl: 'html/chat.html',
        controller: 'ChatCtrl',
      })
  }
)
