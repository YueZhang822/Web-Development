document.addEventListener('DOMContentLoaded', function() {
  const SPLASH = document.querySelector(".splash");
  const PROFILE = document.querySelector(".profile");
  const LOGIN = document.querySelector(".login");
  const ROOM = document.querySelector(".room");

  window.addEventListener('load', function() {
    stopGetMessagesInterval()
    var path = window.location.pathname; 
    var hasCredentials = Boolean(document.cookie.match(/^(.*;)?\s*api_key\s*=\s*[^;]+(.*)?$/));
  
    // Define the behavior for each page based on the current path and user credentials
    if (path === '/') {
      showPage(SPLASH);
    } else if (path === '/login') {
      if (hasCredentials) {
        showPage(SPLASH);
      } else {
        showPage(LOGIN);
      }
    } else if (path === '/room') {
      this.alert("please choose a specific room"); 
      showPage(SPLASH);
    } else if (path === '/profile' || path.match(/^\/room\/\d+\/?$/)) {
      console.log("profile or room"); //debugging
      if (hasCredentials) {
        if (path === '/profile') {
          showPage(PROFILE);
        } else if (path.match(/^\/room\/\d+\/?$/)) {
          var room_id = path.split('/').pop();
          showRoom(room_id);
        }
      } 
      else {
        localStorage.setItem('redirect', path);
        showPage(LOGIN);
      }
    } else {
      throw new Error('Invalid path: ' + path);
    }
  });

  window.addEventListener('popstate', function(event) {
    stopGetMessagesInterval()
    // Get the current path from the URL
    var path = window.location.pathname;
    window.history.pushState(null, null, path);
    var hasCredentials = Boolean(document.cookie.match(/^(.*;)?\s*api_key\s*=\s*[^;]+(.*)?$/));
    
    // Show the corresponding page based on the path
    if (path === '/') {
      showPage(SPLASH);
    } else if (path === '/login') {
      if (hasCredentials) {
        showPage(SPLASH);
      } else {
        showPage(LOGIN);
      }
    } else if (path === '/room') {
      this.alert("please choose a specific room"); 
      showPage(SPLASH);
    } else if (path === '/profile' || path.match(/^\/room\/\d+\/?$/)) {
      if (hasCredentials) {
        if (path === '/profile') {
          showPage(PROFILE);
        } else if (path.match(/^\/room\/\d+\/?$/)) {
          var room_id = path.split('/').pop();
          showRoom(room_id);
        }
      } 
      else {
        localStorage.setItem('redirect', path);
        showPage(LOGIN);
      }
    } else {
      throw new Error('Invalid path: ' + path);
    }
  });


  function showPage(page) {
    // Hide all pages
    SPLASH.style.display = 'none';
    PROFILE.style.display = 'none';
    LOGIN.style.display = 'none';
    ROOM.style.display = 'none';
    
    // Show the specified page
    if (page === SPLASH) {
      showSplash();
      window.history.pushState(null, null, '/');
    } else if (page === PROFILE) {
      showProfile();
      window.history.pushState(null, null, '/profile');
    } else if (page === LOGIN) {
      showLogin();
      window.history.pushState(null, null, '/login');
    } 
  }

  
  
  function showSplash() {
    stopGetMessagesInterval()
    SPLASH.style.display = 'block';
    getRoomlist();
    var hasCredentials = Boolean(document.cookie.match(/^(.*;)?\s*api_key\s*=\s*[^;]+(.*)?$/));
    console.log(hasCredentials); //debugging
  
    // Update the DOM to show the appropriate content based on whether the user is logged in
    var loggedOutEls = SPLASH.querySelectorAll('.loggedOut');
    var loggedInEls = SPLASH.querySelectorAll('.loggedIn');
    var createEls = SPLASH.querySelectorAll('.create');
    var signupEls = SPLASH.querySelectorAll('.signup');
    var splashEls = SPLASH.querySelectorAll('.splash > :not(.loggedOut):not(.signup):not(.loggedIn):not(.create)');

    splashEls.forEach(el => el.style.display = 'block');
  
    if (hasCredentials) {
      // The user is logged in, so hide the "loggedOut" and "create" elements and show the "loggedIn" element
      loggedOutEls.forEach(el => el.style.display = 'none');
      signupEls.forEach(el => el.style.display = 'none');
      loggedInEls.forEach(el => el.style.display = 'block');
      createEls.forEach(el => el.style.display = 'block');
      const usernameEl = SPLASH.querySelector('.loggedIn .username');
      const username = getCookieValue('name');
      console.log(username); //debugging
      usernameEl.textContent = `Welcome back, ${username}!`;
    } else {
      // The user is not logged in, so hide the "loggedIn" and "signup" elements and show the "loggedOut" element
      loggedInEls.forEach(el => el.style.display = 'none');
      createEls.forEach(el => el.style.display = 'none');
      loggedOutEls.forEach(el => el.style.display = 'block');
      signupEls.forEach(el => el.style.display = 'block');
    }
  }
  
  
  function getCookieValue(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return '';
  }
  

  function showProfile() {
    stopGetMessagesInterval()
    PROFILE.style.display = 'block';
    const usernameEl = PROFILE.querySelector('.loggedIn .username');
    const username = getCookieValue('name');
    usernameEl.textContent = `${username}`;
    const usernameInput = PROFILE.querySelector('input[name="username"]');
    usernameInput.value = username;
    const password = getCookieValue('password');
    const passwordInput = PROFILE.querySelector('input[name="password"]');
    passwordInput.value = password;
    const repeatpasswordInput = PROFILE.querySelector('input[name="repeatPassword"]');
    repeatpasswordInput.value = password;
  }
  
  
  function showLogin() {
    stopGetMessagesInterval()
    LOGIN.style.display = 'block';
    // Hide the "failed" class by default
    var failedEl = LOGIN.querySelector('.failed');
    failedEl.style.display = 'none';
  }
  
  
  function showRoom(room_id) {
    console.log('implementing displayRoom'); //debugging
    console.log(room_id); //debugging
    SPLASH.style.display = 'none';
    PROFILE.style.display = 'none';
    LOGIN.style.display = 'none';
    ROOM.style.display = 'block';
    const url = `/room/${room_id}`;
    window.history.pushState(null, null, url);
    const usernameEl = ROOM.querySelector('.loggedIn .username');
    const username = getCookieValue('name');
    usernameEl.textContent = `${username}`;
    const roomNameElement = ROOM.querySelector('.displayRoomName strong');
    let roomName = roomNameElement.textContent;
    const inviteLinkElement = ROOM.querySelector('.roomLink a');
    let roomId = inviteLinkElement.textContent;
    startGetMessagesInterval();
  
    fetch(`/api/room/${room_id}/info`, {
      headers: {
        'Authorization': `Bearer ${getCookieValue('api_key')}`,
      }
    })
    .then(response => response.json())
    .then(room => {
      const room_name = room.name;
      const room_id = room.id;
      roomName = room_name;
      roomId = room_id;
      
      // Update the room name on the page
      roomNameElement.textContent = roomName;
      inviteLinkElement.textContent = `/room/${roomId}`;
    })
    .catch(error => {
      console.error(error);
    });    
  }
  
  
  
  // Implement logic to handle successful login
  function handleSuccessfulLogin() {
    console.log("inside handleSuccessfulLogin"); //debugging
    const redirect = localStorage.getItem('redirect');
    console.log(redirect); //debugging
    if (redirect) {
      console.log("inside redirect"); //debugging
      // Send the user to their original destination
      if (redirect === '/room') {
        showPage(ROOM);
      } else if (redirect === '/profile') {
        showPage(PROFILE);
      } else if (redirect === '/login') {
        showPage(LOGIN);
      }  else if (redirect === '/room') {
        showPage(ROOM);
      } else {
        displayRoom(redirect);
      }
      localStorage.removeItem('redirect');
    } else {
      // Send the user to "/"
      showPage(SPLASH);
    }
  }
  
  function getRoomlist() {
    fetch('/api/room/list')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      var roomList = SPLASH.querySelector('.roomList');
      roomList.innerHTML = '';
      if (data.length === 0) {
        var roomdiv = SPLASH.querySelector('.roomList');
        roomdiv.classList.add('hidden');
        return;
      } else {
        var noRoomMessage = SPLASH.querySelector('.noRooms');
        noRoomMessage.classList.add('hidden');

        var roomList = SPLASH.querySelector('.roomList');
        for (var i = 0; i < data.length; i++) {
          var room = data[i];
          const roomId = room.id;
          var roomLink = document.createElement('a');
          var roomLinkText = document.createTextNode(room.id + ': ');
          var roomName = document.createElement('strong');
          var roomNameText = document.createTextNode(room.name);
          roomName.appendChild(roomNameText);
          roomLink.appendChild(roomLinkText);
          roomLink.appendChild(roomName);
          roomList.appendChild(roomLink);
          roomLink.addEventListener('click', function() { 
            console.log("displaying"); //debugging
            console.log(roomId); //debugging
            showRoom(roomId);
          });
          }
      }
    });
  }
  
  // --------------------------SPLSH PAGE--------------------------

  const signupButton = SPLASH.querySelector('.signup');
  signupButton.addEventListener('click', signup);

  const logindiv = SPLASH.querySelector('.loggedOut');
  logindiv.addEventListener('click', function() {
    showPage(LOGIN);
    console.log("inside logindiv"); //debugging
  });

  const splashprofileButton = SPLASH.querySelector('.material-symbols-outlined');
  splashprofileButton.addEventListener('click', function() {
    showPage(PROFILE);
  });

  const createroomButton = SPLASH.querySelector('.create');
  createroomButton.addEventListener('click', createRoom);


  function createRoom() {
    console.log("inside createRoom"); //debugging
    fetch('/api/room/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue('api_key')}`,
      }
    })
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          const roomId = data.id;
          alert(`Room ${roomId} created!`);
          showRoom(roomId);
        });
      } else {
        alert('Failed to create room')
      }
    })
    .catch(error => {
      alert('Error:', error)
    })
  }


  // --------------------------PROFILE  PAGE--------------------------

  const profileprofileButton = PROFILE.querySelector('.material-symbols-outlined');
  profileprofileButton.addEventListener('click', function() {
    showPage(PROFILE);
  });

  const logoutButton = PROFILE.querySelector('.logout');
  logoutButton.addEventListener('click', logout);

  function logout() {
    console.log('implementing logout'); //debugging
    fetch('/api/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue('api_key')}`,
      }
    })
    .then(response => {
      if (response.ok) {
        // Redirect to home page
        window.location.href = '/'
        alert('Logged out successfully!')
      } else {
        console.error('Failed to log out')
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
    
  }


  const updateusernameInput = PROFILE.querySelector('input[name="username"]');
  const updateUsernameButton = PROFILE.querySelector('button.update-username');

  updateUsernameButton.addEventListener('click', () => {
    const newUsername = updateusernameInput.value;

    // Send a request to the update username API
    fetch('/api/update_username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue('api_key')}`,
      },
      body: JSON.stringify({ new_username: newUsername })
    })
    .then(response => {
      if (response.ok) {
        // Update the username in the UI and set the new username in a cookie
        alert('Username updated successfully!');
        updateusernameInput.value = newUsername;
        const usernameEl = PROFILE.querySelector('.loggedIn .username');
        const username = getCookieValue('name');
        usernameEl.textContent = `${username}`;
      } else {
        // Display an error message
        response.json().then(data => {
          alert(data.error);
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });


  const updatepasswordInput = PROFILE.querySelector('input[name="password"]');
  const repeatPasswordInput = PROFILE.querySelector('input[name="repeatPassword"]');
  const updatePasswordButton = PROFILE.querySelector('button.update-password');

  function checkPasswordMatch() {
    const newPassword = updatepasswordInput.value;
    const repeatPassword = repeatPasswordInput.value;
    return newPassword == repeatPassword
  }

  repeatPasswordInput.addEventListener("input", (event) => {
    if (checkPasswordMatch()) {
      repeatPasswordInput.setCustomValidity("");
    } else {
      repeatPasswordInput.setCustomValidity("Password doesn't match");
    }
  });

  updatePasswordButton.addEventListener('click', () => {
    const newPassword = updatepasswordInput.value;
    const repeatPassword = repeatPasswordInput.value;
    if (!checkPasswordMatch()) {
      alert('Passwords do not match');
    } else if (newPassword.length < 6) {
      // Display an error message
      alert('Password must be at least 6 characters long');
    } else {
      // Send a request to the update username API
      fetch('/api/update_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookieValue('api_key')}`,
        },
        body: JSON.stringify({ 
          new_password: newPassword })
      })
      .then(response => {
        if (response.ok) {
          // Update the username in the UI and set the new username in a cookie
          alert('Password updated successfully!');
          repeatPasswordInput.value = newPassword;
        } else {
          // Display an error message
          response.json().then(data => {
          alert(data.error);
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });


  const gotosplashButton = PROFILE.querySelector('.goToSplash');
  gotosplashButton.addEventListener('click', function() {
    showPage(SPLASH);
  });


  // --------------------------LOGIN PAGE--------------------------

  const loginButton = LOGIN.querySelector('.alignedForm.login button');
  const usernameInput = LOGIN.querySelector('.alignedForm.login input[name="username"]');
  const passwordInput = LOGIN.querySelector('.alignedForm.login input[name="password"]');
  const failedMessage = LOGIN.querySelector('.failed');

  const createAccountButton = failedMessage.querySelector('button');
  loginButton.addEventListener('click', login);

  
  function signup() {
    fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (response.ok) {
        // If the signup was successful, redirect the user to the login page
        showPage(SPLASH);
        alert('Account created successfully! Automatically logging in.');
      } else {
        // Handle any errors that occur during the signup process
        alert('Failed to sign up.');
      }
    })
    .catch(error => {
      console.error(error);
    });
  }
  
  
  function login() {
    const username = usernameInput.value;
    const password = passwordInput.value;
  
    if (!username || !password) {
      throw new Error('Username and password can not be empty.');
    } else {
      fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ 
          username: username,
          password: password 
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        if (response.ok) {
          // If the response was successful, call the handleSuccessfulLogin function
          alert('Login successful!');
          handleSuccessfulLogin();
          return
        } else {
          // If the response was not successful, display the error message
          failedMessage.style.display = 'block';
          createAccountButton.addEventListener('click', signup);
        }
      })
      .catch(error => {
        // If there was an error with the login request, display the error message
        failedMessage.style.display = 'block';
        createAccountButton.addEventListener('click', signup);
      });
    }
  };
  

  // --------------------------ROOM PAGE--------------------------

  const roomprofileButton = ROOM.querySelector('.loggedIn .material-symbols-outlined.md-18');
  roomprofileButton.addEventListener('click', function() {
    console.log('implementing roomprofileButton'); //debugging
    showPage(PROFILE);
  });

  const displayRoomNameEl = ROOM.querySelector('.displayRoomName');
  const editRoomNameEl = ROOM.querySelector('.editRoomName');

  const eidtroomnmaeButton = ROOM.querySelector('.displayRoomName .material-symbols-outlined.md-18');
  eidtroomnmaeButton.addEventListener('click', function() {
    displayRoomNameEl.classList.add('hidden');
    editRoomNameEl.classList.remove('hidden');
  });

  const updateIcon = ROOM.querySelector('.editRoomName button');
  updateIcon.addEventListener('click', change_room_name);

  function change_room_name() {
    console.log('implementing change_room_name'); //debugging
  
    const roomId = window.location.pathname.split('/').pop();
    const newRoomnameInput = ROOM.querySelector('.editRoomName input');
    const newRoomname = newRoomnameInput.value;
  
    fetch(`/api/room/${roomId}/name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue('api_key')}`,
      },
      body: JSON.stringify({ new_roomname: newRoomname })
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          // Display an error message
          response.json().then(data => {
            console.error(data.error);
          });
        }
      })
      .then(data => {
        displayRoomNameEl.classList.remove('hidden');
        editRoomNameEl.classList.add('hidden');
        const newRoomName = ROOM.querySelector('.displayRoomName strong');
        newRoomName.textContent = data.new_roomname;
        alert('Room name changed!');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  

  const postButton = ROOM.querySelector('.comment_box button');
  postButton.addEventListener('click', postMessage);
  
  function postMessage() {
    console.log('implementing postMessage'); //debugging
    const commentInput = ROOM.querySelector('textarea[name="comment"]');
    const comment = commentInput.value;
  
    // Get the room ID from the URL
    const roomId= window.location.pathname.split('/').pop();
    console.log(window.location.pathname); //debugging
    console.log(roomId); //debugging
  
    // Send a request to the post_message API endpoint
    fetch(`/api/room/${roomId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue('api_key')}`,
      },
      body: JSON.stringify({ message: comment }),
    })
      .then((response) => {
        if (response.ok) {
          // Show a success message to the user
          alert('Message posted!');
          commentInput.value = '';
        } else {
          // Show an error message to the user
          alert('Failed to post message.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Failed to post message.');
      });
  }


  function getMessages(room_id) {
    console.log('implementing getMessages'); //debugging
    const requestUrl = `/api/room/${room_id}/messages`;

    fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookieValue('api_key')}`,
      }
    })
    .then(response => {
      if (!response.ok) {
        messagesContainer.innerHTML = '';
      }
      return response.json();
    })
    .then(messages => {
      const messagesContainer = ROOM.querySelector('.messages');
      console.log(messages); //debugging
      console.log(typeof messages); //debugging
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
        if (!messages.length) {
          console.log('no messages'); //debugging
          messagesContainer.innerHTML = 'No messages';
        } else {
          console.log('messages'); //debugging
          messages.forEach(message => {
            const messageElem = document.createElement('message');
            messageElem.classList.add('message');

            const authorElem = document.createElement('author');
            authorElem.classList.add('author');
            authorElem.textContent = message.username;

            const contentElem = document.createElement('content');
            contentElem.classList.add('content');
            contentElem.textContent = message.body;

            messageElem.appendChild(authorElem);
            messageElem.appendChild(contentElem);
            messagesContainer.appendChild(messageElem);
          });
        }
      }
    })
    .catch(error => {
      console.error(error);
    });
  }

  let messageIntervalId; // variable to store the ID of the interval timer

  function startGetMessagesInterval() {
    console.log('implementing startGetMessagesInterval');
    const roomPattern = /^\/room\/\d+$/;
    const currentUrl = window.location.pathname;
    console.log(currentUrl);
    
    if (roomPattern.test(currentUrl)) {
      console.log('room pattern matched');
      const roomId = parseInt(currentUrl.split('/').pop());
      messageIntervalId = setInterval(() => {
        getMessages(roomId);
      }, 100);
    } else {
      console.log('room pattern not matched');
      clearInterval(messageIntervalId); // clear the interval using the ID stored in the messageIntervalId variable
      console.log('interval cleared');
    }
  }
  function stopGetMessagesInterval() {
    clearInterval(messageIntervalId); // stop the interval using the saved interval ID
  }
  

});