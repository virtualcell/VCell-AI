//manage ids
class IDManager {
  constructor() {
    this.nextID = -1;
  }

  getID() {
    this.nextID++;
    return this.nextID;
  }
}

class HTMLInterface {
  constructor(htmlBody, canvasDiv, tableDiv, fileInput, loadingText) {
    //declare html elms
    this.htmlBody = htmlBody;
    this.canvasDiv = canvasDiv;
    this.tableDiv = tableDiv;
    this.fileInput = fileInput;
    this.loadingText = loadingText;
    //set max dimensions for canvases (normally 4000, 180)
    this.maxWidth = 10000;
    this.maxHeight = 250;
    //set bngl begin tokens
    this.compartmentTokens = ["compartments"];
    this.moleculeTokens = [
      "molecule types",
      "molecular types",
      "molecule_types",
      "molecular_types",
      "molecules",
      "molecule"
    ];
    this.speciesTokens = [
      "species",
      "seed species",
      "seed_species",
      "seeds"
    ];
    this.observablesTokens = ["observables"];
    this.reactionTokens = [
      "reaction rules",
      "reaction_rules",
      "reactions",
      "rules"
    ];
    this.polymerTokens = ["<", "<=", ">", ">=", "=="];
    this.sectionTokens = [
      this.compartmentTokens,
      this.moleculeTokens,
      this.speciesTokens,
      this.observablesTokens,
      this.reactionTokens
    ]

    //create section token map
    this.sectionTokenMap = {};
    this.sectionTokens.forEach((item, i) => {
      let val;
      if (i == 0) {
        val = "compartments";
      } else if (i == 1) {
        val = "molecules";
      } else if (i == 2) {
        val = "species";
      } else if (i == 3) {
        val = "observables";
      } else if (i == 4) {
        val = "reactions";
      }
      this.sectionTokenMap[item.toString()] = val;
    });

    //other global var declaration
    this.mm = new MoleculeManager();
    this.be = new BNGLExtractor(this.mm);
    this.canvasHTMLGraphicMap = {};
    this.idManager = new IDManager();
    this.currentBlob;

    //set mode to dark mode initially
    this.darkMode = false;
    this.applyDarkMode();
  }

  applyDarkMode() {
    //recompile list of elms
    let allElms = body.getElementsByTagName("*");
    let len = allElms.length;
    let oldClass = ((this.darkMode) ? "light-mode": "dark-mode");
    let newClass = ((this.darkMode) ? "dark-mode": "light-mode");
    //change css classes
    for (let i = 0; i < len; i++) {
      allElms[i].classList.remove(oldClass);
      allElms[i].classList.add(newClass);
    }
    //body must be completed sepratley
    body.classList.remove(oldClass);
    body.classList.add(newClass);
  }

  applyDarkModeCanvases() {
    //redraw canvases
    let cans = document.querySelectorAll(".bngl-canvas");
    cans.forEach((item, i) => {
      item.getContext
      var graphic, ctx;
      [graphic, ctx] = this.canvasHTMLGraphicMap[item.id];
      ctx.clearRect(0, 0, 1000000, 10000);
      graphic.darkMode = this.darkMode;
      graphic.doDrawList();
    });
  }

  switchDarkMode() {
    this.darkMode = !this.darkMode;
    this.applyDarkMode();
    this.visualize(this.currentBlob);
    //this.applyDarkModeCanvases();
  }

  capitalizeFirstLetter(s) {
    let words = s.split(" ");
    words.forEach((word, i) => {
      words[i] = word[0].toUpperCase() + word.slice(1, s.length);
    });
    return words.join(' ');
  }

  standardizeElm(elm) {
    //create new html element for string inputs
    if (typeof elm == "string") {
      let newP = document.createElement("p");
      newP.innerHTML = elm;
      elm = newP;
    }
    return elm;
  }

  addElmLast(child, parent) {
    parent.appendChild(this.standardizeElm(child));
  }

  drawBNGL(bngl, canvas, data = {type: "molecules", drawExtraPlus: false}) {
    let drawExtraPlus = data.drawExtraPlus;
    let type = data.type;
    let compartmentMap = data.compartmentMap;
    //set up drawing context. "willReadFrequently: true" puts processes in GPU
    let ctx = canvas.getContext("2d", { willReadFrequently: true });
    let drawObj, compartment, numberMolecules;
    let noReacts = false;
    let parameters = {
      mode: 'compact',
      darkMode: this.darkMode,
      compartmentMap: compartmentMap
    };
    if (type === "compartments") {
      parameters["manager"] = this.mm;
      parameters["compDimension"] = this.mm.getDimension(bngl);
      parameters["compartment"] = bngl;
      drawObj = new Graphic("()", parameters);
      //setup draw func
      let dims = drawObj.drawCompartment(ctx, 0, 0);
      //resize canvas
      canvas.width = dims[0];
      canvas.height = dims[1];
      //draw
      drawObj.doDrawList();
      //map html elm and graphic instance
      let id = this.idManager.getID();
      canvas.id = id;
      this.canvasHTMLGraphicMap[id] = [drawObj, ctx];
      return 0;
    } else if (type === "observables") {
      if (compartmentMap) {
        compartment = compartmentMap[bngl[0][0]];
        parameters["compDimension"] = this.mm.getDimension(compartment);
        parameters["compartment"] = compartment;
      }
      parameters["manager"] = this.mm;
      //should be [reactants, products, sign] but observables with - bond are in sign
      drawObj = new Graphic(bngl[0][0], parameters);
      numberMolecules = 1;
    } else if (type === "reactions") {
      let reactants, products, sign;
      [reactants, products, sign] = bngl;
      parameters["manager"] = this.mm;
      parameters["drawExtraPlus"] = drawExtraPlus;
      drawObj = new Reaction(reactants, products, sign, ctx, parameters);
      numberMolecules = reactants.length + products.length;
      noReacts = reactants.length == 0;
    } else if (type === "species") {
      if (compartmentMap) {
        compartment = compartmentMap[bngl];
        parameters["compartment"] = compartment;
      }
      parameters["manager"] = this.mm;
      drawObj = new Graphic(bngl, parameters);
      numberMolecules = 1;
    } else {
      if (compartmentMap) {
        compartment = compartmentMap[bngl];
        parameters["compDimension"] = this.mm.getDimension(compartment);
        parameters["compartment"] = compartment;
      }
      drawObj = new Graphic(bngl, parameters);
      numberMolecules = 1;
    }
    let reactionDims = drawObj.draw(ctx, 0, 0);
    //draw graphic
    drawObj.doDrawList();
    //get dimensions
    let dims;
    dims = getCanvasDimentions(
      ctx,
      {
        numberMolecules: numberMolecules,
        noReacts: noReacts
      },
      this.maxWidth,
      this.maxHeight
    );
    //resize canvas
    canvas.width = dims[0];
    canvas.height = dims[1];
    //canvas.width = 750;
    //canvas.height = 100;
    //have to redraw
    ctx.clearRect(0, 0, 1000000, 10000);
    drawObj.doDrawList();
    //map html elm and graphic instance
    let id = this.idManager.getID();
    canvas.id = id;
    this.canvasHTMLGraphicMap[id] = [drawObj, ctx];
    //manage greysites
    if ((type === "molecules" || type === "species") && !this.mm.has(drawObj)) {
      this.mm.addMolecule(drawObj);
    }
  }

  addToTable(elmNestedList, table, colSpan=0) {
    //iterate through rows
    for (let rowNum = 0; rowNum < elmNestedList.length; rowNum++) {
      let row = elmNestedList[rowNum];
      //make new row
      let tempRow = document.createElement("tr");
      tempRow.classList.add("canvas-row");
      this.addElmLast(tempRow, table);
      //iterate though elements in row
      for (let elmNum = 0; elmNum < row.length; elmNum++) {
        let elm = this.standardizeElm(row[elmNum]);
        //if elm is list, there may be multiple elms to add
        let arrayMode = elm.length != undefined;
        let tempTD = document.createElement("td");
        if (colSpan) {
          tempTD.colSpan = colSpan;
        }
        if (colSpan) {
          tempTD.classList.add("divider-td");
        } else {
          tempTD.classList.add("main-td");
        }
        if (!arrayMode) {
          //insert single element into td
          this.addElmLast(elm, tempTD);
          this.addElmLast(tempTD, tempRow);
        } else {
          for (let i = 0; i < elm.length; i++) {
            //insert multiple elements into td
            this.addElmLast(elm[i], tempTD);
            this.addElmLast(tempTD, tempRow);
          }
        }
      }
    }
  }

  separateBNGLNewLines(reactants, products, sign, newLines) {
    let signProcessed = false;
    function reformat(list) {
      if (!signProcessed) {
        if (list.length == 0) {
          return [[],[],null];
        }
        let i = 0;
        let elm = list[i];
        let noSign = true;
        while (true) {
          if (i >= list.length) {
            break;
          }
          if (elm == null || elm.includes("<") || elm.includes(">")) {
            noSign = false;
            signProcessed = true;
            break;
          }
          i++;
          elm = list[i];
        }
        return [
          list.slice(0, i),
          list.slice(i + 1, list.legnth),
          ((noSign) ? null : list[i])
        ];
      } else {
        return [[], list, null];
      }
    }

    function sliceNewLine(output, startIndex, index) {
      //combine reactants, sign, and product into 1 list to match newline index format
      let sliced = condensedList.slice(startIndex, index);
      //reformat() expands condensed list back into reactants, sign, and product
      output.push(reformat(sliced));
    }

    let condensedList;
    if (sign) {
      condensedList = reactants.concat([sign]).concat(products);
    } else {
      condensedList = reactants.concat(products);
    }
    let output = [];
    let rowNewLineIndexMap = {};
    let startIndex;
    let index = 0;
    for (let i = 0; i < newLines.length; i++) {
      startIndex = index;
      index = newLines[i].index;
      sliceNewLine(output, startIndex, index);
      rowNewLineIndexMap[output.length - 1] = i;
    }
    sliceNewLine(output, index, condensedList.length);
    //remove empty lists
    for (let i = 0; i < output.length; i++) {
      let row = output[i];
      if (row[0].length == 0 && row[1].length == 0 && !row[2]) {
        output.splice(i, 1);
        newLines.splice(rowNewLineIndexMap[i], 1);
      }
    }
    return output;
  }

  //render one set (need to add compartments)
  prepareRow(data, type) {
    let molcCompMap = {};
    let bngl, conc, comment, name, compartment, reactants, products, sign, observData, newLines, rate;
    if (type != "reactions" && type != "observables" && type != "compartments") {
      bngl = data.bngl;
      conc = data.conc.trim();
      comment = data.comment.trim();
      let observType = data.observType;
      [bngl, compartment] = this.mm.processMoleculeCompartment(bngl.trim());
      bngl = addBNGLParenthesis(bngl);
      molcCompMap[bngl] = compartment;
      name = bngl.split("(")[0];
      if (name.includes(":")) {
        name = name.split(":")[1];
      }
      var bngls = [bngl];
    } else if (type == "compartments") {
      //add compartments to molecule manager
      this.mm.addCompartment(data.name, data.dimension);
    } else if (type == "observables") {
      [reactants, products, sign, observData, comment, newLines] = Object.values(data);
      //add paranthesis if there are none
      let bngl, compartment, polymer, polymerIndex;
      reactants.forEach((bngl, i) => {
        //manage polymer lengths
        for (let i = 0; i < this.polymerTokens.length; i++) {
          let token = this.polymerTokens[i];
          if (bngl.includes(token)) {
            polymerIndex = bngl.indexOf(token);
            polymer = bngl.slice(polymerIndex, bngl.length);
            bngl = bngl.slice(0, polymerIndex);
          }
        }
        //other processing
        [bngl, compartment] = this.mm.processMoleculeCompartment(bngl);
        reactants[i] = addBNGLParenthesis(bngl);
        if (polymer && polymer.trim()) {
          this.mm.addPolymer(observData.name, polymer);
        }
        molcCompMap[bngl] = compartment;
      });
      var bngls = this.separateBNGLNewLines(reactants, products, sign, newLines);
    } else if (type === "reactions") {
      [reactants, products, sign, rate, comment, newLines] = Object.values(data);
      //add paranthesis if there are none
      let bngl, compartment;
      reactants.forEach((item, i) => {
        [bngl, compartment] = this.mm.processMoleculeCompartment(item)
        reactants[i] = addBNGLParenthesis(bngl);
        molcCompMap[bngl] = compartment;
      });
      products.forEach((item, i) => {
        [bngl, compartment] = this.mm.processMoleculeCompartment(item)
        products[i] = addBNGLParenthesis(bngl);
        molcCompMap[bngl] = compartment;
      });
      var bngls = this.separateBNGLNewLines(reactants, products, sign, newLines);
    }
    //handle new line special case
    let hasNewLines;
    if (type != "compartments") {
      hasNewLines = ((bngls.length > 1) ? true : false);
    } else {//setup compartment visualization
      bngls = [data.name];
    }
    //make canvases
    let newCans = [];
    for(let i = 0; i < bngls.length; i++) {
      bngl = bngls[i];
      //create new canvas
      let newCan = document.createElement("canvas");
      newCans.push(newCan);
      //must have inital dimensions as large as largest possible visualization
      newCan.width = this.maxWidth;
      newCan.height = this.maxHeight;
      newCan.classList.add("bngl-canvas");
      //draw object on canvas
      this.drawBNGL(
        bngl,
        newCan,
        {
          type: type,
          compartmentMap: molcCompMap,
          drawExtraPlus: hasNewLines && i < bngls.length - 1,
        }
      );
    }
    //output as list
    if (type == "species") {
      return [name, newCans, bngl, conc, comment];
    } else if (type == "observables") {
      return [
        observData.type,
        observData.name,
        newCans,
        this.be.compileBNGL(data, type, observData),
        comment
      ];
    } else if (type == "reactions") {
      return [
        newCans,
        this.be.compileBNGL(data),
        rate.trim(),
        comment
      ];
    } else if (type == "compartments") {
      let output = Object.values(data);
      output.splice(3, 0, newCans);
      return output;
    } else {
      return [name, newCans, bngl, comment];
    }
  }

  //render 1 entire type (molecules, species, etc)
  visualizeType(type, list) {
    if (list.length > 0) {
      //add new table
      let newTable = document.createElement("table");
      this.addElmLast(newTable, this.tableDiv);
      //render header
      if (type != "header comments" || list.length > 0) {
        this.addToTable([[document.createElement("hr")]], newTable, 5);
        const newDivider = document.createElement("p");
        if (type != "header comments") {
          newDivider.innerHTML = this.capitalizeFirstLetter(type);
        }
        newDivider.classList.add("table-divider");
        this.addToTable([[newDivider]], newTable, 5);
        if (type == "observables") {
          this.addToTable(
            [['Type', 'Name', 'Visualization', 'BNGL code', 'Comment']],
            newTable
          );
        } else if (type == "molecules") {
          this.addToTable(
            [['Name', 'Visualization', 'BNGL code', 'Comment']],
            newTable
          );
        } else if (type == "reactions") {
          this.addToTable(
            [['Visualization', 'BNGL code', 'Rate', 'Comment']],
            newTable
          );
        } else if (type == "compartments") {
          this.addToTable(
            [['Name', 'Dimension', 'Size', 'Visualization', 'Comment']],
            newTable
          );
        } else if (type != "header comments") {
          this.addToTable(
            [['Name', 'Visualization', 'BNGL code', 'Concentration', 'Comment']],
            newTable
          );
        }
        //render rows
        if (list.length > 0) {
          let output = [];
          for (let i = 0; i < list.length; i++) {
            let item = list[i];
            //normal row
            if (typeof item == "object") {
              this.addToTable([this.prepareRow(item, type)], newTable);
            }
            //full line comment
            else if (typeof item == "string") {
              this.addToTable([[item]], newTable, 5);
            }
          }
        } else {
          this.addToTable([["None", "", "", ""]], newTable);
        }
      }
    }
  }

  clear() {
    //remove everything in table
    let oldElms = this.tableDiv.children;
    let numOldElms = oldElms.length;
    for(let i = 0; i < numOldElms; i++) {
      oldElms[0].remove();
    }
    //remove everything in canvas div
    oldElms = this.canvasDiv.children;
    numOldElms = oldElms.length;
    for(let i = 0; i < numOldElms; i++) {
      oldElms[0].remove();
    }
    //reset molecule manager
    this.mm.reset();
  }

  //render everything in bngl
  visualize(blob) {
    this.clear();
    this.currentBlob = blob;
    //render new file
    function read(bngl, intrObj) {
      //sort tokens
      let aVal, bVal;
      intrObj.sectionTokens.sort((a, b)=>{
        a.forEach((item, i) => {
          if (bngl.includes("begin " + item)) {
            aVal = bngl.indexOf("begin " + item);
          }
        });
        if (!aVal) {
          return -1;
        }
        b.forEach((item, i) => {
          if (bngl.includes("begin " + item)) {
            bVal = bngl.indexOf("begin " + item);
          }
        });
        return ((aVal < bVal) ? -1: 1);
      });
      //visualize everything
      let comments = intrObj.be.extractComments(bngl, intrObj.sectionTokens);
      intrObj.sectionTokens.forEach((item, i) => {
        let type = intrObj.sectionTokenMap[item.toString()];
        intrObj.visualizeType("header comments", comments[i]);
        intrObj.visualizeType(type, intrObj.be.extractBNGL(bngl, item, type));
      });
      intrObj.visualizeType("header comments", comments[comments.length - 1]);
      //make arrows bigger
      let pElms = document.querySelectorAll("p");
      for (let i = 0; i < pElms.length; i++) {
        let elm = pElms[i];
        elm.innerHTML = elm.innerHTML.replace("&lt;-&gt;", ' <span class="big-arrow">&#8596;</span> ');
        elm.innerHTML = elm.innerHTML.replace("-&gt;", ' <span class="big-arrow">&#8594;</span> ');
        elm.innerHTML = elm.innerHTML.replace("&lt;-", ' <span class="big-arrow">&#8592;</span> ');
      };
      intrObj.applyDarkMode();
    }
    let reader = new FileReader();
    reader.onload = () => {
      read(reader.result, this);
      this.loadingText.style.display = "none";
    }
    //read if file present
    if (typeof blob == "string") {
      read(blob, this);
    } else if (typeof blob == "object") {
      if (this.fileInput.value) {
        reader.readAsText(blob);
      }
    }
  }
}
