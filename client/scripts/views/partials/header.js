import Component from '../../views/component';

import HeaderTemplate from '../../../templates/partials/header';

class Header extends Component {
    async render(userProfile) {
        return await HeaderTemplate({page: this.urlParts.page, profile: userProfile});
    }
}

export default Header;