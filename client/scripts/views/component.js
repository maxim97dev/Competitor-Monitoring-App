import {parseCurrentURL} from '../helpers/utils.js';

import Auth from '../models/auth';

class Component {
    constructor() {
        this.urlParts = parseCurrentURL();
    }

    async getData() {}

    async getAuth() {
        return await Auth.getAuthStatus();
    }

    afterRender() {}
}

export default Component;