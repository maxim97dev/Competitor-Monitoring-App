import Component from '../../../views/component';

import {compareSlider} from '../../../helpers/utils.js';

import Tasks from '../../../models/tasks';

import InfoTemplate from '../../../../templates/pages/tasks/info';
import Error404Template from '../../../../templates/pages/error404';

class Info extends Component {
    async getData() {
        return await Tasks.getTask(this.urlParts.id);
    }

    async render(task) {
        return await (!task.error ? InfoTemplate({task}) : Error404Template());
    }

    afterRender() {
        this.setActions();
    }


    async setActions() {
        const dateContainer = document.getElementsByClassName('task-datetime')[0],
            checkboxes = document.getElementsByTagName('input'),
            taskControlButton = document.getElementsByClassName('task-control__button')[0];

        taskControlButton.disabled = true;

        dateContainer.onclick = e => {
            const target = e.target;
                if (target.tagName === 'INPUT' && target.type === 'checkbox') {

                    this.checkboxCount(taskControlButton, checkboxes);

                }

                if (target.tagName === 'BUTTON') {

                    this.compareTextButton(target);

                }
        };

        taskControlButton.onclick = () => {
            const checkedInput = document.querySelectorAll('input:checked');

            this.comparePage([checkedInput]);
        };

    }

    compareTextButton(target) {
        target.disabled = true;

        this.compareText([
            target.parentElement.previousElementSibling.children[0].dataset.text,
            target.parentElement.children[0].dataset.text, target
        ]);
    }

    checkboxCount(taskControlButton, checkboxes) {
        let checkboxCount = 0;

        for (let item of checkboxes) {

            if (item.checked) {
                checkboxCount++;
            }
        }

        taskControlButton.disabled = (checkboxCount !== 2) || false;
    }

    async comparePage([dataInput]) {

        const comparePicture = document.getElementsByClassName('task-compare__picture')[0];

        comparePicture.innerHTML = '';

        let imageArray = {
            image1: dataInput[0].dataset.image,
            image2: dataInput[1].dataset.image
        };

        imageArray = await Tasks.getPixelMatch(imageArray);

        comparePicture.insertAdjacentHTML('afterbegin', `
        <div class='image-spliter'>
            <div class='mover'></div>
                <img class='img-left' src='${imageArray.image1}'>
                <img class='img-right' src='${imageArray.image2}'>            
        </div>`);

        compareSlider();
    }

    async compareText([textPrev, textNext, target]) {
        let textDiff = {
            text1: textPrev,
            text2: textNext
        };

        textDiff = await Tasks.getTextDiff(textDiff);

        target.parentElement.insertAdjacentHTML('beforeend', '<section class="task-datetime__text"></section>');
        target.nextElementSibling.insertAdjacentHTML('beforeend', `<div>${textDiff.text}</div>`);

    }

}

export default Info;