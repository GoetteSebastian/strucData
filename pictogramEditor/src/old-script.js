var lib = {} //set global var for the library object.
var docTitle = "List and Link"
var contentCanvas = document.getElementById("contentCanvas") //initializing the content canvas where the lists will be rendered
var EntryTypes = {
  text: {
    value: "text",
    name: "Text",
    defaultValue: "",
    set: (entry) => {
      return {
        key: entry.key.input.value,
        name: entry.name.input.value,
        rel: "",
        type: entry.type.input.value
      }
    },
    edit: (parent, prototype, elementReference) => {
      var element = {
        value: elementReference ? lib[elementReference.dataSet].content[elementReference.index][prototype.key] : "",
        key: prototype.key
      }
      element.wrapper = options.parent.appendChild(createElement("DIV", {class: "inputWrapper"}))
      element.label = element.wrapper.appendChild(createElement("LABEL", prototype.name))
      element.input = element.wrapper.appendChild(createElement("INPUT", {type: "text", class: "dataItem"}))
      element.input.value = element.value
      element.input.addEventListener("input", (e) => {
        element.value = element.input.value
      })
      parent.appendChild(element)
      return element
    }
  },
  longText: {
    value: "longText",
    name: "Langer Text",
    defaultValue: "",
    set: (entry) => {
      return {
        key: entry.key.input.value,
        name: entry.name.input.value,
        rel: "",
        type: entry.type.input.value
      }
    },
    edit: (parent, prototype, elementReference) => {
      var element = {
        value: elementReference ? lib[elementReference.dataSet].content[elementReference.index][prototype.key] : "",
        key: prototype.key
      }
      element.wrapper = options.parent.appendChild(createElement("DIV", {"class": "inputWrapper"}))
      element.label = element.wrapper.appendChild(createElement("LABEL", prototype.name))
      element.input = element.wrapper.appendChild(createElement("TEXTAREA", {class: "dataItem"}, element.value))
      element.input.addEventListener("input", (e) => {
        element.value = element.input.innerHTML
      })
      parent.appendChild(element)
      return element
    }
  },
  number: {
    value: "number",
    name: "Nummer",
    defaultValue: 0,
    set: (entry) => {
      return {
        key: entry.key.input.value,
        name: entry.name.input.value,
        rel: "",
        type: entry.type.input.value
      }
    },
    edit: (parent, prototype, elementReference) => {
      var element = {
        value: elementReference ? lib[elementReference.dataSet].content[elementReference.index][prototype.key] : 0,
        key: prototype.key
      }
      element.wrapper = options.parent.appendChild(createElement("DIV", {"class": "inputWrapper"}))
      element.label = element.wrapper.appendChild(createElement("LABEL", prototype.name))
      element.input = element.wrapper.appendChild(createElement("INPUT", {type: "number", class: "dataItem"}))
      element.input.value = element.value
      element.input.addEventListener("input", (e) => {
        element.value = element.input.value
      })
      parent.appendChild(element)
      return element
    }
  },
  link: {
    value: "link",
    name: "Verknüpfung",
    defaultValue: 0,
    set: (entry) => {
      return {
        key: entry.link.input.value,
        name: "",
        rel: entry.rel.input.value,
        type: entry.type.input.value
      }
    },
    edit: (parent, prototype, elementReference) => {
      var element = {
        value: lib[elementReference.dataSet].content[elementReference.index][prototype.key],
        key: prototype.key
      }
      element.wrapper = options.parent.appendChild(createElement("DIV", {"class": "inputWrapper"}))
      element.label = element.wrapper.appendChild(createElement("LABEL", lib[prototype.key].name))
      element.input = element.wrapper.appendChild(createElement("SELECT", {class: "dataItem"}))
      lib[prototype.key].content.forEach((option) => {
        var option = element.input.appendChild(createElement("OPTION", {value: option.id}, option[prototype.rel]))
        if(elementReference) {
          option.selected = element.value == option.id ? true : false
        }
      })
      element.input.addEventListener("change", (e) => {
        element.value = element.input.value
      })
      parent.appendChild(element)
      return element
    }
  },
  boolean: {
    value: "boolean",
    name: "Checkbox",
    defaultValue: false,
    set: (entry) => {
      return {
        key: entry.key.input.value,
        name: entry.name.input.value,
        rel: "",
        type: entry.type.input.value
      }
    },
    edit: (parent, prototype, elementReference) => {
      var element = {
        value: elementReference ? lib[elementReference.dataSet].content[elementReference.index][prototype.key] : false,
        key: prototype.key
      }
      element.wrapper = options.parent.appendChild(createElement("DIV", {"class": "inputWrapper"}))
      element.label = element.wrapper.appendChild(createElement("LABEL", prototype.name))
      element.input = element.wrapper.appendChild(createElement("INPUT", {type: "checkbox", class: "dataItem checkboxWrapper"}))
      element.input.value = element.value
      element.input.addEventListener("input", (e) => {
        element.value = element.input.checked
      })
      parent.appendChild(element)
      return element
    }
  },
  multiLink: {
    value: "multiLink",
    name: "Verknüpfung Multi Select",
    defaultValue: [],
    set: (entry) => {
      return {
        key: entry.link.input.value,
        name: "",
        rel: entry.rel.input.value,
        type: entry.type.input.value
      }
    },
    edit: (parent, prototype, elementReference) => {
      var element = {
        value: elementReference ? lib[elementReference.dataSet].content[elementReference.index][prototype.key] : [],
        key: prototype.key
      }
      element.wrapper = options.parent.appendChild(createElement("DIV", {"class": "inputWrapper"}))
      element.label = element.wrapper.appendChild(createElement("LABEL", lib[prototype.key].name))
      element.input = element.wrapper.appendChild(createElement("SELECT", {class: "dataItem"}))
      element.options = []
      lib[prototype.key].content.forEach((option) => {
        var option = element.input.appendChild(createElement("OPTION", {value: option.id}, option[prototype.rel]))
        if(elementReference) {
          option.selected = element.value.includes(option.id) ? true : false
        }
        element.options.push(option)
      })
      element.input.addEventListener("change", (e) => {
        var newValue = []
        element.options.forEach((option) => {
          if(option.selected) newValue.push(option.value)
        })
        element.value = newValue
      })
      parent.appendChild(element)
      return element
    }
  },
  svg: {
    value: "svg",
    name: "SVG Grafik",
    defaultValue: "",
    set: (entry) => {
      return {
        key: entry.key.input.value,
        name: entry.name.input.value,
        rel: "",
        type: entry.type.input.value
      }
    },
    edit: (parent, prototype, elementReference) => {
      var element = {
        value: elementReference ? lib[elementReference.dataSet].content[elementReference.index][prototype.key] : "",
        key: prototype.key
      }
      element.wrapper = options.parent.appendChild(createElement("DIV", {"class": "inputWrapper"}))
      element.label = element.wrapper.appendChild(createElement("LABEL", prototype.name))
      element.input = element.wrapper.appendChild(createElement("INPUT", {type: "file", accept: "image/svg+xml", class: "hidden"}))
      element.input.addEventListener("change", newSvgFile => {
        var parser = new DOMParser()
        const reader = new FileReader
        var file = newSvgFile.target.files[0]
        reader.originalFileName = file.name.replace(".svg", "")
        reader.addEventListener('load', (event) => {
          var data = parser.parseFromString(event.target.result, "image/svg+xml")
          if(data.getElementById("content_1_") != null) {
            data.getElementById("content_1_").id = "content"
          }
          if(data.getElementById("Content") != null) {
            data.getElementById("Content").id = "content"
          }
          element.value = data.documentElement.outerHTML
          element.svgPreview.innerHTML = element.value
        })
        if(file.name.includes(".svg")) {
          reader.readAsText(file)
        }
      })


      element.svgPreview = element.wrapper.appendChild(createElement("DIV", {class: "svgPreview"}, elementReference ? lib[elementReference.dataSet].content[elementReference.index][prototype.key] : ""))
      svgPreview.addEventListener("click", function(e) {
        element.fileInput.click()
      })
      parent.appendChild(element)
      return element
    }
  }
}

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
  var table = container.appendChild(createElement("TABLE"))
  var headerRow = table.appendChild(createElement("TR"))
  lib[dataSet].prototype.forEach((element) => {
    if(element.key != "id"){
      headerRow.appendChild(createElement("TH", (element.type == "link" || element.type == "multiLink") ? lib[element.key].name : element.name))
    }
  })
  lib[dataSet].content.forEach((item, i) => {
    var bodyRow = table.appendChild(createElement("TR"))
    createRow(dataSet, i, bodyRow)
    bodyRow.setAttribute("data-index", i) //delete
    bodyRow.addEventListener("dblclick", function() {
      setEntry(dataSet, i)
    }, false)
  })
}

function setEntry(dataSet, index) { //build the edit, delete, save functions and edit overlays on doubleclick.
  var dataElement = {
    dataSet: dataSet,
    index: index
  }
  var entries = []

  var editCanvas = document.body.appendChild(createElement("DIV", {id: "editCanvas"}))
  var editFrame = editCanvas.appendChild(createElement("DIV", {class: "editFrame"}))
  var editContainer = editFrame.appendChild(createElement("DIV", {class: "editContainer"}))

  editContainer.setAttribute("data-id", dataSet); //?
  editContainer.setAttribute("data-index", index); //?

  var editFooter = editFrame.appendChild(createElement("DIV", {class: "editFooter"}))

  var deleteButton = editFooter.appendChild(createElement("BUTTON", {"data-id": dataSet, "data-index": index, "container-id": lib[dataSet].id, class: dataElement.index ? "" : "hidden"}, "Löschen"))
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation()
    lib[dataElement.dataSet].content.splice(dataElement.index, 1)
    unsaveChanges(true)
    editCanvas.remove()
    buildViewPort()
  }, false)

  var saveButton = editFooter.appendChild(createElement("BUTTON", {class: "red"}, "Speichern"))
  saveButton.addEventListener("click", (e) => {
    e.stopPropagation()
    var newEntry = {}
    entries.forEach((entry) => {
      newEntry[entry.key] = entry.value
    })
    lib[dataElement.dataSet].content[dataElement.index] = newEntry
    //create get function in EntryTypes.
    //handle new entries with new id.

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
  }, false)




  var abortButton = editFooter.appendChild(createElement("BUTTON", "Abbrechen"))
  abortButton.addEventListener("click", (e) => {
    editCanvas.remove()
    e.stopPropagation()
  }, false)

  lib[dataElement.dataSet].prototype.forEach((item) => {
    entries.push(EntryTypes[item.type].edit(editContainer, item, dataElement))
  })
}

function getLink(element, target) { //get the information of a linked attribute
  var result = {}
  result.html = createElement("SPAN")
  result.html.innerHTML = result.string = find(element[0], "id", element[1])[target]
  return result
}

function createRow(dataSet, index, bodyRow) { //create a body row
  //include function in EntryTypes
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
  var list = {}
  list.prototypeEntries = []
  var editCanvas = document.body.appendChild(createElement("DIV", {"id": "editCanvas"}))
  var editFrame = editCanvas.appendChild(createElement("DIV", {"class": "editFrame"}))
  var editContainer = editFrame.appendChild(createElement("DIV", {"class": "editContainer"}))

  list.id = renderInput({
    parent: editContainer,
    type: "text",
    label: "Tabellen Schlüssel",
    value: listKey ? lib[listKey].id : undefined
  })
  list.id.value = listKey ? lib[listKey].id : undefined
  list.id.input.disabled = listKey ? true : false
  list.id.input.addEventListener("input", (e) => {
    var existingLists = Object.keys(lib)
    existingLists.push("")
    if(existingLists.includes(listId.value)) saveButton.disabled = true
    else saveButton.disabled = false
    list.id.value = list.id.input.value
  })

  list.name = renderInput({
    parent: editContainer,
    type: "text",
    label: "Tabellen Name",
    value: listKey ? lib[listKey].name : undefined
  })
  list.name.value = listKey ? lib[listKey].name : undefined
  list.name.input.addEventListener("input", (e) => {
    list.name.value = list.name.input.value
  })
  list.sort = renderInput({
    parent: editContainer,
    type: "text",
    label: "Sortierreihenfolge [Feld Schlüssel Komma getrennt]",
    value: listKey ? lib[listKey].sort.join() : undefined
  })
  list.sort.value = listKey ? lib[listKey].sort.join() : undefined
  list.sort.addEventListener("input", (e) => {
    var sortArray = []
    list.sort.input.value.replace(" ", "").split(",").forEach((item, i) => {
      if(list.prototype.includes(o => o.key === item)) sortArray.push(item)
    })
    list.sort.value = sortArray.length > 0 ? sortArray : ['id']
    list.sort.input.value = list.sort.value.join()
  })
  if(listKey) {
    lib[listKey].prototype.forEach((proto) => {
      if(proto.key != "id") {
        list.prototype.push(createPrototypeEntry(editContainer, proto))
      }
    })
  }

  var editFooter = editFrame.appendChild(createElement("DIV", {"class": "editFooter"}))

  var saveButton = editFooter.appendChild(createElement("BUTTON", {"class": "red"}, "Speichern"))
  if(!listKey) saveButton.disabled = true
  saveButton.addEventListener("click", function(e) {
    var newList = {
      content: [],
      id: list.id.value,
      name: list.name.value,
      prototype: [
        {
          key: "id",
          name: "Id",
          rel: "",
          type: "number"
        }
      ],
      sort: list.sort.value
    }

    list.prototype.forEach((entry) => {
      if(entry.key.input.value !== "id") {
        newList.prototype.push(EntryTypes[entry.type.input.value].set(entry))
      }
    })
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
        })
        newList.content.push(newItem)
      })
      lib[listKey] = newList
    }
    else lib[newList.id] = newList

    document.editCanvas.remove()
    buildViewPort()
    unsaveChanges(true)
    e.stopPropagation()
  }, false)

  var abortButton = editFooter.appendChild(createElement("BUTTON", "Abbrechen"))
  abortButton.addEventListener("click", function(e) {
    document.getElementById("editCanvas").remove()
    e.stopPropagation()
  }, false)

  var newEntryButton = editFooter.appendChild(createElement("BUTTON", "Neues Feld erstellen"))
  newEntryButton.addEventListener("click", (e) => {
    list.prototype.push(createPrototypeEntry(editContainer))
  }, false)
}

function createPrototypeEntry(editContainer, proto) {
  var element = {}
  var prototypeWrapper = editContainer.appendChild(createElement("DIV", {"class": "prototypeWrapper"}))

  element.type = renderInput({
    parent: prototypeWrapper,
    type: "select",
    label: "Feld Typ"
  })
  Object.entries(EntryTypes).forEach((item) => {
    element.type.input.appendChild(createElement("OPTION", {"value": item[0]}, item[1].name))
  })

  element.key = renderInput({
    parent: prototypeWrapper,
    type: "text",
    label: "Feld Schlüssel",
    value: proto ? proto.key : undefined
  })
  element.key.input.disabled = proto ? true: false

  element.link = renderInput({
    parent: prototypeWrapper,
    type: "select",
    label: "Verknüpfte Liste"
  })
  Object.keys(lib).forEach((list) => {
    element.link.input.appendChild(createElement("OPTION", {"value": list}, lib[list].name))
  });

  element.name = renderInput({
    parent: prototypeWrapper,
    type: "text",
    label: "Anzeigename",
    value: proto ? proto.name : undefined
  })

  element.rel = renderInput({
    parent: prototypeWrapper,
    type: "select",
    label: "Anzeigewert"
  })

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
  return element
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

function renderInput(options) {
  // options = {parent = must, type = must, label = must, value = optional, options = on select must}
  var element = {}
  element.wrapper = options.parent.appendChild(createElement("DIV", {"class": "inputWrapper"}))
  element.label = element.wrapper.appendChild(createElement("LABEL", options.label))

  if(options.type == "select") {
    element.input = element.wrapper.appendChild(createElement("SELECT", {"class": "dataItem"}))
  }
  else {
    element.input = element.wrapper.appendChild(createElement("INPUT", {"type": options.type, "class": "dataItem "}))
    if(options.value) element.input.value = options.value
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
