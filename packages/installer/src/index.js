/**
 * @aios/installer - AIOS Installer Package
 *
 * Provides automated setup wizard for AIOS projects (greenfield & brownfield).
 */

const configureEnvironment = require('./config/configure-environment');
const detectProjectType = require('./detection/detect-project-type');
const wizard = require('./wizard/wizard');

module.exports = {
  configureEnvironment,
  detectProjectType,
  wizard,
};
