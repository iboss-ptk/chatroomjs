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
    // expose the group name
    s.groupName = $stateParams.groupName;
    // all the errors
    s.err = {}

    // all the messages in this chat
    // we get 'messages' from the resolving state in routing.js
    s.Messages = s.GlobalMessages[s.groupName] = messages;

    s.Send = function (content) {
      Message.Send({
        group_name: s.groupName,
        content: content,
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
