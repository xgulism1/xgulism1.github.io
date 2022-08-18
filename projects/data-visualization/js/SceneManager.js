function SceneManager(canvasElement, filterElement,
                      infoDivElement, infoTableElement, infoCountNumElement, toggleInfoElement,
                      detailsPopupElement, detailsTableElement,
                      showDetailsIconElement, hideDetailsIconElement,
                      datGuiElement, selectionBoxElement,
                      dataManager) {

    // Header labels for dat.GUI combobox
    let allAxisLabels = ["-----"];
    let allAxisLabelIndexes = [-1];
    for (let i = 0; i < dataManager.headers.length; i++) {
        let header = dataManager.headers[i];
        if (header.type == "number") {
            allAxisLabels.push(header.label);
            allAxisLabelIndexes.push(i);
        }
    }

    //// Parameters
    let dataVariables = {
        // Data indexes for axes
        axisX: allAxisLabels[1], indexAxisX: allAxisLabelIndexes[1],
        allAxisLabelsX: allAxisLabels, allAxisLabelIndexesX: allAxisLabelIndexes,
        axisY: allAxisLabels[0], indexAxisY: allAxisLabelIndexes[0],
        allAxisLabelsY: allAxisLabels, allAxisLabelIndexesY: allAxisLabelIndexes,
        axisZ: allAxisLabels[2], indexAxisZ: allAxisLabelIndexes[2],
        allAxisLabelsZ: allAxisLabels, allAxisLabelIndexesZ: allAxisLabelIndexes,
        mergeSegmentX: 0.1,
        mergeSegmentZ: 0.05,
    };

    let terrainPlaneVariables = {
        // Size for the data
        numX: dataManager.headers[dataVariables.indexAxisX].max + 0.01,
        numZ: dataManager.headers[dataVariables.indexAxisZ].max + 0.01,

        // Size for the terrain density
        terrainSegmentsX: 150,
        terrainSegmentsZ: 150,

        // Size for terrain
        terrainSizeX: 100,
        terrainSizeY: 100,
        terrainSizeZ: 100,

        // Segments for axes
        axisSegmentsX: 5,
        axisSegmentsY: 5,
        axisSegmentsZ: 5,

        // Scale for axes
        axisScaleX: 1.1,
        axisScaleY: 1.1,
        axisScaleZ: 1.1
    };

    let terrainObjectVariables = {
        // Variables for terrain objects
        objectRadius: 0.5,
        objectSegmentsX: 3,
        objectSegmentsY: 3,
        scaleSelected: 1.1,
        colorSelected: {color: "#ff0000"}
    };

    let terrainGaussVariables = {
        // Variables for height map
        varianceGauss: 0.5,
        scaleGauss: 0.3,
        thresholdGauss: 0.000001
    };

    let terrainColorVariables = {
        // Variables for color heat map
        minHue: 0,
        maxHue: 2 / 3,
        saturation: 1,
        lightness: 0.5,
        axisColorX: {color: "#ff0000"},
        axisColorY: {color: "#00ff00"},
        axisColorZ: {color: "#0000ff"}
    };

    // Data objects:
    //      visibleData - not filtered out
    //      invisibleData - filtered out
    // Data terrain objects:
    //      visibleTerrainObjectsSubjects - not filtered out, in scale, visible, not intersected
    //      invisibleTerrainObjectsSubjects - filtered out or out of scale, invisible
    //      intersectedTerrainObjectsSubjects - not filtered out, in scale, visible, intersected

    // Data
    let terrainData;
    let minMaxTerrainValues;

    // Scene variables
    let axisXLineSubject;
    let axisXScaleNumberSubject;
    let axisXScalePointSubject;
    let axisYLineSubject;
    let axisYScaleNumberSubject;
    let axisYScalePointSubject;
    let axisZLineSubject;
    let axisZScaleNumberSubject;
    let axisZScalePointSubject;
    let terrainPlaneSubject;
    let visibleTerrainObjectsSubjects = [];
    let invisibleTerrainObjectsSubjects = [];
    let intersectedTerrainObjectsSubjects = [];
    let lightsSubjects = [];
    let sceneMeshes = new THREE.Scene();
    sceneMeshes.background = new THREE.Color(0xbfd1e5);
    let terrainObjectMeshes = [];

    // Renderer
    const renderer = new THREE.WebGLRenderer({canvas: canvasElement, antialias: true});
    const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(DPR);
    renderer.setSize(canvasElement.width, canvasElement.height);

    // Camera
    let aspectRatio = 0;
    if (canvasElement.height != 0) {
        aspectRatio = canvasElement.width / canvasElement.height;
    }
    const fieldOfView = 60;
    const nearPlane = 0.2;
    const farPlane = 2000;
    const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.y = 100;
    camera.position.z = 100;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Controls
    const mouse = new Mouse();
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.panningMode = THREE.HorizontalPanning;

    // Interaction variables
    const raycaster = new THREE.Raycaster();
    let isSelectMode = false;
    let isSelectBoundingBox = false;
    let isDeselectBoundingBox = false;
    let absoluteStartSelectPosition = {};

    this.getColorHeight = function (terrainPlaneVariables, terrainColorVariables, valueY, minSizeY) {
        const hueRange = Math.abs(terrainColorVariables.minHue - terrainColorVariables.maxHue);
        let color = new THREE.Color(0xffffff);
        if (terrainPlaneVariables.terrainSizeY - minSizeY != 0) {
            if (terrainColorVariables.maxHue < terrainColorVariables.minHue) {
                color.setHSL(terrainColorVariables.minHue - ((valueY - minSizeY) / (terrainPlaneVariables.terrainSizeY - minSizeY)) * hueRange,
                    terrainColorVariables.saturation, terrainColorVariables.lightness);
            } else {
                color.setHSL(terrainColorVariables.minHue + ((valueY - minSizeY) / (terrainPlaneVariables.terrainSizeY - minSizeY)) * hueRange,
                    terrainColorVariables.saturation, terrainColorVariables.lightness);
            }
        } else {
            color.setHSL(terrainColorVariables.minHue, terrainColorVariables.saturation, terrainColorVariables.lightness);
        }
        return color;
    };

    this.render = function () {

        // Update renderable scene subjects
        if (axisXScaleNumberSubject) {
            axisXScaleNumberSubject.render();
        }
        if (axisXScalePointSubject) {
            axisXScalePointSubject.render();
        }
        if (axisYScaleNumberSubject) {
            axisYScaleNumberSubject.render();
        }
        if (axisYScalePointSubject) {
            axisYScalePointSubject.render();
        }
        if (axisZScaleNumberSubject) {
            axisZScaleNumberSubject.render();
        }
        if (axisZScalePointSubject) {
            axisZScalePointSubject.render();
        }

        // Render the scene
        if (sceneMeshes && camera) {
            renderer.render(sceneMeshes, camera);
        }
    };

    this.updateAll = function () {
        //// Recompute all data
        // Compute data for terrain objects
        dataManager.mergeDataRecords(dataVariables);

        // Compute data for segment points
        terrainData = dataManager.getTerrainData(terrainPlaneVariables, terrainGaussVariables, dataVariables);

        // Find max and min values
        minMaxTerrainValues = dataManager.calcMinMax(terrainData);

        //// Update all scene subjects
        // Axis X
        if (axisXLineSubject) {
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2 + terrainPlaneVariables.terrainSizeX * terrainPlaneVariables.axisScaleX,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            axisXLineSubject.updatePoints(point1, point2);
            axisXLineSubject.updateColor(terrainColorVariables.axisColorX);
        }
        if (axisXScaleNumberSubject) {
            let segmentNumX = 0;
            if (terrainPlaneVariables.terrainSizeX != 0) {
                segmentNumX = +(terrainPlaneVariables.axisSegmentsX / terrainPlaneVariables.terrainSizeX * terrainPlaneVariables.numX).toFixed(2);
            }
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2 + terrainPlaneVariables.terrainSizeX * terrainPlaneVariables.axisScaleX,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            axisXScaleNumberSubject.updatePoints(point1, point2, segmentNumX, terrainPlaneVariables.axisSegmentsX,
                dataVariables.indexAxisX >= 0 ? dataManager.headers[dataVariables.indexAxisX].label : "X");
        }
        if (axisXScalePointSubject) {
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2 + terrainPlaneVariables.terrainSizeX * terrainPlaneVariables.axisScaleX,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            axisXScalePointSubject.updatePoints(point1, point2, terrainPlaneVariables.axisSegmentsX);
            axisXScalePointSubject.updateColor(terrainColorVariables.axisColorX);
        }

        // Axis Y
        if (axisYLineSubject) {
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                terrainPlaneVariables.terrainSizeY * terrainPlaneVariables.axisScaleY,
                -terrainPlaneVariables.terrainSizeZ / 2);
            axisYLineSubject.updatePoints(point1, point2);
            axisYLineSubject.updateColor(terrainColorVariables.axisColorY);
        }
        if (axisYScaleNumberSubject) {
            let segmentNumY = 0;
            if (terrainPlaneVariables.terrainSizeY != 0) {
                segmentNumY = +(terrainPlaneVariables.axisSegmentsY / terrainPlaneVariables.terrainSizeY * minMaxTerrainValues.max).toFixed(2);
            }
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                terrainPlaneVariables.terrainSizeY * terrainPlaneVariables.axisScaleY,
                -terrainPlaneVariables.terrainSizeZ / 2);
            axisYScaleNumberSubject.updatePoints(point1, point2, segmentNumY, terrainPlaneVariables.axisSegmentsY,
                dataVariables.indexAxisY >= 0 ? dataManager.headers[dataVariables.indexAxisY].label : "Y");
        }
        if (axisYScalePointSubject) {
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                terrainPlaneVariables.terrainSizeY * terrainPlaneVariables.axisScaleY,
                -terrainPlaneVariables.terrainSizeZ / 2);
            axisYScalePointSubject.updatePoints(point1, point2, terrainPlaneVariables.axisSegmentsY);
            axisYScalePointSubject.updateColor(terrainColorVariables.axisColorY);
        }

        // Axis Z
        if (axisZLineSubject) {
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2 + terrainPlaneVariables.terrainSizeZ * terrainPlaneVariables.axisScaleZ);
            axisZLineSubject.updatePoints(point1, point2);
            axisZLineSubject.updateColor(terrainColorVariables.axisColorZ);
        }
        if (axisZScaleNumberSubject) {
            let segmentNumZ = 0;
            if (terrainPlaneVariables.terrainSizeZ != 0) {
                segmentNumZ = +(terrainPlaneVariables.axisSegmentsZ / terrainPlaneVariables.terrainSizeZ * terrainPlaneVariables.numZ).toFixed(2);
            }
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2 + terrainPlaneVariables.terrainSizeZ * terrainPlaneVariables.axisScaleZ);
            axisZScaleNumberSubject.updatePoints(point1, point2, segmentNumZ, terrainPlaneVariables.axisSegmentsZ,
                dataVariables.indexAxisZ >= 0 ? dataManager.headers[dataVariables.indexAxisZ].label : "Z");
        }
        if (axisZScalePointSubject) {
            let point1 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2);
            let point2 = new THREE.Vector3(
                -terrainPlaneVariables.terrainSizeX / 2,
                0,
                -terrainPlaneVariables.terrainSizeZ / 2 + terrainPlaneVariables.terrainSizeZ * terrainPlaneVariables.axisScaleZ);
            axisZScalePointSubject.updatePoints(point1, point2, terrainPlaneVariables.axisSegmentsZ);
            axisZScalePointSubject.updateColor(terrainColorVariables.axisColorZ);
        }

        // Terrain
        if (terrainPlaneSubject) {
            terrainPlaneSubject.updateData(this.getColorHeight, terrainData, minMaxTerrainValues,
                terrainPlaneVariables, terrainColorVariables);
        }

        // Terrain objects
        for (let terrainObject of visibleTerrainObjectsSubjects) {
            terrainObject.removeObject();
        }
        for (let terrainObject of invisibleTerrainObjectsSubjects) {
            terrainObject.removeObject();
        }
        for (let terrainObject of intersectedTerrainObjectsSubjects) {
            terrainObject.removeObject();
        }
        visibleTerrainObjectsSubjects = [];
        invisibleTerrainObjectsSubjects = [];
        intersectedTerrainObjectsSubjects = [];
        for (let dataRow of dataManager.allDataObjects) {
            var terrainObject = new TerrainObject(sceneMeshes, terrainObjectMeshes, dataRow);
            terrainObject.updateSphere(terrainObjectVariables);
            terrainObject.updatePosition(
                dataManager, this.getColorHeight,
                visibleTerrainObjectsSubjects, invisibleTerrainObjectsSubjects, intersectedTerrainObjectsSubjects,
                terrainPlaneSubject, minMaxTerrainValues,
                dataVariables, terrainPlaneVariables, terrainColorVariables);
        }
        showInfoData();
    };

    this.update = function (updatedVariable) {
        // Recompute data for terrain objects
        if (["axisX", "axisY", "axisZ",
            "mergeSegmentX", "mergeSegmentZ"].indexOf(updatedVariable) >= 0) {
            dataManager.mergeDataRecords(dataVariables);
        }

        // Recompute all data
        if (["axisX", "axisY", "axisZ",
            "numX", "numZ",
            "terrainSegmentsX", "terrainSegmentsZ",
            "terrainSizeX", "terrainSizeY", "terrainSizeZ",
            "varianceGauss", "scaleGauss", "thresholdGauss"].indexOf(updatedVariable) >= 0) {
            // Compute data for segment points
            terrainData = dataManager.getTerrainData(terrainPlaneVariables, terrainGaussVariables, dataVariables);

            // Find max and min values
            minMaxTerrainValues = dataManager.calcMinMax(terrainData);
        }

        // Update selected scene subjects
        // Axis X
        if (axisXLineSubject) {
            if (["terrainSizeX", "terrainSizeZ", "axisScaleX"].indexOf(updatedVariable) >= 0) {
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2 + terrainPlaneVariables.terrainSizeX * terrainPlaneVariables.axisScaleX,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                axisXLineSubject.updatePoints(point1, point2);
            } else if (["axisColorX"].indexOf(updatedVariable) >= 0) {
                axisXLineSubject.updateColor(terrainColorVariables.axisColorX);
            }
        }
        if (axisXScaleNumberSubject) {
            if (["axisX",
                "numX",
                "terrainSizeX", "terrainSizeZ",
                "axisSegmentsX", "axisScaleX"].indexOf(updatedVariable) >= 0) {
                let segmentNumX = 0;
                if (terrainPlaneVariables.terrainSizeX != 0) {
                    segmentNumX = +(terrainPlaneVariables.axisSegmentsX / terrainPlaneVariables.terrainSizeX * terrainPlaneVariables.numX).toFixed(2);
                }
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2 + terrainPlaneVariables.terrainSizeX * terrainPlaneVariables.axisScaleX,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                axisXScaleNumberSubject.updatePoints(point1, point2, segmentNumX, terrainPlaneVariables.axisSegmentsX,
                    dataVariables.indexAxisX >= 0 ? dataManager.headers[dataVariables.indexAxisX].label : "X");
            }
        }
        if (axisXScalePointSubject) {
            if (["terrainSizeX", "terrainSizeZ", "axisSegmentsX", "axisScaleX"].indexOf(updatedVariable) >= 0) {
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2 + terrainPlaneVariables.terrainSizeX * terrainPlaneVariables.axisScaleX,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                axisXScalePointSubject.updatePoints(point1, point2, terrainPlaneVariables.axisSegmentsX);
                axisXScalePointSubject.updateColor(terrainColorVariables.axisColorX);
            } else if (["axisColorX"].indexOf(updatedVariable) >= 0) {
                axisXScalePointSubject.updateColor(terrainColorVariables.axisColorX);
            }
        }

        // Axis Y
        if (axisYLineSubject) {
            if (["terrainSizeX", "terrainSizeY", "terrainSizeZ", "axisScaleY"].indexOf(updatedVariable) >= 0) {
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    terrainPlaneVariables.terrainSizeY * terrainPlaneVariables.axisScaleY,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                axisYLineSubject.updatePoints(point1, point2);
            } else if (["axisColorY"].indexOf(updatedVariable) >= 0) {
                axisYLineSubject.updateColor(terrainColorVariables.axisColorY);
            }
        }
        if (axisYScaleNumberSubject) {
            if (["axisX", "axisY", "axisZ",
                "mergeSegmentX", "mergeSegmentZ",
                "numX", "numZ",
                "terrainSegmentsX", "terrainSegmentsZ",
                "terrainSizeX", "terrainSizeY", "terrainSizeZ",
                "varianceGauss", "scaleGauss", "thresholdGauss",
                "axisSegmentsY", "axisScaleY"].indexOf(updatedVariable) >= 0) {
                let segmentNumY = 0;
                if (terrainPlaneVariables.terrainSizeY != 0) {
                    segmentNumY = +(terrainPlaneVariables.axisSegmentsY / terrainPlaneVariables.terrainSizeY * minMaxTerrainValues.max).toFixed(2);
                }
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    terrainPlaneVariables.terrainSizeY * terrainPlaneVariables.axisScaleY,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                axisYScaleNumberSubject.updatePoints(point1, point2, segmentNumY, terrainPlaneVariables.axisSegmentsY,
                    dataVariables.indexAxisY >= 0 ? dataManager.headers[dataVariables.indexAxisY].label : "Y");
            }
        }
        if (axisYScalePointSubject) {
            if (["terrainSizeX", "terrainSizeY", "terrainSizeZ", "axisSegmentsY", "axisScaleY"].indexOf(updatedVariable) >= 0) {
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    terrainPlaneVariables.terrainSizeY * terrainPlaneVariables.axisScaleY,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                axisYScalePointSubject.updatePoints(point1, point2, terrainPlaneVariables.axisSegmentsY);
                axisYScalePointSubject.updateColor(terrainColorVariables.axisColorY);
            } else if (["axisColorY"].indexOf(updatedVariable) >= 0) {
                axisYScalePointSubject.updateColor(terrainColorVariables.axisColorY);
            }
        }

        // Axis Z
        if (axisZLineSubject) {
            if (["terrainSizeX", "terrainSizeZ", "axisScaleZ"].indexOf(updatedVariable) >= 0) {
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2 + terrainPlaneVariables.terrainSizeZ * terrainPlaneVariables.axisScaleZ);
                axisZLineSubject.updatePoints(point1, point2);
            } else if (["axisColorZ"].indexOf(updatedVariable) >= 0) {
                axisZLineSubject.updateColor(terrainColorVariables.axisColorZ);
            }
        }
        if (axisZScaleNumberSubject) {
            if (["axisZ",
                "numZ",
                "terrainSizeX", "terrainSizeZ",
                "axisSegmentsZ", "axisScaleZ"].indexOf(updatedVariable) >= 0) {
                let segmentNumZ = 0;
                if (terrainPlaneVariables.terrainSizeZ != 0) {
                    segmentNumZ = +(terrainPlaneVariables.axisSegmentsZ / terrainPlaneVariables.terrainSizeZ * terrainPlaneVariables.numZ).toFixed(2);
                }
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2 + terrainPlaneVariables.terrainSizeZ * terrainPlaneVariables.axisScaleZ);
                axisZScaleNumberSubject.updatePoints(point1, point2, segmentNumZ, terrainPlaneVariables.axisSegmentsZ,
                    dataVariables.indexAxisZ >= 0 ? dataManager.headers[dataVariables.indexAxisZ].label : "Z");
            }
        }
        if (axisZScalePointSubject) {
            if (["terrainSizeX", "terrainSizeZ", "axisSegmentsZ", "axisScaleZ"].indexOf(updatedVariable) >= 0) {
                let point1 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2);
                let point2 = new THREE.Vector3(
                    -terrainPlaneVariables.terrainSizeX / 2,
                    0,
                    -terrainPlaneVariables.terrainSizeZ / 2 + terrainPlaneVariables.terrainSizeZ * terrainPlaneVariables.axisScaleZ);
                axisZScalePointSubject.updatePoints(point1, point2, terrainPlaneVariables.axisSegmentsZ);
                axisZScalePointSubject.updateColor(terrainColorVariables.axisColorZ);
            } else if (["axisColorZ"].indexOf(updatedVariable) >= 0) {
                axisZScalePointSubject.updateColor(terrainColorVariables.axisColorZ);
            }
        }

        // Terrain
        if (terrainPlaneSubject) {
            if (["axisX", "axisY", "axisZ",
                "mergeSegmentX", "mergeSegmentZ",
                "numX", "numZ",
                "terrainSegmentsX", "terrainSegmentsZ",
                "terrainSizeX", "terrainSizeY", "terrainSizeZ",
                "varianceGauss", "scaleGauss", "thresholdGauss"].indexOf(updatedVariable) >= 0) {
                terrainPlaneSubject.updateData(this.getColorHeight, terrainData, minMaxTerrainValues,
                    terrainPlaneVariables, terrainColorVariables);
            } else if (["minHue", "maxHue", "saturation", "lightness"].indexOf(updatedVariable) >= 0) {
                terrainPlaneSubject.updateColor(this.getColorHeight, terrainPlaneVariables, terrainColorVariables);
            }
        }

        // Terrain objects
        if (["axisX", "axisY", "axisZ",
            "mergeSegmentX", "mergeSegmentZ"].indexOf(updatedVariable) >= 0) {
            for (let terrainObject of visibleTerrainObjectsSubjects) {
                terrainObject.removeObject();
            }
            for (let terrainObject of invisibleTerrainObjectsSubjects) {
                terrainObject.removeObject();
            }
            for (let terrainObject of intersectedTerrainObjectsSubjects) {
                terrainObject.removeObject();
            }
            visibleTerrainObjectsSubjects = [];
            invisibleTerrainObjectsSubjects = [];
            intersectedTerrainObjectsSubjects = [];
            for (let dataRow of dataManager.allDataObjects) {
                var terrainObject = new TerrainObject(sceneMeshes, terrainObjectMeshes, dataRow);
                terrainObject.updateSphere(terrainObjectVariables);
                terrainObject.updatePosition(
                    dataManager, this.getColorHeight,
                    visibleTerrainObjectsSubjects, invisibleTerrainObjectsSubjects, intersectedTerrainObjectsSubjects,
                    terrainPlaneSubject, minMaxTerrainValues,
                    dataVariables, terrainPlaneVariables, terrainColorVariables);
            }
            showInfoData();
        } else if (["numX", "numZ",
            "terrainSegmentsX", "terrainSegmentsZ",
            "terrainSizeX", "terrainSizeY", "terrainSizeZ",
            "varianceGauss", "scaleGauss", "thresholdGauss"].indexOf(updatedVariable) >= 0) {
            // Arrays can change - iterate through copy
            let copyVisibleArray = visibleTerrainObjectsSubjects.slice();
            let copyInvisibleArray = invisibleTerrainObjectsSubjects.slice();
            let copyIntersectedArray = intersectedTerrainObjectsSubjects.slice();
            for (let terrainObject of copyVisibleArray) {
                terrainObject.updatePosition(
                    dataManager, this.getColorHeight,
                    visibleTerrainObjectsSubjects, invisibleTerrainObjectsSubjects, intersectedTerrainObjectsSubjects,
                    terrainPlaneSubject, minMaxTerrainValues,
                    dataVariables, terrainPlaneVariables, terrainColorVariables);
            }
            for (let terrainObject of copyInvisibleArray) {
                terrainObject.updatePosition(
                    dataManager, this.getColorHeight,
                    visibleTerrainObjectsSubjects, invisibleTerrainObjectsSubjects, intersectedTerrainObjectsSubjects,
                    terrainPlaneSubject, minMaxTerrainValues,
                    dataVariables, terrainPlaneVariables, terrainColorVariables);
            }
            for (let terrainObject of copyIntersectedArray) {
                terrainObject.updatePosition(
                    dataManager, this.getColorHeight,
                    visibleTerrainObjectsSubjects, invisibleTerrainObjectsSubjects, intersectedTerrainObjectsSubjects,
                    terrainPlaneSubject, minMaxTerrainValues,
                    dataVariables, terrainPlaneVariables, terrainColorVariables);
            }
            showInfoData();
        } else if (["objectRadius", "objectSegmentsX", "objectSegmentsY"].indexOf(updatedVariable) >= 0) {
            for (let terrainObject of visibleTerrainObjectsSubjects) {
                terrainObject.updateSphere(terrainObjectVariables);
            }
            for (let terrainObject of invisibleTerrainObjectsSubjects) {
                terrainObject.updateSphere(terrainObjectVariables);
            }
            for (let terrainObject of intersectedTerrainObjectsSubjects) {
                terrainObject.updateSphere(terrainObjectVariables);
            }
        } else if (["scaleSelected", "colorSelected"].indexOf(updatedVariable) >= 0) {
            for (let terrainObject of intersectedTerrainObjectsSubjects) {
                terrainObject.stopIntersection();
                terrainObject.startIntersection(terrainObjectVariables);
            }
        } else if (["minHue", "maxHue", "saturation", "lightness"].indexOf(updatedVariable) >= 0) {
            for (let terrainObject of visibleTerrainObjectsSubjects) {
                terrainObject.updateColor(this.getColorHeight, terrainPlaneVariables, terrainColorVariables);
            }
            for (let terrainObject of intersectedTerrainObjectsSubjects) {
                terrainObject.updateColor(this.getColorHeight, terrainPlaneVariables, terrainColorVariables);
            }
        }
    }.bind(this);

    this.filter = function (filterValues) {
        // Filter data
        dataManager.filterData(filterValues);

        this.updateAll();
    }.bind(this);

    this.createSceneSubjects = function () {
        // Terrain and light scene subjects
        terrainPlaneSubject = new TerrainPlane(sceneMeshes);
        let light = new GeneralLights(sceneMeshes);
        lightsSubjects.push(light);

        // AxisLine and axis scale scene subjects
        axisXLineSubject = new AxisLine(sceneMeshes);
        axisXScaleNumberSubject = new AxisScaleNumbers(sceneMeshes, camera);
        axisXScalePointSubject = new AxisScalePoints(sceneMeshes, camera);
        axisYLineSubject = new AxisLine(sceneMeshes);
        axisYScaleNumberSubject = new AxisScaleNumbers(sceneMeshes, camera);
        axisYScalePointSubject = new AxisScalePoints(sceneMeshes, camera);
        axisZLineSubject = new AxisLine(sceneMeshes);
        axisZScaleNumberSubject = new AxisScaleNumbers(sceneMeshes, camera);
        axisZScalePointSubject = new AxisScalePoints(sceneMeshes, camera);

        // Initial update
        this.updateAll();

        // Show initial details
        infoDivElement.style.display = "block";
    };

    buildFilter(this.filter, this.render);

    buildSettings(this.update, this.render);

    function buildFilter(filterFunction, renderFunction) {
        // Filter data
        let fields = [];
        let idCounter = 0;
        for (let i = 0; i < dataManager.headers.length; i++) {
            let header = dataManager.headers[i];
            fields.push({id: [idCounter++, i], type: header.type, label: header.label});
            if (header.type == "datetime") {
                fields.push({id: [idCounter++, i], type: "date", label: header.label[0]});
                fields.push({id: [idCounter++, i], type: "time", label: header.label[1]});
            }
        }
        filterElement.structFilter({
            submitButton: true,
            fields: fields
        });
        filterElement.on("submit.search", function () {
            filterFunction(filterElement.structFilter("val"));
            renderFunction();
        });
    }

    function buildSettings(updateFunction, renderFunction) {
        let gui = new dat.GUI({autoPlace: false});
        datGuiElement.appendChild(gui.domElement);

        // Data controls
        let dataControlFolder = gui.addFolder("Data control");
        dataControlFolder.add(dataVariables, "axisX", dataVariables.allAxisLabelsX).onChange(function (value) {
            dataVariables.indexAxisX = dataVariables.allAxisLabelIndexesX[dataVariables.allAxisLabelsX.indexOf(value)];
            updateFunction("axisX");
            renderFunction();
        });
        dataControlFolder.add(dataVariables, "axisY", dataVariables.allAxisLabelsY).onChange(function (value) {
            dataVariables.indexAxisY = dataVariables.allAxisLabelIndexesY[dataVariables.allAxisLabelsY.indexOf(value)];
            updateFunction("axisY");
            renderFunction();
        });
        dataControlFolder.add(dataVariables, "axisZ", dataVariables.allAxisLabelsZ).onChange(function (value) {
            dataVariables.indexAxisZ = dataVariables.allAxisLabelIndexesZ[dataVariables.allAxisLabelsZ.indexOf(value)];
            updateFunction("axisZ");
            renderFunction();
        });
        dataControlFolder.add(dataVariables, "mergeSegmentX").onChange(function () {
            updateFunction("mergeSegmentX");
            renderFunction();
        });
        dataControlFolder.add(dataVariables, "mergeSegmentZ").onChange(function () {
            updateFunction("mergeSegmentZ");
            renderFunction();
        });

        // Terrain plane controls
        let terrainPlaneControlFolder = gui.addFolder("Terrain plane control");
        let terrainPlaneVariablesKeys = Object.keys(terrainPlaneVariables);
        for (let i = 0; i < terrainPlaneVariablesKeys.length; i++) {
            const constIndex = i;
            terrainPlaneControlFolder.add(terrainPlaneVariables, terrainPlaneVariablesKeys[constIndex])
                .onChange(function () {
                    updateFunction(terrainPlaneVariablesKeys[constIndex]);
                    renderFunction();
                });
        }

        // Terrain object controls
        let terrainObjectControlFolder = gui.addFolder("Terrain object control");
        let terrainObjectVariablesKeys = Object.keys(terrainObjectVariables);
        for (let i = 0; i < terrainObjectVariablesKeys.length; i++) {
            const constIndex = i;
            // Check if color
            if (terrainObjectVariables[terrainObjectVariablesKeys[constIndex]].color != undefined) {
                terrainObjectVariables[terrainObjectVariablesKeys[constIndex]] = terrainObjectVariables[terrainObjectVariablesKeys[constIndex]].color;
                terrainObjectControlFolder.addColor(terrainObjectVariables, terrainObjectVariablesKeys[constIndex])
                    .onChange(function () {
                        updateFunction(terrainObjectVariablesKeys[constIndex]);
                        renderFunction();
                    });
            } else {
                terrainObjectControlFolder.add(terrainObjectVariables, terrainObjectVariablesKeys[constIndex])
                    .onChange(function () {
                        updateFunction(terrainObjectVariablesKeys[constIndex]);
                        renderFunction();
                    });
            }
        }

        // Terrain Gauss controls
        let terrainGaussControlFolder = gui.addFolder("Terrain Gauss control");
        let terrainGaussVariablesKeys = Object.keys(terrainGaussVariables);
        for (let i = 0; i < terrainGaussVariablesKeys.length; i++) {
            const constIndex = i;
            terrainGaussControlFolder.add(terrainGaussVariables, terrainGaussVariablesKeys[constIndex])
                .onChange(function () {
                    updateFunction(terrainGaussVariablesKeys[constIndex]);
                    renderFunction();
                });
        }

        // Terrain color controls
        let terrainColorControlFolder = gui.addFolder("Terrain color control");
        let terrainColorVariablesKeys = Object.keys(terrainColorVariables);
        for (let i = 0; i < terrainColorVariablesKeys.length; i++) {
            const constIndex = i;
            // Check if color
            if (terrainColorVariables[terrainColorVariablesKeys[constIndex]].color != undefined) {
                terrainColorVariables[terrainColorVariablesKeys[constIndex]] = terrainColorVariables[terrainColorVariablesKeys[constIndex]].color;
                terrainColorControlFolder.addColor(terrainColorVariables, terrainColorVariablesKeys[constIndex])
                    .onChange(function () {
                        updateFunction(terrainColorVariablesKeys[constIndex]);
                        renderFunction();
                    });
            } else {
                terrainColorControlFolder.add(terrainColorVariables, terrainColorVariablesKeys[constIndex])
                    .onChange(function () {
                        updateFunction(terrainColorVariablesKeys[constIndex]);
                        renderFunction();
                    });
            }
        }
    }

    this.onWindowResize = function () {
        const {width, height} = canvasElement;

        camera.aspect = 0;
        if (height != 0) {
            camera.aspect = width / height;
        }
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    };

    function startSelection() {
        // Store mouse position
        absoluteStartSelectPosition.x = mouse.absoluteDocumentMousePosition.x;
        absoluteStartSelectPosition.y = mouse.absoluteDocumentMousePosition.y;
    }

    function stopSelection() {
        // Hide the selectionBoxElement
        selectionBoxElement.style.display = "none";
        absoluteStartSelectPosition = {};
    }

    function moveSelection() {
        // Check if selection or deselection is active
        if (isSelectBoundingBox || isDeselectBoundingBox) {
            // Show the selectionBoxElement
            selectionBoxElement.style.display = "block";
            const width = mouse.absoluteDocumentMousePosition.x - absoluteStartSelectPosition.x;
            const height = mouse.absoluteDocumentMousePosition.y - absoluteStartSelectPosition.y;

            // Position the selectionBoxElement, square variations
            //  1 | 2
            // ---.---
            //  4 | 3
            // there are 4 ways a square can be gestured onto the screen.
            if (width < 0) {
                selectionBoxElement.style.left = mouse.absoluteDocumentMousePosition.x + 'px';
                selectionBoxElement.style.width = -width + 'px';
            } else {
                selectionBoxElement.style.left = absoluteStartSelectPosition.x + 'px';
                selectionBoxElement.style.width = width + 'px';
            }
            if (height < 0) {
                selectionBoxElement.style.top = mouse.absoluteDocumentMousePosition.y + 'px';
                selectionBoxElement.style.height = -height + 'px';
            } else {
                selectionBoxElement.style.top = absoluteStartSelectPosition.y + 'px';
                selectionBoxElement.style.height = height + 'px';
            }
        }
    }

    function showInfoData() {
        // Compute counts
        const terrainObjectsCount = intersectedTerrainObjectsSubjects.length;
        let dataObjectsCount = 0;
        for (let terrainObject of intersectedTerrainObjectsSubjects) {
            dataObjectsCount += terrainObject.dataRow.visibleData.length;
        }

        // Replace count element
        let hNode = infoCountNumElement.children[0];
        while (hNode.firstChild) {
            hNode.removeChild(hNode.firstChild);
        }
        let textNode = document.createTextNode(terrainObjectsCount.toString() + "/" + dataObjectsCount.toString());
        hNode.appendChild(textNode);

        // Hide showDetailsIconElement on 0 terrainObjectsCount
        if (terrainObjectsCount == 0) {
            showDetailsIconElement.style.display = "none";
        } else {
            showDetailsIconElement.style.display = "inline-block";
        }

        // Remove all child elements
        let tbodyNode = infoTableElement.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0];
        while (tbodyNode.firstChild) {
            tbodyNode.removeChild(tbodyNode.firstChild);
        }

        // Add tbody rows
        let tbodyFragment = document.createDocumentFragment();
        // Add height data
        let trNode = document.createElement("tr");

        // Name cell
        let nameTdNode = document.createElement("td");
        let nameTextNode = document.createTextNode("Height");
        nameTdNode.appendChild(nameTextNode);
        trNode.appendChild(nameTdNode);

        // Value cell
        let valueTdNode = document.createElement("td");
        valueTdNode.appendChild(getAverageHeightTextNode(intersectedTerrainObjectsSubjects));
        trNode.appendChild(valueTdNode);
        tbodyFragment.appendChild(trNode);

        for (let i = 0; i < dataManager.headers.length; i++) {
            let header = dataManager.headers[i];
            let trNode = document.createElement("tr");

            // Name cell
            let nameTdNode = document.createElement("td");
            let nameTextNode = document.createTextNode(header.label);
            nameTdNode.appendChild(nameTextNode);
            trNode.appendChild(nameTdNode);

            // Value cell
            // Prepare text for value
            let valueTdNode = document.createElement("td");
            if (header.type == "number") {
                valueTdNode.appendChild(getAverageTextNode(intersectedTerrainObjectsSubjects, i));
            } else if (header.type == "datetime") {
                valueTdNode.appendChild(getTimeRangeTextNode(intersectedTerrainObjectsSubjects, i, formatDateTime));
            } else if (header.type == "date") {
                valueTdNode.appendChild(getTimeRangeTextNode(intersectedTerrainObjectsSubjects, i, formatDate));
            } else if (header.type == "time") {
                valueTdNode.appendChild(getTimeRangeTextNode(intersectedTerrainObjectsSubjects, i, formatTime));
            } else {
                valueTdNode.appendChild(getListTextNode(intersectedTerrainObjectsSubjects, i));
            }
            trNode.appendChild(valueTdNode);
            tbodyFragment.appendChild(trNode);
        }
        tbodyNode.appendChild(tbodyFragment);
    }

    function showDetailsData() {
        // Remove all child elements
        let theadNode = detailsTableElement.getElementsByTagName("table")[0].getElementsByTagName("thead")[0];
        while (theadNode.firstChild) {
            theadNode.removeChild(theadNode.firstChild);
        }
        let tbodyNode = detailsTableElement.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0];
        while (tbodyNode.firstChild) {
            tbodyNode.removeChild(tbodyNode.firstChild);
        }

        // Add thead row
        let trNode = document.createElement("tr");
        let trFragment = document.createDocumentFragment();
        for (let header of dataManager.headers) {
            // Name cell
            let headerThNode = document.createElement("th");
            let headerTextNode = document.createTextNode(header.label);
            headerThNode.appendChild(headerTextNode);
            trFragment.appendChild(headerThNode);
        }
        trNode.appendChild(trFragment);
        theadNode.appendChild(trNode);

        // Add tbody rows
        let tbodyFragment = document.createDocumentFragment();
        for (let terrainObject of intersectedTerrainObjectsSubjects) {
            for (let dataObject of terrainObject.dataRow.visibleData) {
                let trNode = document.createElement("tr");
                let trFragment = document.createDocumentFragment();
                for (let i = 0; i < dataManager.headers.length; i++) {
                    let item = dataObject.getItem(i);
                    let header = dataManager.headers[i];

                    // Value cell
                    // Prepare text for value
                    let valueTdNode = document.createElement("td");
                    if (header.type == "number") {
                        let textNode = document.createTextNode(item.toString());
                        valueTdNode.appendChild(textNode);
                    } else if (header.type == "datetime") {
                        let textNode = document.createTextNode(formatDateTime(item));
                        valueTdNode.appendChild(textNode);
                    } else if (header.type == "date") {
                        let textNode = document.createTextNode(formatDate(item));
                        valueTdNode.appendChild(textNode);
                    } else if (header.type == "time") {
                        let textNode = document.createTextNode(formatTime(item));
                        valueTdNode.appendChild(textNode);
                    } else {
                        let textNode = document.createTextNode(item);
                        valueTdNode.appendChild(textNode);
                    }
                    trFragment.appendChild(valueTdNode);
                }
                trNode.appendChild(trFragment);
                tbodyFragment.appendChild(trNode);
            }
        }
        tbodyNode.appendChild(tbodyFragment);
    }

    function stopIntersection(terrainObject) {
        terrainObject.stopIntersection();
    }

    function startIntersection(terrainObject) {
        terrainObject.startIntersection(terrainObjectVariables);
    }

    function changeSelectedTerrainObjects(boundingBox, fromArray, toArray, intersectionFunction) {
        // Length can decrease, iterate downwards
        for (let i = fromArray.length - 1; i >= 0; i--) {
            let terrainObject = fromArray[i];

            // Find position in XY coordinates
            let position = terrainObject.mesh.position.clone();
            let projScreenMat = new THREE.Matrix4();
            projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            position.applyMatrix4(projScreenMat);
            let rect = renderer.domElement.getBoundingClientRect();
            const positionX = (position.x + 1) * (rect.right - rect.left) / 2 + rect.left;
            const positionY = (-position.y + 1) * (rect.bottom - rect.top) / 2 + rect.top;

            // Check if within bounds
            if (positionX <= boundingBox.maxX
                && positionX >= boundingBox.minX
                && positionY <= boundingBox.maxY
                && positionY >= boundingBox.minY) {
                // Update arrays
                fromArray.splice(i, 1);
                intersectionFunction(terrainObject);
                toArray.push(terrainObject);
            }
        }
    }

    this.onMouseMove = function (event) {
        mouse.updateMousePosition(event, renderer.domElement);

        if (isSelectMode) {
            moveSelection();
        }
    };

    this.onMouseDown = function (event) {
        mouse.updateMousePosition(event, renderer.domElement);
        const mouseCode = event.button;

        // Select with canvasElement
        if (event.target == canvasElement) {
            if (isSelectMode) {

                // Select/deselect on click
                if (raycaster && camera) {
                    raycaster.setFromCamera(mouse.canvasMousePosition, camera);
                    let intersects = raycaster.intersectObjects(terrainObjectMeshes);

                    // 0 is code for Left click
                    if (mouseCode == 0) {
                        for (let terrainObjectMesh of intersects) {
                            let terrainObject = terrainObjectMesh.object.userData;
                            // Update arrays
                            const index = visibleTerrainObjectsSubjects.indexOf(terrainObject);
                            if (index >= 0) {
                                visibleTerrainObjectsSubjects.splice(index, 1);
                                terrainObject.startIntersection(terrainObjectVariables);
                                intersectedTerrainObjectsSubjects.push(terrainObject);
                            }
                        }
                        showInfoData();

                        // 0 is code for Right click
                    } else if (mouseCode == 2) {
                        for (let terrainObjectMesh of intersects) {
                            let terrainObject = terrainObjectMesh.object.userData;
                            // Update arrays
                            const index = intersectedTerrainObjectsSubjects.indexOf(terrainObject);
                            if (index >= 0) {
                                intersectedTerrainObjectsSubjects.splice(index, 1);
                                terrainObject.stopIntersection();
                                visibleTerrainObjectsSubjects.push(terrainObject);
                            }
                        }
                        showInfoData();
                    }
                }

                // Change color of bounding box if selection/deselection
                // Cannot select and deselect at the same time
                if (!isSelectBoundingBox && !isDeselectBoundingBox) {
                    // 0 is code for Left click
                    if (mouseCode == 0) {
                        isSelectBoundingBox = true;
                        selectionBoxElement.style.border = "2px solid white";

                        // 2 is code for Right click
                    } else if (mouseCode == 2) {
                        isDeselectBoundingBox = true;
                        selectionBoxElement.style.border = "2px solid black";
                    }
                }
                startSelection();
            }

            // Hide info with canvasElement
            detailsPopupElement.style.display = "none";
        }

        // Show details with showDetailsIconElement
        if (event.target == showDetailsIconElement) {
            showDetailsData();
            detailsPopupElement.style.display = "block";
        }

        // Hide details with hideDetailsIconElement
        if (event.target == hideDetailsIconElement) {
            detailsPopupElement.style.display = "none";
        }

        // Toggle info with toggleInfoElement
        if (event.target == toggleInfoElement) {
            let contentNode = infoDivElement.getElementsByClassName("content")[0];
            if (contentNode.style.display) {
                // Show info content
                contentNode.style.display = "";

                // Change text
                while (toggleInfoElement.firstChild) {
                    toggleInfoElement.removeChild(toggleInfoElement.firstChild);
                }
                let textNode = document.createTextNode("Close info");
                toggleInfoElement.appendChild(textNode);
            } else {
                // Hide info content
                contentNode.style.display = "none";

                // Change text
                while (toggleInfoElement.firstChild) {
                    toggleInfoElement.removeChild(toggleInfoElement.firstChild);
                }
                let textNode = document.createTextNode("Open info");
                toggleInfoElement.appendChild(textNode);
            }
        }
    };

    this.onMouseUp = function (event) {
        mouse.updateMousePosition(event, renderer.domElement);

        // Bounding box is in canvas coordinates
        if (absoluteStartSelectPosition != {} && (isSelectBoundingBox || isDeselectBoundingBox)) {
            const boundingBox = {
                maxX: Math.max(mouse.absoluteDocumentMousePosition.x, absoluteStartSelectPosition.x),
                minX: Math.min(mouse.absoluteDocumentMousePosition.x, absoluteStartSelectPosition.x),
                maxY: Math.max(mouse.absoluteDocumentMousePosition.y, absoluteStartSelectPosition.y),
                minY: Math.min(mouse.absoluteDocumentMousePosition.y, absoluteStartSelectPosition.y)
            };

            // Check if selection bounding box is active
            if (isSelectBoundingBox) {
                changeSelectedTerrainObjects(boundingBox,
                    visibleTerrainObjectsSubjects, intersectedTerrainObjectsSubjects,
                    startIntersection);
                isSelectBoundingBox = false;
                stopSelection();
                showInfoData();

                // Check if deselection bounding box is active
            } else if (isDeselectBoundingBox) {
                changeSelectedTerrainObjects(boundingBox,
                    intersectedTerrainObjectsSubjects, visibleTerrainObjectsSubjects,
                    stopIntersection);
                isDeselectBoundingBox = false;
                stopSelection();
                showInfoData();
            }
        }
    };

    this.onKeyDown = function (event) {
        const keyCode = event.which;

        // 17 is code for Ctrl
        if (keyCode == 17) {
            if (!isSelectMode) {
                isSelectMode = true;
                controls.enabled = false;
            }
        }
    };

    this.onKeyUp = function (event) {
        const keyCode = event.which;

        // 17 is code for Ctrl
        if (keyCode == 17) {
            isSelectBoundingBox = false;
            isSelectMode = false;
            controls.enabled = true;
            stopSelection();
        }
    };

    this.onContextmenu = function (event) {
        event.preventDefault();
    };
}