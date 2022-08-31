import Component from '../../../views/component';

import Tasks from '../../../models/tasks';

import AddAndListTemplate from '../../../../templates/pages/tasks/add-list';
import TaskTemplate from '../../../../templates/pages/tasks/task';

class AddAndList extends Component {
    constructor() {
        super();

        this.model = Tasks;
    }

    async getData() {
        return await this.model.getTasksList();
    }

    async render(tasks) {
        return await AddAndListTemplate({tasks});
    }

    afterRender() {
        this.setActions();

        this.countTasksAmount();
        this.initModalTask();
    }

    setActions() {
        const taskTitleField = document.getElementsByClassName('task-add__title')[0],
            taskCheckBtn = document.getElementsByClassName('task-add__checker')[0], // чекер кнопка
            taskPreviewImage = document.getElementsByClassName('task-add__screenshot-img')[0],
            taskDescriptionField = document.getElementsByClassName('task-add__description')[0],
            addTaskBtn = document.getElementsByClassName('task-add__btn-add')[0],
            tasksContainer = document.getElementsByClassName('tasks')[0],
            clearTasksListBtn = tasksContainer.getElementsByClassName('tasks__btn-clear')[0],
            tasksList = tasksContainer.getElementsByClassName('tasks__list')[0];

        addTaskBtn.onclick = () => this.addTask(taskTitleField, taskDescriptionField, addTaskBtn,
                                                tasksList, taskPreviewImage, taskCheckBtn);

        taskCheckBtn.onclick = () => this.checkPreview(taskTitleField, taskDescriptionField, taskCheckBtn, taskPreviewImage, addTaskBtn);

        taskTitleField.onkeyup = evt => {
            if (evt.key === 'Enter' || evt.keyCode === 13) {
                taskCheckBtn.click();
            }
        };

        tasksContainer.onclick = evt => {
            const target = evt.target,
                targetClassList = target.classList;

            switch (true) {
                case targetClassList.contains('tasks__btn-clear'):
                    this.clearTasksList(tasksList, clearTasksListBtn);
                    break;

                case targetClassList.contains('task'):
                case targetClassList.contains('task__title'):
                    this.redirectToTaskInfo(target.dataset.id);
                    break;

                case targetClassList.contains('task__btn-done'):
                    this.changeTaskStatus(target.parentNode.parentNode,
                                          target.previousElementSibling, target);
                    break;

                case targetClassList.contains('task__btn-remove'):
                    this.removeTask(tasksList, target.parentNode.parentNode, clearTasksListBtn);
                    break;
            }
        };
    }

    async checkPreview(taskTitleField, taskDescriptionField, taskCheckBtn, taskPreviewImage, addTaskBtn, tasksList) {

        taskTitleField.value = (taskTitleField.value.trim().includes('http'))
            ? taskTitleField.value.trim()
            : `https://${taskTitleField.value.trim()}`;

        addTaskBtn.disabled = true;

        taskCheckBtn.classList.add('preloader');
        taskCheckBtn.disabled = true;

        let pageInfo = await this.model.getFirstPreview(taskTitleField.value.trim());

        if (pageInfo.status !== 'error') {
            taskPreviewImage.setAttribute('src', `data:image/png;base64,${pageInfo.image}`);
            taskPreviewImage.classList.add('preview');

            taskCheckBtn.classList.remove('preloader');
            taskCheckBtn.disabled = addTaskBtn.disabled = false;

            taskDescriptionField.value = pageInfo.title;
        } else {
            alert('Ошибка при запросе страницы, попробуйте ещё раз!');

            this.clearAddTask(taskTitleField, taskDescriptionField, addTaskBtn, tasksList, taskPreviewImage, taskCheckBtn);
        }

    }

    async addTask(taskTitleField, taskDescriptionField, addTaskBtn, tasksList, taskPreviewImage, taskCheckBtn) {
        addTaskBtn.classList.add('preloader');
        addTaskBtn.disabled = true;

        let parsing = await this.model.getCheckPage(taskTitleField.value.trim());

        let newTask = {
            title: taskTitleField.value.trim(),
            description: taskDescriptionField.value.trim(),
            image: parsing.image,
            thumbnail: parsing.thumbnail,
            id: parsing.id,
            datetime: parsing.datetime,
            folder: parsing.folder,
            scan: [{
                num: 0,
                time: parsing.datetime,
                image: parsing.image,
                text: parsing.text,
                length: parsing.length
            }]
        };

        newTask = await this.model.addTask(newTask);

        this.clearAddTask(taskTitleField, taskDescriptionField, addTaskBtn, tasksList, taskPreviewImage, taskCheckBtn);

        tasksList.insertAdjacentHTML('beforeend', await TaskTemplate({task: newTask}));

        addTaskBtn.classList.remove('preloader');
        addTaskBtn.disabled = false;

        this.countTasksAmount();
    }

    initModalTask() {
        const modalContent = document.getElementById('modal'),
            modalButton = document.getElementsByClassName('modal-button')[0],
            closeButton = document.getElementsByClassName('close')[0];

        modalButton.onclick = () => {
            modalContent.style.display = 'block';
        };

        closeButton.onclick = () => {
            modalContent.style.display = 'none';
        };

        modalContent.onclick = event => {
            if (event.target === modalContent) {
                modalContent.style.display = 'none';
            }
        };
    }

    clearAddTask(taskTitleField, taskDescriptionField, addTaskBtn, tasksList, taskPreviewImage, taskCheckBtn) {
        taskTitleField.value = taskDescriptionField.value = '';

        taskPreviewImage.setAttribute('src', './images/icons/photoframe.png');
        taskPreviewImage.classList.remove('preview');

        taskCheckBtn.classList.remove('preloader');
        taskCheckBtn.disabled = false;

        addTaskBtn.disabled = true;
    }

    countTasksAmount() {
        const tasksCounter = document.getElementsByClassName('tasks__counter')[0],
            totalAmount = document.getElementsByClassName('task').length,
            doneAmount = document.getElementsByClassName('task_done').length,
            toBeVerbForm = (doneAmount === 1) ? 'is' : 'are';

        tasksCounter.innerHTML = !totalAmount ?
            'Tasks list is empty' :
            `There ${toBeVerbForm} <span class="tasks__counter-total">${totalAmount}</span> task`;
        }

    redirectToTaskInfo(id) {
        location.hash = `#/task/${id}`;
    }

    async changeTaskStatus(taskContainer, editTaskBtn, doneTaskBtn) {
        await this.model.changeTaskStatus(taskContainer.dataset.id);

        taskContainer.classList.add('task_done');
        editTaskBtn.remove();
        doneTaskBtn.remove();

        this.countTasksAmount();
    }

    async removeTask(tasksList, taskContainer, clearTasksListBtn) {
        if (confirm('Are you sure?')) {
            await this.model.removeTask(taskContainer.dataset.id);

            taskContainer.remove();
            !tasksList.children.length && (clearTasksListBtn.disabled = true);

            this.countTasksAmount();
        }
    }
}

export default AddAndList;