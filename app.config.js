// Extends app.json. The web build sets STILLPOINT_BASE_URL so the app can
// be hosted under a sub-path (GitHub Pages: /stillpoint).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.STILLPOINT_BASE_URL ? { baseUrl: process.env.STILLPOINT_BASE_URL } : {}),
  },
});
