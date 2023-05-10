import { templates, select } from '../settings.js';
import { utils } from '../utils.js';

class Home {

  constructor(element) {

    const thisHomePage = this;

    thisHomePage.render(element);
    // thisHomePage.initWidgets();

  }

  render() {
    const thisHomePage = this;
    const generatedHTML = templates.homePage();
    thisHomePage.element = utils.createDOMFromHTML(generatedHTML);
    const homeContainer = document.querySelector(select.containerOf.home);
    homeContainer.appendChild(thisHomePage.element);

  }

}


export default Home;