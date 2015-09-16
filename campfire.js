Words = new Mongo.Collection("words");

if (Meteor.isClient) {

  Meteor.startup(function() {
    $.backstretch("dark_wood.png");
    number = 60;
  });

  Meteor.setInterval(function() {
    if(number === 0){
      Meteor.call("removeAllWords");
      number = 60;
    }
    else{
    number--;
    }
    Session.set('countdown', number);
  }, 1000);

  Template.body.helpers({
    words: function () {
      return Words.find({});
    },
    wordCount: function () {
      return Words.find({}).count({});
    },
    countdown: function () {
      return Session.get('countdown');
    }
  });

  Template.body.events({
    "click .delete": function () {
      Meteor.call("removeAllWords");
    },

    "submit .new-word": function(event){
      // Prevent default browser form submit
      event.preventDefault();
    },

    "keyup .new-word": function (event) {
      event.preventDefault();
      // Get value from form element
      var word = event.target.value;
      // Insert a word into the collection when spacebar is pressed -- word.length condition guards against acccidental submission if spacebar is hit before word
      if (event.keyCode === 32 && word.length > 1) {
        //Add formatted text to the story
        Words.insert({
          text: word,
          createdAt: new Date()
        });

        // Clear form
        event.target.value = "";
      }
    }

  });

}

if (Meteor.isServer) {

  Meteor.startup(function() {
    return Meteor.methods({
      removeAllWords: function() {
        return Words.remove({});
      }
    });

  });
}
