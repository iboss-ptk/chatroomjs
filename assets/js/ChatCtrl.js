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
    // expose the group name to its parent
    // s.SetGroup is defined in its parent
    s.SetGroup(s.groupName);
    // all the errors
    s.err = {};

    s.User = User.GetUserObj();
    // all the messages in this chat
    // we get 'messages' from the resolving state in routing.js

    s.Messages = s.GlobalMessages[s.groupName] = messages;
    // clear notification count in this group
    s.NotificationCount[s.groupName] = 0;

    for (var i = messages.length - 1; i >= 0; i--) {
      var datetime = new Date(messages[i].sent_at)
      messages[i].sent_at = datetime.getHours() + '.' + datetime.getMinutes();
    };

    s.Send = function () {
      //do not send if no content
      if($.trim(s.content) == '') return;
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
