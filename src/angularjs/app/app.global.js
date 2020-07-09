(function() {
    'use strict';
  
    angular
      .module('app')
      .constant('Global', {
        appName: 'HeiMAP',
        imagePath: '/images',
        clientPath: '/webapp/app',        
        homeState: 'app.map',
        homeUrl: '/map',
        apiPath: '',
        dashboardUrl: 'http://heimap-app.uni-heidelberg.de',
        discussionBoardUrl: ''
      });
  }());
  