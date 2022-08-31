module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/')
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  },
  statusAuth: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.status(401).json({
        authenticated: false,
        message: 'success auth'
      });
    }
  }
}
