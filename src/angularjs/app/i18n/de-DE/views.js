/*eslint angular/file-name: 0, no-undef: 0*/
(function() {
  'use strict';

  angular
    .module('app')
    .constant('de-DE.i18n.views', {
      breadcrumbs: {
        user: 'Use admin',
        'user-profile': 'User profile',
        dashboard: 'Dashboard',
        audit: 'Audit',
        mail: 'Mail send',
        project: 'Projects',        
        'not-authorized': 'Not authorized'
      },
      titles: {
        dashboard: 'Home page',
        mailSend: 'Send mail',
        taskList: 'Task list',
        userList: 'User list',
        auditList: 'Audit List',
        register: 'Register',
        resetPassword: 'Reset password',
        update: 'Update'
      },
      actions: {
        send: 'Send',
        save: 'Save',
        clear: 'Clear',
        clearAll: 'Clear all',
        restart: 'Restart',
        filter: 'Filter',
        search: 'Search',
        list: 'List',
        edit: 'Edit',
        cancel: 'Cancel',
        update: 'Update',
        remove: 'Remove',
        getOut: 'Exit',
        add: 'Add',
        in: 'enter',
        loadImage: 'Load image'
      },
      fields: {
        date: 'Date',
        action: 'Action',
        actions: 'Actions',        
        login: {
          resetPassword: 'Reset password',
          confirmPassword: 'Confirm password'
        },
        mail: {
          to: 'To',
          subject: 'Subject',
          message: 'Message'
        },
        user: {
          profile: 'Profiles',
          nameOrEmail: 'Name or e-mail'
        }
      },
      layout: {
        menu: {
          dashboard: 'Dashboard',          
          admin: 'Administration',
          examples: 'Examples',
          user: 'User',
          mail: 'Send email',
          audit: 'Audit'
        }
      },
      tooltips: {        
        user: {
          profile: 'Profile',
          transfer: 'Transfer'
        }
      }
    })

}());
