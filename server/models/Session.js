const session = require("express-session");
const MongoStore = require("connect-mongo");

module.exports = function setupSession(app, mongoUrl, secret) {
  // Trust the proxy chain (Cloudflare -> Nginx -> Express)
  app.set("trust proxy", true);

  app.use(
    session({
      name: "erp.sid",
      secret: secret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: mongoUrl,
        ttl: 24 * 60 * 60, // 1 day
      }),
      cookie: {
        httpOnly: true,
        secure: true,    // Required for HTTPS (Cloudflare)
        sameSite: "none", // Essential for cross-origin tunnels
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );
};