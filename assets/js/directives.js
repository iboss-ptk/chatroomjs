"use strict";

angular.module('directives', [])

// set vertical alignment of items inside a given element to be middle
.directive('verticalMiddle', function () {
  return {
    restrict: 'EA',
    templateUrl: '/html/vertical-middle.html',
    transclude: true,
    link: function (scope, element, attrs) {
      var $element = $(element);

      var height = $element.height() + 'px';
      $element.css({
        'line-height': height,
        'height': height
      });

      $element.children('.vertical-middle').css({
        'display': 'inline-block',
        'line-height': 'normal',
        'vertical-align': 'middle',
        'width': '100%',
        'max-height': '100%'
      });

      $element.find('.vertical-middle-content').css({
        'max-height': '100%'
      });
    }
  }
})

.directive('popup', function () {
  return {
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var $element = $(element);
      $element.popup({
        inline: true,
        hoverable: true,
        position: 'bottom center',
        delay: {
          show: 300,
          hide: 800,
        },
      });
    },
  }
})

// resize the div in the groups.jade to fit the window
.directive('listColumn', function () {
  return {
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var $window = $(window);
      var $element = $(element);
      var $mainNav = $('#main-nav');

      $window.resize(function () {
        var availWidth = $window.width() - $mainNav.width();
        $element.attr('style', 'width:' + availWidth + 'px !important');
      })
        // trigger window resize
        .resize();
    }
  }
})

.directive('ngEnter', function () {
  return {
    restrict: 'EA',
    link: function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    },
  }
})

.directive('dropzone', function ($timeout) {
  return {
    restrict: 'EA',
    scope: false,
    link: function (scope, element, attrs) {

      $(element).dropzone({
        url: 'photo',
        maxFiles: 1,
        accetpedFiles: 'image/*',
        thumbnailWidth: '400',
        thumbnailHeight: null,
        autoProcessQueue: false,
        thumbnail: function (file, data) {
          $('#upload-text').fadeOut(350);


          $('.image-preview')
            .fadeOut(350)
            .queue(function () {
              $(this).attr('src', data).dequeue();
            })
            .fadeIn(350);
        },
        init: function () {
          var self = this;
          var callback = null;

          scope.RegisterUploader(function (token, _callback) {
            // register callback
            callback = _callback;
            // insert token
            $('#token').val(token);
            // start upload
            console.log('started uploading..');
            self.processQueue();
          });


          this.on('success', function (files, response) {
            console.log('sending done!');
            callback();
          });
        },
      });
    }
  }
})
