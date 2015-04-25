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
      url: 'uploade.php',
      queueLimit: 1,
    });

    s.Delete = function () {
      uploader.clearQueue();
    }

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
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
