/*eslint angular/file-name: 0, no-undef: 0*/
(function() {
  'use strict';

  angular
    .module('app')
    .constant('de-DE.i18n.attributes', {
      email: 'Email',
      password: 'Password',
      name: 'Name',
      image: 'Image',
      roles: 'Profiles',
      date: 'Date',
      initialDate: 'Initial date',
      finalDate: 'End date',
      task: {
        description: 'Description',
        done: 'Done?',
        priority: 'Priority',
        scheduled_to: 'Scheduled to?',
        project: 'Project'
      },
      project: {
        cost: 'cost'
      },
      auditModel: {
      }
    })

}());
