// This callback function is called when the content script has been
// injected and returned its results
function onPageInfo(o)  {
    console.log(o);
    document.getElementById('title').value = o.title;
    document.getElementById('url').value = o.url;
    document.getElementById('tags').value = o.tags;
}

// Global reference to the status display SPAN
var statusDisplay = null;

// POST the data to the server using XMLHttpRequest
function addBookmark() {
    // Cancel the form submit
    event.preventDefault();

    // The URL to POST our data to
    var postUrl = 'http://dotmarks.dev:5000/dotmarks';

    // Set up an asynchronous AJAX POST request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', postUrl, true);

    // Prepare the data to be POSTed
    var title = document.getElementById('title').value;
    var url = document.getElementById('url').value;
    var tags = document.getElementById('tags').value;
    var user = 'ivan';

    // Set correct header for form data
    xhr.setRequestHeader('Content-type', 'application/json');

    // Handle request state change events
    xhr.onreadystatechange = function() {
        // If the request completed
        var timeOut = 0;
        if (xhr.readyState == 4) {
            statusDisplay.innerHTML = '';
            if (xhr.status === 201) {
                // If it was a success, close the popup after a short delay
                statusDisplay.innerHTML = 'Saved!';
                timeOut = 1000;
            } else if(xhr.status === 0){
              statusDisplay.innerHTML = 'Error: dotMarks is unreachable!';
              timeOut = 2500;
            }else {// Show what went wrong
                var res = JSON.parse(xhr.response);
                var errorMsg = res._issues.url;
                if( errorMsg !== undefined){
                  if(errorMsg.indexOf("is not unique") > 0){
                    statusDisplay.innerHTML = 'Error saving: url already saved!';
                  }else{
                    statusDisplay.innerHTML = 'Error saving: ' + res._issues.url;
                  }
                }else{
                  statusDisplay.innerHTML = 'Error saving: ' + xhr.statusText;
                }
                timeOut= 2500;
            }
            window.setTimeout(window.close, timeOut);
        }
    };

    xhr.send(serializeObject(user, title, url, tags));
    statusDisplay.innerHTML = 'Saving...';
}

 function serializeObject(user, title, url, tags){
    var o = {};
    o['username'] = user;
    o['url'] = url;
    if(tags !== undefined) {
        var aTags = tags.toLowerCase().split(" ");
        if(aTags.length >= 1){
            if(aTags[0].length > 1){
                o['tags'] = aTags;
            }
        }

    }
    if(title !== undefined) {
        o['title'] = title;
    }

    return JSON.stringify(o);
};

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Handle the bookmark form submit event with our addBookmark function
    document.getElementById('addbookmark').addEventListener('submit', addBookmark);
    document.getElementById('tags').focus();
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    // Call the getPageInfo function in the background page, injecting content_script.js
    // into the current HTML page and passing in our onPageInfo function as the callback
    chrome.extension.getBackgroundPage().getPageInfo(onPageInfo);
});
