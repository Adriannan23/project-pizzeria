import AmountWidget from './AmountWidget.js';
import { select, templates, classNames } from '../settings.js';
import { utils } from '../utils.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  prepareCartProductParams() {

    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];


      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {}
      };
      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          // option is selected!
          params[paramId].options[optionId] = option.label;
        }


      }

    }
    return params;
  }

  prepareCartProduct() {
    const thisProduct = this;

    //W productSummary, będą TYLKO niezbędna dla koszyka informacje.
    const productSummary = {
      'id': thisProduct.id,
      'name': thisProduct.data.name,
      'amount': thisProduct.amountWidget.value,
      'priceSingle': thisProduct.priceSingle,
      'price': thisProduct.priceSingle * thisProduct.amountWidget.value,
      'params': thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }

  addToCart() {
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', { bubbles: true, detail: { product: thisProduct } });

    thisProduct.element.dispatchEvent(event);
  }

  // this method is responsible for creating a new AmountWidget class instance and saving it in the product property (so we have easy access to it)
  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }


  renderInMenu() {
    const thisProduct = this;
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);


    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    // /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);

    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);


    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);

    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);



  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) PRODUCT HEADER*/

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct != thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });

  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }
  processOrder() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        let imageSelector = '.' + paramId + '-' + optionId;
        let image = thisProduct.imageWrapper.querySelector(imageSelector);
        // image.classList.toggle('active');
        const isSelected = formData[paramId] && formData[paramId].includes(optionId);


        if (isSelected) {

          // // check if the option is not default
          if (!option.default) {
            price = price + option.price;
            if (image) {
              image.classList.add('active');
            }
          }
          if (option.default) {
            if (image) {
              image.classList.add('active');
            }
          }
        } else {
          // check if the option is default
          if (option.default) {
            price = price - option.price;
            if (image) {
              image.classList.remove('active');
            }
          }
          if (!option.default) {
            if (image) {
              image.classList.remove('active');
            }
          }
        }

      }

    }

    /* multiply price by amount */
    price = price * thisProduct.amountWidget.value;

    thisProduct.priceSingle = price;
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }


}

export default Product;