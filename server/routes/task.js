const express = require('express'),
    router = express.Router(),
    config = require('config'),
    fs = require('file-system'),
    shortId = require('shortid');

router.post('/api/task', (req, res) => {
    const tasksData = getTasksFromDB(req.user.id),
        task = req.body;

    task.description = task.description.trim() || 'No Description';
    task.status = 'In Progress';

    tasksData.push(task);
    setTasksToDB(tasksData, req.user.id);

    res.send(task);
});

router.get('/api/task/:id', (req, res) => {
    const tasksData = getTasksFromDB(req.user.id),
        task = tasksData.find(task => task.id === req.params.id);

    task ? res.send(task) : res.status(404).send({error: 'Task with given ID was not found'});
});

router.put('/api/task/:id', (req, res) => {
    const tasksData = getTasksFromDB(req.user.id),
        task = tasksData.find(task => task.id === req.params.id),
        updatedTask = req.body;

    task.title = updatedTask.title;
    task.description = updatedTask.description || 'No Description';

    setTasksToDB(tasksData, req.user.id);

    res.sendStatus(204);
});

router.put('/api/task/:id/done', (req, res) => {
    const tasksData = getTasksFromDB(req.user.id);

    tasksData.find(task => task.id === req.params.id).status = 'Done';

    setTasksToDB(tasksData, req.user.id);

    res.sendStatus(204);
});

router.delete('/api/task/:id', (req, res) => {
    const tasksData = getTasksFromDB(req.user.id),
        updatedData = tasksData.filter(task => task.id !== req.params.id);

    setTasksToDB(updatedData, req.user.id);
    removeTaskFolder(req.user.id, req.params.id);
    
    res.sendStatus(204);
});

function getTasksFromDB(user) {
    return JSON.parse(fs.readFileSync(`./database/${user}${config.get('database.tasks')}`, 'utf8'));
}

function setTasksToDB(tasksData, user) {
    fs.writeFileSync(`./database/${user}${config.get('database.tasks')}`, JSON.stringify(tasksData));
}

function removeTaskFolder(user, taskId) {
    console.log(`./database/${user}/userdata/${taskId}`);
    fs.rmSync(`./database/${user}/userdata/${taskId}`, {
        recursive: true,
    });
}

module.exports = router;