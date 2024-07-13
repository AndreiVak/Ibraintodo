"use strict";

const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

let habbits = [];

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressBarActive: document.querySelector(".progress__bar__active"),
  },
  content: {
    habbitDay: document.querySelector("#days"),
    nextDay: document.querySelector(".habbit__day"),
  },
  modal: {
    overlay: document.querySelector(".overlay"),
    hiddenInput: document.querySelector(".modal__form-icon-input"),
  },
};

//data utils
//Получаем данные из хранилища
function getData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

//Сохраняем данные в хранилище
function setData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

//отрисовываем меню(навигационное меню)
function rerenderMenu(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name} logo" />`;
      element.addEventListener("click", () => rerender(habbit.id));
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item-active");
      }
      page.menu.appendChild(element);

      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__item-active");
    } else {
      existed.classList.remove("menu__item-active");
    }
  }
}

function renderHeader(activeHabbit) {
  if (!activeHabbit) return;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.h1.innerText = activeHabbit.name;
  page.header.progressPercent.innerText = `${progress}%`;
  page.header.progressBarActive.style.width = `${progress}%`;
}

function renderContent(activeHabbit) {
  if (!activeHabbit) return;

  page.content.habbitDay.innerHTML = "";
  activeHabbit.days.forEach((day, idx) => {
    const element = document.createElement("div");
    element.classList.add("habbit");
    element.innerHTML = `
    <div class="habbit__day">День ${idx + 1}</div>
    <div class="habbit__comment">${day.comment}</div>
    <button class="habbit__delete button">
      <img src="./images/delete.svg" alt="delete" />
    </button>
    `;
    page.content.habbitDay.appendChild(element);
    page.content.nextDay.innerHTML = `День ${activeHabbit?.days?.length + 1}`;
  });
  if (!activeHabbit.days.length) {
    page.content.nextDay.innerHTML = `День ${activeHabbit?.days?.length + 1}`;
  }
}

function createDay(event) {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form);
  const comment = data.get("comment");
  //valid comment
  if (!comment) {
    form["comment"].classList.add("error");
  } else {
    form["comment"].classList.remove("error");
  }
  //create day
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: [...habbit.days, { comment: comment }],
      };
    } else {
      return habbit;
    }
  });
  form["comment"].value = "";
  setData();
  rerender(globalActiveHabbitId);
}

function removeDay(activeHabbit) {
  if (!activeHabbit) return;

  document
    .querySelectorAll(".habbit__delete")
    .forEach((deleteButton, buttonIndex) => {
      deleteButton.addEventListener("click", () => {
        const dayIndexToRemove = buttonIndex;
        const updatedDays = activeHabbit.days.reduce((acc, day, dayIndex) => {
          if (dayIndex !== dayIndexToRemove) {
            acc.push(day);
            return acc;
          }
          return acc;
        }, []);
        activeHabbit.days = updatedDays;
        setData();
        rerender(activeHabbit.id);
      });
    });
}

function toggleModal() {
  page.modal.overlay.classList.toggle("overlay__hidden");
}

function setIcon(ctx, icon) {
  page.modal.hiddenInput.value = icon;
  const activeIcon = document.querySelector(".icon__active");
  activeIcon.classList.remove("icon__active");
  ctx.classList.add("icon__active");
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId;
  const selectetHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  rerenderMenu(selectetHabbit);
  renderHeader(selectetHabbit);
  renderContent(selectetHabbit);
  removeDay(selectetHabbit);
}

//init (запуск приложения)
(() => {
  getData();
  rerender(habbits[0].id);
})();
