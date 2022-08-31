const router = require('express').Router(),
    fs = require('file-system');

const { ensureAuth, ensureGuest, statusAuth } = require('../middleware/auth');

router.get('/', ensureGuest, (req, res) => {
    res.render('login')
});

router.get('/login/success', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: 'user has successfully authenticated',
      user: req.user,
      cookies: req.cookies
    });
  }
});

router.get('/login',ensureAuth, async (req,res) => {
    res.render('index', {
      name: req.user.displayName, 
      image: req.user.image
    });
});

router.get("/authstatus", statusAuth, async (req, res) => {
  if (!fs.existsSync(`./database/${req.user.id}`)) {
    const path = `./database/${req.user.id}`;

    const dir = fs.mkdirSync(path);
    if (!fs.existsSync(dir)) {
      fs.writeFileSync(`${path}/tasks.json`, '[]');
    }
  }

  res.status(200).json({
    authenticated: true,
    message: 'user auth success',
    user: req.user,
    cookies: req.cookies,
  });
});

module.exports = router;