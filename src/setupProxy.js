const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const paths = ['/clusters', '/api/logs'];

  paths.forEach((path) => {
    app.use(
      path,
      createProxyMiddleware({
        target: 'http://10.10.0.71:31042',
        // target: 'http://10.10.0.161:5000',
        changeOrigin: true,
      })
    );
  });
};
