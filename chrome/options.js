// Saves options to chrome.storage
function save_details(){
  var user = document.getElementById('username').value;
  var pwd = document.getElementById('password').value;
  var token = encode64(username + ":" + pwd);
  chrome.storage.sync.set({
    username: user,
    password: pwd,
    token: token
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Details saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function do_login(){
  console.log('do_login');
  var authUrl = "http://dotmarks.dev:5000/users/";
  var xhr = new XMLHttpRequest();
  var user = document.getElementById('username').value;
  var pwd = document.getElementById('password').value;
  var token = encode64(user + ":" + pwd);
  console.log(token);
  xhr.open("GET", authUrl + user, false);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Basic ' + token);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var status=req.status;
      if(status == 201){
        save_details();
      console.log(xhr.responseText);
      }else{
        if(status == 401){
          var status = document.getElementById('status');
          status.textContent = 'Login failure :(';
        }
      }
    }
  }
  xhr.send();
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    username: '',
    password: ''
  }, function(items) {
    document.getElementById('username').value = items.username;
    document.getElementById('password').value = items.password;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('login').addEventListener('click', do_login);
