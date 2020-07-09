(function () {
  'use strict';

  angular
    .module('app')
    .factory('FeatureService', FeatureService);


  function FeatureService(lodash) {
    
    var service = {
      getAttribute: getAttribute,
      setAttribute: setAttribute,
      createObject: createObject,
      stitchObject: stitchObject,
      createObjectFromGeoJson: createObjectFromGeoJson,
      createGeoJson: createGeoJson,
      tearObject: tearObject
    }; 

    function getAttribute(featureId) {
      return {"abc" : "def"};
    }

    function setAttribute(featureProperties) {
      console.log(">>> FeatureService >>> setAttribute ", featureProperties);
    }

    function createObject(obj) {
      console.log(">>> FeatureService >>> createObject ", obj);
      return obj;
    }

    function createObjectFromGeoJson(obj) {
      // console.log(">>> FeatureService >>> createObjectFromGeoJson ", obj.properties);

      if(lodash.size(obj.properties.key_cidoc_array.split("|")) === lodash.size(obj.properties.value_gazetteer_array.split("|"))) {
        var keyArr = obj.properties.key_cidoc_array.split("|");
        var valueArr = obj.properties.value_gazetteer_array.split("|");
        var temp = {
          // "id": obj.properties.type_crm
          "type_crm": obj.properties.type_crm
        };
        // console.log(" keyArr ", keyArr, valueArr);

        for(var i=0; i < keyArr.length; i++) {
          if(valueArr[i].indexOf("[") !== -1) {
            if(valueArr[i] !== "[object Object]") {
              temp[keyArr[i]] = JSON.parse(valueArr[i]);
            }
          } else {
            if(keyArr[i] !== "type_crm") {
              temp[keyArr[i]] = valueArr[i];
            }
          }
        }
        temp["geom"] = obj.geometry;
        // console.log("temp = ", temp);
        return temp;
      }
    }

    /**
     * generate a object with has key : value pair
     * 
     * @param {*} keys 
     * @param {*} values 
     */
    function stitchObject(keys, values) {
      // console.log(">>> FeatureService >>> stitchObject ", keys, values);
      var returnObj = {};
      if(lodash.size(keys) === lodash.size(values)) {
        for(var i=0; i < keys.length; i++) {
          returnObj[keys[i]] = values[i];
        }
        // console.log(">>> FeatureService >>> stitchObject ", returnObj);
        return returnObj;
      }
    }

    function tearObject(obj) {
      // console.log(">>> FeatureService >>> tearObject ", obj);
      // var returnObj = {};
      var keys = Object.keys(obj);
      var values = Object.values(obj);

      var resultVal = [];
      for(var i=0; i < values.length; i++) {
        if(Array.isArray(values[i])) {
          resultVal.push(JSON.stringify(values[i]));
        // } else if(typeof values[i] === "string" || typeof values[i] === "object") {
        } else {
          resultVal.push(values[i]);
        }
      }
      // keys.push("geom");
      // values.push(feature.geometry);
      return {
        "keys": keys,
        "values": resultVal
      }
    }

    function createGeoJson(geojson, properties) {
      console.log(">>> FeatureService >>> createGeoJson ", geojson, properties);
    }

    return service;
  }
})();