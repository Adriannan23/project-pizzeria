/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),



  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,

    }
  };
  console.log(settings.amountWidget.defaultMax)


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

    // this method is responsible for creating a new AmountWidget class instance and saving it in the product property (so we have easy access to it)
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      })
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
        // update calculated price in the HTML
        thisProduct.priceElem.innerHTML = price;
      }
    }

  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      // console.log('thisWidget:', thisWidget);
      // console.log('constructor arguments:', element);

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      // console.log(element);

      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      // console.log('thisWidget.input: ', thisWidget.input);

      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      // console.log("thisWidget.linkDecrease: ", thisWidget.linkDecrease);

      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      // console.log("thisWidget.linkIncrease: ", thisWidget.linkIncrease);

    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      // jesli ten warunek zostanie spełniony, to newValue ma nową wartość, którą dopisujemy do inputu.
      if (thisWidget.value !== newValue && !isNaN(newValue)) {
        thisWidget.value = newValue;

      }

      thisWidget.input.value = thisWidget.value;
      console.log('thisWidget.value: ', thisWidget.value);

      if (thisWidget.value >= settings.amountWidget.defaultMax) {
        thisWidget.value = settings.amountWidget.defaultMax
      }

      if (thisWidget.value < settings.amountWidget.defaultMin) {
        thisWidget.value = settings.amountWidget.defaultMin
      }
      thisWidget.announce();

    }

    initActions() {

      const thisWidget = this;


      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
        // console.log('change')
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }


  const app = {



    initMenu: function () {
      const thisApp = this;

      for (let productData in thisApp.data.products) {


        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },


    init: function () {
      const thisApp = this;


      thisApp.initData();

      thisApp.initMenu();
    },
  };
  app.init();
}