"use strict";

angular.module('RegisterCtrl', [])

.controller('RegisterCtrl',
  function (
    $scope
  , $state
  , User) {
    var s = $scope;

    s.err = {}

    s.StartUpload = null;

    s.Login = function () {
      // redirect to login
      $state.go('login');
    }

    s.RegisterUploader = function (fn) {
      s.StartUpload = fn;
    }

    s.Register = function (username, password, disp_name) {
      // clear error
      s.err = {}
      // validate
      // if (uploader.queue.length === 0) {
      //   s.err.display_image = true;
      //   return ;
      // }

      if (!disp_name) {
        s.err.disp_name = true;
        return;
      }

      if (!username) {
        s.err.username = true;
        return;
      }

      if (!password) {
        s.err.password = true;
        return;
      }
      // make request
      User.Register({
        username: username,
        password: password,
        disp_name: disp_name,
      })
        .then(function (res) {
          // register success
          console.log('res', res);
          // take login
          User.Login({
            username: username,
            password: password,
          })
            .then(function (res) {
              // upload image :D
              var token = User.GetToken();
              s.StartUpload(token, function () {
                // redirect to groups
                $state.go('messenger.groups');
              });

            }, function (err) {
              // login error occured
              console.log('err', err);
            })
        }, function (err) {
          // register err
          err.forEach(function (val) {
            // each err
            switch (val) {
              case 'duplicated_username':
                // do something here
                s.err.username = true;
                break;
            }
          });
        })
    }
  }
)
