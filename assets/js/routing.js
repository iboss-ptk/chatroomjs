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
      .state('messenger', {
        templateUrl: 'html/messenger.template.html',
        controller: 'MessengerCtrl',
        resolve: {
          groups: function(User) {
            var r = User.GetGroup();

            r.then(function (res) {
              console.log('groups', res);
            }, function (err) {
              console.log('during resloving messenger');
              throw new Error(err);
            });

            return r;
          },
        },
      })
      .state('messenger.groups', {
        url: '/groups',
        templateUrl: 'html/groups.html',
        controller: 'GroupsCtrl',
        // restrict that only members can get access
        // to this page
        restrictions: [
          { authorized: ROLES.member,
            // if the user is not member, go to 'login' state
            no: 'login' }
        ],
        resolve: {
          pauseAll: function (User) {
            console.log('pause all groups');
            // pause all groups
            var r = User.Pause({
              group_name: null,
            });

            r.then(null, function (err) {
              console.log('during resolving groups');
              throw new Error(err);
            });

            return r;
          },
        },
      })
      .state('messenger.chat', {
        url: '/chat/:groupName',
        templateUrl: 'html/chat.html',
        controller: 'ChatCtrl',
        // restrict that only members can get access
        // to this page
        restrictions: [
          { authorized: ROLES.member,
            // if the user is not member, go to 'login' state
            no: 'login' }
        ],
        // the following block of code must be done before loading the state
        resolve: {
          messages: function (Message, $state, $stateParams) {
            console.log('getting unread messages of : ', $stateParams.groupName);
            // we have to check whether the group exists or not
            // server should unpause this user from the group as well
            var r = Message.GetUnread({
              group_name: $stateParams.groupName,
            });

            r.then(null, function (err) {
              console.log('during resolving chat');
              throw new Error(err);
            });

            return r;
          }
        },
      })
  }
)
