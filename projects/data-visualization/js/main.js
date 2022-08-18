// Get elements
const canvasElement = document.getElementById("canvas");
const filterElement = $("#filter");
const infoDivElement = document.getElementById("infoDiv");
const infoTableElement = document.getElementById("infoTable");
const infoCountNumElement = document.getElementById("infoCountNum");
const toggleInfoElement = document.getElementById("toggleInfo");
const detailsPopupElement = document.getElementById("detailsPopup");
const detailsTableElement = document.getElementById("detailsTable");
const showDetailsIconElement = document.getElementById("showDetailsIcon");
const hideDetailsIconElement = document.getElementById("hideDetailsIcon");
const datGuiElement = document.getElementById("datGui");
const selectionBoxElement = document.getElementById("selectionBox");

// Create scene manager
let sceneManager;

let loader = new THREE.FileLoader();

// Load a text file and output the result to the console
loader.load(
    // Resource URL
    'household_power_consumption.txt',

    // onLoad callback
    function (data) {
        processData(data)
    },

    // onProgress callback
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function (err) {
        console.error('An error happened during data loading.');
    }
);

function processData(dataCSV) {
    let allLines = dataCSV.split(/\r\n|\n/);

    // Need at least one record after header
    if (allLines.length > 1) {
        // Create data manager
        let dataManager = new DataManager();

        // Parse headers
        dataManager.parseHeaders(allLines[0]);

        //// Parse data objects
        const count = allLines.length / 100;
        // Parse first record to determine type
        let i = 1;
        for (; i < count; i++) {
            const successInit = dataManager.parseFirstRecord(allLines[i]);
            console.log(((i - 1) / (count - 2) * 100) + '% processed');
            if (successInit) {
                break;
            }
        }

        // Parse records
        for (; i < count; i++) {
            dataManager.parseRecord(allLines[i]);
            console.log(((i - 1) / (count - 2) * 100) + '% processed');
        }

        // Merge date and time
        dataManager.mergeDateColumns(0, 1);

        // Create scene manager
        sceneManager = new SceneManager(canvasElement, filterElement,
            infoDivElement, infoTableElement, infoCountNumElement, toggleInfoElement,
            detailsPopupElement, detailsTableElement,
            showDetailsIconElement, hideDetailsIconElement,
            datGuiElement, selectionBoxElement,
            dataManager);
        sceneManager.createSceneSubjects();
    }
    else {
        console.error('No data was loaded.');
    }
}

// Bind event listeners and render
bindEventListeners();
render();

function bindEventListeners() {
    window.onresize = onWindowResize;
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener("keydown", onDocumentKeyDown, false);
    document.addEventListener("keyup", onDocumentKeyUp, false);
    document.addEventListener('contextmenu', onDocumentContextmenu, false);

    onWindowResize();
}

function onWindowResize() {
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';

    canvasElement.width = canvasElement.offsetWidth;
    canvasElement.height = canvasElement.offsetHeight;

    if (sceneManager) {
        sceneManager.onWindowResize();
    }
}

function onDocumentMouseMove(event) {
    if (sceneManager) {
        sceneManager.onMouseMove(event);
    }
}

function onDocumentMouseDown(event) {
    if (sceneManager) {
        sceneManager.onMouseDown(event);
    }
}

function onDocumentMouseUp(event) {
    if (sceneManager) {
        sceneManager.onMouseUp(event);
    }
}

function onDocumentKeyDown(event) {
    if (sceneManager) {
        sceneManager.onKeyDown(event);
    }
}

function onDocumentKeyUp(event) {
    if (sceneManager) {
        sceneManager.onKeyUp(event);
    }
}

function onDocumentContextmenu(event) {
    if (sceneManager) {
        sceneManager.onContextmenu(event);
    }
}

function render() {
    requestAnimationFrame(render);

    if (sceneManager) {
        sceneManager.render();
    }
}