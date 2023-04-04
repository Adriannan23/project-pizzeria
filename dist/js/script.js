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

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
      // console.log('new Product:', thisProduct);
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
      // console.log("cena:" + thisProduct.priceElem)
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) PRODUCT HEADER*/
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

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
      // console.log('initOrderForm')

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        // console.log('submit called')
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          // console.log('change called')
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        // console.log('cart button clicked')
        thisProduct.processOrder();
      });

    }
    processOrder() {
      const thisProduct = this;
      // console.log('processOrder')
      const tabWithProperies = [];
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      for (const property in formData) {
        tabWithProperies.push(...formData[property]);
        // console.log('formData[property]: ', formData[property]);
      }
      // console.log('tabWithProperies ', tabWithProperies);

      // console.log('formData', formData);

      // console.log('thisProduct.data', thisProduct.data);

      // set price to default price
      let price = thisProduct.data.price;
      // console.log(price);

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        // console.log(param);
        // console.log('formData[paramId]', formData[paramId])

        // console.log(thisProduct.data.default)
        // console.log(param.options);
        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // console.log('-------------')
          // console.log('optionId ', optionId);
          // console.log('-------------')
          // console.log('option ', option);
          // (console.log(option.default))
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is not default
            if (!option.default) {
              price = price + option.price;
            }
          } else {
            // check if the option is default
            if (option.default) {
              price = price - option.price;
            }
          }


          // if (option.default == "true") {
          // price = price + option.price;
          // console.log(option.price)
          // console.log('formData: ', formData[paramId])
        }
      }

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

  }




  const app = {



    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data.products);

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
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();

      thisApp.initMenu();
    },
  };
  app.init();
}
