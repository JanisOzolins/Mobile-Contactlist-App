/* global contactList*/
contactList = new Mongo.Collection('contactList');

if (Meteor.isClient) {
  
  // ====================== ROUTERS ============================
  /* global Router */

  Router.configure({
  layoutTemplate: 'layout'
  });

  Router.route('/', function() {
  this.render('page1');
  }),
  Router.route('/page2');
  // router for add contact page
  Router.route('/addContactForm');
  // router for individual contact pages
  Router.route('/contact/:_id', {
    layoutTemplate: "layout",
    data: function(){
        var currentContact = this.params._id;
        return contactList.findOne({ _id: currentContact });
    }
});
  
  // ====================== CONTACT LIST HELPERS ============================

  Template.lists.helpers({
  contacts : function(){
        return contactList.find();
  },
  
  'click [data-action=showActionSheet]': function (event, template) {
    IonActionSheet.show({
      titleText: 'ActionSheet Example',
      buttons: [
        { text: 'Share <i class="icon ion-share"></i>' },
        { text: 'Move <i class="icon ion-arrow-move"></i>' },
      ],
      destructiveText: 'Delete',
      cancelText: 'Cancel',
      cancel: function() {
        console.log('Cancelled!');
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Shared!');
        }
        if (index === 1) {
          console.log('Moved!');
        }
        return true;
      },
      destructiveButtonClicked: function() {
        console.log('Destructive Action!');
        return true;
      }
    });
  }
  
});

  // ====================== ADD CONTACT EVENTS ============================
  Template.form.events({
    "submit form" : function(event, template) {
      
      var inputFirstName = event.target.fName.value;
      var inputLastName = event.target.lName.value;
      var inputPhone = event.target.phone.value;
      
      var object = {fName: inputFirstName, lName: inputLastName, phone: inputPhone}
      
      contactList.insert(object);
    }
  })
  
  
  
  


}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
