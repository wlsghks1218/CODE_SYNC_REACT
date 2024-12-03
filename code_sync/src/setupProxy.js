const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  console.log("프록시 탐");
  app.use(
    '/member',
    createProxyMiddleware({
      target: 'http://localhost:9090', // 백엔드 서버 주소
      changeOrigin: true,
      logLevel: 'debug', // 디버그 활성화
    })
  );
};
