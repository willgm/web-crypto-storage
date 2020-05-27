/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {} from '../node_modules/idb-keyval/dist/idb-keyval-iife';

var cryptoStorage;

var EXAMPLE_NOTES = JSON.stringify([
  { title: 'Return $200 to Alice' },
  { title: 'Buy soy milk', due: '2014-09-15' },
]);

var EXAMPLE_NOTES =
  'You can insert any text you want here.\n' + 'Save it to storage and reload the page.\n';

function value(val) {
  var text = document.getElementById('text');
  if (val) {
    text.value = val;
  } else {
    return text.value;
  }
}

function updateStatus(val) {
  document.getElementById('status').innerHTML = '<b>Status:</b> ' + val;
}

var Buttons = {
  load() {
    cryptoStorage.load('mynotes').then(function(notes) {
      if (notes) {
        value(notes);
        updateStatus('Notes loaded.');
      } else {
        updateStatus('No saved notes found!');
      }
    }, updateStatus);
  },

  save() {
    var notes = value();

    cryptoStorage.save('mynotes', notes).then(function() {
      updateStatus('Notes saved.');
    });
  },

  paste() {
    value(EXAMPLE_NOTES);
    updateStatus('Example notes pasted.');
  },

  clear() {
    idbKeyval.clear();
    Buttons.paste();
    updateStatus('Example notes pasted. (Storage cleared.)');
  },
};

addEventListener('DOMContentLoaded', function() {
  cryptoStorage = new CryptoStorage(prompt('Please enter your password'));
  cryptoStorage.load('mynotes').then(function(notes) {
    if (notes) {
      value(notes);
      updateStatus('Notes loaded.');
    } else {
      Buttons.paste();
      updateStatus('Example notes pasted. (No saved notes found.)');
    }
  }, updateStatus);
});

addEventListener('click', function(event) {
  switch (event.target.id) {
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
  }
});
