"use strict";

angular.module('MessengerCtrl', [])

.factory('MessengerService',
  function () {
    return {

    }
  })

.controller('MessengerCtrl',
  function (
    $scope
  , $timeout
  , $state
  , User
  , Group) {

    console.log('aoeuaoeuao');
    var s = $scope;
    // expose $state to the view
    s.$state = $state;
    // expose User to the view
    s.UserObj = User.GetUserObj();
    // expose User's groups
    s.GroupObjs = User.GetGroup();
    // all errors in this page are here
    s.err = {};

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

    (function () {
      var joinModal = $('#messenger-join-group');

      s.err.join = {};
      s.join = {};

      s.AskJoin = function () {
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
                case 'unknown_group_name':
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
                case 'duplicated_group_name':
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

      s.Leave = function (group_name) {
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
        User.leave({
          group_name: group_name
        })
          .then(function (res) {
            // success
            // remove this group from the array

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
