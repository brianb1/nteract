import { Menu, app } from 'electron';
import { resolve } from 'path';

import {
  launchFilename,
  launchNewNotebook,
} from './launch';

import { defaultMenu, loadFullMenu } from './menu';

const log = require('electron-log');

const version = require('../../package.json').version;

const argv = require('yargs')
  .version(version)
  .parse(process.argv.slice(2));

const notebooks = argv._;

app.on('window-all-closed', () => {
  // On OS X, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('open-file', (event, path) => {
  event.preventDefault();
  launchFilename(resolve(path));
});


app.on('ready', () => {
  log.info('app in ready state');

  // Get the default menu first
  Menu.setApplicationMenu(defaultMenu);
  // Let the kernels/languages come in after
  loadFullMenu().then(menu => Menu.setApplicationMenu(menu));
  if (notebooks.length <= 0) {
    log.info('launching an empty notebook by default');
    launchNewNotebook('python3');
  } else {
    notebooks
      .filter(Boolean)
      .filter(x => x !== '.') // Ignore the `electron .`
      // TODO: Consider opening something for directories
      .forEach(f => launchFilename(resolve(f)));
  }
});
