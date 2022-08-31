import Component from '../../views/component';

import Error404Template from '../../../templates/pages/error404';

class Error404 extends Component {
    async render() {
        return await Error404Template();
    }

}

export default Error404;