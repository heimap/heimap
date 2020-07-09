/*eslint angular/file-name: 0, no-undef: 0*/
(function() {
  'use strict';

  angular
    .module('app')
    .constant('en-GB.i18n.dialog', {
      confirmTitle: 'Confirm?',
      confirmDescription: 'Confirm action?',
      confirmLoadUngeoreferencedTitle: 'Confirm load ungeoreferenced map',
      confirmLoadGeoreferencedTitle: 'Confirm load georeferenced map',
      LoadUngeoreferencedDescription: 'If you load this ungeoreferenced map all base layers and other maps will be removed from the viewer. Do you want to proceed?',
      LoadGeoreferencedDescription: 'If you load this georeferenced map current ungeoreferenced layers will be removed from the viewer. Do you want to proceed?',
      removeDescription: 'Do you want to remove permanently {{name}}?',
      invalidGeorefTitle: 'Invalid number of Ground Control Points',  
      invalidGeorefText: 'Same number of Ground Control Points and a minimum of 3 Ground Control Points is required in each viewer to georeference a map',     
      login: {
        resetPassword: {
          description: 'Type your registered e-mail in the system.'
        }
      },
      cantLoadTitle: 'Can\'t link Both the maps',
      cantLoadDescription: 'Can\'t link maps since one of maps has Ungeoreferenced image',
      cantPreviewGcptableTitle: 'Select Rectify Method and Resampling Method',
      cantPreviewGcptableText: 'Please select Rectify Method and Resampling Method to Preview GCP'
    })

}());
