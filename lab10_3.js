/* global contactList*/
contactList = new Mongo.Collection('contactList');




if (Meteor.isClient) {
  
  Meteor.myFunctions = {

    searchCheck : function() {

    },

  };
  
  Session.set("currentList", "");
  Session.set("sort", "fName");
  
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
      
      //router for dynamic CONTACT and EDIT pages
      
      Router.map(function() {
        this.route('contact.detail', {path:'/contact/:_id', layoutTemplate: 'contactPage'});
        this.route('contact.edit', {path:'/edit/:_id', layoutTemplate: 'editContact'});
      });
    
      // router for addContactForm
      Router.route('/addContactForm');
  
  // ====================== GOOGLE MAPS ========================================
      
      Meteor.startup(function() {
        /* global GoogleMaps*/
        GoogleMaps.load();
      });

  // ====================== CONTACT LISTS ======================================

      Template.lists.helpers({
        contacts : function(){
          if (Session.get('currentList') === "" || "all")
          {
            var criteria = Session.get("sort");
            if (criteria === "fName")
              return contactList.find({},{sort:{fName: 1}});
            else 
              return contactList.find({},{sort:{lName: 1}});
            
          }
          if (Session.get("currentList") === "search")
          {
            
          }
        },
      });
      
      Template.searchLists.helpers({
        contacts : function(){
          var searchParameter = Session.get('searchParameter');
          var criteria = Session.get("sort");
          if (criteria === "fName")
            return contactList.find({ $or: [ { fName: searchParameter }, { lName: searchParameter }, { gender: searchParameter }, { phone: searchParameter }, { email: searchParameter } ] },{sort:{fName: 1}});
          else 
            return contactList.find({ $or: [ { fName: searchParameter }, { lName: searchParameter }, { gender: searchParameter }, { phone: searchParameter }, { email: searchParameter } ] },{sort:{lName: 1}});

        }
      })
      
  // ====================== FRONT PAGE   =======================================

      Template.page1.events({
        "keyup #searchbar" : function() {
          /* global value*/
          var value = document.getElementById("searchbar").value;
          // if search bar is empty or search term is deleted, set variable to ""
          if ( value === "")
            {
              Session.set('currentList', "")
            }
          // if search bar contains characters, set it to a variable and prepare for search
          else
            {
              Session.set('currentList', 'search');
              Session.set('searchParameter', value);
            }
        },
      })
      
      Template.page1.helpers({
        displayList : function() {
          if (Session.get('currentList') === '')
            return true;
          else
            return false;
        }
      })

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
        // adds marker to the map
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
      
      Template.sort.events({
      "change #sort" : function() {
      var sorter = document.getElementById("sort");
      var sortvalue = sorter.options[sorter.selectedIndex].value;
      
      if (sortvalue === "fName")
        Session.set("sort", "fName");
      else
        Session.set("sort", "lName");
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
        
        // checks if the following fields are not empty
        if(document.getElementById("addFName").value === "")
          {
            alert("Please fill in all fields!");
            return false;
          }
        if(document.getElementById("addLName").value === "")
          {
            alert("Please fill in all fields!");
            return false;
          }
        if(document.getElementById("addPhone").value === "")
          {
            alert("Please fill in all fields!");
            return false;
          }
        if(document.getElementById("addEmail").value === "")
          {
            alert("Please fill in all fields!");
            return false;
          }
        if(Session.get('latitude') === "" || undefined)
          {
            alert("Please fill in all fields!");
            return false;
          }
        if(Session.get('longitude') === "" || undefined)
          {
            alert("Please fill in all fields!");
            return false;
          }
    
        
        var object = {fName: inputFirstName, lName: inputLastName, gender: inputGender, phone: inputPhone, email: inputEmail, latitude: inputLatitude, longitude: inputLongitude}
        
        contactList.insert(object);
        
        Session.set("latitude", "");
        Session.set("latitude", "");
        
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
            var inputGender = gen.options[gen.selectedIndex].value;
          }
        
        // checks if the following fields are not empty
        if(document.getElementById("editFName").value === "")
          {
            alert("Please fill in all fields!");
            return false;
          }
        if(document.getElementById("editLName").value === "")
          {
            alert("Please fill in all fields!");
            return false;
          }
        if(document.getElementById("editPhone").value === "")
          {
            alert("Please fill in all fields!");
            return false;
          }
        if(document.getElementById("editEmail").value === "")
          {
            alert("Please fill in all fields!");
            return false;
          }
        
        contactList.update({_id: Router.current().params._id}, {fName: inputFirstName, lName: inputLastName, gender: inputGender, phone: inputPhone, email: inputEmail, latitude: inputLatitude, longitude: inputLongitude});
        Session.set("latitude", "");
        Session.set("latitude", "");
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
        initialEditFormMap: function() 
        {
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
      
      Template.editForm.rendered = function() {
        if(!this._rendered) 
          {
            var edFName = contactList.findOne({_id: Router.current().params._id}).fName;
            document.getElementById("editFName").value = edFName;
            
            var edLName = contactList.findOne({_id: Router.current().params._id}).lName;
            document.getElementById("editLName").value = edLName;
            
            var edPhone = contactList.findOne({_id: Router.current().params._id}).phone;
            document.getElementById("editPhone").value = edPhone;
            
            var edEmail = contactList.findOne({_id: Router.current().params._id}).email;
            document.getElementById("editEmail").value = edEmail;
          }
      }

  
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
