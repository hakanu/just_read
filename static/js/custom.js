jQuery( document ).ready(function( $ ) {
  // Put stuff here.
  console.log('doc ready');
  checkIfChromeExtensionInstalled();
  var config = {
    apiKey: "AIzaSyDglzT_bTVl4pUANG_N6-yIQSLMPy2wrLM",
    authDomain: "alterna.firebaseapp.com",
    databaseURL: "https://alterna.firebaseio.com",
    storageBucket: "firebase-alterna.appspot.com",
  };
  firebase.initializeApp(config);

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // console.log('user is here: ' + JSON.stringify(user));
      initUiWithUserBookmarks(user);
    } else {
      updateUiAfterLogout();
    }
  });

  $('#btn-logout').click(function(e) {
    console.log('Logging out.');
    firebase.auth().signOut();
    updateUiAfterLogout();
  });

  $('#btn-login').click(function(e) {
    console.log('Logging in.');
    userSignIn();
  });
});

String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
};

function checkIfChromeExtensionInstalled() {
  if (chrome.app.isInstalled) {
    document.getElementById('install-button').style.display = 'none';
  }
}


function updateUiAfterLogout() {
  $('#btn-logout').addClass('hidden');
  $('#btn-login').removeClass('hidden');
  $('#p-login-username').html('Not logged in');
  $('#ul-urls').html('');
  $('#p-message').text('Log in first');
}


function userSignIn() {
  console.log('user is null so signing in with popup');
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/plus.login');
  firebase.auth().signInWithRedirect(provider).then(function(result) {
    console.log('signing in...');
    // console.log('result: ' + JSON.stringify(result));
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log('user: ' + user);
    initUiWithUserBookmarks(user);
  }).catch(function(error) {
    console.log('error happened : ' + JSON.stringify(error));
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}

function initUiWithUserBookmarks(user) {
  console.log('initing UI for ' + user.uid);
  $('#btn-logout').removeClass('hidden');
  $('#btn-login').addClass('hidden');
  $('#p-login-username').text('Logged in as ' + user.displayName);

  var urlParam = getQueryVariable('url');
  if (!urlParam) {
    var _URL_TEMPLATE = (
        '<p><a href="{url}"">{title}</a></p>' +
        '<p><sup>{date_added}</sup></p>' +
        '<p><sub>Tags: {tags}</sub></p><hr>');
    firebase.database().ref('/user_uid_to_urls/' + user.uid).once('value').then(
      function(snapshot) {
        // console.log(JSON.stringify(snapshot.val()));
        var urls = snapshot.val();

        if (!urls || urls.length == 0) {
          $('#p-message').text(
              'Can not find any URLs in your profile, ' +
              'download extension and start bookmarking.');
        }

        for(var urlKey in urls) {
          var urlItem = urls[urlKey];
          var tags = '';
          if (urlItem && urlItem.tags) {
            tags = urlItem.tags.join();
          }
          $('#ul-urls').append(_URL_TEMPLATE.supplant({
              'url': '/?url=' + urlItem.url_key,
              'title': urlItem.title,
              'date_added': urlItem.date_added,
              'tags': tags,
          }));
        }
      }
    );
  } else {
    console.log('single url: ' + urlParam);
    firebase.database().ref('/urls/' + urlParam).once('value').then(
      function(snapshot) {
        console.log('snapshot fetched');
        var urlInfo = snapshot.val();
        console.log('updating view.');
        $('#h1-single-article-title').text(urlInfo.title);
        if (urlInfo.extracted) {
          $('#div-single-article-content').html(urlInfo.extracted.summary);
        } else {
          $('#div-single-article-content').html('<i>Can not find article content</i>');
        }
      }
    );
  }
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return pair[1];
    }
  }
  return null;
}
