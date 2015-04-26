"use strict";

angular.module('MessengerCtrl', [])

.controller('MessengerCtrl',
  function (
    $scope
  , $timeout
  , socket
  , $state
  , $stateParams
  , User
  , Group
  , groups) {

    var s = $scope;
    // expose $state to the view
    s.$state = $state;
    // expose User to the view
    s.UserObj = User.GetUserObj();
    console.log('UserObj:', s.UserObj);
    // expose User's messages
    s.GlobalMessages = {};
    // expose User's groups
    s.GroupObjs = groups;
    // s.GroupObjs = [];
    // all errors in this page are here
    s.err = {};

    s.SetGroup = function (group) {
      s.groupName = group;
    };

    // Let's say that when user come
    console.log('got into messenger ctrl');

    // listen to all incoming messages
    // and classify them to the right place
    socket.on('message.receive', function (message) {
      var messageGroup = message.GroupObj.group_name;
      // if the messageGroup is not recognized
      if (!s.GlobalMessages[messageGroup]) {
        console.log('got a message from an unknown group');
        return ;
      }
      //time format
      var datetime = new Date(message.sent_at)
      message.sent_at = datetime.getHours() + '.' + datetime.getMinutes();
      // scroll down when receive a new message
      var h = $('#messenger-chat')[0].scrollHeight;
      $('#messenger-chat').animate({ scrollTop: h }, 300);
      // separatly clissify it to the right box
      s.GlobalMessages[messageGroup].push(message);
    });

    // Logout
    s.Logout = function () {
      User.Logout()
        .then(function (res) {
          // logout success
          console.log('logout success');
          // redirect to login
          $state.go('login');
        }, function (err) {
          // logout err
          console.log('logout fail', err);
        });
    };

    // this block is of code is all about joining..
    (function () {
      var joinModal = $('#messenger-join-group');

      s.err.join = {};
      s.join = {};

      s.AskJoin = function () {
        // clear vars
        s.err.join = {};
        s.join = {};
        // use timeout just get over the angular's warning message
        $timeout(function () {
          joinModal
            .modal({
              onApprove: function () {
                // prevent this modal from closing
                return false;
              },
            })
            .modal('show');
        });
      };

      s.Join = function (group_name) {
        // clear errors
        s.err.join = {};
        // validate
        if (!group_name) {
          s.err.join.group_name = true;
          return;
        }
        // make request
        User.Join({
          group_name: group_name
        })
          .then(function (GroupObj) {
            // success
            // make a new group list
            s.GroupObjs.push(GroupObj);
            console.log('pushed the group: ', GroupObj);
            // hide modal
            joinModal.modal('hide');
          }, function (err) {
            // err
            err.forEach(function (each) {
              switch (each) {
                case 'group_not_found':
                  s.err.join.group_name = true;
                  break;
                default:
                  console.log('err', each);
                  break;
              }
            });
          });
      };
    }());

    // Creating a new group encapsulation
    (function () {
      var createModal = $('#messenger-create-group');
      // local errors
      s.err.create = {};
      // data models
      s.create = {};

      s.AskCreate = function () {
        // clear vars
        s.err.create = {};
        s.create = {};

        // use timeout just get over the angular's warning message
        $timeout(function () {
          createModal
            .modal({
              onApprove: function () {
                // prevent this modal from closing
                return false;
              },
            })
            .modal('show');
        });
      };

      s.Create = function (group_name) {
        // clear errors
        s.err.create = {};
        // validate
        if (!group_name) {
          s.err.create.group_name = true;
          return;
        }
        // make request
        Group.Create({
          group_name: group_name,
        })
          .then(function (res) {
            // success
            // join into the newly craeted group
            User.Join({
              group_name: group_name,
            })
              .then(function (GroupObj) {
                // success
                // make a new group list
                console.log('GroupObjs', s.GroupObjs);
                s.GroupObjs.push(GroupObj);
                console.log('pushed the group: ', GroupObj);
              }, function (err) {
                throw new Error('err', err);
              });

            // hide modal
            createModal.modal('hide');
          }, function (err) {
            // err
            err.forEach(function (each) {
              switch (each) {
                case 'already_exists':
                  s.err.create.group_name = true;
                  break;
                default:
                  console.log('err', each);
                  break;
              }
            });
          });
      }
    }());

    // Leaving a group encapsulation
    (function () {
      var leaveModal = $('#messenger-leave-group');
      var groupNotDefinedModal = $('#messenger-leave-not-defined-group');
      // local errors
      s.err.leave = {};

      s.AskLeave = function () {
        // clear varls
        s.err.leave = {};

        // only at 'messenger.chat' can take this action
        if ($state.current.name !== 'messenger.chat') {
          return;
        }

        $timeout(function () {
          leaveModal
            .modal({
              onApprove: function () {
                // prevent this modal from closing
                return false;
              },
            })
            .modal('show');
        });
      };

      s.Leave = function () {
        var group_name = s.groupName;
        console.log('leaving from the group .. ', group_name);
        // clear errors
        s.err.leave = {};
        // validate
        if (!group_name) {
          // notice the user
          // leave modal will be auto hidden by this command
          groupNotDefinedModal.modal('show');
          return;
        }
        // make request
        User.Leave({
          group_name: group_name
        })
          .then(function (res) {
            // success
            // remove this group from the array
            for (var i = 0; i < s.GroupObjs.length; ++i) {
              if (s.GroupsObjs[i].group_name === group_name) {
                // remove that group from groupslist
                s.GroupObjs.splice(i, 1);
                break;
              }
            }
            // remove its messages
            delete s.GlobalMessages[group_name];

            // hide leave modal
            leaveModal.modal('hide');
          }, function (err) {
            // fail
            err.forEach(function (each) {
              console.log('err', each);
            })
          })
      };
    }());

  })
