import { select } from './settings.js';

import AmountWidget from './comopnents/AmountWidget.js';

class CartProduct {
    constructor(menuProduct, element) {

        const thisCartProduct = this;

        thisCartProduct.id = menuProduct.id;
        thisCartProduct.name = menuProduct.name;
        thisCartProduct.priceSingle = menuProduct.priceSingle;
        thisCartProduct.amount = menuProduct.amount;

        thisCartProduct.params = menuProduct.params;
        thisCartProduct.price = menuProduct.price;

        thisCartProduct.getElements(element);
        thisCartProduct.initAmountWidget();
        thisCartProduct.initActions();
        thisCartProduct.getData();
    }



    getElements(element) {
        const thisCartProduct = this;
        thisCartProduct.dom = {};
        thisCartProduct.dom.wrapper = element;
        thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
        thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
        thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
        thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);

    }

    initAmountWidget() {
        const thisCartProduct = this;
        thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

        thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
            thisCartProduct.amount = thisCartProduct.amountWidget.value;
            thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
            thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

        });
    }

    remove() {
        const thisCartProduct = this;

        const event = new CustomEvent('remove', {
            bubbles: true,
            detail: {
                cartProduct: thisCartProduct,
            },
        });

        thisCartProduct.dom.wrapper.dispatchEvent(event);
        // console.log('click?')
    }

    initActions() {

        const thisCartProduct = this;

        thisCartProduct.dom.edit.addEventListener('click', function (event) {
            event.preventDefault;
        });
        thisCartProduct.dom.remove.addEventListener('click', function (event) {
            event.preventDefault;
            thisCartProduct.remove();
        });
    }

    getData() {

        const thisCartProduct = this;

        const productCartData = {

            'id': thisCartProduct.id,

            'amount': thisCartProduct.value,

            'price': thisCartProduct.priceSingle * thisCartProduct.amountWidget.value,

            'priceSingle': thisCartProduct.priceSingle,

            'name': thisCartProduct.name,

            'params': thisCartProduct.params,
        };
        return productCartData;
    }
}

export default CartProduct;