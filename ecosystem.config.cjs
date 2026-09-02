module.exports = {
  apps: [
    {
      name: "vokasin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/vokasin",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1400M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
