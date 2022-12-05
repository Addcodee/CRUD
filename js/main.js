//! фейковый бекэнд

const API = "http://localhost:8000/ContactBook";

//! карточка с будущими данными

const list = document.querySelector("#contacts-list");

// ! вытаскиваем инпуты для заполнения

const name = document.querySelector("#name");

const lastName = document.querySelector("#last_name");

const desc = document.querySelector("#desc");

const number = document.querySelector("#number");

const img = document.querySelector("#img");

// ! вытаскиваем кнопку для отправления запроса

const addBtn = document.querySelector("#addBtn");

// ! вытаскиваем инпуты из модального окна
const editName = document.querySelector("#edit-name");

const editLastName = document.querySelector("#edit-last_name");

const editDesc = document.querySelector("#edit-desc");

const editNumber = document.querySelector("#edit-number ");

const editImg = document.querySelector("#edit-img");

// ! вытаскиваем модальные окна и их кнопки

const editModal = document.querySelector("#editModal");

const warningModal = document.querySelector("#warningModal");

const btnDeleteCont = document.querySelector("#btn-delete-cont");

const btnSaveEdit = document.querySelector("#btn-save-edit");

addBtn.addEventListener("click", async function () {
  // ? собираем объект из введенных значений(value)
  let obj = {
    name: name.value,
    lastName: lastName.value,
    number: number.value,
    img: img.value,
    desc: desc.value,
  };
  // ? проверяем поля на заполненность
  if (
    !obj.name.trim() ||
    !obj.lastName.trim() ||
    !obj.number.trim() ||
    !obj.desc.trim() ||
    !obj.img.trim()
  ) {
    alert("You have to complete all forms");
    return;
  }
  //? отправляем данные на фейк-бекэнд
  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });

  //? отображаем данные в реальном времени
  render();
  //? по отправке данных опусташаем инпуты
  name.value = "";
  lastName.value = "";
  number.value = "";
  desc.value = "";
  img.value = "";
});

render();
async function render() {
  // ? вытаскиваем данные из фейк-бекэнда
  let contacts = await fetch(API)
    .then((res) => res.json())
    .catch((err) => console.log(err));

    //? очищаем наш контакт

  list.innerHTML = "";

  //? перебор полученных данных и отображение

  contacts.forEach((elem) => {
    let newElem = document.createElement("div");
    newElem.id = elem.id;

    newElem.innerHTML = `
    <div class="card m-5" style="width: 18rem;">
  <img src=${elem.img} class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">${elem.name} ${elem.lastName}</h5>
    <p class="card-text">${elem.desc}</p>
    <p class="card-text">${elem.number}</p>
    <a href="#" class="btn btn-danger btn-delete" data-bs-toggle="modal" data-bs-target="#warningModal">DELETE</a>
    <a href="#" class="btn btn-primary btn-edit" id = ${elem.id}
    data-bs-toggle="modal" data-bs-target="#editModal">EDIT</a>
  </div>
</div>
      `;

      //? заталкиваем данные в новый блок

    list.append(newElem);
  });
}


//! редактирование данных

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-edit")) {
    //? достаем id
    let id = event.target.id;
    //? обращаясь по id, приравниваем новые полученных данные к уже созданных ключам
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        editName.value = data.name;
        editLastName.value = data.lastName;
        editDesc.value = data.desc;
        editNumber.value = data.number;
        editImg.value = data.img;

        //? передаем id нашей кнопке edit

        btnSaveEdit.setAttribute("id", data.id);
      });
  }
});

btnSaveEdit.addEventListener("click", function () {
  //? т.к мы ранее задали аттрибут id, мы обращаемся к родителю и достаем его id
  let id = this.id;
  //? полученные данные(для изменения) мы приравниваем к переменным
  let name = editName.value;
  let lastName = editLastName.value;
  let desc = editDesc.value;
  let number = editNumber.value;
  let img = editImg.value;

//? проверяем на заполненность полей

  if (!name || !lastName || !desc || !number || !img) return;

//? собираем новый объект из полученных данных

  let editedProd = {
    name: name,
    lastName: lastName,
    desc: desc,
    number: number,
    img: img,
  };
  //? даем кнопке функцию, которая отредачит наши данные
  saveEdit(editedProd, id);
});

//? фунция для редактирования данных 
async function saveEdit(editedProd, id) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(editedProd),
  });

  render();

  //? по нажатие кнопки, пусть окно уйдет

  let modal = bootstrap.Modal.getInstance(editModal);
  modal.hide();
}



//! удаление данных

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn-delete")) {
    //? опять таки вытаскиваем id
    let id = event.target.id;

    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        //? здесь получаем массив, который нужно перебрать
        data.forEach((elem) => {
          //? для того, чтобы обратиться к конкретному контакту(карточке), мы задаем аттрибут кнопке с нашим id(который мы вытащили ранее)
          btnDeleteCont.setAttribute("id", elem.id);
        });
      });
  }
});


btnDeleteCont.addEventListener("click", async function () {
  //? ранее мы передали id кнопке и теперь мы можем обратиться к родителю и передать ее переменной
  let id = this.id;
  //? кидая запрос, используем метод DELETE 
  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    //? насколько я понимаю, так как мы не отправляем данные и не редачим их, нам не нужно указывать данные, с которыми нужно будет работать JSON(речь идет о body)
  });

  render();
//? напоследок по нажатие кнопки DELETE, прячем модалку и радуемся, что это закончилось.
  let modal = bootstrap.Modal.getInstance(warningModal);
  modal.hide();
});
