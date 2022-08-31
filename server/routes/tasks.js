const express = require('express'),
    router = express.Router(),
    config = require('config'),
    fs = require('file-system');

router.get('/api/tasks', (req, res) => {   
    console.log(req.user); 
    res.send(fs.readFileSync(`./database/${req.user.id}${config.get('database.tasks')}`, 'utf8'))
});

router.delete('/api/tasks', (req, res) => {
    console.log(req.user);
    fs.writeFileSync(`./database/${req.user.id}${config.get('database.tasks')}`, JSON.stringify([]));

    res.sendStatus(204);
});

module.exports = router;
