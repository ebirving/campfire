Words = new Mongo.Collection("words");
Stories = new Mongo.Collection("stories");

if (Meteor.isClient) {

  Meteor.startup(function() {
    //Dynamic, responsive background image
    $.backstretch("dark_wood.png");
    //Start countdown timer for three minutes
    number = 10;
    Meteor.call("createNewStory");
  });

  Meteor.setInterval(function() {
    //Reset timer and clear all words when countdown hits 0
    if(number === 0) {
      Meteor.call("removeAllWords");
      number = 10;
    }
    //Decrement by one every second
    else {
      number--;
    }
    //Pass countdown value to body template helper, converted to min and sec
    var minutes = Math.floor(number/60);
    Session.set("minutes", minutes);

    var seconds = (number % 60);
    if (seconds < 10) {
      Session.set("seconds", "0" + seconds);
    }
    else {
      Session.set("seconds", seconds);
    }
  }, 1000);

  Template.body.helpers({

    words: function () {
      return Words.find({});
    },
    wordCount: function () {
      return Words.find({}).count({});
    },
    minutes: function () {
      return Session.get("minutes");
    },
    seconds: function () {
      return Session.get("seconds");
    }

  });

  Template.body.events({

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
        //Add text to the story
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
      },
      createNewStory: function () {
        Stories.insert({
          createdAt: new Date ()
        });
      }
    });

  });
}
