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

    s.OpenChat = function(group) {
    	// todo: change page
    	$state.go();
    }
  }
)
