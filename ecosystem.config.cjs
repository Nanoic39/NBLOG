module.exports = {
  apps: [
    {
      name: 'NBLOG',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        NITRO_PORT: 3000,
        NITRO_HOST: '0.0.0.0', // 监听所有网卡接口，允许外部访问
        NODE_ENV: 'production'
      }
    }
  ]
}
