var lib = {} //set global var for the library object.
var docTitle = "List and Link"
var contentCanvas = document.getElementById("contentCanvas") //initializing the content canvas where the lists will be rendered
var EntryTypes = {
  text: {
    value: "text",
    name: "Text",
    defaultValue: ""
  },
  longText: {
    value: "longText",
    name: "Langer Text",
    defaultValue: ""
  },
  number: {
    value: "number",
    name: "Nummer",
    defaultValue: 0
  },
  link: {
    value: "link",
    name: "Verknüpfung",
    defaultValue: 0
  },
  boolean: {
    value: "boolean",
    name: "Checkbox",
    defaultValue: false
  },
  multiLink: {
    value: "multiLink",
    name: "Verknüpfung Multi Select",
    defaultValue: []
  },
  svg: {
    value: "svg",
    name: "SVG Grafik",
    defaultValue: ""
  }
};


window.api.receive("fromMain", (data) => {
  switch(data.action) {
    case "load file":
      loadJsonFile(data.data)
      break
    case "notification":
      notification(data.data.text, data.data.type)
      break
    case "get library for saving":
      saveLibrary(data.data.close, data.data.quit)
      break
    case "set title":
      document.title = docTitle + " – " + data.data.fileName
      break
  }
})
//set the event handlers for all the buttens for import, load or export
document.getElementById("redrawCanvas").addEventListener("click", () => {buildViewPort()}, false)
document.getElementById("createNewList").addEventListener("click", () => {setList()}, false)

function loadJsonFile(data) { //Load the initial json library from the file system
  lib = JSON.parse(data.json);
  document.title = docTitle + " – " + data.file;
  buildViewPort();
}

function saveLibrary(close, quit) {
  window.api.send("toMain", {
    action: "send library for saving",
    data: {
      json: JSON.stringify(lib),
      close: close,
      quit: quit
    }
  });
}

function buildViewPort() { //Sort library and generate the list containers with headers and "add" button in the DOM
  sort()
  contentCanvas.innerHTML = ""
  var tables = Object.entries(lib)
  tables.forEach((item) => {
    var container = contentCanvas.appendChild(createElement("DIV", {"data-id": item[0]}))
    var title = container.appendChild(createElement("H1", item[1].name))
    var editButton = title.appendChild(createElement("BUTTON", {"class": "right"}, "Tabelle bearbeiten"))
    editButton.addEventListener("click", () => {
      setList(item[0])
    }, false)
    var addButton = title.appendChild(createElement("BUTTON", {"class": "right red marginRight"}, "Element hinzufügen"))
    addButton.onclick = function() {
      setEntry(item[0], "new")
    }
    jsonToTable(container, item[0])
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
        var icon = document.createElement("ICON")
        icon.classList.add(lib[dataSet].content[index][item.key])
        cell.appendChild(icon)
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
          if(a[i] > b[i]) result = 1
          if(a[i] < b[i]) result = -1
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
  var prototypeEntries = []
  var editCanvas = document.body.appendChild(createElement("DIV", {"id": "editCanvas"}))

  var editFrame = editCanvas.appendChild(createElement("DIV", {"class": "editFrame"}))

  var editContainer = editFrame.appendChild(createElement("DIV", {"class": "editContainer"}))

  var listIdWrapper = renderInput(editContainer, "listId", "text", "Tabellen Schlüssel", listKey ? lib[listKey].id : undefined)
  listIdWrapper.input.disabled = listKey ? true : false
  listIdWrapper.input.addEventListener("input", (e) => {
    var existingLists = Object.keys(lib)
    existingLists.push("")
    if(existingLists.includes(listId.value)) saveButton.disabled = true
    else saveButton.disabled = false
  })

  var listNameWrapper = renderInput(editContainer, "listName", "text", "Tabellen Name", listKey ? lib[listKey].name : undefined)

  var listSort = renderInput(editContainer, "listSort", "text", "Sortierreihenfolge [Feld Schlüssel Komma getrennt]", listKey ? lib[listKey].sort.join() : undefined)

  if(listKey) {
    lib[listKey].prototype.forEach((proto) => {
      if(proto.key != "id") {
        prototypeEntries.push(createPrototypeEntry(editContainer, proto))
      }
    });
  }

  var editFooter = editFrame.appendChild(createElement("DIV", {"class": "editFooter"}))

  var saveButton = editFooter.appendChild(createElement("BUTTON", {"class": "red"}, "Speichern"))
  if(!listKey) saveButton.disabled = true
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
    }

    var prototypeFields = document.getElementsByClassName("prototypeWrapper")

    for (let item of prototypeFields) {
      var proto = {
        key: "",
        name: "",
        rel: "",
        type: item.getElementsByClassName("dataidtype")[0].value
      };
      if(proto.type == "link" || proto.type == "multiLink") {
        proto.key = item.getElementsByClassName("dataidlink")[0].value;
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

    var sortArray = []
    listSort.input.value.replace(" ", "").split(",").forEach((item, i) => {
      if(newList.prototype.findIndex(o => o.key === item) !== -1) sortArray.push(item)
    })
    newList.sort = sortArray.length > 0 ? sortArray : ['id']

    if(listKey) {
      lib[listKey].content.forEach((item) => {
        var newItem = {};
        newList.prototype.forEach((p) => {
          if(item[p.key] !== undefined) {
            newItem[p.key] = item[p.key]
          }
          else {
            newItem[p.key] = EntryTypes[p.type].defaultValue
          }
        });
        newList.content.push(newItem)
      });
      lib[listKey] = newList
    }
    else lib[document.getElementById("dataidlistId").value] = newList

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
  var element = {}
  var prototypeWrapper = editContainer.appendChild(createElement("DIV", {"class": "prototypeWrapper"}))

  element.type = renderInput(prototypeWrapper, "type", "select", "Feld Typ")
  Object.entries(EntryTypes).forEach((item) => {
    element.type.input.appendChild(createElement("OPTION", {"value": item[0]}, item[1].name))
  })

  element.key = renderInput(prototypeWrapper, "key", "text", "Feld Schlüssel", proto ? proto.key : undefined)
  element.key.input.disabled = proto ? true: false

  element.link = renderInput(prototypeWrapper, "link", "select", "Verknüpfte Liste")
  Object.keys(lib).forEach((list) => {
    element.link.input.appendChild(createElement("OPTION", {"value": list}, lib[list].name))
  });

  element.name = renderInput(prototypeWrapper, "name", "text", "Anzeigename", proto ? proto.name : undefined)

  element.rel = renderInput(prototypeWrapper, "rel", "select", "Anzeigewert")

  element.type.input.addEventListener("input", (e) => {
    if(element.type.input.value == "link" || element.type.input.value == "multiLink") {
      element.rel.wrapper.classList.remove("hidden")
      element.key.wrapper.classList.add("hidden")
      element.name.wrapper.classList.add("hidden")
      element.link.wrapper.classList.remove("hidden")
      element.name.input.value = lib[element.link.input.value].name
      element.rel.input.innerHTML = ""
      lib[element.link.input.value].prototype.forEach((entry) => {
        element.rel.input.appendChild(createElement("OPTION", {"value": entry.key}, entry.name))
      })
      if(proto) element.rel.input.value = proto.rel
    }
    else {
      element.rel.wrapper.classList.add("hidden")
      element.key.wrapper.classList.remove("hidden")
      element.name.wrapper.classList.remove("hidden")
      element.link.wrapper.classList.add("hidden")
    }
  }, false)

  element.link.input.addEventListener("change", (e) => {
    element.rel.input.innerHTML = ""
    lib[element.link.input.value].prototype.forEach((entry) => {
      element.rel.input.appendChild(createElement("OPTION", {"value": entry.key}, entry.name))
    })
  })

  if(proto) {
    element.link.input.value = proto.key;
    element.link.input.disabled = true;
    element.type.input.value = proto.type
    element.type.input.dispatchEvent(new Event('input', { bubbles: true }))
    element.type.input.disabled = true
  }
  else {
    element.link.wrapper.classList.add("hidden")
    element.rel.wrapper.classList.add("hidden")
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

function renderInput(parent, id, type, label, value) {
  var element = {}
  element.wrapper = parent.appendChild(createElement("DIV", {"class": "inputWrapper " + id + "Wrapper"}))
  element.label = element.wrapper.appendChild(createElement("LABEL",{"for": "dataid" + id}, label))
  if(type == "select") {
    element.input = element.wrapper.appendChild(createElement("SELECT", {"data-id": id, "id": "dataid" + id, "class": "dataItem dataid" + id}))
  }
  else {
    element.input = element.wrapper.appendChild(createElement("INPUT", {"type": type, "data-id": id, "id": "dataid" + id, "class": "dataItem dataid" + id}))
    if(value) element.input.value = value
  }
  return element
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

function unsaveChanges(state) {
  window.api.send("toMain", {action: "open file changed", data: {state: state}});
}
