/*eslint angular/file-name: 0, no-undef: 0*/
(function() {
  'use strict';

  angular
    .module('app')
    .constant('en-GB.i18n.attributes', {
      email: 'Email',
      password: 'Password',
      name: 'Name',
      image: 'Image',
      roles: 'Profiles',
      date: 'Date',
      initialDate: 'Initial date',
      finalDate: 'End date',
      title: 'Title',
      mapType: 'Map type',
      projection: 'Projection',
      georeferenced: 'Georeferenced',
      isGeoreferenced: 'Is georeferenced',
      isNotGeoreferenced: 'Is not georeferenced',
      mapOptions: 'Map options',          
      verified: 'Verified',
      rectifyMethod: 'Rectify method',
      resamplingMethod: 'Resampling method',
      enterGeorefFileName: 'Georeferenced file name',
      extentGeoRef: 'Enter coordinates to crop the image: min Lng, min Lat, max Lng, max Lat. Default extent, as shown below, is selected based from the provided GCPs. If don\'t want any cropping then simply delete the default coordinates',
      minx: 'West',
      miny: 'South',
      maxx: 'East',
      maxy: 'North',
      cropImage: 'Crop Image based on Extent Values?',
      cropImageByDraw: 'Crop Image based by drawing on map?',
      cropImageNone: 'None',
      previewGCP: 'Show GCP Table',
      showOnlyChildMap: 'Show only Maps which used the loaded NonGeoreferenced image',
      description: 'Description',
      gazzType: 'CRM Entity Type',
      buildingType: 'Buidling Type',
      state: 'State',
      country: 'Country',
      timeSpan: 'Time Span',
      material: 'Material',
      refDocument: 'Document Reference',
      createdDate: 'Created Date',
      king: 'King',
      title: 'Title'
    })

}());
