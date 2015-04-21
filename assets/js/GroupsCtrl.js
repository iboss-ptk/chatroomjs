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

    s.groups = User.GetGroup();
    console.log('groups', s.groups)

  }
)
