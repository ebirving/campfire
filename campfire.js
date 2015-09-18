Words = new Mongo.Collection("words");
Stories = new Mongo.Collection("stories");

if (Meteor.isClient) {

  Meteor.startup(function() {
    //Dynamic, responsive background image
    $.backstretch("dark_wood.png");
    //Open a new story
    Meteor.call("createNewStory");
    //Start countdown timer for three minutes
    counter = 0;
    console.log(counter);
  });

  Template.body.helpers({

    words: function () {
      return Words.find({});
    },
    wordCount: function () {
      return Words.find({}).count({});
    },
    stories: function () {
      return Stories.find({});
    }
  });

  Template.timer.helpers({
    minutes: function () {
      return Session.get("minutes");
    },
    seconds: function () {
      return Session.get("seconds");
    }
  });

  Template.timer.events({

    "click, .start-button": function (event) {
      event.preventDefault();
      counter++;
      console.log(counter);
      if (counter === 1) {
        number = 180;
        Meteor.call("clearAllWords");
        Meteor.call("createNewStory");
        Meteor.setInterval(function() {
          //Reset timer and clear all words when countdown hits 0
          if(number === 0) {
            Meteor.call("clearAllWords");
            counter = 0;
            return true;
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
      }
    }
  });

  Template.story.helpers({
    //Only render story in archive if it has storyText
    hasContent: function () {
      if(this.storyText.length > 0) {
        return true;
      }
    }
  });

  Template.story.events({
    "click .delete": function () {
      Stories.remove(this._id);
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
      var typing = $("input[name='word']").val();
      // Insert a word into the collection when spacebar is pressed -- word.length condition guards against acccidental submission if spacebar is hit before word
      if (event.keyCode === 32 && word.length > 1) {
        //Add text to the story
        Meteor.call("createNewWord", word);
        Meteor.call("updateStory");
        // Clear form
        event.target.value = "";
        $("#wordInProgress").empty();
      }
      else {
        $("#wordInProgress").text(typing);
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

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

Meteor.methods({

  createNewWord: function (word) {
    Words.insert({
      text: word,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  clearAllWords: function() {
    return Words.remove({});
  },

  createNewStory: function () {
    Stories.insert({
      storyText: [],
      storyAuthors: [],
      createdAt: new Date()
    });
  },

  updateStory: function() {
    var currentStory = Stories.find({}, {sort: {createdAt: -1}, limit: 1 }).fetch();
    console.log(currentStory[0].storyText);
    var latestWord = Words.find({}, {sort: {createdAt: -1}, limit: 1 }).fetch();
    console.log(latestWord[0].text);
    console.log(latestWord[0].username);
    Stories.update(
      {_id: currentStory[0]._id},
      {$push: {storyText: latestWord[0].text}, $addToSet: {storyAuthors: latestWord[0].username}}
    );
  },

});

// if (Meteor.isServer) {
//
//   Meteor.startup(function() {
//
//   });
// }
