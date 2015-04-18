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
        ]
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
        ]
        // the following block of code must be done before loading the state
        resolve: {
          messages: function (Message, $state, $stateParams) {
            console.log('aoeuaoeu');
            // we have to check whether the group exists or not
            return Message.GetUnread({
              group_name: $stateParams.groupName,
            })
              .then(null, function (err) {
                console.log('err', err);
                // tell the user that he's requesting the unknown group
              });
          }
        },
      })
  }
)
