var methods = {
  config: {
    url: "http://tiy-fee-rest.herokuapp.com/collections/chattanooga"
  },
  init: function () {
    methods.initStyle();
    methods.initEvents();
  },
  initStyle: function () {


  },
  initEvents: function () {

    //erases server content
    $('.btn-warning').on('click', function (e) {
      e.preventDefault();
      $.ajax({
        url: methods.config.url,
        type: 'DELETE',
        success: function () {
          console.log('SUCCESS: erased server');
        },
        error: function () {
          console.log('WARNING: erase server failed');
          location.reload();
        }
      });
    });

    //user logout
    $('.btn-danger').on('click', function (e) {
      e.preventDefault();
      methods.logOutUser();
    });

    //Login disabled without text input
    $('input[name="usernameInput"]').on('keyup', function (e) {
      e.preventDefault();
      if($('input[name="usernameInput"]').val().length > 0){
        $('#usernameForm legend, #usernameForm input').addClass('hl placeholderColor');
        $('#usernameForm').addClass('hlBorder');
        $('#usernameForm').removeClass('fgBorder');
        $('#usernameForm .btn-primary').prop('disabled', false);
      }else{
        $('#usernameForm legend, #usernameForm input').removeClass('hl placeholderColor');
        $('#usernameForm').addClass('fgBorder');
        $('#usernameForm').removeClass('hlBorder');
        $('#usernameForm .btn-primary').prop('disabled', true);
      }
    });

    //Send chat disabled without text input
    $('input[name="enterTextInput"]').on('keyup', function (e) {
      e.preventDefault();
      if($('input[name="enterTextInput"]').val().length > 0){
        $('#enterTextForm .btn-success').prop('disabled', false);
      }else{
        $('#enterTextForm .btn-success').prop('disabled', true);
      }
    });

    //hover reveals colors of main page/top-right buttons
    $('.btn-warning, .btn-danger').on('hover', function (e) {
      e.eventDefault();
      $(this).removeClass('greyBG');
    });

    //Log into chat application
    $('#usernameForm').on('submit', function (e) {
      e.preventDefault();
      methods.loginMaster($('input[name="usernameInput"]').val());
    });
  },
  loginMaster: function (passedUsername) {
    $.ajax({
      url: methods.config.url,
      type: 'GET',
      success: function (retrievedObjects){
        var allUsers = _.find(retrievedObjects, function (eachObject) {
          return eachObject.hasOwnProperty('users');
        });
        if(allUsers === undefined){
          //if server empty, initialize master user object
          methods.initUsersObject(passedUsername);
        }else{
          var thisUser = _.find(allUsers.users, function (eachObject) {
            return eachObject.username.toLowerCase() === passedUsername.toLowerCase();
          });
          if(thisUser === undefined){
            //if username is not found, create new user
            methods.createNewUser(passedUsername,allUsers);
          }else{
            //found username match
            methods.loadMain(thisUser.username);
          }
        }
      },
      error: function () {
        console.log('WARNING: loginMaster');
      }
    });
  },
  initUsersObject: function (passedUsername) {
    $.ajax({
      url: methods.config.url,
      data: {
        users: [
          {
            username: passedUsername,
            created: Date.now(),
            active: false
          }
        ]
      },
      type: 'POST',
      success:function(){
        methods.loadMain(passedUsername);
      },
      error:function(){
        console.log('WARNING: initUserObject');
      }
    });
  },
  createNewUser: function (passedUsername, serverObject) {
    var newUserObject = {
      username: passedUsername,
      created: Date.now(),
      active: false
    }
    serverObject.users.push(newUserObject);
    $.ajax({
     url: methods.config.url + '/' + serverObject._id,
     data: serverObject,
     type: 'PUT',
     success: function () {
       console.log('SUCCESS: created new user: '+passedUsername+' (_id: '+serverObject._id+')');
       methods.loadMain(passedUsername);
     },
     error: function () {
       console.log('WARNING: createNewUser');
     }
   });
  },
  loadMain: function (passedUsername) {
    methods.updateStatus(passedUsername,true);
    localStorage.chattanooga = passedUsername;
    console.log('Logged in as: ', passedUsername);
    $('#loginWrapper').addClass('invis');
    $('.container').removeClass('invis');
    $('input[name="usernameInput"]').val('');
  },
  logOutUser: function () {
    methods.updateStatus(localStorage.chattanooga,false);
    delete localStorage.chattanooga;
    $('input[name="usernameInput"]').val('');
    $('input[name="usernameInput"]').keyup();
    $('#loginWrapper').removeClass('invis');
    $('.container').addClass('invis');
    console.log('SUCCESS: logout');
  },
  updateStatus: function (passedUsername,activeStatus) {
    $.ajax({
      url: methods.config.url,
      type: 'GET',
      success: function (retrievedObjects){
        var allUsers = _.find(retrievedObjects, function (eachObject) {
          return eachObject.hasOwnProperty('users');
        });
        var thisUser = _.findWhere(allUsers.users, {username: passedUsername});
        thisUser.active = activeStatus;
        $.ajax({
         url: methods.config.url + '/' + allUsers._id,
         data: allUsers,
         type: 'PUT',
         success: function () {
           console.log('SUCCESS: updated status for: '+passedUsername+' (_id: '+allUsers._id+')');
         },
         error: function () {
           console.log('WARNING: updateStatus PUT');
         }
       });
      },
      error: function () {
        console.log('WARNING: updateStatus GET');
      }
    });
  },
  renderUsernames:function () {

  },
  sendChat: function () {

  },
  renderChats: function () {

  }
}

$(document).ready( function () {
  methods.init();
});
