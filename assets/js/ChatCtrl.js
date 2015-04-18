"use strict";

angular.module('ChatCtrl', [])

.controller('ChatCtrl',
  function (
    $scope
  , $state
  , $stateParams
  , User
  , Group
  , Message
  , messages) {

    var s = $scope;

    s.err = {}

    // resolved from Message (in routing.js)
    s.messages = messages;
    console.log('messages', s.messages);

    s.Send = function (content) {
      Message.Send({
        group_name: $stateParams.groupName
      })
        .then(function (res) {
          // sending done!
          // do nothing perhaps.
        }, function (err) {
          console.log('err', err);
        });
    }

  }
)
