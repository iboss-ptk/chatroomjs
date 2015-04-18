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
        // restrict that only members can get access
        // to this page
        // restrictions: [
        //   { authorized: ROLES.member,
        //     // if the user is not member, go to 'login' state
        //     no: 'login' }
        // ]
      })
      .state('messenger.groups', {
        url: '/groups',
        templateUrl: 'html/groups.html',
        controller: 'GroupsCtrl',
      })
      .state('messenger.chat', {
        url: '/chat/:groupId',
        templateUrl: 'html/chat.html',
        controller: 'ChatCtrl',
      })
  }
)
