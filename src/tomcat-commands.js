const path = require('path');
const exec = require('child_process').exec;
const { userSettings } = require('./user-settings.js');

function execute(command, cwd, callback) {
  exec(command, {
    cwd: cwd,
  }, (error, stdout, stderr) => {
    if(error) {
      alert('ERROR: ' + error.message);
    } else {
      callback(stdout);
    }
  });
}

function execTomcat(script, defaultMessage) {
  return function() {
    const {
      tomcatPath,
      isWindows,
    } = userSettings;
    const cwd = path.join(tomcatPath, 'bin');

    execute(script, cwd, function(output) {
      if (!isWindows) {
        alert(output || defaultMessage);
      }
    });
  };
}

module.exports = {
  execTomcat,
};