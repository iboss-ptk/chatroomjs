"use strict";

angular.module('LoginCtrl', [])

.controller('LoginCtrl',
  function (
    $scope
  , $state
  , User) {

    var s = $scope;

    s.err = {}

    s.Login = function (username, password) {
      // clear error
      s.err = {}
      // validate
      if (!username) {
        s.err.username = true;
        return;
      }

      if (!password) {
        s.err.password = true;
        return;
      }
      // make request
      User.Login({
        username: username,
        password: password,
      })
        .then(function (res) {
          // login success
          console.log('res', res);
          // redirect to groups
          $state.go('messenger.groups');
        }, function (err) {
          // login error
          console.log('err', err);
          // show error
          s.err.username = s.err.password = true;
        });
    }

    s.Register = function () {
      // redirect to register
      $state.go('register');
    }
  }
)
