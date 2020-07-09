/*eslint angular/file-name: 0, no-undef: 0*/
(function() {
  'use strict';

  angular
    .module('app')
    .constant('en-GB.i18n.messages', {
      internalError: 'Internal error. contact the system admin',
      mapFileIsMandatory: 'Select a map file is mandatory',
      invalidImageFile: 'File selected is not a valid image file',
      fileTooBig: 'File selected is too big',
      notFound: 'Not found',
      notAuthorized: 'You do not have access to this functionality.',
      searchError: 'Search error.',
      saveSuccess: 'Item saved successfully.',
      saveGeoreferenceSuccess: 'Image has been rectified.',
      operationSuccess: 'Operation done with success.',
      operationError: 'Error while doing the operation',
      saveError: 'Error while trying to save the item.',
      removeSuccess: 'Removal done with success.',
      removeError: 'Error while trying to remove the item.',
      resourceNotFoundError: 'Item not found',
      notNullError: 'All the mandatory fields must be filled.',
      duplicatedResourceError: 'Already exists an item with these data.',
      deleteLayerTitle: 'Delete Layer?',
      deleteLayerMessage: 'Would you like to Delete layer?',
      yes: 'Yes',
      no: 'No',
      validate: {
        fieldRequired: 'The field {{field}} is mandatory.'
      },
      layout: {
        error404: 'Page no found'
      },
      login: {
        logoutInactive: 'You have been logged out. Login again.',
        invalidCredentials: 'Invalid credentials',
        unknownError: 'It was not possible to log you in. ' +
          'Try again. If the error persists, contact the system administrator.',
        userNotFound: 'User not found'
      },
      dashboard: {
        welcome: 'Welcome {{userName}}',
        description: 'Use the for navigation.'
      },
      mail: {
        mailErrors: 'An error has occurred in the following e-mails:\n',
        sendMailSuccess: 'Email sent with success!',
        sendMailError: 'It was not possible to send the e-mail.',
        passwordSendingSuccess: 'The password recover process was initiated. If the e-mail does not arrive in 10 minutes, try again.'
      },
      user: {
        removeYourSelfError: 'You can not remove your own user.',
        userExists: 'User already exists!',
        profile: {
          updateError: 'It was not possible to update your profile.'
        }
      },
      map: {
        dropMap: 'Drop map here',
        selectAMap: 'Select a map image',
        selectAGeoFile: 'Select a geo file',
        clickToAdd: 'Click to add a new map'
      },
      georefStartRectangleExtent: 'Draw a Rectangle on Left Map'
    })

}());
