import Component from '../../views/component';

import AboutTemplate from '../../../templates/pages/about';

class About extends Component {
    async render() {
        return await AboutTemplate();
    }
}

export default About;