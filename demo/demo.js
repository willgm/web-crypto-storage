const { CryptoStorage } = require('../dist/web-crypto-storage.cjs');

let cryptoStorage;

const INITIAL_NOTES = `You can insert any text you want here.
Save it to storage and reload the page.`;

function value(id, val) {
  let input = document.getElementById(id) || Array.from(document.getElementsByName(id)).find(e => e.checked);
  if (val !== undefined) {
    input.value = val;
  } else {
    return input.value;
  }
}

function focus(id) {
  document.getElementById(id).focus();
}

function setclass(id, val) {
  let el = document.getElementById(id);
  el.className = val;
}

function updateStatus(val) {
  document.getElementById('status').innerHTML = '<b>Status:</b> ' + val;
}

async function webauthn(user, challenge) {
  const encoder = new TextEncoder();
  const publicKey = {
    challenge: encoder.encode(challenge),
    user: {
      id: encoder.encode(user),
      name: user,
      displayName: user
    },
    pubKeyCredParams: [
      {
        type: "public-key",
        alg: -7
      }
    ],
    rp: {
      name: document.title,
      id: location.hostname
    },
  };

  const credential = await navigator.credentials.create({ publicKey });

  const decoder = new TextDecoder();
  const decodedClientData = decoder.decode(
    credential.response.clientDataJSON
  );

  // parse the string as an object
  const clientDataObj = JSON.parse(decodedClientData);

  return clientDataObj.challenge;
}

const Buttons = {
  async login() {
    try {
      const user = value('user');
      let pass = value('pass');
      const logintype = value('logintype');

      if (!user || (logintype !== 'webauthn' && !pass)) {
        return updateStatus('User and password are required');
      }

      if(logintype !== 'password') {
        pass = await webauthn(user, logintype === 'webauthn' ? user : pass)
      }

      // Here the user password is used as base crypto key
      // and the user name is used as database name to fully scope the data:
      cryptoStorage = new CryptoStorage(pass, user);
      const notes = await cryptoStorage.get('mynotes');

      if (notes) {
        value('text', notes);
        updateStatus('Notes loaded for ' + user);
      } else {
        Buttons.paste();
        updateStatus('Example notes pasted. No saved notes found for ' + user);
      }

      setclass('login', 'hide');
      setclass('notes', 'show');
    } catch (error) {
      updateStatus(error);
    }
  },

  load() {
    cryptoStorage.get('mynotes').then(notes => {
      if (notes) {
        value('text', notes);
        updateStatus('Notes loaded.');
      } else {
        updateStatus('No saved notes found!');
      }
    }, updateStatus);
  },

  save() {
    const notes = value('text');
    cryptoStorage.set('mynotes', notes).then(() => {
      updateStatus('Notes saved.');
    });
  },

  paste() {
    value('text', INITIAL_NOTES);
    updateStatus('Example notes pasted.');
  },

  clear() {
    cryptoStorage.clear();
    Buttons.paste();
    updateStatus('Example notes pasted. (Storage cleared.)');
  },

  logout() {
    value('user', '');
    value('pass', '');
    cryptoStorage.close();
    setclass('login', 'show');
    setclass('notes', 'hide');
    updateStatus('Logged out.');
    focus('user');
  },
};

addEventListener('click', event => {
  if(event.target.type !== 'button' && event.target.type !== 'submit') {
    return;
  }

  event.preventDefault();
  switch (event.target.id) {
    case 'login':
      Buttons.login();
      break;
    case 'load':
      Buttons.load();
      break;
    case 'save':
      Buttons.save();
      break;
    case 'paste':
      Buttons.paste();
      break;
    case 'clear':
      Buttons.clear();
      break;
    case 'logout':
      Buttons.logout();
      break;
  }
});

addEventListener('submit', event => {
  event.preventDefault();
  switch (event.target.id) {
    case 'login':
      Buttons.login();
      break;
  }
});
