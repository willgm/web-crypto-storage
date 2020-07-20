const { CryptoStorage } = require('../dist/web-crypto-storage.cjs');

let cryptoStorage;

const INITIAL_NOTES = `You can insert any text you want here.
Save it to storage and reload the page.`;

function value(id, val) {
  let input = document.getElementById(id);
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

const Buttons = {
  login() {
    const user = value('user');
    const pass = value('pass');
    if (!user || !pass) {
      return updateStatus('User and password are required');
    }
    // Here the user password is used as base crypto key
    // and the user name is used as database name to fully scope the data:
    cryptoStorage = new CryptoStorage(pass, user);
    cryptoStorage.get('mynotes').then(notes => {
      if (notes) {
        value('text', notes);
        updateStatus('Notes loaded for ' + user);
      } else {
        Buttons.paste();
        updateStatus('Example notes pasted. No saved notes found for ' + user);
      }
      setclass('login', 'hide');
      setclass('notes', 'show');
    }, updateStatus);
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
    // cryptoStorage.close();
    setclass('login', 'show');
    setclass('notes', 'hide');
    updateStatus('Logged out...');
    focus('user');
  },
};

addEventListener('click', event => {
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
