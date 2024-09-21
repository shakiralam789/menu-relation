{
  let wrap = document.getElementById("relational-data-wrapper");

  let menuClass = "menu-js";
  let menuListClass = "menu-list-js";
  let dragWith = "drag-with-js";

  let allList = wrap.querySelectorAll("." + menuListClass);
  let allMenu = wrap.querySelectorAll("." + menuClass);

  allMenu.forEach((el) => {
    el.id = generateUniqueId();
  });

  allList.forEach((el) => {
    el.id = generateUniqueId();
  });

  function generateUniqueId() {
    return (
      Date.now() +
      Math.random().toString(36).substr(2, 9) +
      performance.now().toString(36).replace(".", "")
    );
  }

  let selectedMenu = [];
  let chooseSpc = 1;
  let points = [];
  let count = 0;

  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  wrap.addEventListener("mousedown", (e) => {
    if (e.target.closest(`.${dragWith}`)) {
      let el = e.target.closest(`.${menuClass}`);
      dragMouseDown(e, el);
    }
  });

  function dragMouseDown(e, el) {

    el.style.zIndex = '999'

    e = e || window.event;
    e.preventDefault();

    pos3 = e.clientX;
    pos4 = e.clientY;

    document.onmouseup = ()=> closeDragElement(el);
    document.onmousemove = (e) => elementDrag(e, el);
  }

  function elementDrag(e, el) {
    path = relationalSVG.querySelectorAll("path");

    e = e || window.event;

    e.preventDefault();

    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;

    pos3 = e.clientX;
    pos4 = e.clientY;

    el.style.top = el.offsetTop - pos2 + "px";
    el.style.left = el.offsetLeft - pos1 + "px";

    points = [];

    if (count % 2 != 0 && selectedMenu.length > 0) {
      let numOfLastLi = selectedMenu.filter(
        (el) => el?.el == selectedMenu[selectedMenu.length - 1].el
      );

      if (numOfLastLi.length == 1) {
        selectedMenu[selectedMenu.length - 1].el.classList.remove("active");
        selectedMenu[selectedMenu.length - 1].el.style.pointerEvents = null;
      }

      selectedMenu.splice(selectedMenu.length - 1, 1);
    }

    count = 0;

    path?.forEach((y) => {
      if (
        y.dataset["secondPoint"] == el.id ||
        y.dataset["firstPoint"] == el.id
      ) {
        let id = y.dataset["relatedTo"];

        y.remove();

        let findIndex = selectedMenu.findIndex((el) => el.id == id);
        let x1 = selectedMenu[findIndex - 1];
        let x2 = selectedMenu[findIndex];

        link({ d: x1?.el, menuParent: el, id: x1.id });
        link({ d: x2?.el, menuParent: el, id: x2.id });
      }
    });
  }

  function closeDragElement(el) {
    el.style.zIndex = null
    document.onmouseup = null;
    document.onmousemove = null;
  }

  let SVG_NS = "http://www.w3.org/2000/svg";
  let mainBox = wrap.getBoundingClientRect();

  function link(obj) {
    let { d, menuParent, id } = obj;
    let bcr = d.getBoundingClientRect();
    mainBox = wrap.getBoundingClientRect();
    let x = map(
      bcr.left - mainBox.left + bcr.width / 2,
      mainBox.left,
      mainBox.left + mainBox.width,
      0,
      100
    );

    let y = map(
      bcr.top - mainBox.top + bcr.height / 2,
      mainBox.top,
      mainBox.top + mainBox.height,
      0,
      100
    );

    points.push({ x, y, d });

    if (count % 2 == 1) {
      drawConnector(
        points[points.length - 1],
        points[points.length - 2],
        menuParent,
        id
      );
    }

    count++;
  }

  function map(n, a, b, p, q) {
    let d = b - a;
    let r = q - p;
    let u = r / d;
    return p + n * u;
  }

  function drawConnector(a, b, el, id) {
    if (!a || !b) return;
    let path = document.createElementNS(SVG_NS, "path");
    let firstLiLeft = b.d.getBoundingClientRect().left;
    let secondLiLeft = a.d.getBoundingClientRect().left;

    b.d.style.pointerEvents = null;
    a.d.style.pointerEvents = null;

    let existedPath = relationalSVG.querySelector(
      `[data-connected-to = "${b.d.id + "-to-" + a.d.id}"]`
    );

    if (existedPath) {
      selectedMenu = selectedMenu.slice(0, selectedMenu.length - 2);
      points = points.slice(0, points.length - 2);
      return;
    }

    let direction = firstLiLeft - secondLiLeft;
    let dir = "right";

    let menuDirection = "right";

    if (a.d.closest(`.${menuClass}`) == el) {
      menuDirection = "right";
    }
    if (b.d.closest(`.${menuClass}`) == el) {
      menuDirection = "left";
    }

    let ax = a.x;
    let ay = a.y;

    let bx = b.x;
    let by = b.y;

    let mx = (ax + bx) / 2;

    if (direction <= 0) {
      bx = bx + (100 * (b.d.clientWidth / 2)) / mainBox.width;
      ax = ax - (100 * (a.d.clientWidth / 2)) / mainBox.width;
      mx = (ax + bx) / 2;
      dir = "right";
    } else {
      bx = bx - (100 * (b.d.clientWidth / 2)) / mainBox.width;
      ax = ax + (100 * (a.d.clientWidth / 2)) / mainBox.width;
      mx = (ax + bx) / 2;
      dir = "left";
    }
    let point = `M ${ax} ${ay} C ${mx} ${ay} ${mx} ${by} ${bx} ${by}`;

    if (menuDirection == "right") {
      if (mx - ax >= -chooseSpc && dir == "right") {
        point = `M ${ax + (100 * a.d.clientWidth) / mainBox.width} ${ay} C ${
          ax + (100 * a.d.clientWidth) / mainBox.width + chooseSpc
        } ${ay} ${
          ax + (100 * a.d.clientWidth) / mainBox.width + chooseSpc
        } ${by} ${bx} ${by}`;
      }

      if (dir == "left") {
        point = `M ${ax - (100 * a.d.clientWidth) / mainBox.width} ${ay} C ${
          ax - (100 * a.d.clientWidth) / mainBox.width - chooseSpc
        } ${ay} ${
          ax - (100 * a.d.clientWidth) / mainBox.width - chooseSpc
        } ${by} ${bx} ${by}`;
      }

      if (
        dir == "right" &&
        bx - (ax + (100 * a.d.clientWidth) / mainBox.width + chooseSpc) >=
          -chooseSpc
      ) {
        point = `M ${ax} ${ay} C ${
          bx - (100 * b.d.clientWidth) / mainBox.width - chooseSpc
        } ${ay} ${
          bx - (100 * b.d.clientWidth) / mainBox.width - chooseSpc
        } ${by} ${bx - (100 * b.d.clientWidth) / mainBox.width} ${by}`;
      }

      if (dir == "left" && mx - ax > chooseSpc) {
        point = `M ${ax} ${ay} C ${mx} ${ay} ${mx} ${by} ${bx} ${by}`;
      }
    }

    if (menuDirection == "left") {
      if (mx - ax >= -chooseSpc && dir == "right") {
        point = `M ${ax} ${ay} C ${
          bx - (100 * b.d.clientWidth) / mainBox.width - chooseSpc
        } ${ay} ${
          bx - (100 * b.d.clientWidth) / mainBox.width - chooseSpc
        } ${by} ${bx - (100 * b.d.clientWidth) / mainBox.width} ${by}`;
      }

      if (dir == "left") {
        point = `M ${ax} ${ay} C ${ax + chooseSpc} ${ay} ${
          ax + chooseSpc
        } ${by} ${bx + (100 * b.d.clientWidth) / mainBox.width} ${by}`;
      }

      if (
        dir == "left" &&
        ax + chooseSpc - (bx + (100 * b.d.clientWidth) / mainBox.width) <=
          chooseSpc
      ) {
        point = `M ${ax} ${ay} C ${
          bx + (100 * b.d.clientWidth) / mainBox.width + chooseSpc
        } ${ay} ${
          bx + (100 * b.d.clientWidth) / mainBox.width + chooseSpc
        } ${by} ${bx + (100 * b.d.clientWidth) / mainBox.width} ${by}`;
      }

      if (dir == "left" && mx - ax > chooseSpc) {
        point = `M ${ax} ${ay} C ${mx} ${ay} ${mx} ${by} ${bx} ${by}`;
      }
    }

    path.setAttributeNS(null, "d", point);

    relationalSVG.appendChild(path);

    let firstListParentID = b.d.closest(`.${menuClass}`)?.id;
    let secondListParentID = a.d.closest(`.${menuClass}`).id;

    path.dataset["connectedTo"] = b.d.id + "-to-" + a.d.id;

    path.dataset["firstPoint"] = firstListParentID;
    path.dataset["secondPoint"] = secondListParentID;
    path.dataset["relatedTo"] = id;

    path.onclick = function () {
      removePath({
        firstLi: a.d,
        id: id,
        secondLi: b.d,
        path: this,
      });
    };
  }

  // remove path
  function removePath({ firstLi, id, secondLi, path }) {
    if (!firstLi || !secondLi) return;

    let numOfFirstLi = selectedMenu.filter((el) => el?.el == firstLi);
    let numOfSecondLi = selectedMenu.filter((el) => el?.el == secondLi);

    if (numOfFirstLi.length == 1) {
      firstLi.classList.remove("active");
    }

    if (numOfSecondLi.length == 1) {
      secondLi.classList.remove("active");
    }

    let selected = selectedMenu.findIndex((el) => el.id == id);

    selectedMenu.splice(selected - 1, 2);
    points.splice(selected - 1, 2);

    if (path) {
      path.remove();
    }
  }

  wrap.addEventListener("click", (e) => {
    if (e.target.closest(`.${menuListClass}`)) {
      let el = e.target.closest(`.${menuListClass}`);

      selectedMenu.push({ el, id: generateUniqueId() });

      el.classList.add("active");
      let myDiv = el.closest(`.${menuClass}`);

      link({
        d: el,
        menuParent: myDiv,
        id: selectedMenu[selectedMenu.length - 1].id,
      });

      if (selectedMenu.length % 2 != 0) {
        el.style.pointerEvents = "none";
      }
    }
  });
}
