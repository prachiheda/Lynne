const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@google/generative-ai']
    }
  }, argv);

  // Customize the config before returning it.
  if (config.resolve) {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any additional aliases here
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "crypto": false,
      "stream": false,
      "buffer": false
    };
  }

  return config;
}; 