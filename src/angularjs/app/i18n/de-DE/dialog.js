/*eslint angular/file-name: 0, no-undef: 0*/
(function() {
  'use strict';

  angular
    .module('app')
    .constant('de-DE.i18n.dialog', {
      confirmTitle: 'Confirm?',
      confirmDescription: 'Confirm action?',
      removeDescription: 'Do you want to remove permanently {{name}}?',
      audit: {
        created: 'Created',
        updatedBefore: 'Updated before',
        updatedAfter: 'Updated after',
        deleted: 'Deleted'
      },
      login: {
        resetPassword: {
          description: 'Type your registered e-mail in the system.'
        }
      }
    })

}());
