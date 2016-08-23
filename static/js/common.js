var _FIREBASE_URL = "https://diziler.firebaseio.com";
var jafApp = angular.module('jafApp', ['firebase'],
  function($interpolateProvider) {
      $interpolateProvider.startSymbol('[[{').endSymbol('}]]');
  });

jafApp.factory('firebaseConnection', ['$firebase', function($firebase) {
    var firebaseUrl = _FIREBASE_URL;//document.getElementById('data-firebase-url').getAttribute('data-firebase-url');
    var firebaseRef = new Firebase(firebaseUrl);
    return { 
      firebaseUrl : firebaseUrl, 
      firebaseRef : firebaseRef,
      user : {}
    };
}]);

jafApp.controller('authController', ['$scope', 'firebaseConnection', function($scope, firebaseConnection) {
    console.log("Initializing the controller");
    $scope.user = {};
    var ref = firebaseConnection.firebaseRef; //new Firebase(firebaseConnection.firebase_url);
    console.log('ref: ' + ref);
    var authData = ref.getAuth();
    if (authData) {
      console.log("User " + authData.uid + " is logged in with " + authData.provider + " | ");
      console.log(authData);
      $scope.user = authData;
      firebaseConnection.user = authData;
    } else {
      console.log("User is logged out");
    }

    $scope.login = function() {
      console.log("Logging in");
      ref.authWithPassword(
          {email: $scope.email, password: $scope.password}, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
          $scope.user = authData;
          firebaseConnection.user = authData;
          $scope.$apply();
        }
      });
    };

    $scope.logout = function() {
      console.log("Logging out");
      // firebaseAuthClient.logout();
    };

    $scope.signup = function() {
      var email = $scope.email;
      var password = $scope.password;
      console.log("Signing up " + email + " - " + $scope.password);
      ref.createUser({
        email: email,
        password: password
      }, function(error, userData) {
        if (error) {
          switch (error.code) {
            case "EMAIL_TAKEN":
              console.log("The new user account cannot be created because the email is already in use.");
              break;
            case "INVALID_EMAIL":
              console.log("The specified email is not a valid email.");
              break;
            default:
              console.log("Error creating user:", error);
          }
        } else {
          console.log("Successfully created user account with uid:", userData);
          $scope.user = userData;
          firebaseConnection.user = authData;
          $scope.$apply();
        }
        // Try to login.
        $scope.login();
      })
    };

    $scope.dummy = function() {
      console.log('dummy');
    }

    console.log("----");
}]);

jafApp.controller('showController', ['$scope', 'firebaseConnection', function($scope, firebaseConnection) {
    console.log("Initializing the diziler controller");
    $scope.user = firebaseConnection.user;
    console.log($scope.user);
    var ref = firebaseConnection.firebaseRef;
    console.log('ref: ' + ref);

    $scope.fetchShows = function() {
      console.log("Fetching shows");
      ref.limitToFirst(50).once("value", function(snapshot) {
        console.log(snapshot.val());
        $scope.shows = snapshot.val();
        $scope.$apply();
      });
    }

    $scope.seen = function(showId) {
      console.log("Seen " + showId);
    }

    $scope.skip = function(showId) {
      console.log("Skipped " + showId);
    }

    $scope.partiallySeen = function(showId) {
      console.log("partially Seen " + showId);
    }

    $scope.fetchShows();

}]);