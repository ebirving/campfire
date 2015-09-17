Words = new Mongo.Collection("words");
Stories = new Mongo.Collection("stories");

if (Meteor.isClient) {

  Meteor.startup(function() {
    //Dynamic, responsive background image
    $.backstretch("dark_wood.png");
    //Open a new story
    Meteor.call("createNewStory");
    //Start countdown timer for three minutes
    number = 180;
  });

  Meteor.setInterval(function() {
    //Reset timer and clear all words when countdown hits 0
    if(number === 0) {
      Meteor.call("clearAllWords");
      Meteor.call("createNewStory");
      number = 180;
    }
    //Otherwise, decrement by one every second
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
    },
    stories: function () {
      return Stories.find({});
    }

  });

  Template.firstLine.helpers({
   //For each story, return the text of the first ten words, followed by an ellipsis
   hasContent: function (story) {
      if (this.storyText.length > 0) {
        return true;
      }
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
        Meteor.call("createNewWord", word);
        Meteor.call("updateStory");
        // Clear form
        event.target.value = "";
      }
    },

    "click .lightbox-trigger": function (event) {
      event.preventDefault();
      $("#lightbox").css("display", "block");
    },

    "click .lightbox-close": function () {
      $("#lightbox").css("display", "none");
    }

  });

}

Meteor.methods({
  createNewWord: function (word) {
    Words.insert({
      text: word,
      createdAt: new Date()
    });
  },
  clearAllWords: function() {
    return Words.remove({});
  },
  createNewStory: function () {
    Stories.insert({
      storyText: [],
      createdAt: new Date()
    });
  },
  updateStory: function () {
    var currentStory = Stories.findOne({}, {sort: {createdAt: -1}});
    var latestWord = Words.findOne({}, {sort: {createdAt: -1}});
    Stories.update(
      {_id: currentStory._id},
      {$push: {storyText: latestWord}}
    );
  }
});

if (Meteor.isServer) {

  Meteor.startup(function() {

  });
}
