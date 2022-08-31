class Settings {
    static async getSettingsList() {
        const response = await fetch('http://localhost:3000/api/settings', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            }
        });

        return await response.json();
    }

    static async setAvatar(formData) {
        const response = await fetch('http://localhost:3000/api/settings', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Access-Control-Allow-Credentials': true
            },
            body: formData
        });

        return await response.json();
    }

    static async editSettings(name) {
        await fetch('http://localhost:3000/api/settings', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(name)
        });
    }

}

export default Settings;