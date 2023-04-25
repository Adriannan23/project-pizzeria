import { select, classNames, templates } from './settings.js';
import utils from './utils.js';
import settings from './settings.js';
import CartProduct from './comopnents/CartProduct.js';

class Cart {

    constructor(element) {

        const thisCart = this;

        thisCart.products = [];


        thisCart.getElements(element);
        thisCart.initActions();
        // thisCart.update();

    }

    getElements(element) {
        const thisCart = this;
        thisCart.dom = {};
        thisCart.dom.wrapper = element;

        thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

        thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);


        thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

        thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

        thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);

        thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

        thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

        thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

        thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }

    initActions() {
        const thisCart = this;

        thisCart.dom.toggleTrigger.addEventListener('click', function () {
            thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });

        thisCart.dom.productList.addEventListener('updated', function () {
            thisCart.update();
        });

        thisCart.dom.productList.addEventListener('remove', function (event) {
            thisCart.remove(event.detail.cartProduct);
        });

        thisCart.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisCart.sendOrder();
        });

    }

    remove(cancel) {

        const thisCart = this;

        cancel.dom.wrapper.remove();

        const indexOfProduct = thisCart.products.indexOf(cancel);
        thisCart.products.splice(indexOfProduct, 1);

        thisCart.update();
    }



    add(menuProduct) {
        const thisCart = this;


        /* generate HTML based on template */
        const generatedHTML = templates.cartProduct(menuProduct);

        thisCart.generatedDOM = utils.createDOMFromHTML(generatedHTML);

        thisCart.dom.productList.appendChild(thisCart.generatedDOM);
        thisCart.products.push(new CartProduct(menuProduct, thisCart.generatedDOM));

        thisCart.update();
    }

    update() {
        const thisCart = this;

        thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.totalNumber = 0;
        thisCart.subtotalPrice = 0;


        for (let cartProduct of thisCart.products) {

            thisCart.totalNumber += cartProduct.amount;
            thisCart.subtotalPrice += cartProduct.price;

        }

        // We'll be using this outside of this 'update' method - in the method that will be responsible for sending data to server.
        thisCart.totalPrice = 0;

        if (thisCart.subtotalPrice > 0) {
            thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;
        }



        thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
        thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

        for (const totalPriceSelector of thisCart.dom.totalPrice) {

            totalPriceSelector.innerHTML = thisCart.totalPrice;
        }
    }
    sendOrder() {
        const thisCart = this;
        const url = settings.db.url + '/' + settings.db.orders;

        const payload = {
            address: thisCart.dom.address.value,
            phone: thisCart.dom.phone.value,
            totalPrice: thisCart.totalPrice,
            subtotalPrice: thisCart.subtotalPrice,
            totalNumber: thisCart.totalNumber,
            deliveryFee: thisCart.deliveryFee,
            products: [],
        };

        for (let prod of thisCart.products) {
            payload.products.push(prod.getData());
            // console.log(prod);
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(function (response) {
                return response.json();
            }).then(function (parsedResponse) {
                console.log('parsedResponse', parsedResponse);
            });
    }

}

export default Cart;