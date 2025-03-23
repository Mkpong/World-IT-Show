const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const paths = ['/clusters', '/api/logs'];

  paths.forEach((path) => {
    app.use(
      path,
      createProxyMiddleware({
        target: 'http://10.10.0.161:32446',
        changeOrigin: true,
      })
    );
  });
};
