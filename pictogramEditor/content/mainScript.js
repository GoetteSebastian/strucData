var lib = {}; //set global var for the library object.
var hasUnsavedChanges = false;
var contentCanvas = document.getElementById("contentCanvas"); //initializing the content canvas where the lists will be rendered
window.api.receive("fromMain", (data) => {
  switch(data.action) {
    case "load file":
      loadJsonFile(data.data);
      break;
    case "notification":
      notification(data.data.text, data.data.type);
      break;
    case "get library for saving":
      window.api.send("toMain", {action: "send library for saving", data: JSON.stringify(lib)});
  }
});
//set the event handlers for all the buttens for import, load or export
document.getElementById("redrawCanvas").addEventListener("click", () => {buildViewPort();}, false);
document.getElementById("createNewList").addEventListener("click", () => {setList();}, false);
document.getElementById("loadFile").addEventListener("click", () => {
  window.api.send("toMain", {action: "open file", data: ""});
}, false);
document.getElementById("saveFile").addEventListener("click", () => {
  saveLibrary();
});

function loadJsonFile(data) { //Load the initial json library from the file system
  lib = JSON.parse(data);
  buildViewPort();
}

function saveLibrary() {
  window.api.send("toMain", {action: "save file", data: JSON.stringify(lib)});
  unsaveChanges(false);
}

function buildViewPort() { //Sort library and generate the list containers with headers and "add" button in the DOM
  sort();
  contentCanvas.innerHTML = "";
  var tables = Object.entries(lib);
  tables.forEach((item) => {
    var container = contentCanvas.appendChild(createElement("DIV", {"id": item[1].id, "data-id": item[0]}));
    var title = container.appendChild(createElement("H1", item[1].name));
    var editButton = title.appendChild(createElement("BUTTON", {"data-id": item[0], "class": "right"}, "Tabelle bearbeiten"));
    editButton.addEventListener("click", () => {
      setList(editButton.getAttribute("data-id"));
    }, false);
    var addButton = title.appendChild(createElement("BUTTON", {"class": "right red marginRight", "dom-id": item[1].id, "data-id": item[0]}, "Element hinzufügen"));
    addButton.onclick = function() {
      setEntry(this.getAttribute("data-id"), "new")
    };
    jsonToTable(container, item[0]);
  });
}

function jsonToTable(container, dataSet) { //create a html table from a json list
  var table = document.createElement("TABLE");
  table.appendChild(createHeader(lib[dataSet].prototype, document.createElement("TR")));
  lib[dataSet].content.forEach((item, i) => {
    var bodyRow = document.createElement("TR");
    bodyRow.setAttribute("data-index", i);
    bodyRow.addEventListener("dblclick", function() {
      setEntry(dataSet, i);
    }, false);
    table.appendChild(createRow(dataSet, i, bodyRow));
  });
  container.appendChild(table);
}

function loadSVG(input, dataKey) { //load choosen svg files, read them and write them in the library. If an old graphic already exist, it overwrites this one.
  var svgFiles = Array.from(input.target.files);
  var parser = new DOMParser();
  svgFiles.forEach(file => {
    const reader = new FileReader;
    reader.originalFileName = file.name.replace(".svg", "");
    reader.addEventListener('load', (event) => {
      var data = parser.parseFromString(event.target.result, "image/svg+xml");
      if(data.getElementById("content_1_") != null) {
        data.getElementById("content_1_").id = "content";
      }
      if(data.getElementById("Content") != null) {
        data.getElementById("Content").id = "content";
      }
      var pictoId = parseInt(reader.originalFileName.substring(0, 2));
      var location = {dir: "svgPictos", rel: "pictos"};
      if(pictoId == 21 || reader.originalFileName.indexOf("Gleis") == 0) location = {dir: "svgTrack", rel: "track"};
      else if(pictoId == 22 || reader.originalFileName.indexOf("Sektor") == 0) location = {dir: "svgSector", rel: "sector"};
      else if(pictoId == 23 || reader.originalFileName.indexOf("Kante") == 0) location = {dir: "svgStand", rel: "stand"};
      var isNew = true;
      lib[location.dir].content.forEach((item, i) => {
        if(item.file_name == reader.originalFileName || item.file_name.substring(item.file_name.indexOf("_") + 1) == reader.originalFileName) {
          item[dataKey] = data.documentElement.outerHTML;
          isNew = false;
        }
      });
      if(isNew) {
        lib[location.dir].content.push({
          file_name: reader.originalFileName,
          [dataKey]: data.documentElement.outerHTML,
          [location.rel]: parseInt(reader.originalFileName.substring(0, reader.originalFileName.indexOf("_"))),
          isLeft: (reader.originalFileName.includes("_r")) ? 0 : 1,
          isRight: (reader.originalFileName.includes("_l")) ? 0 : 1,
          isDe: (reader.originalFileName.includes("_fr") || reader.originalFileName.includes("_it") || reader.originalFileName.includes("_en")) ? 0 : 1,
          isFr: (reader.originalFileName.includes("_de") || reader.originalFileName.includes("_it") || reader.originalFileName.includes("_en")) ? 0 : 1,
          isIt: (reader.originalFileName.includes("_de") || reader.originalFileName.includes("_fr") || reader.originalFileName.includes("_en")) ? 0 : 1,
          isEn: (reader.originalFileName.includes("_de") || reader.originalFileName.includes("_fr") || reader.originalFileName.includes("_it")) ? 0 : 1
        });
      }
    });
    if(file.name.indexOf(".svg") != -1) {
      reader.readAsText(file);
    }
  });
}

function setEntry(dataSet, index) { //build the edit, delete, save functions and edit overlays on doubleclick.
  var editCanvas = document.createElement("DIV");
  editCanvas.id = "editCanvas";
  document.body.appendChild(editCanvas);

  var editFrame = document.createElement("DIV");
  editFrame.classList.add("editFrame");
  editCanvas.appendChild(editFrame);

  var editContainer = document.createElement("DIV");
  editContainer.classList.add("editContainer");
  editContainer.setAttribute("data-id", dataSet);
  editContainer.setAttribute("data-index", index);
  editContainer.addEventListener("click", function(e) {e.stopPropagation();}, false);
  editFrame.appendChild(editContainer);

  var editFooter = document.createElement("DIV");
  editFooter.classList.add("editFooter");
  editFrame.appendChild(editFooter);

  var deleteButton = editFooter.appendChild(createElement("BUTTON", {"data-id": dataSet, "data-index": index, "container-id": lib[dataSet].id}, "Löschen"));
  if(index == "new") {
    deleteButton.classList.add("hidden");
  }
  deleteButton.addEventListener("click", function(e) {
    e.stopPropagation();
    lib[this.getAttribute("data-id")].content.splice(this.getAttribute("data-index"), 1);
    unsaveChanges(true);
    document.getElementById("editCanvas").remove();
    buildViewPort();
  }, false);
  editFooter.appendChild(deleteButton);

  var saveButton = document.createElement("BUTTON");
  saveButton.innerHTML = "Speichern";
  saveButton.classList.add("red");
  saveButton.setAttribute("data-id", dataSet);
  saveButton.setAttribute("data-index", index);
  saveButton.setAttribute("container-id", lib[dataSet].id);
  saveButton.addEventListener("click", function(e) {
    e.stopPropagation();
    var element = {};
    var currentList = this.getAttribute("data-id");
    lib[currentList].prototype.forEach((item, i) => {
      var domElement = document.getElementById("dataid" + item.key);
      if(item.key == "id") {
        if(index == "new") {
          var ids = [];
          lib[currentList].content.forEach((id) => {
            ids.push(parseInt(id.id));
          });
          if(ids.length > 0) {
            element.id = Math.max(...ids) + 1;
          }
          else element.id = 0;
        }
        else {
          element.id = lib[currentList].content[index].id;
        }
      }
      else if(domElement.type == "checkbox") {
        element[item.key] = domElement.checked;
      }
      else if(domElement.type == "select-multiple") {
        var values = [];
        for(var i = 0; i < domElement.selectedOptions.length; i++) {
          values.push(Number(domElement.selectedOptions[i].value));
        }
        element[item.key] = values;
      }
      else if(item.type == "number" || item.type == "link") {
        element[item.key] = parseInt(domElement.value);
      }
      else {
        element[item.key] = domElement.value;
      }
    });
    if(index != "new") {
      lib[this.getAttribute("data-id")].content[this.getAttribute("data-index")] = element;
    }
    else {
      lib[dataSet].content.push(element);
    }
    document.getElementById("editCanvas").remove();
    buildViewPort();
    unsaveChanges(true);
  }, false);
  editFooter.appendChild(saveButton);

  var abortButton = document.createElement("BUTTON");
  abortButton.innerHTML = "Abbrechen";
  abortButton.addEventListener("click", function(e) {document.getElementById("editCanvas").remove(); e.stopPropagation();}, false);
  editFooter.appendChild(abortButton);

  var dataPrototype = lib[dataSet].prototype;
  dataPrototype.forEach((item, i) => {
    var inputWrapper = document.createElement("DIV");
    inputWrapper.classList.add("inputWrapper");
    var label = document.createElement("LABEL");
    if(item.type == "link" || item.type == "multiLink") label.innerHTML = lib[item.key].name;
    else label.innerHTML = item.name;
    label.setAttribute("for", "dataid" + item.key);
    inputWrapper.appendChild(label);
    if(item.type == "text" || item.type == "number") {
      var input = document.createElement("INPUT");
      input.type = item.type;
      if(index != "new") {
        input.value = lib[dataSet].content[index][item.key];
      }
    }
    else if(item.type == "boolean") {
      var input = document.createElement("INPUT");
      input.type = "checkbox";
      inputWrapper.classList.add("checkboxWrapper");
      if(index != "new") input.checked = lib[dataSet].content[index][item.key];
    }
    else if(item.type == "link") {
      var input = document.createElement("SELECT");
      var options = lib[item.key].content;
      options.forEach((opt, i) => {
        var option = document.createElement("OPTION");
        option.value = opt.id;
        option.innerHTML = opt[item.rel];
        if(index != "new") {
          if(opt.id == lib[dataSet].content[index][item.key]) {
            option.selected = true;
          }
        }
        input.appendChild(option);
      });
    }
    else if(item.type == "multiLink") {
      var input = document.createElement("SELECT");
      input.multiple = true;
      var options = lib[item.key].content;
      options.forEach((opt, i) => {
        var option = document.createElement("OPTION");
        option.value = opt.id;
        option.innerHTML = opt[item.rel];
        if(index != "new") {
          if(lib[dataSet].content[index][item.key].includes(Number(opt.id)) === true) {
            option.selected = true;
          }
        }
        input.appendChild(option);
      });
    }
    else if(item.type == "svg") {
      var input = document.createElement("INPUT");
      input.type = "hidden";
      if(index != "new") {
        input.value = lib[dataSet].content[index][item.key];
      }
      var newFileInput = document.createElement("INPUT");
      newFileInput.type = "file";
      newFileInput.accept="image/svg+xml";
      newFileInput.style.display = "none";
      newFileInput.addEventListener("change", function(newSvgFile) {
        var parser = new DOMParser();
        const reader = new FileReader;
        var file = newSvgFile.target.files[0];
        reader.originalFileName = file.name.replace(".svg", "");
        reader.addEventListener('load', (event) => {
          var data = parser.parseFromString(event.target.result, "image/svg+xml");
          if(data.getElementById("content_1_") != null) {
            data.getElementById("content_1_").id = "content";
          }
          if(data.getElementById("Content") != null) {
            data.getElementById("Content").id = "content";
          }
        svgPreview.innerHTML = data.documentElement.outerHTML;
        input.value = data.documentElement.outerHTML;
        });
        if(file.name.indexOf(".svg") != -1) {
          reader.readAsText(file);
        }
      });
      var svgPreview = document.createElement("DIV");
      svgPreview.classList.add("svgPreview");
      if(index != "new") {
        svgPreview.innerHTML = lib[dataSet].content[index][item.key];
      }
      svgPreview.addEventListener("click", function(e) {
        newFileInput.click();
      });
      inputWrapper.appendChild(svgPreview);
      inputWrapper.appendChild(newFileInput);
    }
    input.setAttribute("data-id", item.key);
    input.id = "dataid" + item.key;
    input.classList.add("dataItem");
    inputWrapper.appendChild(input);
    if(item.key !== "id") {
      editContainer.appendChild(inputWrapper);
    }
  });
}

function downloadFile(text, filename) { //function to save "download in this case" the choosen export or the library itself
  var d = new Date();
  filename = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "_" + d.getHours() + "." + d.getMinutes() + "_" + filename;
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function getLink(element, target) { //get the information of a linked attribute
  var result = {};
  result.html = document.createElement("SPAN");
  result.html.innerHTML = result.string = find(element[0], "id", element[1])[target];
  return result;
}

function createHeader(prototype, bodyRow) { //create table header
  prototype.forEach((item, i) => {
    if(item.key != "id"){
      var cell = document.createElement("TH");
      if(item.type == "link" || item.type == "multiLink") cell.innerHTML = lib[item.key].name;
      else cell.innerHTML = item.name;
      bodyRow.appendChild(cell);
    }
  });
  return bodyRow;
}

function createRow(dataSet, index, bodyRow) { //create a body row
  var prototype = lib[dataSet].prototype;
  prototype.forEach((item, i) => {
    if(item.key != "id") {
      var cell = document.createElement("TD");
      if(item.type == "text" || item.type == "number" || item.type == "svg") {
        cell.innerHTML = lib[dataSet].content[index][item.key];
      }
      else if(item.type == "link") {
        cell.appendChild(getLink([item.key, lib[dataSet].content[index][item.key]], item.rel).html);
      }
      else if(item.type == "multiLink") {
        lib[dataSet].content[index][item.key].forEach((linkItem, linkIndex) => {
          cell.appendChild(getLink([item.key, lib[dataSet].content[index][item.key][linkIndex]], item.rel).html);
        });
      }
      else if(item.type == "boolean") {
        cell.innerHTML = lib[dataSet].content[index][item.key];
      }
      bodyRow.appendChild(cell);
    }
  });
  return bodyRow;
}

function sort() { //sort the library. The sorting attributes are stored in each table lib[tablename].sort
  Object.keys(lib).forEach((item) => {
    lib[item].content.sort((a, b) => {
      var result = 0;
      lib[item].sort.forEach((i) => {
        if(result == 0) {
          result = a[i] - b[i];
        }
      });
      return result;
    });
  });

}

function createExportHeader(header, separator) { //creating header line for csv exports
  var csvString = "";
  header.forEach((item, index) => {
    csvString += item.name;
    csvString += (index < header.length -1) ? separator : "";
  });
  csvString += "\n";
  return csvString;
}

function createLine(item, header, id = false, lang = false, dir = false) { //creating a line for a csv export.
  var lineString = "";
  header.forEach((key, index) => {
    if(key.type == "generated") {
      lineString += key.get(item, id, lang, dir);
    }
    else if(key.type == "link")
    {
      lineString += find(key.key, "id", item[key.key]).name;
    }
    else {
      lineString += item[key.key];
    }
    lineString += (index < header.length -1) ? "," : "";
  });
  lineString += "\n";
  return lineString;
}

function find(list, attribute, value) { //search in the library in a given list for a value in a given attribute
  var result = false;
  lib[list].content.forEach((item, index) => {
    if(item[attribute] == value) {
      result = item;
    }
  });
  return result;
}

function setList(listKey) {
  var editCanvas = document.body.appendChild(createElement("DIV", {"id": "editCanvas"}));

  var editFrame = editCanvas.appendChild(createElement("DIV", {"class": "editFrame"}));

  var editContainer = editFrame.appendChild(createElement("DIV", {"class": "editContainer"}));

  var listIdWrapper = editContainer.appendChild(createElement("DIV", {"class": "inputWrapper listIdWrapper"}));
  listIdWrapper.appendChild(createElement("LABEL", {"for": "dataidlistId"}, "Tabellen Schlüssel"));
  var listId = listIdWrapper.appendChild(createElement("INPUT", {"type": "text", "data-id": "listId", "id": "dataidlistId", "class": "dataItem" + "dataidlistId"}));
  if(listKey) {
    listId.value = lib[listKey].id;
    listId.disabled = true;
  }
  else {
    listId.addEventListener("input", (e) => {
      var existingLists = Object.keys(lib);
      existingLists.push("");
      if(existingLists.includes(listId.value)) saveButton.disabled = true;
      else saveButton.disabled = false;
    });
  }
  var listNameWrapper = editContainer.appendChild(createElement("DIV", {"class": "inputWrapper listNameWrapper"}));
  listNameWrapper.appendChild(createElement("LABEL", {"for": "dataidlistName"}, "Tabellen Name"));
  listNameWrapper.appendChild(createElement("INPUT", {"type": "text", "data-id": "listName", "id": "dataidlistName", "class": "dataItem" + "dataidlistName"}));
  if(listKey) {
    listNameWrapper.getElementsByTagName("INPUT")[0].value = lib[listKey].name;
  }

  if(listKey) {
    lib[listKey].prototype.forEach((proto) => {
      if(proto.key != "id") {
        createPrototypeEntry(editContainer, proto);
      }
    });
  }

  var editFooter = editFrame.appendChild(createElement("DIV", {"class": "editFooter"}));

  var saveButton = editFooter.appendChild(createElement("BUTTON", {"class": "red"}, "Speichern"));
  saveButton.disabled = true;
  saveButton.addEventListener("click", function(e) {
    var newList = {
      content: [],
      id: document.getElementById("dataidlistId").value,
      name: document.getElementById("dataidlistName").value,
      prototype: [
        {
          key: "id",
          name: "Id",
          rel: "",
          type: "number"
        }
      ],
      sort: []
    };
    var prototypeFields = document.getElementsByClassName("prototypeWrapper");

    for (let item of prototypeFields) {
      var proto = {
        key: "",
        name: "",
        rel: "",
        type: item.getElementsByClassName("dataidtype")[0].value
      };
      if(proto.type == "link" || proto.type == "multiLink") {
        proto.key = item.getElementsByClassName("dataidlink")[0].value;
        //proto.name = lib[proto.key].name;
        proto.rel = item.getElementsByClassName("dataidrel")[0].value;
      }
      else {
        proto.key = item.getElementsByClassName("dataidkey")[0].value;
        proto.name = item.getElementsByClassName("dataidname")[0].value;
      }
      if(proto.key != "id") {
        newList.prototype.push(proto);
      }
    };
    if(listKey) {
      lib[listKey].content.forEach((item) => {
        var newItem = {};
        newList.prototype.forEach((p) => {
          if(item[p.key]) {
            newItem[p.key] = item[p.key];
          }
          else {
            if(p.type == "checkbox") newItem[p.key] = false;
            else newItem[p.key] = "";
          }
        });
        newList.content.push(newItem);
      });
      lib[listKey] = newList;
    }
    else lib[document.getElementById("dataidlistId").value] = newList;

    document.getElementById("editCanvas").remove();
    buildViewPort();
    unsaveChanges(true);
    e.stopPropagation();
  }, false);

  var abortButton = editFooter.appendChild(createElement("BUTTON", "Abbrechen"));
  abortButton.addEventListener("click", function(e) {
    document.getElementById("editCanvas").remove();
    e.stopPropagation();
  }, false);

  var newEntryButton = editFooter.appendChild(createElement("BUTTON", "Neues Feld erstellen"));
  newEntryButton.addEventListener("click", (e) => {
    createPrototypeEntry(editContainer);
  }, false);
}

function createPrototypeEntry(editContainer, proto) {
  var prototypeWrapper = editContainer.appendChild(createElement("DIV", {"class": "prototypeWrapper"}));
  var typeWrapper = prototypeWrapper.appendChild(createElement("DIV", {"class": "inputWrapper"}));
  typeWrapper.appendChild(createElement("LABEL", {"for": "dataidtype"}, "Feld Typ"));
  var type = typeWrapper.appendChild(createElement("SELECT", {"id": "dataidtype", "class": "dataItem dataidtype", "data-id": "type"}));
  var types = [
    {
      value: "text",
      name: "Text"
    },
    {
      value: "number",
      name: "Nummer"
    },
    {
      value: "link",
      name: "Verknüpfung"
    },
    {
      value: "boolean",
      name: "Checkbox"
    },
    {
      value: "multiLink",
      name: "Verknüpfung Multi Select"
    },
    {
      value: "svg",
      name: "SVG Grafik"
    }
  ];

  types.forEach((item) => {
    type.appendChild(createElement("OPTION", {"value": item.value}, item.name));
  });
  type.addEventListener("input", (e) => {
    if(type.value == "link" || type.value == "multiLink") {
      relWrapper.classList.remove("hidden");
      keyWrapper.classList.add("hidden");
      nameWrapper.classList.add("hidden");
      linkWrapper.classList.remove("hidden");
      nameWrapper.getElementsByTagName("INPUT")[0].value = lib[linkSelect.value].name;
      relSelect.innerHTML = "";
      lib[linkSelect.value].prototype.forEach((entry) => {
        relSelect.appendChild(createElement("OPTION", {"value": entry.key}, entry.name));
      });
      if(proto) relSelect.value = proto.rel;
    }
    else {
      relWrapper.classList.add("hidden");
      keyWrapper.classList.remove("hidden");
      nameWrapper.classList.remove("hidden");
      linkWrapper.classList.add("hidden");
    }
  }, false);

  var keyWrapper = prototypeWrapper.appendChild(createElement("DIV", {"class": "inputWrapper keyWrapper"}));
  keyWrapper.appendChild(createElement("LABEL", {"for": "dataidkey"}, "Feld Schlüssel"));
  var keyInput = keyWrapper.appendChild(createElement("INPUT", {"type": "text", "data-id": "key", "id": "dataidkey", "class": "dataItem dataidkey"}));
  if(proto) {
    keyInput.value = proto.key;
    keyInput.disabled = true;
  }

  var linkWrapper = prototypeWrapper.appendChild(createElement("DIV", {"class": "inputWrapper hidden"}));
  linkWrapper.appendChild(createElement("LABEL", {"for": "dataidlink"}, "Verknüpfte Liste"));
  var linkSelect = linkWrapper.appendChild(createElement("SELECT", {"id": "dataidlink", "class": "dataItem dataidlink", "data-id": "link"}));
  linkSelect.addEventListener("change", (e) => {
    //nameWrapper.getElementsByTagName("input")[0].value = lib[linkSelect.value].name;
    relSelect.innerHTML = "";
    lib[linkSelect.value].prototype.forEach((entry) => {
      relSelect.appendChild(createElement("OPTION", {"value": entry.key}, entry.name));
    });
  });

  Object.keys(lib).forEach((list) => {
    linkSelect.appendChild(createElement("OPTION", {"value": list}, lib[list].name));
  });
  if(proto) {
    linkSelect.value = proto.key;
    linkSelect.disabled = true;
  }

  var nameWrapper = prototypeWrapper.appendChild(createElement("DIV", {"class": "inputWrapper nameWrapper"}));
  nameWrapper.appendChild(createElement("LABEL", {"for": "dataidname"}, "Anzeigename"));
  var nameInput = nameWrapper.appendChild(createElement("INPUT", {"type": "text", "data-id": "name", "id": "dataidname", "class": "dataItem dataidname"}));
  if(proto) {
    nameInput.value = proto.name;
  }

  var relWrapper = prototypeWrapper.appendChild(createElement("DIV", {"class": "inputWrapper hidden"}));
  relWrapper.appendChild(createElement("LABEL", {"for": "dataodrel"}, "Anzeigewert"));
  var relSelect = relWrapper.appendChild(createElement("SELECT", {"id": "dataidrel", "class": "dataItem dataidrel", "data-id": "rel"}));

  if(proto) {
    type.value = proto.type;
    type.dispatchEvent(new Event('input', { bubbles: true }));
    type.disabled = true;
  }
}

function createElement(type, attributes, innerHTML) {
  var element = document.createElement(type);
  if(typeof attributes == "object") {
    Object.keys(attributes).forEach((attr) => {
      element.setAttribute(attr, attributes[attr]);
    });
  }
  else if(typeof attributes == "string") {
    element.innerHTML = attributes;
  }
  if(innerHTML) element.innerHTML = innerHTML;
  return element;
}

function notification(text, type) {
  var notifier = document.createElement("p");
  notifier.classList.add("notifier");
  switch (type) {
    case "success":
      notifier.classList.add("success");
      break;
    case "error":
      notifier.classList.add("error");
      break;
    default:

  }
  notifier.addEventListener("click", function(e) {
    notifier.remove();
  });
  document.getElementById("notificationCanvas").appendChild(notifier);
  notifier.innerHTML = text;
  setTimeout(function() {
    notifier.remove();
  }, 5000);
}

function cleanBoolean (list) {
  lib[list].prototype.forEach((item, index) => {
    if(item.type == "boolean") {
      lib[list].content.forEach(i => {
        i[item.key] = i[item.key] == 1 ? true : false;
      });
    }
    else if(item.type == "number" || item.type == "link") {
      lib[list].content.forEach(i => {
        i[item.key] = parseInt(i[item.key]);
      });
    }
  });
}

function exportDesignSystems(header, filename, target, types) { //csv export for design systems
  var csvString = "";
  csvString += createExportHeader(header, ";");
  var lists = [];
  target.forEach(list => {
    lib[list].content.forEach((item, index) => {
      if(find(lib[list].rel, "id", item[lib[list].rel]).active == 1 && types.includes(find(lib[list].rel, "id", item[lib[list].rel]).type)) {
        lists.push(item);
      }
    });
  });
  lists.sort((a, b) => {
    var pictoA = find("pictos", "id", a.pictos) || find("track", "id", a.track) || find("sector", "id", a.sector) || find("stand", "id", a.stand);
    var pictoB = find("pictos", "id", b.pictos) || find("track", "id", b.track) || find("sector", "id", b.sector) || find("stand", "id", b.stand);
    if(Number(pictoA.category) < Number(pictoB.category)) return -1;
    else if(Number(pictoA.category) > Number(pictoB.category)) return 1;
    else if(Number(pictoA.subcategory) < Number(pictoB.subcategory)) return -1;
    else if(Number(pictoA.subcategory) > Number(pictoB.subcategory)) return 1;
    else if(Number(pictoA.order) < Number(pictoB.order)) return -1;
    else if(Number(pictoA.order) > Number(pictoB.order)) return 1;
    else return 0;
  });
  lists.forEach((item, i) => {
      header.forEach((key, index) => {
        if(key.type == "generated") {
          csvString += key.get(item, i);
        }
        else if(key.type == "link")
        {
          lib[key.key].content.forEach((link) => {
            if(link.id == item[key.key]) {
              csvString += link.name;
            }
          });
        }
        else {
          csvString += item[key.key];
        }
        csvString += (index < header.length -1) ? ";" : "";
      });
      csvString += "\n";
  });
  downloadFile(csvString, filename);
}

function exportPictosEditor(header, filename, target, types) { //csv export for signaletik Editor db -> issues.sbb.ch/projects/SEE
  var csvString = "";
  csvString += createExportHeader(header, ";");
  var lists = [];
  target.forEach(list => {
    lists = lists.concat(lib[list].content);
  });
  lists.sort((a, b) => {
    if(a.id < b.id) return -1;
    else if(a.id > b.id) return 1;
    else return 0;
  });
  lists.forEach((item, i) => {
    if(item.active == 1 && types.includes(item.type)) {
      header.forEach((key, index) => {
        if(key.type == "generated") {
          csvString += key.get(item, i);
        }
        else if(key.type == "link")
        {
          csvString += find(key.key, "id", item[key.key]).name;
        }
        else {
          csvString += item[key.key];
        }
        csvString += (index < header.length -1) ? ";" : "";
      });
      csvString += "\n";
    }
  });
  downloadFile(csvString, filename);
}

function exportSVGEditor(header, filename, target) { //csv export containing the svg graphics for signaletik Editor db -> issues.sbb.ch/projects/SEE
  var lang = ["de", "fr", "it"];
  var dir = ["l", "r"];
  var csvString = "";
  var id = 1;
  csvString += createExportHeader(header, ",");
  lib[target].content.forEach((item, i) => {
    if(item.active == 1 && (item.type == "picto" || item.type == "generated")) {
      if(item.dir == 1 && item.lang == 1) {
        lang.forEach(l => {
          dir.forEach(d => {
            csvString += createLine(item, header, id, l, d);
            id++;
          });
        });
      }
      else if(item.dir == 1) {
        dir.forEach(d => {
          csvString += createLine(item, header, id, false, d);
          id++;
        });

      }
      else if(item.lang == 1) {
        lang.forEach(l => {
          csvString += createLine(item, header, id, l, false);
          id++;
        });
      }
      else {
        csvString += createLine(item, header, id, false, false);
        id++;
      }
    }
  });
  downloadFile(csvString, filename);
}

function unsaveChanges(state) {
  hasUnsavedChanges = state;
  window.api.send("toMain", {action: "open file changed", data: {state: state}});
  if(state) {
    document.getElementById("saveFile").classList.add("highlighted");
  }
  else document.getElementById("saveFile").classList.remove("highlighted");
}
