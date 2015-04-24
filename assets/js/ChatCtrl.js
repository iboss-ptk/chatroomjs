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
    s.err = {};

    s.User = User.GetUserObj();
    // all the messages in this chat
    // we get 'messages' from the resolving state in routing.js
    s.Messages = s.GlobalMessages[s.groupName] = messages;

    s.Send = function () {
      console.log('sending ...', s.content);
      Message.Send({
        group_name: s.groupName,
        content: s.content,
      })
        .then(function (res) {
          // sending done!
          // do nothing perhaps.
          s.content = '';
          console.log('sending done');
        }, function (err) {
          console.log('err', err);
        });
    };
  }
)
