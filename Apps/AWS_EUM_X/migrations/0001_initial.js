exports.up = async function (dataDir, logger) {
  // Initial migration: ensure a basic config exists and create metadata
  const fs = require('fs');
  const path = require('path');

  const cfgFile = path.join(dataDir, 'config.json');
  if (!fs.existsSync(cfgFile)) {
    const defaultCfg = {
      AWS_REGION: process.env.AWS_REGION || 'eu-west-2',
      DISABLE_CSP: false
    };
    fs.writeFileSync(cfgFile, JSON.stringify(defaultCfg, null, 2), { mode: 0o600 });
    logger.info({ cfgFile }, 'Wrote default configuration');
  }

  // Optionally create any other initial files here
};
