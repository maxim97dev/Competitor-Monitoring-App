const { statusAuth } = require("../middleware/auth");  

const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    multer  = require('multer'),
    User = require('../models/User');


const storage = multer.diskStorage({
   destination: function(req, file, done) {
   	// Сохраняем путь вывода после получения файла (если он не существует, вам необходимо его создать)
   	done(null, `./database/${req.user.id}/userdata/`);
   },
   filename: function(req, file, done) {
   	// Задайте для имени файла сохранения отметку времени + исходное имя файла, например 151342376785-123.jpg
   	done(null, Date.now() + "-avatar-" + file.originalname);
   }
});

const upload = multer({
   storage: storage
});

router.post('/api/settings', upload.single('avatar'), async (req, res) => {
    try {
        const image = {
            'image': `http://localhost:3000/static/images/${req.user.id}/userdata/${req.file.filename}`
        }
        await setAvatarFormDB(req.user.googleId, image);
        res.send(req.file);
    } catch (error) {
        console.log(error);
        res.send(400);
    }
});


router.get('/api/settings', statusAuth, async (req, res) => {
    const user = req.user;

    res.json(user);
});

router.put('/api/settings', statusAuth, async (req, res) => {
    const usersData = await getUsersFromDB(req.user.googleId);

    const userBody = req.body;

    await User.findOneAndUpdate(
        { googleId: usersData.googleId }, 
        { $set: userBody },
        {
            new: true
        }
    );

    res.sendStatus(204);
});

async function getUsersFromDB(userId) {
    return await User.findOne({ 'googleId': userId });
}

async function setAvatarFormDB(userId, image) {
    return await User.findOneAndUpdate(
        { googleId: userId },
        { $set: image },
        {
            new: true
        }        
    );
}

module.exports = router;