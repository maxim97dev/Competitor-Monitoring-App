import Component from '../../views/component';

import Settings from '../../models/settings';

import SettingsTemplate from '../../../templates/pages/settings';

class SettingsEdit extends Component {
    constructor() {
        super();

        this.model = Settings;
    }

    async getData() {
        return await this.model.getSettingsList();
    }

    async render(settings) {
        return await SettingsTemplate({settings});
    }

    afterRender() {
        this.setActions();
    }

    async setActions() {
        const inputName = document.getElementsByClassName('settings__input-name')[0],
            // inputEmail = document.getElementsByClassName('settings__input-email')[0],
            imageAvatar = document.getElementsByClassName('settings__image-avatar')[0],
            formAvatar = document.getElementsByClassName('settings__avatar-form')[0],
            inputAvatar = document.getElementById('uploaded_file'),
            saveButton = document.getElementsByClassName('settings__button')[0];

            saveButton.onclick = () => this.editUser(inputName);

            // formAvatar.onsubmit = async(e) => {
            //     e.preventDefault();

            //     await this.model.setAvatar(new FormData(formAvatar));

            // };

            formAvatar.onsubmit = (e) => this.editAvatar(e, formAvatar, imageAvatar, inputAvatar);

    }

    async editUser(inputName) {
        const userName = {
            displayName: inputName.value
        };

        await this.model.editSettings(userName);

    }

    async editAvatar(e, formAvatar) {
        e.preventDefault();

        const formData = new FormData(formAvatar);

        await this.model.setAvatar(formData);
    }
}

export default SettingsEdit;