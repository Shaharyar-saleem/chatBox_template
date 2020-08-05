// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(feathers.hooks());
// Use localStorage to store our login token
client.configure(feathers.authentication({
  storage: window.localStorage
}));
// Retrieve email/password object from the login/signup page
function getCredentials() {
  const user = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value
  };

  return user;
}

// Log in either using the given email/password or the token from storage
function login(credentials) {
  const payload = credentials ?
    Object.assign({ strategy: 'local' }, credentials) : {};

  return client.authenticate(payload)
    .then(showChat)
    .catch(showLogin);
}

document.addEventListener('click', function(ev) {
  switch(ev.target.id) {
    case 'signup': {
      const user = getCredentials();

      // For signup, create a new user and then log them in
      client.service('users').create(user)
        .then(() => login(user));

      break;
    }
    case 'login': {
      const user = getCredentials();

      login(user);

      break;
    }
    case 'logout': {
      client.logout().then(() => {
         document.getElementById('app').innerHTML = loginHTML;
      });

      break;
    }
  }
});
document.addEventListener('submit', function(ev) {
  if(ev.target.id === 'send-message') {
    // This is the message text input field
    const input = document.querySelector('[name="text"]');

    // Create a new message and then clear the input field
    client.service('messages').create({
      text: input.value
    }).then(() => {
      input.value = '';
    });
    ev.preventDefault();
  }
});

// Listen to created events and add the new message in real-time
client.service('messages').on('created', addMessage);

// We will also see when new users get created in real-time
client.service('users').on('created', addUser);

login();