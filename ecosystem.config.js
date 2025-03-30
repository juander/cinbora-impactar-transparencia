module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "/app/backend",
      script: "node",
      args: "-r module-alias/register dist/src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: "3333",  
      },
    },
    {
      name: "frontend",
      cwd: "/app/frontend",
      script: "node",
      args: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: "3000",  
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};