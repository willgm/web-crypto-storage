const { CryptoStorage } = require('../dist/web-crypto-storage.cjs');

let cryptoStorage;

const Actions = {
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
        value('text', 'You can insert any text you want here.');
        updateStatus('No saved notes found for ' + user);
      }

      setclass('loginform', 'hide');
      setclass('notes', 'show');
      focus('text');
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

  clear() {
    cryptoStorage.clear();
    value('text', '');
    updateStatus('Storage cleared, just crypto salt remains.');
  },

  logout() {
    value('user', '');
    value('pass', '');
    cryptoStorage.close();
    setclass('loginform', 'show');
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
      Actions.login();
      break;
    case 'load':
      Actions.load();
      break;
    case 'save':
      Actions.save();
      break;
    case 'clear':
      Actions.clear();
      break;
    case 'logout':
      Actions.logout();
      break;
  }
});

addEventListener('submit', event => {
  event.preventDefault();
  Actions.login();
});

function value(id, val) {
  let input = document.getElementById(id) || Array.from(document.getElementsByName(id)).find(e => e.checked);
  if (val !== undefined) {
    input.value = val;
  } else {
    return input.value;
  }
}

function focus(id) {
  document.getElementById(id).select();
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
