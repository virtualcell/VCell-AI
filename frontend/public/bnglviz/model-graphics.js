//script for graphics

//note all scale params in draw functions do not work, fix or delete

//define string hash
function hashString(s) {
  var hash = 0, i, chr;
  for (var i = 0; i < s.length; i++) {
    chr   = s.charCodeAt(i);
    hash = (chr << (6 * i)) + hash;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

//defining string rgb values by hashing them
Object.defineProperty(String.prototype, 'rgb', {
  //hashing string
  value: function() {
    hash = hashString(this);
    //changing hash into rgb format:
    hash *= ((hash < 0) ? -1: 1);
    if (hash < 65280) {
      hash++;
      hash *= 17777777;
    }
    //16777215 is FFFFFF in base 16
    hash = hash % 16777215;
    color = Math.floor(hash);
    color = color.toString(16);
    var rgb = [];
    for (var i = 0; i < 3; i++) {
      rgb.push(parseInt(color.slice(i, 2 + i), 16));
    }
    //correcting colors too dark
    if (rgb.reduce((a, b) => a + b, 0) < 600) {
      //remainder of 255 and highest rbg chanel
      const buff = 255 - Math.max(rgb[0], rgb[1], rgb[2]);
      //add buff
      for (var i = 0; i < 3; i++) {
        rgb[i] = rgb[i] + buff;
      }
      //find min chanel
      let min = 0;
      for (var i = 1; i < 3; i++) {
        if (rgb[i] < rgb[min]) {
          min = i;
        }
      }
      //equalize far apart channels
      let diff = Math.max(rgb[0], rgb[1], rgb[2]) - rgb[min];
      if (diff > 100) {
        rgb[min] += diff - 50;
      }
      //construct rbg string
      color = '';
      for (var i = 0; i < 3; i++) {
        color += rgb[i].toString(16);
      }
    }
    return (color);
  }
});


//splits string at target character;
function splitString(string, target) {
  list = [];
  lastTagert = 0;
  for (var i = 0; i < string.length; i++) {
    if (string[i] == target) {
      list.push(string.slice(lastTagert, i));
      lastTagert = i + 1;
    }
  }
  list.push(string.slice(lastTagert, string.length));
  return(list);
}


//
function compactString(s, numChars = 10) {
  if (s.length <= numChars) {
    return s;
  } else {
    return s.slice(0, numChars - 3) + "...";
  }
}


//simple class to hold data from molecule's sites
class Site {
  constructor(name, states, molecule, color = null) {
    this.inheritType = false;
    this.molecule = molecule;
    this.textColor = "000000";
    this.bondName = null;
    //get bond name from states
    for (var i = 0; i < states.length; i++) {
      if (states[i].includes('!')) {
        var pair = splitString(states[i], '!');
        states[i] = pair[0];
        this.setBondName(pair[1]);
      }
    }
    //get bond name from site name
    if (name.includes('!')) {
      var pair = splitString(name, '!');
      name = pair[0];
      this.setBondName(pair[1]);
    }
    //init vars
    this.name = name;
    this.states = states; //list of state names
    this.position = null; //x y coords of where to draw bond
    //color from name
    if (color == null) {
      this.color = this.name.rgb();
    } else {
      this.color = color;
    }
    //set unique id
    this.setId();
    return this;
  }

  setId() {
    let name = this.name;
    let identifyingNumber = 0;
    let idSet = this.molecule.ids;
    while (idSet.has(name + identifyingNumber)) {
      identifyingNumber++;
    }
    let id = name + identifyingNumber;
    this.id = id;
    this.molecule.ids.add(id);
  }

  //if any site has a bond
  hasBond() {
    if (this.bondName == null || isNaN(this.bondName)) {
      return false;
    } else {
      return true;
    }
  }

  //if bond is special case (+, -, ?)
  specialBond(bondName) {
    return ((bondName === "+" || bondName === "-" || bondName === "?") ? true : false);
  }

  getSpecialBondPair() {
    return [this.position, null, this.bondName, "special"];
  }

  setBondName(bondName) {
    if (this.specialBond(bondName)) {
      this.bondName = bondName;
    } else {
      this.bondName = parseInt(bondName);
    }
  }
}

//add parenthesis to any bngl definition string
window.addBNGLParenthesis = function addBNGLParenthesis(bngl) {
  //split into each molecule
  if ((!bngl.includes("<")) && (!bngl.includes(">"))) {
    let molecules = bngl.split(".");
    let output = "";
    let len = molecules.length;
    molecules.forEach((m, i) => {
      //add paranthesis if there are none
      if (m.indexOf("(") < 0) {
        m = m + "()";
      }
      output += m;
      if (i != len - 1) {
        output += ".";
      }
    });
    return output;
  } else {
    return bngl;
  }
}

//class for molecules
window.Molecule = class Molecule {
  constructor(def, graphic, parameters) {
    //old constructor(def, mode = 'normal', graphic = null)
    this.parameters = parameters;
    //set of site id's
    this.ids = new Set();
    //map of site ids to site instance
    this.siteMap = {};
    //parent graphic instance
    this.graphic = graphic;
    //draw compact / normal
    this.mode = parameters.mode;
    //bionetgen definition
    this.def = def;
    //6 digit rgb hex
    this.color = '';
    //name of molecule
    this.name = '';
    //this.sites, list of Site() instances, initialized in this.process()
    if (this.def) {
      this.process();
    }
    //colors used to draw states
    this.stateColors = ['#FBC6D0', '#00FDFF', '#FA26A0', '#99F3BD'];
    //list of {drawFunction, parameterList} objects
    this.drawList = [];
    //dimentions, calculated later
    this.x = 0;
    this.y = 0;
    //radius for main round rects
    this.radius = 15;
    //radius for main round sites
    this.siteRadius = 8;
  }

  addSite(site, list) {
    list.push(site);
    this.siteMap[site.id] = site;
  }

  getSite(id) {
    return this.siteMap[id];
  }

  //initialize this.color, sites, name from bionetgen def
  process() {
    //notice bond info is kept in this.sites and removed later
    let temp = splitString(this.def, '(');
    this.name = ((this.mode == "normal") ? temp[0] : compactString(temp[0]));
    this.color = temp[0].rgb();
    let sites = temp[1].slice(0, -1);
    //sites = sites.slice(sites.length - 2);
    sites = splitString(sites, ',');
    let siteList = [];
    temp = '';
    for (var i = 0; i < sites.length; i++) {
      if (sites[i].includes(')')) {
        sites[i] = sites[i].replace(')', '');
      }
      if (sites[i].includes('~')) {
        //if sites have states
        temp = splitString(sites[i], '~');
        let states = temp.slice(1);
        if (this.mode == 'normal') {
          this.addSite(new Site(temp[0], states, this), siteList);
        } else {
          //if compact mode slice restrict number of characters
          for (let u = 0; u < states.length; u++) {
            let state = states[u];
            //if state has bond
            if (state.includes('!')) {
              let temp = states[u].split('!');
              let stateName = temp[0];
              let bond = temp[1];
              stateName = compactString(stateName);
              states[u] = stateName + '!' + bond;
            }
            else {
              states[u] = compactString(state);
            }
          }
          let originalName = temp[0];
          let sliced = compactString(originalName);
          this.addSite(
            new Site(sliced, states, this, originalName.rgb()),
            siteList
          );
        }
        //if there are sites but no states
      } else if (sites[i].length != 0) {
        //if normal
        if (this.mode == 'normal') {
          this.addSite(new Site(sites[i], [], this), siteList);
        } else {
          //if compact
          let site = sites[i];
          let originalName = sites[i];
          //if site has bond
          if (site.includes('!')) {
            let temp = site.split('!');
            let siteName = temp[0];
            let bond = temp[1];
            siteName = compactString(siteName);
            sites[i] = siteName + '!' + bond;
            this.addSite(new Site(sites[i], [], this, siteName.rgb()), siteList);
          } else {
            this.addSite(
              new Site(compactString(site), [], this, originalName.rgb()),
              siteList
            );
          }
        }
      } else {
        //if there are no sites
        siteList = null;
      }
    }
    this.sites = ((siteList == null) ? [] : siteList);
    //add observable parent sites
    let graphic = this.graphic;
    let indexSiteMap = {};
    if (graphic && graphic.manager && graphic.manager.hasMolecules()) {
      let parentSites = graphic.manager.getSites(this.name);
      if (parentSites && this.sites && this.sites.length > 0) {
        parentSites.forEach((parent, p) => {
          this.sites.forEach((site, s) => {
            //only add if parent site is not already represented in BNGL
            if ((site.id === parent.id)) {
              indexSiteMap[p] = site;
              p++;
            } else {
              indexSiteMap[p] = parent;
            }
          });
        });
        //correct site order
        let l = [];
        for (let i = 0; i < parentSites.length; i++) {
          l.push(indexSiteMap[i]);
        }
        this.sites = l;
      } else {
        //if no non parent sites
        this.sites = ((parentSites) ? parentSites: this.sites);
      }
    }
  }

  hasBond() {
    let answer = false;
    this.sites.forEach((item) => {
      if (item.hasBond()) {
        answer = true;
      }
    });
    return answer;
  }

  //evaluate all draw list functions
  doDrawList() {
    if (this.def) {
      let list = this.drawList;
      for (let i = 0; i < list.length; i++) {
        let elm = list[i];
        let func = elm.func;
        let params = elm.params;
        func(params);
      }
    }
  }

  //draw rounded rect
  drawRoundRect(ctx, x, y, radius, length, rgb) {
    ctx.fillStyle = '#' + rgb;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, Math.PI / 2, Math.PI * (3/2));
    ctx.arc(
      x + radius + length,
      y + radius, radius,
      Math.PI * (3/2),
      Math.PI / 2
    );
    ctx.lineTo(x + radius, y + 2 * radius);
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.closePath();
  }

  //draw sites
  drawSites(ctx, x, y, radius, scale = 1, initX = 0, visible = true) {
    const spaceBetweenSites = 3;
    let siteLength, stateLength, longestState, tallestState;
    siteLength = stateLength = longestState = tallestState = 0;
    let hasStates = false;
    //adding sites
    let dx = radius - 2 * this.siteRadius;
    for (var i = 0; i < this.sites.length; i++) {
      //bottom line of sites
      let dy = 2 * radius + 2;
      dx += + 2 * this.siteRadius + siteLength;
      //if site not first add spacing between sites
      if (i != 0) {
        dx += spaceBetweenSites;
      }
      if (longestState > 2 * this.siteRadius + siteLength) {
        dx += - siteLength + longestState - 2 * this.siteRadius;
      }
      //drawing sites
      siteLength = ctx.measureText(this.sites[i].name).width;
      let colorParam = this.sites[i].color;
      let xParam = x + dx - radius / 2;
      let yParam = y + dy - radius / 2;
      if (visible) {
        this.drawList.push({func: (params) => {
          this.drawRoundRect(
            ctx,
            params[0],
            params[1],
            params[3],
            params[4],
            params[2]
          );
        }, params: [xParam, yParam, colorParam, this.siteRadius, siteLength]});
      }
      //drawing site names
      let nameParam = this.sites[i].name;
      colorParam = this.sites[i].textColor;
      xParam = x + dx - this.siteRadius / 2;
      yParam = y + dy + this.siteRadius / 2 + 1;
      if (visible) {
        this.drawList.push({func: (params) => {
          ctx.fillStyle = "#" + params[3];
          ctx.font = "12px Arial";
          ctx.fillText(
            params[2],
            params[0],
            params[1]
          );
        }, params: [xParam, yParam, nameParam, colorParam]});
      }
      //drawing states of sites
      var states = this.sites[i].states;
      if (states.length == 0) {
        longestState = 0;
      } else if (!hasStates) {
        hasStates = true;
      }
      //add bonds to stateless sites
      if (this.sites[i].bondName != null) {
        if (this.sites[i].states.length == 0) {
          this.sites[i].position = [x + dx - initX, y + dy + this.siteRadius];
        }
      }
      for (var u = 0; u < states.length; u++) {
        var sx = x + dx - this.siteRadius + 2;
        var sy = y + dy + u * 13 + this.siteRadius;
        //fix lengths
        stateLength = ctx.measureText(this.sites[i].states[u]).width;
        if (this.sites[i].states[u].length <= 10) {
          stateLength += 3;
        }
        if (longestState < stateLength) {longestState = stateLength;}
        //add bonds to sites with states
        if (this.sites[i].bondName != null) {
          this.sites[i].position = [sx + stateLength / 2 - initX, sy + 13];
        }
        //draw states
        //var colorIndex = u;
        let stateParam = this.sites[i].states[u];
        xParam = sx;
        yParam = sy;
        //if (colorIndex > 3) {colorIndex = colorIndex % 3;}
        if (visible) {
          this.drawList.push({func: (params) => {
            ctx.fillStyle = "#" + params[3];
            ctx.beginPath();
            ctx.rect(params[0], params[1], params[4], 13);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.stroke();
            ctx.closePath();
            //naming states
            ctx.fillStyle = '#000000';
            ctx.fillText(params[2], params[0] + 1.5, params[1] + 10.5);
          }, params: [
            xParam,
            yParam,
            stateParam,
            stateParam.rgb(),
            stateLength
          ]});
        }
        if (sy + 13 > tallestState) {
          tallestState = sy + 13;
        }
      }
    }
    //return total [length, height] to compare to default dimensions
    var dims = [];
    //use either end of site, state, or molecule for x component
    var possibleLengths = [
      dx - radius / 2 + siteLength,
      dx,
      sx + stateLength - x
    ];
    for (var i = 0; i < 3; i++) {
      if (isNaN(possibleLengths[i])) {
        possibleLengths[i] = 0;
      }
    }
    dims.push(possibleLengths.reduce(function (a, b) {
      return (Math.max(a, b));
    }));
    if (hasStates) {
      dims.push(tallestState);
    } else {
      dims.push(radius * 2 + this.siteRadius + 2);
    }
    return (dims);
  }

  //draw molecule with states and sites labled
  initDrawList(ctx, x, y, scale = 1, initX = 0) {
    if (this.def) {
      ctx.font = "15px Arial";
      var length = Math.abs(ctx.measureText(this.name).width);
      var dims = this.drawSites(ctx, x, y, this.radius, 1, initX, false);
      if (length < dims[0]) {
        length = dims[0];
      }
      let numSites = Object.keys(this.sites).length;
      //add main molecule to draw list
      this.drawList.push({func: (params) => {
        ctx.font = "15px Arial";
        //drawing pill shape
        this.drawRoundRect(
          ctx,
          params[0],
          params[1],
          params[2],
          params[3],
          params[4]
        );
        //drawing sites
        this.drawSites(
          ctx,
          params[0],
          params[1],
          params[2],
          1,
          params[5]
        );
        //drawing name
        ctx.fillStyle = '#000000';
        ctx.font = "15px Arial";
        ctx.fillText(
          params[6],
          params[0] + params[2] / 2,
          params[1] + params[2] + 5
        );
      }, params: [x, y, this.radius, length, this.color, initX, this.name]});
      //return [length, height] of molecule for Graphic class
      this.x = dims[0];
      this.y = dims[1];
      return ([this.radius * 2 + length, dims[1]]);
    }
  }
}

//basically a map from molecule definitions to sites
window.MoleculeManager = class MoleculeManager {
  constructor() {
    //map from molecule name to list of sites
    this.molcMap = {};
    //map from compartment name to dimension
    this.compMap = {};
    //map from molecule name to compartment name
    this.molcCompMap = {};
    //map from molecule name to polymer length string
    this.polymerMap = {};
    //most recent compartment name added
    this.latestComp = null;
  }

  processMoleculeCompartment(moleculeName) {
    //for some reason I need to redefine the function parameter as follows
    //I have no idea why I need to do this, it is a cursed error
    this.moleculeName = moleculeName;
    let compartmentName;
    if (this.moleculeName.includes("@")) {
      //if the string doesn't have exactly 1 colon its invalid
      let colonCount = this.moleculeName.split(":").length - 1;
      if (colonCount != 1) {
        throw new Error("Invalid compartment definition!");
        return this.moleculeName;
      }
      let pair = this.moleculeName.split(":");
      compartmentName = pair[0].slice(1, pair[0].length);
      this.moleculeName = pair[1];
      this.molcCompMap[this.moleculeName] = compartmentName;
      this.latestComp = compartmentName;
    }
    return [this.moleculeName, compartmentName];
  }

  addPolymer(name, polymer) {
    this.polymerMap[name] = polymer;
  }

  getPolymer(name) {
    return this.polymerMap[name];
  }

  hasPolymer(name) {
    return this.polymerMap.hasOwnProperty(name);
  }

  addCompartment(compartment, dimension) {
    this.compMap[compartment] = dimension;
  }

  getCompartment(name) {
    return this.molcCompMap[name];
  }

  getDimension(compartment) {
    return this.compMap[compartment];
  }

  hasCompartment(name) {
    return this.compMap.hasOwnProperty(name);
  }

  hasMoleculeWithCompartment(name) {
    return this.molcCompMap.hasOwnProperty(name);
  }

  getDimension(compartment) {
    return ((this.hasCompartment(compartment)) ? this.compMap[compartment]:-1);
  }

  addMolecule(graphic) {
    if (this.validDefinition(graphic)) {
      let molecule = graphic.molecules[0];
      let sites = molecule.sites;
      //change parameters of sites to show its from parent
      sites.forEach((item, i) => {
        this.inheritType = true;
        item.color = "cfcfcf";
        item.bondName = null;
        item.states = [];
        item.textColor = "cfcfcf";
      });
      let name = molecule.name;
      this.molcMap[name] = sites;
    }
  }

  validDefinition(graphic) {
    return (graphic && graphic.molecules && graphic.molecules.length === 1);
  }

  getSites(name) {
    return this.molcMap[name];
  }

  hasMolecules() {
    return ((Object.keys(this.molcMap).length > 0) ? true : false);
  }

  has(graphic) {
    let molecule = graphic.molecules[0];
    return (this.validDefinition(graphic) && this.molcMap.hasOwnProperty(molecule.name));
  }

  reset() {
    this.molcMap = {};
    this.compMap = {};
  }
}


//each bionetgen should have own Graphic instance
window.Graphic = class Graphic {
  constructor(def, parameters) {
    //old constructor def, mode = 'normal', darkMode = false, manager = null
    this.parameters = parameters;
    //molecule manager class instance
    this.manager = parameters.manager;
    //list of {drawFunction, parameterList} objects
    this.drawList = [];
    try {
      //draw normal / compact
      this.mode = parameters.mode;
      //bionetgen definition
      this.def = addBNGLParenthesis(def.replaceAll(" ", ""));
      //dark mode boolean
      this.darkMode = parameters.darkMode;
      //compartment name
      this.comp = parameters.compartment;
      //compartment dimension number
      this.compDimension = ((this.comp) ? this.manager.getDimension(this.comp): undefined);
      //list of instances of molecule classes
      this.molecules = [];
      //initializing this.molecules
      this.process();
      //dimesntions, calcutlated later
      this.x = this.y = 0;
      //boolean if bonds have any connections
      this.anyBondConnection = false;
    } catch(e) {
      console.log("model-graphics.js Graphic() constructor() error:\n" + e);
    }
  }

  process() {
    let defs = splitString(this.def, '.');
    let mode = ((this.mode == 'normal') ? "" : 'compact');
    for (var i = 0; i < defs.length; i++) {
      this.molecules.push(
        new Molecule(
          defs[i],
          this,
          {mode: mode}
        )
      );
    }
  }

  //evaluate all draw list functions
  doDrawList() {
    //graphics draw functions
    let list = this.drawList;
    for (let i = 0; i < list.length; i++) {
      let elm = list[i];
      let func = elm.func;
      let params = elm.params;
      func(params);
    }
    //molecules draw functions
    for (let i = 0; i < this.molecules.length; i++) {
      this.molecules[i].doDrawList();
    }
  }

  //draw compartment (compartment)
  drawCompartment(ctx, xPos, yPos) {
    if (this.comp) {
      //box dims
      let textWidth = ctx.measureText(this.comp).width;
      let y = 55 + yPos;

      //compartment color from dimension
      let color = ((this.compDimension == 3) ? '#000': '#666');

      //add to draw list
      this.drawList.push({func: (params) => {
        //draw compartment at top right corner, filling ctx
        ctx.fillStyle = color;
        ctx.fillRect(xPos, yPos, params[0] + 9, y);
        ctx.strokeStyle = '#ddd';
        ctx.fillStyle = '#ddd';
        ctx.font = "11px Arial";
        ctx.beginPath();
        ctx.moveTo(xPos, yPos);
        //left line
        ctx.lineTo(xPos, y);
        //bottom line
        ctx.lineTo(xPos + params[0] + 9, y);
        //right line
        ctx.lineTo(xPos + params[0] + 9, yPos);
        //top line
        ctx.lineTo(xPos, yPos);
        ctx.stroke();
        ctx.closePath();
        ctx.fillText(this.comp, xPos + 2, y - 5);
      }, params: [textWidth]});
      return [textWidth + 10, y];
    }
  }

  draw(ctx, initX, initY) {
    if (this.def) {
      let length = 0;
      let height = 0;
      let checkedBonds = new Set();
      let completedBonds = new Set();
      let pairs = [];//list of pairs of xy coords for each bond
      //draw compartment
      this.drawCompartment(ctx, initX, initY);
      //set up dimension vars
      for (let i = 0; i < this.molecules.length; i++) {
        let thisX = 2 + length + initX;
        let thisY = 2 + initY;
        let dims = this.molecules[i].initDrawList(ctx, thisX, thisY, null, initX);
        length += dims[0];
        if (dims[1] > height) {
          height = dims[1];
        }
      }
      //extracting bonds
      //each molecule
      for (let i = 0; i < this.molecules.length; i++) {
        //each site
        for (let y = 0; y < this.molecules[i].sites.length; y++) {
          let m1 = this.molecules[i].sites[y];
          //if unique bond m1 exists
          if (m1.bondName != null && !checkedBonds.has(m1.bondName)) {
            //add special bonds
            if (m1.specialBond(m1.bondName)) {
              pairs.push(m1.getSpecialBondPair());
            } else {
              //finish getting normal bonds
              checkedBonds.add(m1.bondName);
              let newPair = [m1.position];
              //check all sites in species for matching bond type
              for (let u = 0; u < this.molecules.length; u++) {
                for (let z = 0; z < this.molecules[u].sites.length; z++) {
                  //ensure a molecule doesnt bond to itself
                  if (z != y || u != i) {
                    let m2 = this.molecules[u].sites[z];
                    if (m2.bondName == m1.bondName) {
                      this.anyBondConnection = true;
                      newPair.push(m2.position);
                      newPair.push(m2.bondName);
                      newPair.push("normal");
                      pairs.push(newPair);
                      completedBonds.add(m1.bondName);
                    }
                  }
                }
              }
            }
          }
        }
      }
      //finding unmatched bonds to mark as special bonds
      for (let i = 0; i < this.molecules.length; i++) {
        for (let y = 0; y < this.molecules[i].sites.length; y++) {
          let m1 = this.molecules[i].sites[y];
          if (m1.bondName != null) {
            //add special bonds
            if ((!m1.specialBond(m1.bondName)) && (!completedBonds.has(m1.bondName))) {
              m1.bondName = "+";
              pairs.push(m1.getSpecialBondPair());
            }
          }
        }
      }
      //drawing bonds
      var maxHeight = 0;
      for (let i = 0; i < pairs.length; i++) {
        let isNormal = (pairs[i][3] === "normal");
        if (pairs[i][0][1] > maxHeight) {
          maxHeight = pairs[i][0][1];
        }
        if (isNormal && pairs[i][1][1] > maxHeight) {
          maxHeight = pairs[i][1][1];
        }
        let x1 = pairs[i][0][0] + initX;
        let x2, y2;
        if (isNormal) {
          x2 = pairs[i][1][0] + initX;
          y2 = pairs[i][1][1] + initY;
        }
        let y0 =  pairs[i][0][1] + initY;
        let y1;
        if (this.anyBondConnection) {
          y1 = (pairs[i][0][1] + 5 * i + 10) + initY;
        } else {
          y1 = (pairs[i][0][1] + 10) + initY;
        }
        let textParam = pairs[i][2];
        let textParamX = x1 - 4;
        let textParamY = pairs[i][0][1] + 11 + initY;
        if (isNormal) {
          this.drawList.push({func: (params) => {
            ctx.strokeStyle = ((this.darkMode) ? "#FFFFFF" : "#000000");
            ctx.lineWidth = 2;
            ctx.font = "10px Arial";
            ctx.beginPath();
            ctx.moveTo(params[0], params[2]);
            ctx.lineTo(params[0], params[3]);
            ctx.lineTo(params[1], params[3]);
            ctx.lineTo(params[1], params[4]);
            ctx.stroke();
          }, params: [x1, x2, y0, y1, y2, textParam, textParamX, textParamY]});
        } else if (textParam === "+") {
          this.drawList.push({func: (params) => {
            ctx.strokeStyle = ((this.darkMode) ? "#FFFFFF" : "#000000");
            ctx.lineWidth = 2;
            ctx.font = "10px Arial";
            ctx.beginPath();
            ctx.moveTo(params[0], params[2]);
            ctx.lineTo(params[0], params[3]);
            ctx.stroke();
          }, params: [x1, x2, y0, y1, y2, textParam, textParamX, textParamY]});
        } else if (textParam === "-") {
          this.drawList.push({func: (params) => {
            ctx.strokeStyle = ((this.darkMode) ? "#FFFFFF" : "#000000");
            ctx.lineWidth = 2;
            ctx.font = "10px Arial";
            ctx.beginPath();
            ctx.moveTo(params[0], params[2]);
            ctx.lineTo(params[0], params[3]);
            ctx.moveTo(params[0] - 4, params[3] - 2);
            ctx.lineTo(params[0] + 4, params[3] - 2);
            ctx.stroke();
          }, params: [x1, x2, y0, y1, y2, textParam, textParamX, textParamY]});
        } else if (textParam === "?") {
          this.drawList.push({func: (params) => {
            ctx.fillStyle = ((this.darkMode) ? "#FFFFFF" : "#000000");
            ctx.font = "13px Arial";
            ctx.fillText(params[5], params[6], params[7]);
          }, params: [x1, x2, y0, y1, y2, textParam, textParamX, textParamY]});
        }
      }
      if (maxHeight + 10 > height + 5) {
        this.x += length + 5;
        this.y += maxHeight + 10;
        return ([length + 5, maxHeight + 10]);
      } else {
        this.x += length + 5;
        this.y += height + 5;
        return ([length + 5, height + 5]);
      }
    }
  }
}


class Reaction {
  constructor(reactants, products, sign, ctx, parameters) {
    this.parametes = parameters;
    //list of reactant bngl definition strings
    this.reactants = reactants;
    //list of product bngl definition strings
    this.products = products;
    //either "->", "<->", or "<-"
    this.sign = sign;
    //canvas 2d context instance
    this.ctx = ctx;
    //dark mode boolean
    this.darkMode = parameters.darkMode;
    //list of draw functions
    this.drawList = [];
    //numbers tracking canvas dimensions as drawing is produced
    this.totalLength = 0;
    this.totalHeight = 0;
    //boolean
    this.drawExtraPlus = !!parameters.drawExtraPlus;
    //MoleculeManager instance
    this.mm = parameters.manager;
  }

  drawPlus(x, totalHeight, ctx) {
    let plusLen = 30;
    ctx.beginPath();
    ctx.moveTo(x, totalHeight / 2);
    ctx.lineTo(x + plusLen, totalHeight / 2);
    ctx.moveTo(x + plusLen / 2, (plusLen + totalHeight) / 2);
    ctx.lineTo(x + plusLen / 2, (-plusLen + totalHeight) / 2);
    ctx.strokeStyle = ((this.darkMode) ? "#FFFFFF" : "#000000");;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 1;
  }

  drawArrow(x, totalHeight, ctx) {
    let arrowLen = 30;
    ctx.beginPath();
    //draw arrow shaft
    ctx.moveTo(x, totalHeight / 2);
    ctx.lineTo(x + arrowLen, totalHeight / 2);
    //draw right facing arrow tip
    if (this.sign != "<-") {
      ctx.moveTo(x + arrowLen, totalHeight / 2);
      ctx.lineTo(x + arrowLen * (2/3), totalHeight / 2 + 7.5);
      ctx.moveTo(x + arrowLen, totalHeight / 2);
      ctx.lineTo(x + arrowLen * (2/3), totalHeight / 2 - 7.5);
    }
    //draw left facing arrow tip
    if (this.sign != "->") {
      ctx.moveTo(x, totalHeight / 2);
      ctx.lineTo(x + arrowLen / 3, totalHeight / 2 + 7.5);
      ctx.moveTo(x, totalHeight / 2);
      ctx.lineTo(x + arrowLen / 3, totalHeight / 2 - 7.5);
    }
    ctx.strokeStyle = ((this.darkMode) ? "#FFFFFF" : "#000000");
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 1;
  }

  draw() {
    //get html elements
    let drawMap = {};
    let scale = 1;
    let reactants = this.reactants;
    let products = this.products;

    //reactants
    for (let u = 0; u < reactants.length; u++) {
      //init obj
      let bngl = reactants[u];
      let parameters = {
        mode: 'compact',
        darkMode: this.darkMode,
        manager: this.mm,
        compartment: this.mm.getCompartment(bngl)
      };
      let drawObj = new Graphic(bngl, parameters);

      //initial draw to get size
      var dims = drawObj.draw(this.ctx, this.totalLength, 0);
      if (dims) {
        this.totalLength += dims[0];
      }

      //add draw function
      this.drawList.push(
        {
          func: (ctx, totalLength, totalHeight) => {
            drawObj.doDrawList();
          },
          x: this.totalLength
        }
      );

      //add plus under specific conditions
      if (u < reactants.length - 1 || this.drawExtraPlus && products.length == 0 && this.sign == null) {
        this.drawList.push(
          {
            func: (ctx, totalLength, totalHeight) => {
              this.drawPlus(totalLength, totalHeight, this.ctx);
            },
            x: this.totalLength
          }
        );
        this.totalLength += 30;
      }

      //add height
      if (dims && dims[1] > this.totalHeight) {
        this.totalHeight = dims[1];
      }
    }

    //add arrow between reactants, products
    if (this.sign) {
      this.drawList.push(
        {
          func: (ctx, totalLength, totalHeight) => {
            this.drawArrow(totalLength, totalHeight, this.ctx);
          },
          x: this.totalLength
        }
      );
      this.totalLength += 30;
    }

    //products
    for (let u = 0; u < products.length; u++) {
      //init obj
      let bngl = products[u];
      let parameters = {
        mode: 'compact',
        darkMode: this.darkMode,
        manager: this.mm,
        compartment: this.mm.getCompartment(bngl)
      };
      let drawObj = new Graphic(bngl, parameters);

      //initial draw to get size
      var dims = drawObj.draw(this.ctx, this.totalLength, 0, scale);
      if (dims) {
        this.totalLength += dims[0];
      }

      //add product draw function
      this.drawList.push(
        {
          func: (ctx, totalLength, totalHeight) => {
            drawObj.doDrawList();
          },
          x: this.totalLength
        }
      );

      //add plus under specific conditions
      if (u < products.length - 1 || this.drawExtraPlus) {
        this.drawList.push(
          {
            func: (ctx, totalLength, totalHeight) => {
              this.drawPlus(totalLength, totalHeight, this.ctx);
            },
            x: this.totalLength
          }
        );
        this.totalLength += 30;
      }

      //add height
      if (dims && dims[1] > this.totalHeight) {
        this.totalHeight = dims[1];
      }
    }

    //return dimensions for resizing canvas
    return [this.totalLength, this.totalHeight];
  }

  //execute all functions in draw list
  doDrawList() {
    let ctx = this.ctx;
    let drawList = this.drawList;
    let len = drawList.length;
    for (let u = 0; u < len; u++) {
      let elm = drawList[u];
      elm.func(ctx, elm.x, this.totalHeight);
    }
  }
}

//to see contents of matrix
function prettyPrintMatrix(mat) {
  function helper(x) {
    return ((x === 0) ? 0: 1);
  }
  for (let i = 0; i < mat.length; i++) {
    mat[i] = mat[i].map(helper);
  }
  let output = "";
  for (let i = 0; i < mat.length; i++) {
    output += mat[i].toString() + "\n";
  }
  return output;
}

//convert Uint8ClampedArray to matrix of pixle alpha values
function RGBAtoImageMat(arr, width) {
  let output = [];
  //filter every fourth element because only interested in alpha
  let alphaOnly = arr.filter((element, index) => {
    return (index + 1) % 4 === 0;
  });
  //correct array dimensions
  for (let i = 0; i + width <= alphaOnly.length; i += width) {
    output.push(alphaOnly.slice(i, i + width));
  }
  return output;
}

//get color of single pixle on ctx
window.pixleAlpha = function pixleAlpha(ctx, x, y) {
  return ctx.getImageData(x, y, 1, 1).data[3];
}

//find the size of drawing in ctx
window.getCanvasDimentions = function getCanvasDimentions(ctx, data, maxWidth, maxHeight) {
  let dims = [null, null];
  let numMol = data.numberMolecules;
  let noReacts = data.noReacts;
  //if binary search can be used
  if (numMol == 1 && !noReacts) {
    //find initial furthest visible pixle right with binary search
    let x = maxWidth;
    let y = 1;
    let a = 0;
    let l = 23;
    let r = maxWidth - 1;
    let mid, centerA, lastA;
    while (r >= l) {
      mid = l + Math.floor((r - l) / 2);
      centerA = pixleAlpha(ctx, mid, 1);
      lastA = pixleAlpha(ctx, mid - 1, 1);
      if (centerA == 0 && lastA != 0) {
        break;
      } else if (centerA != 0) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
    x = mid;
    //find absolute furthest visible pixle right
    while (y <= maxHeight) {
      y++;
      a = pixleAlpha(ctx, x, y);
      while (a != 0) {
        x++;
        a = pixleAlpha(ctx, x, y);
      }
    }
    let right;
    right = dims[0] = x;
    //find initial furthest visible pixle down
    x = 1;
    y = maxHeight;
    a = 0;
    while (a == 0 && y >= 0) {
      y--;
      a = pixleAlpha(ctx, x, y);
    }
    y++
    //find absolute furthest visible pixle right
    while (x <= right) {
      x++;
      a = pixleAlpha(ctx, x, y);
      while (a != 0) {
        y++;
        a = pixleAlpha(ctx, x, y);
      }
    }
    dims[1] = y;
    //check if arrow is present
    if (pixleAlpha(ctx, dims[0] + 3, Math.floor(dims[1] / 2)) != 0) {
      dims[0] += 35;
    }
    return dims;
  } else {
    //if binary search cannot be used
    //find initial furthest visible pixle right
    let x = 4500;
    let y = 1;
    let a = 0;
    while (a == 0 && x >= 0) {
      x--;
      a = pixleAlpha(ctx, x, 1);
    }
    x++;
    //find absolute furthest visible pixle right
    while (y <= 250) {
      y++;
      a = pixleAlpha(ctx, x, y);
      while (a != 0) {
        x++;
        a = pixleAlpha(ctx, x, y);
      }
    }
    let right;
    right = dims[0] = x;
    //find initial furthest visible pixle down
    x = 1;
    y = 250;
    a = 0;
    while (a == 0 && y >= 0) {
      y--;
      a = pixleAlpha(ctx, x, y);
    }
    y++
    //find absolute furthest visible pixle right
    while (x <= right) {
      x++;
      a = pixleAlpha(ctx, x, y);
      while (a != 0) {
        y++;
        a = pixleAlpha(ctx, x, y);
      }
    }
    dims[1] = y;
    //check if arrow is present
    y = 1;
    x = dims[0] + 3;
    //could do binary search here, but rn linear search doesn't affect runtime too much
    while (y < dims[1]) {
      if (pixleAlpha(ctx, x, y) != 0) {
        dims[0] += 35;
        break;
      }
      y++;
    }
    return dims;
  }
}
