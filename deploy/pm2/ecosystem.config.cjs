/** PM2: pacarrent-api (.NET 8). Jalankan dari ~/pacarent setelah git pull. */
module.exports = {
  apps: [
    {
      name: 'pacarrent-api',
      script: 'deploy/scripts/run-api.sh',
      interpreter: 'bash',
      cwd: process.env.PACARRENT_REPO || process.cwd(),
      instances: 1,
      autorestart: true,
      max_restarts: 15,
      min_uptime: '15s',
      time: true,
    },
  ],
};
