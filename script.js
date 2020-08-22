const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = document.querySelector('.input__cities-from'),
    dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
    inputDateDepart = document.querySelector('.input__date-depart');
//Для вывода выбранных из базы билетов/направлений
const cheapestTicket = document.getElementById('cheapest-ticket');
const otherCheapTickets = document.getElementById('other-cheap-tickets');

//=====================данные=========================
const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json', //можно прямой ссылкой на базу удаленную
    proxy = 'https://cors-anywhere.herokuapp.com/', //прокси сервер для теста
    API_KEY = 'e7bf9ca9c0f83dde79be06a3cce40091',
    calendar = 'http://min-prices.aviasales.ru/calendar_preload',
    MAX_COUNT = 10; //ограничить число карточек

let city = [];



//=================получение данных из базы городов======================
//для обработки ошибки 404(например Киев-Вашингтон) добавить ф-цию:
const getData = (url, callBack, errorFunc = console.error) => {

    const request = new XMLHttpRequest(); //создание обьекта запроса

    request.open('GET', url); //настройка запроса(какой запрос POST или GET и адрес запроса(url))

    request.addEventListener('readystatechange', () => { //readystatechange метод
        if (request.readyState !== 4) return; //проверка статуса запроса(если статус не равен 4, то блок ф-ции)

        if (request.status === 200) { //200 = успех
            //   console.log(request.response);
            callBack(request.response); //вызов ф-ции
        } else {
            errorFunc(request.status);
            // console.error(request.status);
        }
    });

    request.send();
};


//=============== отображение городов для выбора(выпад. меню) ====================
const showCity = (input, list) => {

    list.textContent = ''; //очистка поля ввода

    if (input.value !== '') { //если ничего не введено, то всплывающего окна не будет
        //если input не пустой, то будут работать ф-ции

        //живой поиск
        const filterCity = city.filter((item) => { //city.forEach((item) в скобках любое имя, для ориентирования в коде
            //console.log(item, i, arr); выведет города, их индекс и весь массив городов  
            const fixItem = item.name.toLowerCase(); //перевод букв массива городов в нижний регистр
            return fixItem.startsWith(input.value.toLowerCase()); //value значение из елемента формы 
            //startsWith() метод для сортировки по каждой букве в названии
            //return item.includes(input.value); для поиска по введенной букве, проверяет наличие введенной буквы

        });


        //======создания списка городов с буквами, введенными в строке поиска============
        filterCity.forEach((item) => { //в filterCity отправляются города, которые пользователь выбрал
            const li = document.createElement('li'); //создание елемента списка li для аомещения выбранного
            li.classList.add('dropdown__city'); //добавление класса созданного елемента li
            li.textContent = item.name; //записать выбранные города в список li
            list.append(li); //добавить созданный список в елемент ul(получен вначале, прописан в html/css)

        });
    }
};

const selectCity = (event, input, list) => {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;
        list.textContent = '';
    }
};


//=========================отображение города в результатах поиска=====================================
const getNameCity = (code) => {
    const objCity = city.find((item) => item.code === code)
        //console.log(objCity);
    return objCity.name;
};

//=======================вывод количества пересадок=============================
const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
    } else {
        return "Без пересадок"
    }
};

//=================вывод даты в удобном формате=============================
const getDateNormal = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

//====функция перенаправки на Авиасеилс, для покупки============
const getLinkAviaseles = (data) => {
    let link = 'https://www.aviasales.ru/search/';
    //console.log(data);
    link += data.origin; //link += data.origin; === link = link + data.origin;
    const date = new Date(data.depart_date);
    //console.log(date);
    const day = date.getDate(); //получение данных о дне в билете

    link += day < 10 ? '0' + day : day; //если день меньше 10, то перед цифрой поставить 0, если больше то ничего

    const month = date.getMonth() + 1; //получение данных о месяце в билете

    link += month < 10 ? '0' + month : month; //если месяц меньше 10, то перед цифрой поставить 0, если больше то ничего
    //console.log('link', link);
    link += data.destination;

    link += '1'; //количество взрослых

    return link;
}

//==============создане карточек для вывода полученых, из базы, данных(самый дешевый билет)==============
//получение его в renderCheapDay()
const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if (data) {
        deep = `
        <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
	            <div class="left-side">
		            <a href="${getLinkAviaseles(data)}" target='_blank' class="button button__buy">Купить
			        за ${data.value} p.</a>
	            </div>
	        <div class="right-side">
		        <div class="block-left">
			        <div class="city__from">Вылет из города
				        <span class="city__name">${getNameCity(data.origin)}</span>
			        </div>
			    <div class="date">${getDateNormal(data.depart_date)}</div>
	    	</div>

		<div class="block-right">
			<div class="changes">${getChanges(data.number_of_changes)}</div>
			    <div class="city__to">Город назначения:
				    <span class="city__name">${getNameCity(data.destination)}</span>
			</div>
		</div>
	</div>
</div>
        `;
    } else {
        deep = '<h3>Билетов на текущую дату не существует</h3>'
    }

    ticket.insertAdjacentHTML('afterbegin', deep);



    return ticket;
};

const renderCheapDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>'; //для запрета дублирования, при повторном клике(очистка формы)


    //console.log(cheapTicket);
    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);
    //  console.log(ticket);
};

const renderCheapYear = (cheapTickets) => {
    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>'; //для запрета дублирования, при повторном клике(очистка формы), добавляя их через js

    //ограничение вывода карточек
    for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
        const ticket = createCard(cheapTickets[i]);
        otherCheapTickets.append(ticket);
    }

    //  console.log(cheapTickets);
    cheapTickets.sort((a, b) => a.value - b.value); //данный способ не работает для строк
};



//==========================рендеринг рейсов===========================
const renderCheap = (data, date) => {
    const cheapTicketYear = JSON.parse(data).best_prices;
    //===================фильтр результатов по дню  =====================
    // в cheapTicketDay будут передаваться только те данные, которые совпадают с выбранной датой
    const cheapTicketDay = cheapTicketYear.filter((item) => {
        return item.depart_date === date; //depart_date свойство из базы городов
    });

    renderCheapDay(cheapTicketDay);
    renderCheapYear(cheapTicketYear);
};

//======================отлавливание событий мыши(запуск списков при введении названия)=====================
inputCitiesFrom.addEventListener('input', () => { //сработает инпут при любом действии с input(строкой ввода)
    showCity(inputCitiesFrom, dropdownCitiesFrom); //запуск showCity при введении в input, a он передает введенное в inputCitiesFrom и dropdownCitiesFrom
});

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', () => { //отдельно создание ф-ции, для действий с выпадающим меню
    selectCity(event, inputCitiesFrom, dropdownCitiesFrom); // передача места события
});

dropdownCitiesTo.addEventListener('click', () => {
    selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener('submit', (event) => { //событие отправки данных формы, отмена перезагрузки страницы при нажатии button(отмена перезагрущки страницы)
    event.preventDefault();

    //debugger; //для того, что бы отловить момент оишбки

    const cityFrom = city.find((item) => inputCitiesFrom.value === item.name); //сравнение введенных в форму данных и индекса города(метод find берет из массива лишь нужный елемент), получение кода города
    const cityTo = city.find((item) => {
        return inputCitiesTo.value === item.name
    });

    //========================формирование обьекта=====================
    const formData = { //сохранение введенных данных   //запуск при нажатии submit
        from: cityFrom,
        to: cityTo,
        when: inputDateDepart.value,
    };
    // console.log(formData.from, formData.to); ошибка при неправильном выборе
    if (formData.from && formData.to) { //проверка ошибок ввода города(обернуть весь запрос на сервер)

        //=========================запрос на сервер для даты===============================
        //шаблонной строкой
        const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}` +
            `&destination=${formData.to.code}&one_way=true`;
        //=========================запрос на сервер для даты===============================
        /* const requestData = '?depart_date=' + formData.when +
            '&origin=' + formData.from +
            '&destination=' + formData.to +
            '&one_way=true&token=';  */

        getData(calendar + requestData, (data) => { //callback функция
            renderCheap(data, formData.when);
        }, (error) => {
            alert('В этом направлении нет рейсов');
            console.error('Ошибка', error);
        });

    } else {
        alert('Введите правильное название города');
    }

});


//==========================вызовы ф-ций========================


//распарсить JSON данные в обычный обьект JSON.parse(data), где data имя обьекта
/*еще 1 вариант записи
getData(proxy + citiesApi, data => city = JSON.parse(data).filter(item => item.name));
*/
getData(proxy + citiesApi, (data) => {
    city = JSON.parse(data).filter(item => item.name) //фильтр городов

    city.sort((a, b) => { //сортировка городов по названиям из базы
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        return 0;
    });

    //  console.log(city);
    //   const dataCities = JSON.parse(data);
    //   city = dataCities.filter((item) => { 
    //      console.log(item.name);
    //          return;
    // })
});








//запрос по датам и направлениям
/*
getData(proxy + calendar + '?depart_date=2020-05-25&origin=SVX&destination=KGD&one_way=true&token=' + API_KEY, (data) => {
    const cheapTicket = JSON.parse(data).best_prices.filter(item => item.depart_date === '2020-05-29')
        //  console.log(cheapTicket);
});
*/

//========================= запрос на сервер для данных ===============================
/* const requestData = '?depart_date=' + formData.when +
    '&origin=' + formData.from +
    '&destination=' + formData.to +
    '&one_way=true&token=';  */


/*замена на единую ф-цию
//выпадающие списки

dropdownCitiesFrom.addEventListener('click', () => { //выбрать елемент из списка по клику
    // console.log(event); вывод возможных событий клика 
    // console.log(event.target); вывод елемента, по которому клик
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li') { //если клик по елементу списка li, то запишет значение в value
        inputCitiesFrom.value = target.textContent;
        dropdownCitiesFrom.textContent = '';
    }
});

dropdownCitiesTo.addEventListener('click', () => {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li') {
        inputCitiesTo.value = target.textContent;
        dropdownCitiesTo.textContent = '';
    }
}); 


/*
const findBool = item => {
    return item[0] === 'Г';
};
const arr = ['Сергей', 'Илья', 'Гоша', 'Саня', 'Андрей', 'Максим', 'Степан', 'Феофан'];
const arr2 = arr.filter((item, i, array) => { //filter возвращает новый массив
    return item.length === 4;
    // console.log(item);
    // console.log(i);
    //  console.log(array);
});
const name = arr.find(findBool);
console.log(name);
*/

/* ===== вариант сортировки(универсальный) ====
(a, b)=> {
        if (a.value > b.value) {
            return 1;
        }
        if (a.value < b.value) {
            return -1;
        }
        // a должно быть равным b
        return 0;
    } */
//видео 4, 1.58.00