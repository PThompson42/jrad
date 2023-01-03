/*
JRAD2 - Javascript Rapid App Development
A suite of tools and apps to make building apps easier
Based on JRAD original
Version 0.9.0

1.  Constants and Constant Functions
2.  Application
3. UI
4. UI Items
    4a - buttons
    4b - labels
    4c - input types
    4d - Display - CANVAS and SVG
    4e - Media
    4f- Windows
    4g - Handlers (keys, etc)

5. Random
6. Hex/Bindary
7. Simple Math
8. Statistics
9. Color
10. Point
11. Quadtree
12.  Graphing/Geometry
13. Geography
14. Vectors
15. Coordinate System
16. Text
17. Miscellaneous
*/

//*-------------------------------- 1.Constants and Functions
//const $ to get items by id's
const XMLNS = "http://www.w3.org/2000/svg";
export const $ = (id) =>
    document.getElementById(id) && document.getElementById(id).owner
        ? document.getElementById(id).owner
        : document.getElementById(id);
const body = {
    _id: "body",
    parentID: null,
    bParent: null,
    element: document.body,
};
const EARTH_RADIUS = 3437;
//*--------------------------2. Application & App Objects Base
export class ApplicationData {
    constructor() {
        //this.cat = cat;

        this.EN = 0;
        this.FR = 1;
        this.LANG = this.EN;
    }
    loadLanguageFromStorage() {
        this.LANG = Number(localStorage.getItem("language"));
        if (this.LANG != this.EN && this.LANG != this.FR) {
            this.LANG = this.EN;
            this.saveLanguageToStorage();
        }
    }
    saveLanguageToStorage() {
        localStorage.setItem("language", this.LANG);
    }
    changeLanguage() {
        if (this.LANG == this.EN) this.LANG = this.FR;
        else this.LANG = this.EN;
        this.saveLanguageToStorage();
        //change language of UI items
        AO.UID.forEach((item) => {
            $(item).updateBCaption();
        });
    }
    storeItem(key, value) {
        localStorage.setItem(key, value);
    }
    getStoredItem(key) {
        return localStorage.getItem(key);
    }
    clearLocalStorage() {
        localStorage.clear();
    }
    removeStoredItem(key) {
        localStorage.removeItem(key);
    }
    download(filename, text) {
        let element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(text)
        );
        element.setAttribute("download", filename);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    selectFile(fileCallback, accept = "") {
        this.openFileCallback = fileCallback;
        //bText is true if file to be opened and input as text
        var inputElement = document.createElement("input");
        inputElement.type = "file";
        inputElement.accept = accept; // Note Edge does not support this attribute
        inputElement.addEventListener(
            "change",
            this.fileDialogChanged.bind(this)
        );
        inputElement.dispatchEvent(new MouseEvent("click"));
    }
    fileDialogChanged(event) {
        let fName = event.target.files[0].name;
        let file = event.target.files[0];
        let openF = this.openFileCallback.bind(this);
        //console.log("Added:  " + fName);
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function (event) {
            openF(event.target.result);
        };
        reader.readAsText(file);
    }
    async openFile(url, callback = null) {
        const response = await fetch(url);
        const data = await response.text();
        if (callback) callback(data);
        else return data;
    }
    async loadImage(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        let img = await createImageBitmap(blob);
        //console.log(img);
        let ur = URL.createObjectURL(blob);
        return { img: img, url: ur };
    }
    async openBase64(url) {
        return fetch(url)
            .then((response) => response.blob())
            .then(
                (blob) =>
                    new Promise((callback) => {
                        let reader = new FileReader();
                        reader.onload = function () {
                            callback(this.result);
                        };
                        reader.readAsDataURL(blob);
                    })
            );
    }
}
class AO {
    //*------------------------------Static Props
    static bWindowContainer = false;
    static windowContainerID = "main";
    static UID = [];
    static POSITIONMODE = "absolute";
    static NORMAL = "normal";
    static CENTER = "center";
    static RECTMODE = AO.NORMAL;

    //*------------------------------Static Methods
    static isIDUnique(test) {
        if (AO.UID.indexOf(test) > 0) return false;
        return true;
    }
    static getUniqueID() {
        let items = [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
        ];
        let testID = AO.getRandomID(items);
        while (!AO.isIDUnique(testID)) testID = AO.getRandomID(items);
        return testID;
    }
    static getRandomID(items) {
        let retVal = "u";
        for (let i = 0; i < 4; i++) {
            retVal += items.sort(() => 0.5 - Math.random())[0];
        }
        return retVal;
    }
    //*------------------------------Constructor
    constructor(props) {
        //console.log(props);
        if (arguments.length == 0) {
            props = {
                id: null,
                type: "div",
                parentID: null,
            };
        }
        //console.log(props);
        //ensure id is unique
        if (!props.id) this._id = AO.getUniqueID();
        else {
            let isUnique = AO.isIDUnique(props.id);
            if (isUnique) {
                this._id = props.id;
            } else {
                alert("object id is not unique - generating a unique id");
                this._id = AO.getUniqueID();
            }
        }
        AO.UID.push(this._id);
        this.parentID = props.parentID;
        //create the html or svg element
        if (!props.type) props.type = "div";
        this.type = props.type;
        if (props.bSVG) {
            this.element = document.createElementNS(XMLNS, props.type);
            //console.log(this.element);
        } else {
            this.element = document.createElement(props.type);
        }
        //assign the parent
        this.assignParent(props.parentID);
        //assign element properties
        this.element.id = this.id;
        this.element.owner = this;
        //Fill out properties
        this._visible = true;
        this.applyPositioning(AO.POSITIONMODE);
        this._x = 0;
        this._y = 0;
        this._z = 1;
        this._w = 0;
        this._h = 0;
        this.bBilingual = false;
        this.bFixedWidth = false;
        this.bFixedHeight = false;
        this._action = null;
        this.element.style["box-sizing"] = "border-box";
        this.hideOverflow();
    }
    //*---------------------------  Parent & Child
    removeElement() {
        if (this.bParent) this.parent.element.removeChild(this.element);
        else document.body.removeChild(this.element);
    }
    getChildren() {
        return this.element.children;
    }
    assignParent(pID) {
        if (!pID) {
            //console.log("assignParent: " + pID);
            //if no parent ID was given:
            if (AO.bWindowContainer) {
                this.attachToParent(AO.windowContainerID);
            } else {
                this.attachToBody();
            }
            return;
        }
        let pr = $(pID);
        if (!pr) {
            if (AO.bWindowContainer) {
                alert("parent id does not exist.  attaching to main");
                this.attachToParent(AO.windowContainerID);
            } else {
                alert("parent id does not exist.  attaching to body");
                this.attachToBody();
            }
            return;
        }
        //we have a parent
        this.attachToParent(pID);
    }
    attachToBody() {
        this.bParent = false;
        this.parent = body;
        document.body.appendChild(this.element);
        this.parent[this._id] = this;
        this.parentID = this.parent._id;
    }
    attachToParent(pID) {
        //console.log(pID);
        let pr = $(pID);
        this.bParent = true;
        this.parent = pr;
        this.parent.element.appendChild(this.element);
        this.parent[this._id] = this;
        this.parentID = this.parent._id;
    }
    changeParent(newParentID) {
        this.removeElement();
        this.assignParent(newParentID);
    }
    //*---------------------------  ID
    assignID(id) {
        this._id = id;
        return this;
    }
    get id() {
        return this._id;
    }
    //*---------------------------  Value
    set value(val) {
        this.element.value = val;
        return this;
    }
    get value() {
        return this.element.value;
    }
    //*---------------------------  Class & Style
    addClass(className) {
        this.element.classList.add(className);
        this.className = className; //used if only one and want to swap
        return this;
    }
    removeClass(className) {
        this.element.classList.remove(className);
        return this;
    }
    changeClass(newName) {
        if (this.className) {
            this.removeClass(this.className);
        }
        this.addClass(newName);
        return this;
    }
    applyStyle(styleAction, value) {
        this.element.style[styleAction] = value;
        return this;
    }
    //*---------------------------  Dragging
    get draggable() {
        return this.element.draggable;
    }
    set draggable(val) {
        this.element.draggable = val;
        return this;
    }
    setDraggable(val) {
        this.draggable = val;
        return this;
    }
    //*---------------------------  Position and Vis
    applyPositioning(p) {
        this.applyStyle("position", p);
    }
    set z(val) {
        this._z = val;
        this.applyStyle("zIndex", val);
        return this;
    }
    get z() {
        return this._z;
    }
    setX(val) {
        this._x = val;
        this.applyStyle("left", val + "px");
        return this;
    }
    get x() {
        return this._x;
    }
    setY(val) {
        this._y = val;
        this.applyStyle("top", val + "px");
        return this;
    }
    get y() {
        return this._y;
    }
    fixLocation(x, y) {
        this.setX(x);
        this.setY(y);
        return this;
    }
    moveTo(x, y) {
        this.fixPosition(x, y);
        return this;
    }
    hide() {
        this.visible = false;
        return this;
    }
    show() {
        this.visible = true;
        return this;
    }
    set visible(b) {
        if (b) {
            this._visible = true;
            this.applyStyle("display", "block");
        } else {
            this._visible = false;
            this.applyStyle("display", "none");
        }
    }
    get visible() {
        return this._visible;
    }
    setOpacity(val) {
        this.applyStyle("opacity", val);
    }
    //*---------------------------  Size
    setWidth(val) {
        this._w = val;
        this.applyStyle("width", val + "px");
        this.bFixedWidth = true;
        return this;
    }
    get w() {
        return this._w;
    }
    set w(val) {
        this._w = val;
    }
    setHeight(val) {
        this._h = val;
        this.applyStyle("height", val + "px");
        this.bFixedHeight = true;
        return this;
    }
    set h(val) {
        this._h = val;
    }
    get h() {
        return this._h;
    }
    fixSize(w, h) {
        this.setWidth(w);
        this.setHeight(h);
        return this;
    }
    relativeWidth(val) {
        this.applyStyle("width", val + "%");
        this.bFixedWidth = false;
        return this;
    }
    relativeHeight(val) {
        this.applyStyle("height", val + "%");
        this.bFixedWidth = false;
        return this;
    }
    relativeSize(w, h) {
        this.relativeWidth(w);
        this.relativeHeight(h);
        return this;
    }
    getWidth() {
        if (this.bFixedWidth) return this.w;
        else return this.element.offsetWidth;
    }
    getHeight() {
        if (this.bFixedHeight) return this.h;
        else return this.element.offsetHeight;
    }
    //*---------------------------  Alignment
    centerH() {
        let x = (this.parent.getWidth() - this.getWidth()) / 2;
        this.setX(x);
        return this;
    }
    centerV() {
        let y = (this.parent.getHeight() - this.getHeight()) / 2;
        this.setY(y);
        return this;
    }
    center() {
        this.centerH();
        this.centerV();
        return this;
    }

    //*---------------------------  Action, new Properties
    addAction(val) {
        this._action = val;
        return this;
    }
    get action() {
        return this._action;
    }
    addProperty(prop, val) {
        this[prop] = val;
        return this;
    }
    //*---------------------------  Overflow
    hideOverflow() {
        this.applyStyle("overflow", "hidden");
        return this;
    }
    autoOverflow() {
        this.applyStyle("overflow", "auto");
        return this;
    }
    autoOverflowY() {
        this.applyStyle("overflow-y", "auto");
        return this;
    }
    //*---------------------------  Text
    setBCaption(textEn, textFr) {
        this.bBilingual = true;
        this.captionEn = textEn;
        this.captionFr = textFr;
        this.updateBCaption();
        return this;
    }
    updateBCaption() {
        if (!this.bBilingual) return;
        if (LANG == EN) this.updateText(this.captionEn);
        else this.updateText(this.captionFr);
        return this;
    }
    updateText(text) {
        if (this.type == "input") this.value = text;
        else this.element.innerHTML = text;
        return this;
    }
    updateCaption(text) {
        this.updateText(text);
        return this;
    }
    clearText() {
        this.updateText("");
        return this;
    }
    clearCaption() {
        this.clearText();
        return this;
    }
    get text() {
        if (this.type == "input") return this.value;
        else return this.element.innerHTML;
    }
    get caption() {
        if (this.type == "input") return this.value;
        else return this.element.innerHTML;
    }
    fontSize(sz) {
        this.applyStyle("fontSize", String(sz) + "px");
        return this;
    }
    fontColor(color) {
        this.applyStyle("color", processColor(color));
        return this;
    }
    bold() {
        this.applyStyle("fontWeight", "bold");
        return this;
    }
    fontNormal() {
        this.applyStyle("fontWeight", "normal");
        return this;
    }
    italics() {
        this.applyStyle("fontStyle", "italic");
        return this;
    }
    alignRight() {
        this.applyStyle("textAlign", "right");
        return this;
    }
    alignLeft() {
        this.applyStyle("textAlign", "left");
        return this;
    }
    alignCenter() {
        this.applyStyle("textAlign", "center");
        return this;
    }
    wrap(shouldWrap) {
        if (shouldWrap) {
            this.applyStyle("white-space", "normal");
        } else {
            this.applyStyle("white-space", "nowrap");
        }
        return this;
    }
    //*---------------------------  background color and images
    bgColor() {
        //console.log(...arguments);
        this.applyStyle("backgroundColor", processColor(...arguments));
        return this;
    }
    bgImage(url) {
        this.applyStyle("backgroundImage", "url(" + url + ")");
        return this;
    }
    bgImageFit() {
        this.applyStyle("background-size", "scale-down");
        return this;
    }
    bgImageClear() {
        this.applyStyle("backgroundImage", "none");
        return this;
    }
    bgImageCover() {
        this.applyStyle("background-size", "cover");
        return this;
    }
    bgImageNoRepeat() {
        this.applyStyle("background-repeat", "no-repeat");
        return this;
    }
    bgImageContain() {
        this.applyStyle("background-size", "contain");
        return this;
    }
    bgImageCenter() {
        this.applyStyle("background-position", "center");
        return this;
    }
    //*---------------------------   BORDERS
    borderStandard(sz) {
        this.applyStyle("borderStyle", "solid");
        this.borderWidth(sz);
        this.borderColor("#000000");
        return this;
    }
    borderNone() {
        this.applyStyle("borderStyle", "none");
        return this;
    }
    borderColor() {
        this.applyStyle("borderColor", processColor(...arguments));
        return this;
    }
    borderWidth(sz) {
        this.applyStyle("borderWidth", String(sz) + "px");
        return this;
    }
    borderRadius(sz) {
        this.applyStyle("borderRadius", String(sz) + "px");
        return this;
    }
    borderRadius4(tl, tr, br, bl) {
        this.applyStyle(
            "border-radius",
            tl + "px " + tr + "px " + br + "px " + bl + "px"
        );
        return this;
    }
    borderStyle(style) {
        this.applyStyle("borderStyle", style);
        return this;
    }
    border(top, right, bottom, left) {
        this.applyStyle("borderStyle", "solid");
        this.applyStyle(
            "border-width",
            top + "px " + right + "px " + bottom + "px " + left + "px"
        );
        return this;
    }
    //*---------------------------   Mouse & CURSOR/POINTER
    setPointer(val) {
        this.element.style.cursor = val;
    }
    ignoreMouse() {
        this.applyStyle("pointer-events", "none");
        return this;
    }
    listenMouse() {
        this.applyStyle("pointer-events", "auto");
        return this;
    }
    //*---------------------------   Event Listening
    listenForClicks(callback) {
        this.element.addEventListener(
            "click",
            this.clickCallback.bind(this),
            false
        );
        this.element.addEventListener(
            "contextmenu",
            this.clickCallback.bind(this),
            true
        );
        this.clickHandler = callback;
        return this;
    }
    clickCallback(e) {
        let owner = null;
        if (e.target.owner) {
            owner = e.target.owner;
        }
        //console.log("click");
        e.stopPropagation();
        e.preventDefault();
        // console.log(e);
        // console.log(this.clickHandler);
        this.clickHandler({
            sender: this,
            sender_id: this.id,
            clicktarget: owner,
            action: this.action,
            client: { x: e.clientX, y: e.clientY },
            offset: { x: e.offsetX, y: e.offsetY },
            button: e.button,
        });
    }
    listenForMouseDown(callback) {
        this.element.addEventListener(
            "mousedown",
            this.mouseDownCallback.bind(this),
            false
        );
        this.mouseDownHandler = callback;
        return this;
    }
    mouseDownCallback(e) {
        e.stopPropagation();
        e.preventDefault();
        //console.log(e);
        this.mouseDownHandler({
            sender: this,
            sender_id: this.id,
            action: this.action,
            client: { x: e.clientX, y: e.clientY },
            offset: { x: e.offsetX, y: e.offsetY },
            button: e.button,
        });
    }
    listenForMove(callback) {
        this.element.addEventListener(
            "mousemove",
            this.moveCallback.bind(this),
            false
        );
        this.moveHandler = callback;
        return this;
    }
    moveCallback(e) {
        this.moveHandler({
            sender: this,
            sender_id: this.id,
            action: this.action,
            client: { x: e.clientX, y: e.clientY },
            offset: { x: e.offsetX, y: e.offsetY },
            button: e.button,
        });
    }
    listenForChanges(callback) {
        this.element.addEventListener(
            "change",
            this.changeCallback.bind(this),
            false
        );
        this.changeHandler = callback;
        return this;
    }
    changeCallback(e) {
        this.changeHandler({
            sender: this,
            sender_id: this.id,
            value: this.value,
            action: this.action,
        });
    }
    listenForInput(callback) {
        this.element.addEventListener(
            "input",
            this.inputCallback.bind(this),
            false
        );
        this.inputHandler = callback;
        return this;
    }
    inputCallback(e) {
        this.inputHandler({
            sender: this,
            sender_id: this.id,
            value: this.value,
            action: this.action,
        });
    }
    //dragging - for non draggable things to track
    listenForDragging(callback) {
        this.rMseDown = this.rMouseDown.bind(this);
        this.rMseUp = this.rMouseUp.bind(this);
        this.rMseMove = this.rMouseMove.bind(this);
        this.element.addEventListener("mousedown", this.rMseDown);
        this.dragCallback = callback;
    }
    rMouseDown(e) {
        this.element.addEventListener("mouseup", this.rMseUp);
        this.element.addEventListener("mouseout", this.rMseUp);
        this.element.addEventListener("mousemove", this.rMseMove);
        this.lastClickPos = new Point(e.clientX, e.clientY);
    }
    rMouseUp(e) {
        this.element.removeEventListener("mouseup", this.rMseUp);
        this.element.removeEventListener("mouseout", this.rMseUp);
        this.element.removeEventListener("mousemove", this.rMseMove);
    }
    rMouseMove(e) {
        this.dragCallback({
            x: e.clientX - this.lastClickPos.x,
            y: e.clientY - this.lastClickPos.y,
            event: e,
        });
        this.lastClickPos.update(e.clientX, e.clientY);
    }
    //DRAGGING AND DROPPING
    enableDragTracking(startCallback, endCallback) {
        this.element.addEventListener(
            "dragstart",
            this.handleDragStart.bind(this)
        );
        this.element.addEventListener("dragend", this.handleDragEnd.bind(this));

        this.dragStartCallback = startCallback;
        this.dragEndCallback = endCallback;

        // this.element.addEventListener("drop", this.handleDrop.bind(this));
        // this.dropCallack = dropCallback;

        return this;
    }
    enableDropTracking(dropCallback, dragOverClass = "over") {
        this.element.addEventListener(
            "dragover",
            this.handleDragOver.bind(this)
        );
        this.element.addEventListener(
            "dragenter",
            this.handleDragEnter.bind(this)
        );
        this.element.addEventListener(
            "dragleave",
            this.handleDragLeave.bind(this)
        );
        this.element.addEventListener("drop", this.handleDrop.bind(this));
        this.dropCallback = dropCallback;

        this.dragOverClass = dragOverClass;

        return this;
    }
    handleDragStart(e) {
        let details = {
            note: "dragstart",
            draggedItemID: this.id,
            draggedItemSize: { w: this.w, h: this.h },
            draggedItemOffset: { x: e.offsetX, y: e.offsetY },
            action: this.action,
        };
        e.dataTransfer.setData("text/plain", JSON.stringify(details));
        this.dragStartCallback(details);
    }
    handleDragEnd(e) {
        let details = {
            note: "dragend",
            draggedItemID: this.id,
        };
        this.dragEndCallback(details);
    }
    handleDrop(e) {
        let draggedItemDetails = JSON.parse(
            e.dataTransfer.getData("text/plain")
        );
        let details = {
            note: "drop",
            e: e,
            offset: { x: e.offsetX, y: e.offsetY },
            draggedItemDetails: draggedItemDetails,
            src: this.id,
            action: this.action,
        };
        this.dropCallback(details);
        this.element.classList.remove(this.dragOverClass);
        return this;
    }
    handleDragOver(e) {
        //console.log("handleDragOver");
        e.preventDefault();
        return false;
    }
    handleDragEnter(e) {
        //console.log("handleDragEnter");
        this.element.classList.add(this.dragOverClass);
    }
    handleDragLeave(e) {
        //console.log("handleDragLeave");
        this.element.classList.remove(this.dragOverClass);
    }
    //*---------------------------   Other
    setRequired() {
        this.element.setAttribute("required", "");
        this.element.required = true;
    }
}
export class ApplicationColors {
    constructor() {
        this.WHITE = "#ffffff";
        this.BLACK = "#000000";

        this.BLACKISH = "#202020";
        this.DARKGREY = "#3f3f3f";
        this.MEDIUMGREY = "#707070";
        this.EGGYELLOW = "#FFDF6C";

        //nav color constants
        this.NLIGHTBLUE = "#00a6dc";
        this.NLIGHTBLUE2 = "#64c3e8";
        this.NLIGHTBLUE3 = "#b1ddf2";
        this.NMEDIUMBLUE = "#006eb0";
        this.NMEDIUMBLUE2 = "#6798ca";
        this.NMEDIUMBLUE3 = "#abc2e1";
        this.NDARKBLUE = "#00529c";
        this.NDARKBLUE2 = "#6781ba";
        this.NDARKBLUE3 = "#a8b4d8";
        this.NLIGHTGREY = "#999fa8";
        this.NLIGHTGREY2 = "#bdc1c9";
        this.NLIGHTGREY3 = "#dadce1";
        this.NDARKGREY = "#474d56";
        this.NDARKGREY2 = "#888d97";
        this.NDARKGREY3 = "#bdc1c9";
        this.NTEAL = "#1faa92";
        this.NTEAL2 = "#86c6b7";
        this.NTEAL3 = "#bfdfd7";
        this.NGREEN = "#7bc466";
        this.NGREEN2 = "#b0d89f";
        this.NGREEN3 = "#d5eacc";
        this.NYELLOW = "#fcb334";
        this.NYELLOW2 = "#ffd086";
        this.NYELLOW3 = "#ffe5be";
        this.NORANGE = "#f4793b";
        this.NORANGE2 = "#f9ab7f";
        this.NORANGE3 = "#fdd2b8";
        this.NRED = "#ed1c24";
        this.NRED2 = "#f58466";
        this.NRED3 = "#fbbea7";
        this.NPINK = "#d6186e";
        this.NPINK2 = "#e382a7";
        this.NPINK3 = "#eebcc8";
        this.NPURPLE = "#715da3";
        this.NPURPLE2 = "#9e8fc0";
        this.NPURPLE3 = "#c7bfdc";
    }
}
//*----------------------------------------------- 3. UI
export class UIContainer extends AO {
    constructor() {
        let props = {
            id: AO.windowContainerID,
            type: "div",
            bSVG: false,
        };
        super(props);
        AO.bWindowContainer = true;
        this.hideOverflow();
        this.fixLocation(0, 0);
        this.relativeSize(100, 100);
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.resizeHandler = null;
        this.anim = {
            bEnabled: false,
            fps: 60,
            bLimitFramerate: false,
            oldTime: 0,
            nowTime: 0,
            timeGap: 0,
            bRunning: false,
            id: null,
            animFunction: this.animRender.bind(this),
        };

        //listen for size/orientation changes
        window.addEventListener("resize", this.onResizeEvent.bind(this), true);
        window.addEventListener(
            "orientationchange",
            this.onResizeEvent.bind(this),
            true
        );
    }
    onResizeEvent(e) {
        this.w = this.getWidth();
        this.h = this.getHeight();

        if (this.resizeHandler) {
            this.resizeHandler(this.w, this.h);
        } else {
            console.log(
                "Resize Event:  no resize handler.  Subclass UIContainer or setResizeHandler(callback)"
            );
        }
    }
    setResizeHandler(callback) {
        this.resizeHandler = callback;
        return this;
    }
    goFullScreen() {
        var elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            /* IE11 */
            elem.msRequestFullscreen();
        }
    }
    enableAnimation(callback) {
        this.anim.bEnabled = true;
        this.anim.callback = callback;
    }
    setFrameRate(fps) {
        this.anim.fps = fps;
        this.bLimitFramerate = true;
    }
    animStart() {
        if (this.anim.bRunning) return;
        this.anim.bRunning = true;
        this.anim.nowTime = new Date().getTime();
        this.anim.id = requestAnimationFrame(this.anim.animFunction);
    }
    animStop() {
        this.anim.bRunning = false;
        cancelAnimationFrame(this.anim.id);
        this.anim.id = null;
    }
    animRender() {
        if (!this.anim.bRunning) {
            cancelAnimationFrame(this.anim.id);
            this.anim.id = null;
            return;
        }
        this.anim.id = requestAnimationFrame(this.anim.animFunction);

        this.anim.nowTime = new Date().getTime();
        this.anim.timeGap = this.anim.nowTime - this.anim.oldTime; //milliseconds
        //console.log(this.anim.timeGap);
        if (this.bLimitFramerate && this.anim.timeGap < 1000 / this.anim.fps)
            return;
        this.anim.callback(this.anim.timeGap);
        this.anim.oldTime = this.anim.nowTime;
    }
    frameRate() {
        return Math.floor(1000 / this.anim.timeGap);
    }
}
export class Div extends AO {
    constructor(id, parentID = null) {
        //console.log(id, parentID);
        super({ id: id, parentID: parentID });
    }
}
export class Container extends AO {
    constructor(id, parentID = null) {
        //console.log(id, parentID);
        super({ id: id, parentID: parentID });
    }
    addLabel(id, caption) {
        let l = new Label(id, caption, this.id);
        return l;
    }
    addBasicButton(id, caption) {
        let b = new BasicButton(id, caption, this.id);
        return b;
    }
    addSlider(id, min, max, step, value) {
        let s = new Slider(id, min, max, step, value, this.id);
        return s;
    }
    addCheckbox(id) {
        let c = new Checkbox(id, this.id);
        return c;
    }
    addStackManager(id, masterWidth) {
        new StackManager(id, masterWidth, this.id);
    }
}
export class Form extends AO {
    constructor(id, parentID = null) {
        super({ id: id, parentID: parentID, type: "form" });
    }
}
//*---------------------------------------------- 4.UI Items
//--------------------  4a. BUTTONS
export class BasicButton extends AO {
    constructor(id, caption, parentID = null) {
        super({ id: id, parentID: parentID, type: "button" });
        this.updateCaption(caption);
    }
}
export class HoldButton extends AO {
    constructor(id, actionName, delta, callback, caption, parentID) {
        super({ id: id, parentID: parentID, type: "button" });
        this.callback = callback;
        this.delta = delta;
        this.actionName = actionName;
        this.updateCaption(caption);
        this.bPressed = false;
        this.element.addEventListener(
            "mousedown",
            this.buttonDown.bind(this),
            false
        );
        this.fButtonEnd = this.buttonEnd.bind(this);
        this.fTimerTick = this.timerTick.bind(this);
        this._timerInterval = 125;
    }
    buttonDown(e) {
        this.bPressed = true;
        this.element.addEventListener("mouseup", this.fButtonEnd, false);
        this.element.addEventListener("mouseleave", this.fButtonEnd, false);
        this.timer = setInterval(this.fTimerTick, this._timerInterval);
        this.actionCallback();
    }
    buttonEnd(e) {
        this.bPressed = false;
        window.clearInterval(this.timer);
        this.timer = null;
        this.element.removeEventListener("mouseup", this.fButtonEnd, false);
        this.element.removeEventListener("mouseleave", this.fButtonEnd, false);
    }
    timerTick(e) {
        this.actionCallback();
    }
    assignDataName(dName) {
        this.dataName = dName;
        return this;
    }
    changeDelta(delta) {
        this.delta = delta;
    }
    changeInterval(inc) {
        this._timerInterval = inc;
    }
    actionCallback() {
        this.callback({
            sender: this,
            actionType: this.actionName,
            value: this.delta,
        });
    }
}
export class ToggleButton extends AO {
    constructor(id, className, captionOff, actionName, parentID) {
        super({ id: id, parentID: parentID, type: "button" });
        this.updateCaption(captionOff);
        this.classNameOff = className;
        this.classNameOn = className + "-on";
        this.captionOff = captionOff;
        this.captionOn = null;
        this.bOn = false;
        this.addClass(this.classNameOff);
        this.listenForClicks(this.toggle.bind(this));
        this.notificationCallback = null;
        this.addAction(actionName);
        return this;
    }
    getState() {
        return this.bOn;
    }
    addCaptionOn(text) {
        this.captionOn = text;
        return this;
    }
    listenForToggle(callback) {
        this.notificationCallback = callback;
        return this;
    }
    toggleOn() {
        this.bOn = true;
        this.changeClass(this.classNameOn);
        if (this.captionOn) this.updateCaption(this.captionOn);
        return this;
    }
    toggleOff() {
        this.bOn = false;
        this.changeClass(this.classNameOff);
        if (this.captionOn) this.updateCaption(this.captionOff);
        return this;
    }
    toggle() {
        if (this.bOn) this.toggleOff();
        else this.toggleOn();
        if (this.notificationCallback != null) {
            this.notificationCallback({
                sender: this,
                action: this.action,
                state: this.bOn,
            });
        }
    }
}
export class SpinButton extends AO {
    constructor(
        id,
        loval,
        hival,
        increment,
        startval,
        actionName,
        changeCallback,
        parentID = null
    ) {
        super({ id: id, parentID: parentID });
        //console.log(this.id);
        this.label = new Label(
            "lbl_" + this.id,
            startval,
            this.id
        ).alignCenter();
        this.loval = loval;
        this.hival = hival;
        this.increment = increment;
        this.value = startval;
        this.changeCallback = changeCallback;
        this.addAction(actionName);
        this.btnUp = new HoldButton(
            "btnUp" + this.id,
            "up",
            increment,
            this.chgHandler.bind(this),
            "+",
            this.id
        );
        this.btnDown = new HoldButton(
            "btnDn" + this.id,
            "down",
            -increment,
            this.chgHandler.bind(this),
            "-",
            this.id
        );
        this.lblFontSize = 14;
        this.btnFontSize = 13;
        this.fixSize(90, 22);
        return this;
    }
    fixSize(w, h) {
        super.fixSize(w, h);
        this.btnDown.fixSize(h, h).fixLocation(0, 0).fontSize(this.btnFontSize);
        this.btnUp
            .fixSize(h, h)
            .fixLocation(w - h, 0)
            .fontSize(this.btnFontSize);
        this.label
            .fixLocation(h, 0)
            .fixSize(w - 2 * h, h)
            .fontSize(this.lblFontSize);
        return this;
    }
    setLabelFontSize(sz) {
        this.lblFontSize = sz;
        this.fixSize();
        return this;
    }
    setButtonFontSize(sz) {
        this.btnFontSize = sz;
        this.fixSize();
        return this;
    }
    chgHandler(details) {
        if (details.actionType == "down") this.value -= this.increment;
        else if (details.actionType == "up") this.value += this.increment;
        if (this.value < this.loval) this.value = this.loval;
        if (this.value > this.hival) this.value = this.hival;
        this.label.updateCaption(this.value);
        this.changeCallback({
            sender: this,
            senderID: this.id,
            action: this.action,
            value: this.value,
        });
    }
    setLabelClass(cls) {
        this.label.addClass(cls);
        return this;
    }
    setButtonClass(cls) {
        this.btnUp.addClass(cls);
        this.btnDown.addClass(cls);
        return this;
    }
}
//---------------------------------- 4b. LABELS
export class Label extends AO {
    constructor(id, caption, parentID = null) {
        super({ id: id, parentID: parentID, type: "label" });
        this.updateCaption(caption);
    }
    labelFor(targetID) {
        this.element.htmlFor = targetID;
        return this;
    }
}
//---------------------------------- 4c.  INPUT types
export class TextInput extends AO {
    constructor(id, caption, parentID = null) {
        super({ id: id, parentID: parentID, type: "input" });
        this.element.type = "text";
        this.updateCaption(caption);
    }
}
export class NumberInput extends AO {
    constructor(id, parentID = null) {
        super({ id: id, parentID: parentID, type: "input" });
        this.element.type = "number";
    }
    setParms(min, max, step) {
        this.element.min = min;
        this.element.max = max;
        this.element.step = step;
        return this;
    }
}
export class PasswordInput extends AO {
    constructor(id, caption, parentID = null) {
        super({ id: id, parentID: parentID, type: "input" });
        this.element.type = "password";
        this.updateCaption(caption);
        return this;
    }
}
export class DateInput extends AO {
    constructor(id, parentID = null) {
        super({ id: id, parentID: parentID, type: "input" });
        this.element.type = "date";
    }
}
export class ColorInput extends AO {
    constructor(id, parentID, color) {
        super({ id: id, parentID: parentID, type: "input" });
        this.element.type = "color";
        this.value = color;
    }
}
export class Slider extends AO {
    constructor(id, min, max, step, value, parentID = null) {
        super({ id: id, parentID: parentID, type: "input" });
        this.element.type = "range";

        this.setRange(min, max, step);
        this.value = value;
        this.applyStyle("cursor", "ew-resize");
    }
    setRange(min, max, step) {
        this.element.min = min;
        this.element.max = max;
        this.element.step = step;
    }
}
export class Checkbox extends AO {
    constructor(id, parentID = null) {
        super({ id: id, parentID: parentID, type: "input" });
        this.element.type = "checkbox";
    }
    check() {
        this.element.checked = true;
        return this;
    }
    uncheck() {
        this.element.checked = false;
        return this;
    }
    isChecked() {
        return this.element.checked;
    }
}
//--------------------------  4d.  Display and animation items
export class Canvas extends AO {
    constructor(id, parentID, willReadFrequently = false) {
        super({ id: id, parentID: parentID, type: "canvas" });
        if (willReadFrequently) {
            this.ctx = this.element.getContext("2d", {
                willReadFrequently: true,
            });
        } else {
            this.ctx = this.element.getContext("2d");
        }

        //console.log("Resize canvas elements with resize(w,h) command only");
        this.lineWeight = 1;
        this.font = "Arial";
        this.w = this.element.width;
        this.h = this.element.height;
    }
    resize(w, h) {
        this.w = w;
        this.h = h;
        this.element.width = w;
        this.element.height = h;
        this.weight = this.lineWeight;
        return this;
    }
    //-------------translation
    translate(x, y) {
        this.ctx.translate(x, y);
    }
    rotateDegrees(amt) {
        this.rotateRadians(DTOR(amt));
    }
    rotateRadians(amt) {
        this.ctx.rotate(amt);
    }
    restore() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    //*------------------
    fillStyle() {
        this.ctx.fillStyle = processColor(...arguments);
        return this;
    }
    strokeStyle() {
        this.ctx.strokeStyle = processColor(...arguments);
        return this;
    }
    fill() {
        this.ctx.fill();
    }
    stroke() {
        this.ctx.stroke();
    }
    beginPath() {
        this.ctx.beginPath();
    }
    set weight(wt) {
        this.lineWeight = wt;
        this.ctx.lineWidth = wt;
        return this;
    }
    get weight() {
        return this.ctx.lineWidth;
    }
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
        return this;
    }
    fillCanvas() {
        //console.log(color, this.w, this.h);
        this.fillStyle(processColor(...arguments));
        this.ctx.fillRect(0, 0, this.w, this.h);
        return this;
    }
    moveTo(x, y) {
        this.ctx.moveTo(x, y);
    }
    lineTo(x, y) {
        this.ctx.lineTo(x, y);
    }
    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
        this.ctx.stroke();
    }
    drawLinePoints(p1, p2) {
        this.drawLine(p1.x, p1.y, p2.x, p2.y);
    }
    circle(center, radius, bFill = false) {
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        //console.log(center.x, center.y, radius, 0, 2*Math.PI);
        this.ctx.stroke();
        if (bFill) {
            this.ctx.fill();
        }
        this.ctx.closePath();
    }
    circlexy(x, y, radius, bFill = false) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        //console.log(center.x, center.y, radius, 0, 2*Math.PI);
        this.ctx.stroke();
        if (bFill) {
            this.ctx.fill();
        }
        this.ctx.closePath();
    }
    rectangle(x, y, w, h, bFill = false) {
        //console.log("here");
        this.ctx.beginPath();
        if (AO.RECTMODE == AO.CENTER) this.ctx.rect(x - w / 2, y - h / 2, w, h);
        else this.ctx.rect(x, y, w, h);
        this.ctx.stroke();
        if (bFill) {
            this.ctx.fill();
        }
    }
    point(x, y) {
        this.circle({ x: x, y: y }, 1, true);
    }
    triangle(x1, y1, x2, y2, x3, y3, bFill = false) {
        let pts = [new Point(x1, y1), new Point(x2, y2), new Point(x3, y3)];

        this.drawClosedPoly(pts, bFill);
    }
    drawClosedPoly(aPoints, bFill = false) {
        this.ctx.beginPath();
        this.moveTo(aPoints[0].x, aPoints[0].y);
        for (let i = 1; i < aPoints.length; i++) {
            this.lineTo(aPoints[i].x, aPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        if (bFill) this.ctx.fill();
    }
    drawPath(aPoints) {
        if (!aPoints.length) return;
        this.ctx.beginPath();
        this.moveTo(aPoints[0].x, aPoints[0].y);
        for (let i = 1; i < aPoints.length; i++) {
            this.lineTo(aPoints[i].x, aPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }
    drawOpenPath(aPoints) {
        if (!aPoints.length) return;
        //console.log(aPoints);
        this.ctx.beginPath();
        this.moveTo(aPoints[0].x, aPoints[0].y);
        for (let i = 1; i < aPoints.length; i++) {
            this.lineTo(aPoints[i].x, aPoints[i].y);
            //console.log(aPoints[i].x, aPoints[i].y);
        }
        this.ctx.stroke();
    }
    changefont(font) {
        this.font = font;
    }
    drawText(txt, size, x, y, bBold = false) {
        let ad = "";
        if (bBold) {
            ad = "bold ";
        }
        this.ctx.font = ad + String(size) + "px " + this.font;

        this.ctx.fillText(txt, x, y);
    }
    getImgAddress() {
        return this.element.toDataURL();
    }
    getFullImageData() {
        return this.ctx.getImageData(0, 0, this.w, this.h);
    }
    getImageData(x, y, width, height) {
        return this.ctx.getImageData(x, y, width, height);
    }
    getPixels() {
        let ret = this.getImageData(0, 0, this.w, this.h);
        this.pixels = ret.data;
        return this.pixels;
    }
    setImageData(pixelArray) {
        this.ctx.putImageData(pixelArray);
    }
    getPixelColorH(x, y) {
        let vals = this.ctx.getImageData(x, y, 1, 1).data;
        return "#" + HEX(vals[0]) + HEX(vals[1]) + HEX(vals[2]) + HEX(vals[3]);
    }
    setPixelColor(x, y, color) {
        this.fillStyle(color);
        this.ctx.fillRect(x, y, 1, 1);
    }
    beginPath() {
        this.ctx.beginPath();
    }
    endPath() {
        this.ctx.closePath();
    }
}
export class Scene3d extends AO {
    //THREE.JS library must be loaded
    //<script src="lib/three.js"></script>
    constructor(id, parentID) {
        super({ id: id, parentID: parentID, type: "canvas" });
        this.ctx = this.element.getContext("webgl");
        this.w = this.element.width;
        this.h = this.element.height;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.element,
            context: this.ctx,
        });
        this.camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
    }
    resize(w, h) {
        this.w = w;
        this.h = h;
        this.element.width = w;
        this.element.height = h;
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        return this;
    }
    updateFrame() {
        this.renderer.render(this.scene, this.camera);
    }
    updateCameraPosition(x, y, z) {
        this.camera.position.set(x, y, z);
        // this.camera.position.x = x;
        // this.camera.position.y = y;
        // this.camera.position.z = z;
    }
    updateCameraLook(x, y, z) {
        this.camera.lookAt(x, y, z);
    }
}
export class SVGContainer extends AO {
    constructor(id, parentID = null) {
        super({ id: id, parentID: parentID, type: "svg", bSVG: true });
        return this;
    }
    clearChildren() {
        while (this.element.lastChild) {
            this.element.removeChild(this.element.lastChild);
        }
    }
}
export class SVGObject extends AO {
    constructor(id, parentID, svgType) {
        super({ id: id, parentID: parentID, type: svgType, bSVG: true });
        this.loc = new Point();
        return this;
    }
    fillColor(color) {
        this.element.style.fill = color;
        return this;
    }
    strokeColor(color) {
        this.element.style.stroke = color;
        return this;
    }
    strokeWidth(w) {
        this.element.style.strokeWidth = w;
        return this;
    }
}
export class svgPath extends SVGObject {
    constructor(id, parentID, data) {
        super(id, parentID, "path");
        //this.element.d = data;
        this.element.setAttribute("d", data);
        return this;
    }

    setViewbox(x, y, w, h) {
        console.log(`${x} ${y} ${w} ${h}`);
        this.element.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
        return this;
    }
    locate(p, yC = null) {
        let pt = new Point();
        if (!yC) {
            pt.x = p.x;
            pt.y = p.y;
        } else {
            pt.x = p;
            pt.y = yC;
        }
        this.loc = pt;
        this.element.style.x = pt.x;
        this.element.style.y = pt.y;
        return this;
    }
}
export class svgCircle extends SVGObject {
    constructor(id, parentID) {
        super(id, parentID, "circle");
        this.setRadius(30);
        return this;
    }
    setRadius(r) {
        this.element.style.r = r;
        return this;
    }
    locate(p, yC = null) {
        let pt = new Point();
        if (!yC) {
            pt.x = p.x;
            pt.y = p.y;
        } else {
            pt.x = p;
            pt.y = yC;
        }
        this.loc = pt;
        this.element.style.cx = pt.x;
        this.element.style.cy = pt.y;
        return this;
    }
}
export class svgRectangle extends SVGObject {
    constructor(id, parentID) {
        super(id, parentID, "rect");
        this.setSize(60, 30);
    }
    setSize(w, h) {
        this.element.style.width = w;
        this.element.style.height = h;
        return this;
    }
    locate(p, yC) {
        let pt = new Point();
        if (!yC) {
            pt.x = p.x;
            pt.y = p.y;
        } else {
            pt.x = p;
            pt.y = yC;
        }
        this.loc = pt;
        this.element.style.x = pt.x;
        this.element.style.y = pt.y;
        if (AO.RECTMODE == AO.CENTER) {
            this.element.style.x = pt.x - this.element.style.width / 2;
            this.element.style.y = pt.y - this.element.style.height / 2;
        }
        return this;
    }
}
export class svgPolygon extends SVGObject {
    constructor(id, parentID) {
        super(id, parentID, "polygon");
        this.points = this.element.point;
        this.containerID = this.parent.element;
    }
    addPoint() {
        this.points.appendItem(this.containerID.createSVGPoint());
    }
    update(num, x, y) {
        this.points[num].x = x;
        this.point[num].y = y;
    }
}
export class Image extends AO {
    constructor(id, parentID, src) {
        super({ id: id, parentID: parentID, type: "img" });
        this.src = src;
    }
    set src(url) {
        this.element.src = url;
    }
}
//---------------------------------- 4e.  MEDIA
export class Video extends AO {
    constructor(id, parentID = null) {
        super({ id: id, parentID: parentID, type: "video" });
        this.borderWidth(0);
        return this;
    }
    enableWebcam(callback) {
        this.mediaDevices = navigator.mediaDevices;
        this.mediaDevices
            .getUserMedia({
                video: true,
            })
            .then((stream) => {
                // Changing the source of video to current stream.
                //this.video.setSource(stream, '');
                this.element.srcObject = stream;
                this.element.addEventListener("loadedmetadata", () => {
                    this.play();
                    if (callback) callback();
                });
            })
            .catch(alert);

        return this;
    }
    getElement() {
        return this.element;
    }
    setSource(src, type) {
        this.element.src = src;
        this.element.type = type;
        return this;
    }
    play() {
        this.element.play();
        return this;
    }
    pause() {
        this.element.pause();
        return this;
    }
    resize(w, h) {
        this.element.width = w;
        this.element.height = h;
        return this;
    }
    toggleControls() {
        this.element.controls = !this.element.controls;
    }
    unload() {
        this.pause();
        this.element.src = "";
        this.element.type = "";
        this.element.load();
    }
    getDuration() {
        return this.element.duration;
    }
    getCurrentTime() {
        return this.element.currentTime;
    }
    setCurrentTime(amt) {
        this.element.currentTime = amt;
    }
    incrementCurrentTime(amt) {
        this.element.currentTime += amt;
    }
    setVolume(amt) {
        this.element.volume = amt;
    }
    setPlaybackSpeed(amt) {
        this.element.playbackRate = amt;
    }
    setEndingCallback(callback) {
        this.element.addEventListener("ended", callback);
    }
}
//---------------------------------- 4f.  Windows

//*---------------------------------- Utility
export class StackManager extends Container {
    constructor(id, masterWidth, parentID = null) {
        super(id, parentID);
        this.panes = [];
        this.masterWidth = masterWidth;
        this.setWidth(this.masterWidth);
        this.paneClosedHeight = 24;
        return this;
    }
    addPane(id, text) {
        let pn = new StackablePane(
            "",
            this.id,
            this.masterWidth,
            text,
            this.panes.length - 1,
            this.paneClosedHeight,
            this.adjust.bind(this)
        );
        this.panes.push(pn);
        this.adjust();
        return pn;
    }
    adjust() {
        let totalH = 0;
        for (let i = 0; i < this.panes.length; i++) {
            this.panes[i].setY(totalH);
            totalH += this.panes[i].h;
        }
        this.setHeight(totalH);
    }
}
export class StackablePane extends AO {
    constructor(
        id,
        parentID,
        w,
        titleText,
        index,
        closedHeight,
        stateChangeCallback
    ) {
        super({ id: id, parentID: parentID });
        this.state = "closed";
        this.addClass("stack-pane");
        this.index = index;
        this.closedHeight = closedHeight;
        this.masterWidth = w;

        this.fixSize(w, closedHeight);
        this.openHeight = closedHeight;
        this.chgButton = new BasicButton("", "+", this.id)
            .fixSize(30, this.closedHeight)
            .fixLocation(w - 34, 0)
            .addClass("stack-pane-chgbutton")
            .listenForClicks(this.changeState.bind(this));
        this.headerLabel = new Label("", titleText, this.id)
            .fixLocation(5, 0)
            .addClass("stack-pane-title")
            .labelFor(this.chgButton.id);
        this.stateChangeCallback = stateChangeCallback;
        this.hideOverflow();
    }
    changeState() {
        if (this.state == "closed") {
            this.setHeight(this.openHeight);
            this.state = "open";
            this.chgButton.updateCaption("-");
        } else {
            this.setHeight(this.closedHeight);
            this.state = "closed";
            this.chgButton.updateCaption("+");
        }
        this.stateChangeCallback();
    }
    isOpen() {
        return this.state == "open";
    }
    setBCaption(textEn, textFr) {
        this.headerLabel.setBCaption(textEn, textFr);
    }
    hideHeaderLabel() {
        this.headerLabel.hide();
    }
    hideToggleButton() {
        this.chgButton.hide();
    }
}
//---------------------------------- 4g - Handlers
export class KeyHandler {
    constructor(callback) {
        this.callback = callback;
        document.addEventListener("keydown", this.handleDown.bind(this));
        document.addEventListener("keyup", this.handleUp.bind(this));
    }
    handleDown(e) {
        if (e.repeat) return;
        let status = {
            action: "Down",
            key: e.key,
            keycode: e.keyCode,
            shift: e.shiftKey,
            alt: e.altKey,
            ctrl: e.ctrlKey,
        };
        this.callback(status);
    }
    handleUp(e) {
        let status = {
            action: "Up",
            key: e.key,
            keycode: e.keyCode,
            shift: e.shiftKey,
            alt: e.altKey,
            ctrl: e.ctrlKey,
        };
        this.callback(status);
    }
}
//*                             UTILITIES & MATH
//*------------------------       5. RANDOM Functions
export function random() {
    return Math.random();
}
export function randomInt(val) {
    return Math.floor(Math.random() * val);
}
export function randomFloat(val) {
    return Math.random() * val;
}
export function getRandomIntegerFrom(a, b) {
    //returns a random between a and b including a and b
    let r = Math.floor(Math.random() * (b + 1 - a));
    return a + r;
}
export function coinflip() {
    if (Math.random() < 0.5) {
        return true;
    } else {
        return false;
    }
}
export function random2d() {
    let v = new Vector(Math.random() - 0.5, Math.random() - 0.5);
    v.normalize();
    return v;
}
export function randomVector() {
    let v = new Vector(randomFloat(2) - 1, randomFloat(2) - 1);
    v.normalize();
    return v;
}
//*------------------------  6.  HEX/BINARY Functions
export const HEX = (x) => {
    x = x.toString(16);
    if (x.length === 3) x = "FF";
    return x.length === 1 ? "0" + x : x;
};
export function Dec2Hex(num, len = 2) {
    let s = num.toString(16);
    //console.log(s);
    while (s.length < len) s = "0" + s;
    return s;
}
export function Hex2Dec(str) {
    return parseInt(str, 16);
}
export function Hex2Bin(hex) {
    return parseInt(hex, 16).toString(2).padStart(8, "0");
}
//*------------------------ 7. SIMPLEMATH Functions
export function isBetween(a, b, testVal) {
    if (testVal < a && testVal < b) return false;
    if (testVal > a && testVal > b) return false;
    return true;
}
export function constrain(val, low, high) {
    if (val < low) return low;
    else if (val > high) return high;
    else return val;
}
export function floor(val) {
    return Math.floor(val);
}
export function ceil(val) {
    return Math.ceil(val);
}
export function round(val) {
    return Math.round(val);
}
export const DTOR = (Degrees) => (Degrees * Math.PI) / 180;
export const RTOD = (Radians) => Radians * (180 / Math.PI);
export const ROUND = (n, numdigits) =>
    Math.round(n * Math.pow(10, numdigits)) / Math.pow(10, numdigits);
//*------------------------ 8. STATISTICS Functions
export function MEAN(data) {
    let total = 0;
    for (let i = 0; i < data.length; i++) {
        total += data[i];
    }
    return total / data.length;
}
export function MSTDEV(data) {
    let mean = MEAN(data);
    let pSum = 0;
    for (let i = 0; i < data.length; i++) {
        pSum += Math.pow(mean - data[i], 2);
    }
    return { mean: mean, stdev: Math.sqrt(pSum / data.length) };
}
//*------------------------ 9. COLOR Functions
export function processColor() {
    //NOTE - alpha must always be a value between 0 and 1
    if (arguments.length == 0) {
        return "#000000";
    } else if (arguments.length == 1) {
        let t = arguments[0];
        if (typeof t == "string") {
            return t;
        } else if (typeof t == "number") {
            let str =
                "rgb(" + String(t) + "," + String(t) + "," + String(t) + ")";
            return str;
        }
    } else if (arguments.length == 2) {
        //console.log(arguments);
        //first argument color, second is alpha
        let t = arguments[0];
        let alpha = Math.floor(arguments[1] * 255);
        if (alpha > 255) {
            console.error(
                "Error in process color - alpha must be between 0 and 1"
            );
            return "#000000";
        }
        if (typeof t == "string") {
            if (t.charAt(0) != "#") {
                console.error(
                    "Error in process color - trying to add alpha to text color"
                );
                return "#000000";
            }
            return t + String(HEX(alpha));
        } else if (typeof t == "number") {
            let str =
                "rgba(" +
                String(t) +
                "," +
                String(t) +
                "," +
                String(t) +
                "," +
                String(arguments[1]) +
                ")";
            return str;
        }
    } else if (arguments.length == 3) {
        let str =
            "rgb(" +
            String(arguments[0]) +
            "," +
            String(arguments[1]) +
            "," +
            String(arguments[2]) +
            ")";
        return str;
    } else if (arguments.length == 4) {
        let str =
            "rgba(" +
            String(arguments[0]) +
            "," +
            String(arguments[1]) +
            "," +
            String(arguments[2]) +
            "," +
            String(arguments[3]) +
            ")";
        return str;
    }
}
export function getMedianColor(color1, color2, lowVal, highVal, actualVal) {
    let ratio = (actualVal - lowVal) / (highVal - lowVal);
    if (actualVal < lowVal) {
        return color1;
    }
    if (actualVal > highVal) {
        return color2;
    }
    color1 = color1.substr(1);
    color2 = color2.substr(1);

    let r = Math.ceil(
        parseInt(color2.substring(0, 2), 16) * ratio +
            parseInt(color1.substring(0, 2), 16) * (1 - ratio)
    );
    let g = Math.ceil(
        parseInt(color2.substring(2, 4), 16) * ratio +
            parseInt(color1.substring(2, 4), 16) * (1 - ratio)
    );
    let b = Math.ceil(
        parseInt(color2.substring(4, 6), 16) * ratio +
            parseInt(color1.substring(4, 6), 16) * (1 - ratio)
    );

    if (Number.isNaN(r)) console.log(ratio, actualVal, color1, color2);
    return "#" + HEX(r) + HEX(g) + HEX(b);
}
//*------------------------10. POINT Functions
export class Point {
    constructor(x, y) {
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : 0;
    }
    update(x, y) {
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : 0;
    }
    copy() {
        return new Point(this.x, this.y);
    }
}
//*------------------------11. QUADTREE Functions
export class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.left = x - w / 2;
        this.right = x + w / 2;
        this.top = y - h / 2;
        this.bottom = y + h / 2;
    }
    contains(point) {
        return (
            this.left <= point.x &&
            point.x <= this.right &&
            this.top <= point.y &&
            point.y <= this.bottom
        );
    }
    intersects(range) {
        return !(
            this.right < range.left ||
            range.right < this.left ||
            this.bottom < range.top ||
            range.bottom < this.top
        );
    }
    subdivide(quadrant) {
        switch (quadrant) {
            case "ne":
                return new Rectangle(
                    this.x + this.w / 4,
                    this.y - this.h / 4,
                    this.w / 2,
                    this.h / 2
                );
            case "nw":
                return new Rectangle(
                    this.x - this.w / 4,
                    this.y - this.h / 4,
                    this.w / 2,
                    this.h / 2
                );
            case "se":
                return new Rectangle(
                    this.x + this.w / 4,
                    this.y + this.h / 4,
                    this.w / 2,
                    this.h / 2
                );
            case "sw":
                return new Rectangle(
                    this.x - this.w / 4,
                    this.y + this.h / 4,
                    this.w / 2,
                    this.h / 2
                );
        }
    }
    xDistanceFrom(point) {
        if (this.left <= point.x && point.x <= this.right) {
            return 0;
        }

        return Math.min(
            Math.abs(point.x - this.left),
            Math.abs(point.x - this.right)
        );
    }
    yDistanceFrom(point) {
        if (this.top <= point.y && point.y <= this.bottom) {
            return 0;
        }

        return Math.min(
            Math.abs(point.y - this.top),
            Math.abs(point.y - this.bottom)
        );
    }
    // Skips Math.sqrt for faster comparisons
    sqDistanceFrom(point) {
        const dx = this.xDistanceFrom(point);
        const dy = this.yDistanceFrom(point);

        return dx * dx + dy * dy;
    }
    // Pythagorus: a^2 = b^2 + c^2
    distanceFrom(point) {
        return Math.sqrt(this.sqDistanceFrom(point));
    }
}
export class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.rSquared = this.r * this.r;
    }

    contains(point) {
        // check if the point is in the circle by checking if the euclidean distance of
        // the point and the center of the circle if smaller or equal to the radius of
        // the circle
        let d = Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
        return d <= this.rSquared;
    }

    intersects(range) {
        let xDist = Math.abs(range.x - this.x);
        let yDist = Math.abs(range.y - this.y);

        // radius of the circle
        let r = this.r;

        let w = range.w / 2;
        let h = range.h / 2;

        let edges = Math.pow(xDist - w, 2) + Math.pow(yDist - h, 2);

        // no intersection
        if (xDist > r + w || yDist > r + h) return false;

        // intersection within the circle
        if (xDist <= w || yDist <= h) return true;

        // intersection on the edge of the circle
        return edges <= this.rSquared;
    }
}
//*------------------------12. GRAPHING/GEOMETRY Functions
export function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Check x and y for overlap
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
        return false;
    }
    return true;
}
export function isPointInPoly(poly, pt) {
    //Algorithm/function from:
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].D.y <= pt.y && pt.y < poly[j].D.y) ||
            (poly[j].D.y <= pt.y && pt.y < poly[i].D.y)) &&
            pt.x <
                ((poly[j].D.x - poly[i].D.x) * (pt.y - poly[i].D.y)) /
                    (poly[j].D.y - poly[i].D.y) +
                    poly[i].D.x &&
            (c = !c);
    return c;
}
export function linesIntersect(p1, p2, q1, q2) {
    // console.log(p1);
    // console.log(p2);
    // console.log(q1);
    // console.log(q2);
    // tester = q2;

    // console.log( p1.x ,p1.y, p2.x, p2.y);

    // console.log(q1.x, q1.y, q2.x, q2.y);
    // console.log('--------------------------');

    //two lines are made up of segments A-B and C-D
    //each must be a 2d vector or point (with .x and .y coords)
    // let x;
    // let y;
    if (p2.x == p1.x) {
        if (q2.x == q1.x) {
            //means we have two vertical lines
            //check if q1.y is between p1.y and p2.y
            if (isBetween(p1.y, p2.y, q1.y)) return true;
            if (isBetween(p1.y, p2.y, q2.y)) return true;
            return false;
        }
        let m2 = (q2.y - q1.y) / (q2.x - q2.x);
        let b2 = q1.y - m2 * q1.x;
        //test where line q crosses the x
        x = p1.x;
        y = m2 * x + b2;
    } else if (q2.x == q1.x) {
        let m1 = (p2.y - p1.y) / (p2.x - p1.x);
        let b1 = p1.y - m1 * p1.x;
        x = q1.x;
        y = m1 * x + b1;
    } else {
        let m1 = (p2.y - p1.y) / (p2.x - p1.x);
        //console.log('m1=' + m1);
        let m2 = (q2.y - q1.y) / (q2.x - q1.x);
        //console.log(q2.y - q1.y);
        //console.log(q2.x - q1.x);
        //console.log('m2=' + m2);

        let b1 = p1.y - m1 * p1.x;
        //console.log('b1='+b1);
        let b2 = q1.y - m2 * q1.x;
        //console.log('b2=' + b2);

        //now have equations of both lines
        //determine the point of intersection if there is one
        //know that y = mx+b so put mx + b = mx + b and solve for x.
        x = (b2 - b1) / (m1 - m2);
        y = m1 * x + b1;
    }

    //now determine if x,y is on both line segments
    if (x < p1.x && x < p2.x) return false;
    if (x > p1.x && x > p2.x) return false;
    if (x < q1.x && x < q2.x) return false;
    if (x > q1.x && x > q2.x) return false;

    if (y < p1.y && y < p2.y) return false;
    if (y > p1.y && y > p2.y) return false;
    if (y < q1.y && y < q2.y) return false;
    if (y > q1.y && y > q2.y) return false;

    //console.log(true);
    return true;
}
export function trajectoryIntersect(p, v, q, w) {
    //p is position of object P, v is it's vector
    //q is position of object Q, w is its vector
    //all vector 2d's
    let r0 = p.minus(q);
    let rv = v.minus(w);
    //following is the time at which the distance between them is at a minimum.  //determined by taking derivative of distance equation
    let t = -(r0.x * rv.x + r0.y * rv.y) / (rv.x * rv.x + rv.y * rv.y);
    //console.log(t);
    //so determine the distance apart at time t.
    let p2 = p.plus(v.multiply(t));
    let q2 = q.plus(w.multiply(t));
    let dist = p2.distanceFrom(q2);
    //console.log('time: ' + t + '   @Dist: ' + dist);
    return { time: t, dist: dist };
}
//*------------------------13. GEOGRAPHY Functions
export class Geo {
    constructor(lat, long) {
        this.update(lat, long);
        return this;
    }
    update(lat, long) {
        this.lat = lat !== undefined ? lat : 0;
        this.long = long !== undefined ? long : 0;
    }
    getDistance(g) {
        var c1, c2;
        c1 = Math.sin(DTOR(this.lat)) * Math.sin(DTOR(g.lat));
        c2 =
            Math.cos(DTOR(this.lat)) *
            Math.cos(DTOR(g.lat)) *
            Math.cos(DTOR(g.long - this.long));
        return RTOD(Math.acos(c1 + c2)) * 60;
    }
    getBearing(g, variation = 0) {
        var c1, c2, c3, c4, c5, tempBearing, Xlat, Xlong, Ylat, Ylong, Distance;
        Distance = this.getDistance(g);
        Ylong = g.long;
        Ylat = g.lat;
        Xlong = this.long;
        Xlat = this.lat;
        c1 = Math.sin(DTOR(Ylat));
        c2 = Math.sin(DTOR(Xlat)) * Math.cos(DTOR(Distance / 60));
        c3 = Math.sin(DTOR(Distance / 60)) * Math.cos(DTOR(Xlat));
        c4 = Math.abs((c1 - c2) / c3);
        c5 = (c1 - c2) / c3;
        if (c4 >= 1) c4 = 0.99999;
        tempBearing = RTOD(Math.acos(c4));
        if (Xlong == Ylong && c5 < 0) tempBearing = 180;
        else if (Xlong < Ylong && c5 > 0) tempBearing = tempBearing;
        else if (Xlong < Ylong && c5 < 0) tempBearing = 180 - tempBearing;
        else if (Xlong > Ylong && c5 < 0) tempBearing = 180 + tempBearing;
        else if (Xlong > Ylong && c5 > 0) tempBearing = 360 - tempBearing;
        else tempBearing = tempBearing;
        if (tempBearing >= 360) tempBearing = tempBearing - 360;
        if (variation) tempBearing = ConvertToMagnetic(tempBearing, variation);
        return tempBearing;
    }
    getVector() {
        var Phi, theta;
        //SendMessage ("This:  " + this.Lat + ", " + this.Long);
        theta = DTOR(this.long); //note west longitude is negative
        Phi = DTOR(90 - this.lat);
        return new Vector(
            EARTH_RADIUS * Math.sin(Phi) * Math.cos(theta),
            EARTH_RADIUS * Math.sin(Phi) * Math.sin(theta),
            EARTH_RADIUS * Math.cos(Phi)
        );
    }
}
export class WorldLoc {
    static worldMapCenter = new Geo();
    static screenSize = new Point();
    static zoom = 100;
    static screenUpdateNumber = 1;
    static updateDisplayParameters(screenSz, wrldCenter, zoom) {
        WorldLoc.screenSize.x = screenSz.x;
        WorldLoc.screenSize.y = screenSz.y;
        WorldLoc.worldMapCenter.lat = wrldCenter.lat;
        WorldLoc.worldMapCenter.long = wrldCenter.long;
        WorldLoc.zoom = zoom;
        WorldLoc.screenUpdateNumber++;
    }
    static getGeoFromScreen(x, y) {
        const ctrX = WorldLoc.screenSize.x / 2;
        const ctrY = WorldLoc.screenSize.y / 2;
        const PPM = ctrY / WorldLoc.zoom;

        const tY = (x - ctrX) / PPM;
        const tZ = (ctrY - y) / PPM;
        const temp = EARTH_RADIUS * EARTH_RADIUS - (tY * tY + tZ * tZ);
        const tX = Math.sqrt(temp);

        let v = new Vector(tX, tY, tZ);
        v.rotate3DY(WorldLoc.worldMapCenter.lat, true);
        v.rotate3DZ(WorldLoc.worldMapCenter.long, true);
        //console.log(v.getGeo());
        return v.getGeo();
    }
    static getPixelDistance(nMiles) {
        var PPM;
        let ScreenCtrY = Math.round(WorldLoc.screenSize.y / 2);
        PPM = ScreenCtrY / WorldLoc.zoom; //Pixels Per Mile
        return PPM * nMiles;
    }
    static getActualDistanceFromPixels(pixels) {
        var PPM;
        let ScreenCtrY = Math.round(WorldLoc.screenSize.y / 2);
        PPM = ScreenCtrY / WorldLoc.zoom; //Pixels Per Mile
        return pixels / PPM;
    }
    constructor() {
        //console.log(arguments.length);
        if (arguments.length == 2) {
            this.G = new Geo(arguments[0], arguments[1]);
            this.V = this.G.getVector();
        } else if (arguments.length == 3) {
            this.V = new Vector(arguments[0], arguments[1], arguments[2]);
            this.G = this.V.getGeo();
        } else if (arguments.length == 0) {
            this.V = new Vector(0, 0, 0);
            this.G = new Geo(0, 0);
        } else {
            console.error("wrong number of arguments in WorldLoc Constructor");
            console.log(arguments);
        }

        this.D = new Vector();
        this.lastUpdate = WorldLoc.screenUpdateNumber - 1;
        this.bAlwaysUpdate = false;
        return this;
    }
    setAlwaysUpdate(bVal) {
        this.bAlwaysUpdate = bVal;
        return this;
    }
    update(lat, long) {
        this.G.update(lat, long);
        this.V = this.G.getVector();
        this.lastUpdate = WorldLoc.screenUpdateNumber - 1;
    }
    updateVector3d(v) {
        //console.log(v);
        this.V = new Vector(v.x, v.y, v.z);
    }
    updateDisplay() {
        if (
            this.lastUpdate === WorldLoc.screenUpdateNumber &&
            !this.bAlwaysUpdate
        ) {
            return this.D;
        }
        const ctrX = WorldLoc.screenSize.x / 2;
        const ctrY = WorldLoc.screenSize.y / 2;

        const PPM = ctrY / WorldLoc.zoom;

        let mVector = this.V.copy();
        mVector.rotate3DZ(-WorldLoc.worldMapCenter.long, true);
        mVector.rotate3DY(-WorldLoc.worldMapCenter.lat, true);
        this.D.update(mVector.y * PPM + ctrX, ctrY - mVector.z * PPM);
        this.lastUpdate = WorldLoc.screenUpdateNumber;
        return this.D;
    }
    getBearingTo(v) {
        //this.lastUpdate = WorldLoc.screenUpdateNumber - 1;
        const pVector = this.V.newPositionFromVector(v, 1).getGeo();
        return this.G.getBearing(pVector);
    }
    VectorFromBearing(bearing, degrees = true) {
        var pSource = this.G;
        if (degrees) bearing = DTOR(bearing);
        //console.log('theta=' + theta);
        var dest = new WorldLoc(
            this.G.lat - Math.cos(bearing),
            this.G.long - Math.sin(bearing) / Math.cos(DTOR(this.G.lat))
        );

        return this.V.minus(dest.V).norm;
    }
    fixLength() {
        this.V.normalize().scale(EARTH_RADIUS);
    }
}
export function getDisplayFromLatLong(lat, long) {
    const ctrX = WorldLoc.screenSize.x / 2;
    const ctrY = WorldLoc.screenSize.y / 2;
    const PPM = ctrY / WorldLoc.zoom;
    let mVector = new Geo(lat, long).getVector();
    //console.log(mVector);
    mVector.rotate3DZ(-WorldLoc.worldMapCenter.long, true);
    mVector.rotate3DY(-WorldLoc.worldMapCenter.lat, true);

    return new Vector(
        Math.round(mVector.y * PPM) + ctrX,
        ctrY - Math.round(mVector.z * PPM)
    );
}
export function ConvertToTrue(MagBearing, variation) {
    var TrueBearing = MagBearing - variation;
    if (TrueBearing < 0) TrueBearing += 360;
    if (TrueBearing > 360) TrueBearing -= 360;
    return TrueBearing;
}
export function ConvertToMagnetic(TrueBearing, variation) {
    var MagBearing = TrueBearing + variation;
    if (MagBearing < 0) MagBearing += 360;
    if (MagBearing > 360) MagBearing -= 360;
    return MagBearing;
}
//*------------------------14. VECTOR
export class Vector {
    constructor() {
        let n = arguments.length;
        if (n == 0) {
            this.rank = 2;
            this.vector = [0, 0];
        } else if (n == 1) {
            this.rank = arguments[0];
            this.vector = new Array(this.rank).fill(0);
        } else {
            this.rank = n;
            this.vector = [];
            for (let i = 0; i < this.rank; i++) {
                this.vector.push(arguments[i]);
            }
        }
    }
    get x() {
        return this.vector[0];
    }
    set x(val) {
        this.vector[0] = val;
    }
    get y() {
        return this.vector[1];
    }
    set y(val) {
        this.vector[1] = val;
    }
    get z() {
        return this.vector[2];
    }
    set z(val) {
        this.vector[2] = val;
    }
    get length() {
        let sum = 0;
        this.vector.forEach((item) => {
            sum += item * item;
        });
        return Math.sqrt(sum);
    }
    get magSquared() {
        let sum = 0;
        this.vector.forEach((item) => {
            sum += item * item;
        });
        return sum;
    }
    get norm() {
        var l = this.length;
        return new Vector(
            ...this.vector.map((item) => {
                return item / l;
            })
        );
    }
    //------------------
    setMagnitude(val) {
        this.normalize();
        this.scale(val);
        return this;
    }
    limit(val) {
        if (this.length > val) {
            this.normalize();
            this.scale(val);
            return this;
        }
    }
    update() {
        for (let i = 0; i < arguments.length; i++) {
            this.vector[i] = arguments[i];
        }
    }
    copy() {
        return new Vector(...this.vector);
    }
    plus(v) {
        if (this.rank !== v.rank) alert("cannot add vectors of unequal rank");
        return new Vector(
            ...this.vector.map((item, index) => {
                return item + v.vector[index];
            })
        );
    }
    increment(v) {
        if (this.rank !== v.rank) alert("cannot add vectors of unequal rank");
        for (let i = 0; i < this.rank; i++) {
            this.vector[i] += v.vector[i];
        }
    }
    minus(v) {
        if (this.rank !== v.rank)
            alert("cannot subtract vectors of unequal rank");
        return new Vector(
            ...this.vector.map((item, index) => {
                return item - v.vector[index];
            })
        );
    }
    decrement(v) {
        if (this.rank !== v.rank)
            alert("cannot subtract vectors of unequal rank");
        for (let i = 0; i < this.rank; i++) {
            this.vector[i] -= v.vector[i];
        }
    }
    multiply(scalar) {
        return new Vector(
            ...this.vector.map((item) => {
                return item * scalar;
            })
        );
    }
    scale(scalar) {
        for (let i = 0; i < this.rank; i++) {
            this.vector[i] *= scalar;
        }
        return this;
    }
    invert() {
        for (let i = 0; i < this.rank; i++) {
            this.vector[i] *= -1;
        }
    }
    normalize() {
        let l = this.length;
        for (let i = 0; i < this.rank; i++) {
            this.vector[i] /= l;
        }
        return this;
    }
    dot(v) {
        if (this.rank !== v.rank) alert("cannot dot vectors of unequal rank");
        let sum = 0;
        for (let i = 0; i < this.rank; i++) {
            sum += this.vector[i] * v.vector[i];
        }
        return sum;
    }
    angleFrom(v) {
        const dot = this.dot(v);
        const mod1 = this.dot(this);
        const mod2 = v.dot(v);
        const mod = Math.sqrt(mod1) * Math.sqrt(mod2);
        if (mod === 0) return null;
        const theta = dot / mod;
        if (theta < -1) return Math.acos(-1);
        if (theta > 1) return Math.acos(1);
        return Math.acos(theta);
    }
    distanceFrom(v) {
        return this.minus(v).length;
    }
    //------------- > 2D specific
    getDisplayHeading(v) {
        let diff = v.minus(this).normalize();
        //console.log(diff);
        let heading = RTOD(Math.atan2(diff.x, -diff.y));
        if (heading < 0) heading += 360;
        if (heading > 359) heading -= 360;
        return heading;
    }
    getHeading() {
        let temp = this.norm;
        let heading = RTOD(Math.atan2(temp.x, -temp.y));
        if (heading < 0) heading += 360;
        if (heading > 359) heading -= 360;
        return heading;
    }
    updateFromHeading(hdg, bDegrees = true) {
        if (bDegrees) hdg = DTOR(hdg);
        this.update(Math.sin(hdg), -Math.cos(hdg));
    }
    //------------- > 3D specific
    rotate3DX(theta, degrees = false) {
        if (degrees) theta = DTOR(theta);
        let tempY = this.y * Math.cos(theta) - this.z * Math.sin(theta);
        let tempZ = this.y * Math.sin(theta) + this.z * Math.cos(theta);
        this.y = tempY;
        this.z = tempZ;
    }
    rotate3DY(theta, degrees = false) {
        if (degrees) theta = DTOR(theta);
        let tempX = this.x * Math.cos(theta) - this.z * Math.sin(theta);
        let tempZ = this.x * Math.sin(theta) + this.z * Math.cos(theta);
        this.x = tempX;
        this.z = tempZ;
    }
    rotate3DZ(theta, degrees = false) {
        if (degrees) theta = DTOR(theta);
        let tempX = this.x * Math.cos(theta) - this.y * Math.sin(theta);
        let tempY = this.x * Math.sin(theta) + this.y * Math.cos(theta);
        this.x = tempX;
        this.y = tempY;
    }
    rotate2D(theta, degrees = false) {
        if (degrees) theta = DTOR(theta);
        let tempX = this.x * Math.cos(theta) - this.y * Math.sin(theta);
        let tempY = this.x * Math.sin(theta) + this.y * Math.cos(theta);
        this.x = tempX;
        this.y = tempY;
    }
    newPositionFromVector(v, dist) {
        if (this.rank !== v.rank) alert("vectors must be of equal rank");
        //console.log(this.vector);
        return new Vector(
            ...this.vector.map((item, index) => {
                return item + v.vector[index] * dist;
            })
        );
        //console.log(this.vector);
    }
    //------------- > conversions
    getGeo() {
        var Phi, Theta, temp;
        var nLat, nLong;
        if (this.z > EARTH_RADIUS) this.z = EARTH_RADIUS;
        Phi = Math.acos(this.z / EARTH_RADIUS);
        nLat = 90 - RTOD(Phi);
        temp = Math.sqrt(this.x * this.x + this.y * this.y);
        Theta = Math.acos(this.x / temp);
        nLong = RTOD(Theta);
        if (this.y <= 0) nLong *= -1;
        return new Geo(nLat, nLong);
    }
}
export function Vector2Bearing(vSource, vVector, variation) {
    let pSource = vSource.getGeo();
    pVector = vSource.NewPositionFromVector(vVector, 1).getGeo();
    return pSource.getBearing(pVector, variation);
}
export function get2DVectorFromBearing(brg, bDegrees = true) {
    if (bDegrees) brg = DTOR(brg);
    return new Vector(Math.sin(brg), -Math.cos(brg));
}
//*------------------------15. COORDINATE SYSTEMS
//for mapping a 2-d position and distance to display coordinates
export class Pos2d extends Vector {
    static zoom = 1;
    static viewCenter = new Point(0, 0);
    static screenSize = new Point();
    static displayFromPos(x, y) {}
    static posFromDisplay(x, y) {}
    constructor(...args) {
        super(...args);
        if (this.rank !== 2) {
            alert(`Error!  Pos2d created with rank of ${this.rank}`);
        }
    }
    updateDisplay() {}
}

//*------------------------16. TEXT Functions
export function removeBreaks(s) {
    return s.replace(/(\r\n|\n|\r)/gm, "");
}
export function splitAndTrim(str, char) {
    //takes a string, splits it by char into array and strips of blanks from each element
    let elements = str.split(char);
    for (let i = 0; i < elements.length; i++) {
        elements[i] = elements[i].trim();
    }
    return elements;
}
//*------------------------17. MISC Functions
export function UrlExists(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    xhr.send();

    if (xhr.status == "404") {
        return false;
    } else {
        return true;
    }
}
export function fMap(
    sourceValue,
    sourceBottom,
    sourceTop,
    targetLoVal,
    targetHiVal
) {
    //
    let nProportion = (sourceValue - sourceBottom) / (sourceTop - sourceBottom);
    return nProportion * (targetHiVal - targetLoVal) + targetLoVal; //targetValue
}
export class Range {
    constructor(lo, hi) {
        this.update(lo, hi);
    }
    update(lo, hi) {
        this.lo = lo !== undefined ? lo : 0;
        this.hi = hi !== undefined ? hi : 0;
        this.delta = this.hi - this.lo;
    }
}
