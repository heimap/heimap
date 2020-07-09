/*eslint angular/file-name: 0, no-undef: 0*/
(function() {
  'use strict';

  angular
    .module('app')
    .constant('en-GB.i18n.views', {
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
        update: 'Update',
        addMap: 'Add map',
        editMap: 'Edit map' ,
        mapList: 'Map list',
        mapView: 'Map view',
        mapElements: 'Map elements',
        mapLayers: 'Map layers',
        newMap: 'New map',
        mapGeoreferencing: 'Map georeferencing',
        saveControlPoints: 'Save Control Points',
        vectorTitle: 'Vector',
        featureAttr: 'Feature Attribute',
        layerList: 'Layer list',
        addLayer: 'Add layer',
        editLayer: 'Edit layer'
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
        loadImage: 'Load image',
        open:'Open',
        close: 'Close',
        view: 'View',
        filterMaps: 'Filter maps',
        show: 'Show',
        hide: 'Hide',
        loadMapInLeft: 'Load in the left viewer',
        loadMapInRight: 'Load in the right viewer',
        hideMapLayer: 'Hide map layer',
        showMapLayer: 'Show map layer',
        removeMapLayer: 'Remove map layer',
        zoomToMapLayer: 'Zoom to map layer',
        loadedInLeftViewer: 'Loaded in the left viewer',
        loadedInRightViewer: 'Loaded in the right viewer',
        reset: 'Reset',
        unlinkLink: 'Unlink/link viewers',
        split: 'Split viewers',
        toggleVerified: 'Is or not a verified map?',
        toggleFavorite: 'Toggle favorite',
        toggleWheelZoom: 'Toggle wheel zoom', 
        toggleMarkerCreation: 'Enable/disable marker creation',
        toggleMarkerRemoval: 'Enable/disable marker removal',
        saveGeoref: 'Save georef',
        loadGcpOnMap: 'Load GCP on Map',
        createlayer: 'New Layer',
        publish: 'Publish',
        showFeatureVersion: 'Show Features Version sdfgasdgasd asdgfasdgasdfga asdgasdgfasdfasd asdfasdfasdfasd asdfasdfasdf'
      },
      fields: {
        date: 'Date',
        action: 'Action',
        actions: 'Actions',
        opacity: 'Opacity',      
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
          map: 'Map',          
          export: 'Export',
          import: 'Import',
          vector: 'Vector',
          georeference: 'Georeference',
          preferences: 'preferences',
          dashboard: 'Home',
          discussion: 'Discussion Board'
        },
        input:{
          select: 'Select'          
        }
      },
      tooltips: {        
        user: {
          profile: 'Profile',
          transfer: 'Transfer'
        }
      },
      pagination: { 
        total: 'Total',
        items: 'Item(s)'      
      }
    })

}());
