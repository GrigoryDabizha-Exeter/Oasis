const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround for 'import.meta' outside a module errors in Supabase/Zustand
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
