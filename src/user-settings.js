const isWindows = process.platform === "win32";

const userSettings = {
  startScript: isWindows ? './startup.bat' : './startup.sh',
  shutdownScript: isWindows ? './shutdown.bat' : './shutdown.sh',
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
  isWindows,
};

function updateUserSetting(key, value) {
  userSettings[key] = value;
  return value;
}

module.exports = {
  userSettings,
  updateUserSetting,
};

