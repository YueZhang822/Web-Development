

// ------------------------------ CHANGE ROOM NAME ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Get a reference to the button element
  const button = document.createElement('button');
  button.textContent = 'Change Room Name';

  // Add a click event listener to the button
  button.addEventListener('click', async () => {

    // Prompt the user for the new room name
    const newRoomName = prompt('Enter the new name for the room:');
    if (newRoomName === null) {
      return;
    }

    // Get the room ID from the URL
    const url = new URL(window.location.href);
    const roomId = url.pathname.split('/').pop();

    // Send a POST request to the Flask API
    const response = await fetch(`/api/rooms/${roomId}/name`, {
      method: 'POST',
      headers: {
        'Authorization': WATCH_PARTY_API_KEY
      },
      body: new URLSearchParams({
        name: newRoomName,
      }),
    });

    // Check the response status and display an appropriate message to the user
    if (response.status === 200) {
      alert('Room name has been changed successfully.');
    } else if (response.status === 400) {
      alert('Please enter a valid room name.');
    } else if (response.status === 403) {
      alert('You must be logged in to change the room name.');
    } else if (response.status === 404) {
      alert('You are not in a room.');
    } else {
      alert('An error occurred. Please try again later.');
    }
  });

  // Add the button to the top of the document
  document.body.prepend(button);
});



// ------------------------------ CHANGE PASSWORD ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button');
  button.textContent = 'Change Password';
  
  // Add a click event listener to the button
  button.addEventListener('click', async () => {

    // Prompt the user for their new password
    const newPassword = prompt('Enter your new password:');
    if (newPassword === null) {
      return;
    }
  
    // Send a POST request to the Flask API
    const response = await fetch('/api/users/password', {
      method: 'POST',
      headers: {
        'Authorization': WATCH_PARTY_API_KEY
      },
      body: new URLSearchParams({
        password: newPassword,
      }),
    });
  
    // Check the response status and display an appropriate message to the user
    if (response.status === 200) {
      alert('Your password has been changed successfully.');
    } else if (response.status === 400) {
      alert('Please enter a valid password.');
    } else if (response.status === 403) {
      alert('You must be logged in to change your password.');
    } else {
      alert('An error occurred. Please try again later.');
    }
  });
  
  // Add the button to the top of the document
  document.body.prepend(button);

});



// ------------------------------ CHANGE USERNAME ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Get a reference to the button element
const button = document.createElement('button');
button.textContent = 'Change Username';

// Add a click event listener to the button
button.addEventListener('click', async () => {

  // Prompt the user for their new username
  const newName = prompt('Enter your new username:');
  if (newName === null) {
    return;
  }
  
  // Send a POST request to the Flask API
  const response = await fetch('/api/users/name', {
    method: 'POST',
    headers: {
      'Authorization': WATCH_PARTY_API_KEY
    },
    body: new URLSearchParams({
      name: newName,
    }),
  });

  // Check the response status and display an appropriate message to the user
  if (response.status === 200) {
    const welcomeBack = document.querySelector('.welcomeBack');
    welcomeBack.textContent = `Welcome back, ${newName}! `;
    const logoutLink = document.createElement('a');
    logoutLink.textContent = '(logout)';
    logoutLink.href = '/logout';
    welcomeBack.appendChild(logoutLink);
    alert('Your username has been changed successfully.');
  } else if (response.status === 400) {
    alert('Please enter a valid username.');
  } else if (response.status === 403) {
    alert('You must be logged in to change your username.');
  } else {
    alert('An error occurred. Please try again later.');
  }
});

// Add the button to the document
document.body.prepend(button);

});



// ------------------------------ CREATE CHAT ----------------------------------
/* For index.html */

// TODO: If a user clicks to create a chat, create an auth key for them
// and save it. Redirect the user to /chat/<chat_id>
function createChat() {
  const form = document.querySelector('form');
  const button = document.querySelector('button');

  button.addEventListener('click', async (event) => {
    event.preventDefault();
  
    const authKey = generateKey();
  
    try {
      const response = await fetch('/api/rooms', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': WATCH_PARTY_API_KEY
        },
        body: JSON.stringify({
          authKey: authKey
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        const chatId = data.id;
        const redirectUrl = `/rooms/${chatId}`;
        // save auth key in local storage
        localStorage.setItem('authKey', authKey);
        window.location.replace(redirectUrl);
      } 
    } catch (error) {
      console.error(error);
      alert('Error creating chat!');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createChat();
});

function generateKey() {
  const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return key;
}



// ------------------------------ POST CHAT ----------------------------------
function postMessage() {
  const form = document.querySelector('.comment_box form');
  const comment = form?.elements?.comment;
  const chatId = window.location.pathname.split('/').pop();

  if (!form || !comment) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = comment.value.trim();
    if (!message) {
      alert('Please enter a message!');
      return;
    }

    const url = `/api/rooms/${chatId}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': WATCH_PARTY_API_KEY
        },
        body: new FormData(form)
      });

      if (response.ok) {
        alert('Message posted!');
        comment.value = '';
      } else {
        alert('Error posting message!');
      }
    } catch (error) {
      console.error(error);
      alert('Error posting message!');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  postMessage();
});



// ------------------------------ GET CHAT ----------------------------------
/* For chat.html */

// TODO: Fetch the list of existing chat messages.
// POST to the API when the user posts a new message.
// Automatically poll for new messages on a regular interval.
function getMessages() {
  const chatId = window.location.pathname.split('/').pop();
  const url = `/api/rooms/${chatId}/messages`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': WATCH_PARTY_API_KEY
    }
  })
  .then(response => {
    if (!response.ok) {
      const messagesContainer = document.querySelector('.messages');
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
      }
      return;
    }
    return response.json();
  })
  .then(messages => {
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      messages.forEach(message => {
        const messageElem = document.createElement('message');
        messageElem.classList.add('message');

        const authorElem = document.createElement('author');
        authorElem.classList.add('author');
        authorElem.textContent = message.user_id;

        const contentElem = document.createElement('content');
        contentElem.classList.add('content');
        contentElem.textContent = message.body;

        messageElem.appendChild(authorElem);
        messageElem.appendChild(contentElem);
        messagesContainer.appendChild(messageElem);
      });
    }
  })
  .catch(error => {
    console.error(error);
  });
}





function startMessagePolling() {
  if (window.location.pathname.startsWith('/rooms/')) {
    setInterval(getMessages, 100);
  }
}

document.addEventListener('DOMContentLoaded', startMessagePolling);


