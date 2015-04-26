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
    s.NotificationCount = {};
    // expose User's groups
    s.GroupObjs = groups;
    // s.GroupObjs = [];
    // all errors in this page are here
    s.err = {};
    // joining group, default null
    s.groupName = null;

    s.SetGroup = function (group) {
      s.groupName = group;
    };

    s.ShowAllGroups = function () {
      // pause the group we're leaving
      var groupName = s.groupName;
      if (groupName === null) {
        // just clicking ....
        return ;
      }
      User.Pause({
        group_name: groupName,
      })
        .then(function (res) {
          console.log('pause success:', groupName);
        }, function (err) {
          console.log('pause fail:', groupName);
        });

      s.groupName = null;
      $state.go('messenger.groups');
    };

    // Init global messages according to Group list
    (function () {
      s.GroupObjs.forEach(function (group) {
        s.GlobalMessages[group.group_name] = [];
        s.NotificationCount[group.group_name] = 0;
      });
    }());

    // Let's say that when user come
    console.log('got into messenger ctrl');

    // listen to all incoming messages
    // and classify them to the right place
    socket.on('message.receive', function (message) {
      console.log('got this message: ', message);
     
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
      if (s.groupName !== null) {
        // do this only when we're in a group
        var h = $('#messenger-chat')[0].scrollHeight;
        $('#messenger-chat').animate({ scrollTop: h }, 300);
      }
      // separatly clissify it to the right box
      s.GlobalMessages[messageGroup].push(message);
      // incr notification count
      // check if the message is the one in the group we're watching
      if (messageGroup === s.groupName) {
        // we will not count this
        return ;
      }
     // show notification
      notify(message);
      console.log('notification count!');
      // count notification
      s.NotificationCount[messageGroup] += 1;
    });

    // emit notification
    function notify(message){
      $timeout(function(){
        // $('#notification').fadeOut(500);
        $('#notification').queue(function(){
          $(this).html(
            '<a href="/#/chat/'+ message.GroupObj.group_name +'">'+
            '<img class="avatar" src="/display_images/'+ message.UserObj.display_image +'">'+
            '<div class="content">'+
            '<b>'+message.UserObj.disp_name+'</b> says to '+ message.GroupObj.group_name+
            ':<br> '+message.content.substring(0, 24)+
            '</div></a>'
          ).dequeue();
        });
        $('#notification').fadeTo(500, 0.8, 'swing').delay(2000).fadeTo(500, 0);
      });
    }

    // Logout
    s.Logout = function () {
      // helper function
      function Logout() {
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
      }

      // in group ? checking
      var groupName = s.groupName;
      if (groupName === null) {
        // we're not in a group
        // no need to pause
        Logout();
      }
      else {
        // pause the group we're leaving
        User.Pause({
          group_name: groupName,
        })
          .then(function (res) {
            console.log('pause success:', groupName);
            Logout();
          }, function (err) {
            console.log('pause fail:', groupName);
            Logout();
          });
      }
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
              if (s.GroupObjs[i].group_name === group_name) {
                // remove that group from groupslist
                s.GroupObjs.splice(i, 1);
                break;
              }
            }
            // remove its messages
            delete s.GlobalMessages[group_name];

            // hide leave modal
            leaveModal.modal('hide');

            $state.go('messenger.groups');
          }, function (err) {
            // fail
            err.forEach(function (each) {
              console.log('err', each);
            })
          })
      };
    }());

  })
