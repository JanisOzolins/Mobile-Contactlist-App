/* global contactList*/
contactList = new Mongo.Collection('contactList');

if (Meteor.isClient) {
  
  // ====================== ROUTERS ============================================
      
      // sets the overall template for the app
    
      Router.configure({
      /* global Router */
      layoutTemplate: 'layout'
      });
      
      // router for the front page
    
      Router.route('/', function() {
      this.render('page1');
      }),
      
      //router for contact page (where details are displayed)
      
      Router.map(function() {
        this.route('contact.detail', {path:'/contact/:_id', layoutTemplate: 'contactPage'});
        this.route('contact.edit', {path:'/edit/:_id', layoutTemplate: 'editContact'});
      });
    
      // router for add contact page
      Router.route('/addContactForm');
  
  // ====================== GOOGLE MAPS ========================================
      
      Meteor.startup(function() {
        /* global GoogleMaps*/
        GoogleMaps.load();
      });

  // ====================== CONTACT LIST HELPERS ===============================

      Template.lists.helpers({
        contacts : function(){
              return contactList.find();
        },
  

});

  // ====================== SINGLE CONTACT PAGE   ==============================

      Template.contactPage.helpers({
        // returns contact information based on the current URL ID
        contact: function () {
          return contactList.findOne({_id: Router.current().params._id});
        },
        // determines the contact's location based on previous user input
        contactLocationOptions: function() {
        // Make sure the maps API has loaded
        var lat = parseFloat(contactList.findOne({_id: Router.current().params._id}).latitude);
        var long = parseFloat(contactList.findOne({_id: Router.current().params._id}).longitude);
        if (GoogleMaps.loaded()) {
          // Map initialization options
          /* global google*/
          return {
            center: new google.maps.LatLng(lat, long),
            zoom: 8
          };
        }
      }
      });
  
      Template.contactPage.onCreated(function() {
        GoogleMaps.ready('contactLocation', function(map) {
            // Add a marker to the map once it's ready
            var marker = new google.maps.Marker({
              position: map.options.center,
              map: map.instance
            });
          });
      });
      
      Template.contactPage.events({
      // something here...
      });
  
  // ============================= TABS ========================================
      
      Template.tabs.events({
      "click #btnDelete" : function(event, template) {
        contactList.remove({_id: Router.current().params._id});
        /* global history*/
        Router.go('/');
      },
      "click #btnEdit" : function(event, template) {
       
       Router.go('/edit/'+Router.current().params._id);
      }
      });
  
  // ====================== ADD CONTACTS PAGE =================================
  
      Template.form.events({
      "submit form" : function(event, template) {
        
        var inputFirstName = event.target.fName.value;
        var inputLastName = event.target.lName.value;
        var inputPhone = event.target.phone.value;
        var inputEmail = event.target.email.value;
        var inputLatitude = Session.get("latitude");
        var inputLongitude = Session.get("longitude");
        
        var gen = document.getElementById("gender");
        var inputGender = gen.options[gen.selectedIndex].value;
        
        
        var object = {fName: inputFirstName, lName: inputLastName, gender: inputGender, phone: inputPhone, email: inputEmail, latitude: inputLatitude, longitude: inputLongitude}
        
        contactList.insert(object);
        
        Router.go('/');
        
        return false;
  
      },
      });
      
      Template.form.helpers({
      initialFormMap: function() {
          // Make sure the maps API has loaded
          if (GoogleMaps.loaded()) {
            // Map initialization options
            return {
              center: new google.maps.LatLng(-37.8136, 144.9631),
              zoom: 8
            };
          }
        },
      });
  
      Template.form.onCreated(function() {
        GoogleMaps.ready('addContactMap', function(map) {
          
          google.maps.event.addListener(map.instance, 'click', function(event) {
            Session.set("latitude", event.latLng.lat());
            Session.set("longitude", event.latLng.lng());
      
          addMarker(event.latLng);
          Session.set("latitude", event.latLng.lat());
          Session.set("longitude", event.latLng.lng());
          // contactList.findOne({_id: Router.current().params._id}, {latitude: event.latLng.lat()});
          // contactList.findOne({_id: Router.current().params._id}, {latitude: event.latLng.lng()});
          });
          
          var marker;
          
          function addMarker(latLng){       
            //clear the previous marker if it contains any locations...
            if(marker != null){
                marker.setMap(null);
            }
    
            marker = new google.maps.Marker({
                position: latLng,
                map: map.instance,
                draggable:true
            });
          }
        });
    });
    
  // ====================== EDIT CONTACTS PAGE =================================
    
      Template.editForm.events({
      "submit form" : function(event, template) {
        
        var inputFirstName = event.target.fName.value;
        var inputLastName = event.target.lName.value;
        var inputPhone = event.target.phone.value;
        var inputGender = contactList.findOne({_id: Router.current().params._id}).gender;
        var inputEmail = event.target.email.value;
        var inputLatitude = Session.get("latitude");
        var inputLongitude = Session.get("longitude");
        
        
        if(document.getElementById("gender").value != (undefined || null) )
        {
        var gen = document.getElementById("gender");
        vainputGender = gen.options[gen.selectedIndex].value;
        }
        
        contactList.update({_id: Router.current().params._id}, {fName: inputFirstName, lName: inputLastName, gender: inputGender, phone: inputPhone, email: inputEmail, latitude: inputLatitude, longitude: inputLongitude});

        Router.go('/');
        
        return false;
  
      },
      });
    
      Template.editForm.onCreated(function() {
        GoogleMaps.ready('editContactMap', function(map) {
          // Add a marker to the map once it's ready
          var marker = new google.maps.Marker({
            position: map.options.center,
            map: map.instance
          });
          
          
          document.getElementById("editFName").value = contactList.findOne({_id: Router.current().params._id}).fName;
          document.getElementById("editLName").value = contactList.findOne({_id: Router.current().params._id}).lName;
          document.getElementById("editPhone").value = contactList.findOne({_id: Router.current().params._id}).phone;
          document.getElementById("editEmail").value = contactList.findOne({_id: Router.current().params._id}).email;
          
          google.maps.event.addListener(map.instance, 'click', function(event) {
            Session.set("latitude", event.latLng.lat());
            Session.set("longitude", event.latLng.lng());
      
          addMarker(event.latLng);
          contactList.findOne({_id: Router.current().params._id}, {latitude: event.latLng.lat()});
          contactList.findOne({_id: Router.current().params._id}, {latitude: event.latLng.lng()});
          });
          
          var marker;
          
          function addMarker(latLng){       
            //clear the previous marker if it contains any locations...
            if(marker != null){
                marker.setMap(null);
            }
    
            marker = new google.maps.Marker({
                position: latLng,
                map: map.instance,
                draggable:true
            });
          }
        });
        
    });
    
      Template.editForm.helpers({
      initialEditFormMap: function() {
          // Make sure the maps API has loaded
          if (GoogleMaps.loaded()) {
            // Map initialization options
            var latitude = parseFloat(contactList.findOne({_id: Router.current().params._id}).latitude);
            var longitude = parseFloat(contactList.findOne({_id: Router.current().params._id}).longitude);
            return {

              center: new google.maps.LatLng(latitude, longitude ),
              zoom: 8
            };
          }
        },
      });
  
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
