import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking {

  constructor(element) {

    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.selectedTable = null;
    thisBooking.startersTab = [];
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],

      eventsRepeat: [
        settings.db.repeatParam,

        endDateParam,
      ],
    };

    // console.log(params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    // console.log(urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {

        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];


        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log('bookings', bookings);
        // console.log('eventsCurrent', eventsCurrent);
        // console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        // console.log('eventsCurrentResponse', eventsCurrent);

      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;


    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      // console.log('loop', hourBlock);

      thisBooking.booked[date][hourBlock].push(table);

    }

  }


  updateDOM() {
    // console.log('updateDOM');
    const thisBooking = this;


    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    // console.log('resetuje stoliki w update dom');
    thisBooking.resetTables();
  }


  render(element) {
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = document.querySelector(
      select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(
      select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelector(select.booking.starters);

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);

    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);

    thisBooking.dom.orderButton = thisBooking.dom.wrapper.querySelector(select.booking.orderButton);

    thisBooking.dom.breadCheckbox = thisBooking.dom.wrapper.querySelector('input[value="bread"]');

    thisBooking.dom.waterCheckbox = thisBooking.dom.wrapper.querySelector('input[value="water"]');

  }

  initTables(event) {
    const thisBooking = this;

    if (event.target.classList.contains('table')) {
      // console.log('event', event.target);

      if (event.target.classList.contains('booked')) {
        alert('Table already booked!');
      } else {
        if (!event.target.classList.contains('selected')) {
          thisBooking.resetTables();
          event.target.classList.add('selected');
          let tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
          if (!isNaN(tableId)) {
            tableId = parseInt(tableId);
          }
          thisBooking.selectedTable = tableId;
        }
        else { event.target.classList.remove('selected'); }
      }
    }
    // console.log('thisBooking.dom.address.value', thisBooking.dom.phone.value);

  }

  resetTables() {
    const thisBooking = this;
    for (let table of thisBooking.dom.tables) {
      table.classList.remove('selected');
    }
  }
  sendBooking() {
    // console.log('wywoluje sie');
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    // for (const starter of thisBooking.dom.starters) {
    //   console.log('starter', starter);
    // }


    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hour,
      table: thisBooking.selectedTable,
      duration: thisBooking.hoursAmount.correctValue,
      ppl: thisBooking.peopleAmount.correctValue,
      starters: thisBooking.startersTab,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };


    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log('Booking sent:', data);
      })
      .catch(error => {
        console.error('Error while sending booking:', error);
      });

  }


  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () { });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () { });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function () { });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('click', function () { });

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesWrapper.addEventListener('click', function (event) {
      thisBooking.initTables(event);

    });

    thisBooking.dom.orderButton.addEventListener('click', function () {
      thisBooking.sendBooking();
      // console.log('robi sie');
    });

    thisBooking.dom.breadCheckbox.addEventListener('click', function () {
      thisBooking.startersTab.push(thisBooking.dom.breadCheckbox.value);
      // console.log('thisBooking.startersTab', thisBooking.startersTab);
    });

    thisBooking.dom.waterCheckbox.addEventListener('click', function () {
      thisBooking.startersTab.push(thisBooking.dom.waterCheckbox.value);
    });
  }
}

export default Booking;