const fs = require('fs-extra');
const exec = require('child_process').exec;
const ncp = require('ncp').ncp;
const path = require('path');

const isWindows = process.platform === "win32";

(function() {
  const tomcatDirectoryInput = document.getElementById('tomcat-dir');
  const projectDirectoryInput = document.getElementById('project-dir');
  const projectNameInput = document.getElementById('project-name');
  const projectNameSection = document.getElementById('project-name-section');
  const updateButton = document.getElementById('update');
  const removeProjectsButton = document.getElementById('remove-projects');
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const tomcatDirValidationError = document.getElementById('tomcat-dir-validation-error');
  const projectDirValidationError = document.getElementById('project-dir-validation-error');
  const existingProjectsSelector = document.getElementById('existing-projects');
  const existingProjectValidationError = document.getElementById('existing-projects-validation-error');


  const userSettings = {
    startScript: isWindows ? 'startup.bat' : 'startup.sh',
    shutdownScript: isWindows ? 'shutdown.bat' : 'shutdown.sh',
    webapps: 'webapps',
    serverConfig: {
      path: 'conf/server.xml',
      value: null,
    },
    defaultApps: [
      'ROOT',
      'docs',
      'examples',
      'host-manager',
      'manager',
    ],

  };

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
      } = userSettings;
      const cwd = path.join(tomcatPath, 'bin');

      execute(script, cwd, function(output) {
        if (!isWindows) {
          alert(output || defaultMessage);
        }
      });
    };
  }

  function addOption(value) {
    const option = document.createElement('option');
    option.value = value;
    option.innerHTML = value;
    existingProjectsSelector.appendChild(option);
  }

  function displayExistingProjects() {
    const {
      tomcatPath,
      webapps,
      defaultApps,
    } = userSettings;

    if(!tomcatPath) { return; }

    const fullPath = path.join(tomcatPath, webapps);

    existingProjectsSelector.innerHTML = '';

    fs.readdir(fullPath, function(err, items) {
      const userProjects = items.filter(i => defaultApps.indexOf(i) === -1);

      userProjects.forEach(function(projectName) {
        addOption(projectName);
      })
    });
  }

  tomcatDirectoryInput.onchange = function() {
    userSettings.tomcatPath = tomcatDirectoryInput.files[0].path;

    startButton.removeAttribute('disabled');
    stopButton.removeAttribute('disabled');
    tomcatDirValidationError.classList.add('hidden');
    existingProjectValidationError.classList.add('hidden');
    removeProjectsButton.classList.remove('hidden');
    existingProjectsSelector.classList.remove('hidden');

    displayExistingProjects();
    updateForm();
  };

  projectDirectoryInput.onchange = function() {
    const projectPath = projectDirectoryInput.files[0].path;
    userSettings.projectPath = projectPath;
    projectNameInput.value = path.basename(projectPath);

    updateButton.removeAttribute('disabled');
    projectDirValidationError.classList.add('hidden');
    projectNameSection.classList.remove('hidden');
    updateForm();
  };

  startButton.onclick = execTomcat(userSettings.startScript, 'Tomcat Started.');
  stopButton.onclick = execTomcat(userSettings.shutdownScript, 'Tomcat has Shutdown.');

  updateButton.onclick = function() {
    const {
      projectPath,
      tomcatPath,
    } = userSettings;

    if(!tomcatPath) {
      alert('You must select a Tomcat directory');
      return;
    }

    const projectName = projectNameInput.value || path.basename(projectPath);
    const destination = path.join(tomcatPath, 'webapps', projectName);

    ncp(projectPath, destination, function(error) {
      if(error) {
        alert('Error: ' + error);
      } else {
        alert('Your project has been updated in Tomcat/webapps');
        displayExistingProjects();
      }
    });
  };

  removeProjectsButton.onclick = function() {
    const {
      tomcatPath,
      webapps,
    } = userSettings;
    const selected = existingProjectsSelector.querySelectorAll('option:checked');
    const values = Array.from(selected)
      .map(el => path.join(tomcatPath, webapps, el.value));

    values.forEach(projectName => {
      fs.removeSync(projectName);
    });

    displayExistingProjects();
  };

  function updateForm() {
    if (!userSettings.tomcatPath) {
      startButton.setAttribute('disabled', 'disabled');
      stopButton.setAttribute('disabled', 'disabled');
      tomcatDirValidationError.classList.remove('hidden');
      existingProjectValidationError.classList.remove('hidden');
      removeProjectsButton.classList.add('hidden');
      existingProjectsSelector.classList.add('hidden');
    }

    if(!userSettings.projectPath) {
      updateButton.setAttribute('disabled', 'disabled');
      projectDirValidationError.classList.remove('hidden');
      projectNameSection.classList.add('hidden');
      projectNameInput.value = '';
    }
  }

  updateForm();
})();

