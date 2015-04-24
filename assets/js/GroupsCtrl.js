"use strict";

angular.module('GroupsCtrl', [])

.controller('GroupsCtrl',
  function (
    $scope
  , $state
  , User
  , Group) {

    var s = $scope;

    s.err = {};

    s.OpenChat = function (group) {
      $state.go('messenger.chat', { groupName: group.group_name });
    }
  }
)
