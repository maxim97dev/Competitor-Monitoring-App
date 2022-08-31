import Component from '../../../views/component';

import Tasks from '../../../models/tasks';

import EditTemplate from '../../../../templates/pages/tasks/edit';
import Error404Template from '../../../../templates/pages/error404';

class Edit extends Component {
    constructor() {
        super();

        this.model = Tasks;
    }

    async getData() {
        this.task = await this.model.getTask(this.urlParts.id);

        return this.task;
    }

    async render(task) {
        let template;

        if (this.isEditEnable()) {
            task.description = (task.description === 'No Description') ? '' : task.description;

            template = EditTemplate({task});
        } else {
            template =  Error404Template();
        }

        return await template;
    }

    afterRender() {
        this.isEditEnable() && this.setActions();
    }

    isEditEnable() {
        return !this.task.error &&
               this.task.status !== 'Done' &&
               !location.hash.split(this.urlParts.action)[1];
    }

    setActions() {
        const taskTitleField = document.getElementsByClassName('task-edit__title')[0],
            taskDescriptionField = document.getElementsByClassName('task-edit__description')[0],
            saveTaskBtn = document.getElementsByClassName('task-edit__btn-save')[0];

        taskTitleField.onkeyup = () => saveTaskBtn.disabled = !taskTitleField.value.trim();
        saveTaskBtn.onclick = () => this.editTask(taskTitleField, taskDescriptionField);
    }

    async editTask(taskTitleField, taskDescriptionField) {
        this.task.description = taskDescriptionField.value.trim();

        await this.model.editTask(this.task);

        this.redirectToTaskInfo();
    }

    redirectToTaskInfo() {
        location.hash = `#/task/${this.task.id}`;
    }
}

export default Edit;