"use strict";

angular.module('RegisterCtrl', [])

.controller('RegisterCtrl',
  function (
    $scope
  , $state
  , FileUploader
  , User) {
    var s = $scope;

    var uploader = s.uploader = new FileUploader({
      url: 'photo',
      formData: { _token: User.GetToken() },
      queueLimit: 2,
    });

    s.Delete = function () {
      uploader.clearQueue();
    }

    uploader.onAfterAddingFile = function(fileItem) {
      console.log('queue: ', uploader.queue.length);
      if (uploader.queue.size > 0) {
        uploader.removeFromQueue(0);
      }
        console.info('onAfterAddingFile', fileItem);
    };

    s.err = {}

    s.Login = function () {
      // redirect to login
      $state.go('login');
    }

    s.Register = function (username, password, disp_name) {
      // clear error
      s.err = {}
      // validate
      if (uploader.queue.length === 0) {
        s.err.display_image = true;
        return ;
      }

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
              uploader.queue[0].upload();
              uploader.onCompleteAll = function() {
                  console.info('onCompleteAll');
              };
              // redirect to groups
              $state.go('messenger.groups');
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
