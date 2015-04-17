"use strict";

angular.module('routing', [])

.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login');

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'html/login.html',
      controller: 'LoginCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'html/register.html',
      controller: 'RegisterCtrl'
    })
    .state('groups', {
      url: '/groups',
      templateUrl: 'html/groups.html',
      controller: 'GroupsCtrl'
    })
    .state('chat', {
      url: '/chat/:groupId',
      templateUrl: 'html/chat.html',
      controller: 'ChatCtrl'
    })
})
