// Saves options to chrome.storage
function save_details(){
    var user = document.getElementById('username').value;
    var pwd = document.getElementById('password').value;
    var token = encode64(user + ":" + pwd);
    chrome.storage.local.set({
            username: user,
            password: pwd,
            token: token
        },
            display_status('Details saved.')
        );
}

function display_status(message){
    var status = document.getElementById('status');
    status.textContent = message;
    setTimeout(function() {
        status.textContent = '';
        chrome.storage.local.get({
            origin: '',
            token: ''
          }, function(items) {
                console.log(origin);
                // This is if we do login
                if(origin === '' ){
                    window.close();

                }else{
                    location.href = origin;
                }
          });
    }, 1550);
}

function do_login(){
    var authUrl = "http://dotmarks.dev:5000/users/";
    var user = document.getElementById('username').value;
    var pwd = document.getElementById('password').value;
    var token = encode64(user + ":" + pwd);

    var xhr = new XMLHttpRequest();
    xhr.open("GET", authUrl + user, false);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic ' + token);
    xhr.onreadystatechange = function() {
        var response_status = xhr.status;
        if (xhr.readyState === 4) {
            if(response_status === 401){
                display_status('Login failure :(');
            }else if(response_status === 200 || response_status === 201){
                save_details();
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
