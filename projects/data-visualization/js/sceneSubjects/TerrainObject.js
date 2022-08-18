function TerrainObject(sceneMeshes, terrainObjectMeshes, dataRow) {
    this.dataRow = dataRow;

    // Create material
    let material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        flatShading: true,
        shininess: 0
    });

    // Create mesh
    this.mesh = new THREE.Mesh(undefined, material);
    this.mesh.userData = this;

    this.stopIntersection = function () {
        // Restore color and scale
        this.mesh.material.emissive.set("#000000");
        this.mesh.scale.x = 1;
        this.mesh.scale.y = 1;
        this.mesh.scale.z = 1;
    };

    this.startIntersection = function (terrainObjectVariables) {
        // Change color and scale
        this.mesh.material.emissive.set(terrainObjectVariables.colorSelected);
        this.mesh.scale.x = terrainObjectVariables.scaleSelected;
        this.mesh.scale.y = terrainObjectVariables.scaleSelected;
        this.mesh.scale.z = terrainObjectVariables.scaleSelected;
    };

    this.updatePosition = function (dataManager, getColorHeight,
                                    visibleTerrainObjectsSubjects,
                                    invisibleTerrainObjectsSubjects,
                                    intersectedTerrainObjectsSubjects,
                                    terrainPlane, minMaxTerrainValues,
                                    dataVariables, terrainPlaneVariables, terrainColorVariables) {
        if (this.mesh && terrainPlane.mesh && terrainPlane.mesh.geometry) {

            // Need at least one visible data
            if (dataRow.visibleData.length >= 0) {
                // Calculate numX and numZ positions
                let positionX = 0;
                let positionZ = 0;
                for (let dataObj of dataRow.visibleData) {
                    positionX += dataObj.getItem(dataVariables.indexAxisX);
                    positionZ += dataObj.getItem(dataVariables.indexAxisZ);
                }
                this.numX = positionX / dataRow.visibleData.length;
                this.numZ = positionZ / dataRow.visibleData.length;

                // Show this object
                if (this.numX < terrainPlaneVariables.numX && this.numX >= 0
                    && this.numZ < terrainPlaneVariables.numZ && this.numZ >= 0) {
                    // Compute new positions
                    let positionX = 0;
                    if (terrainPlaneVariables.numX != 0) {
                        positionX = this.numX / terrainPlaneVariables.numX * terrainPlaneVariables.terrainSizeX;
                    }

                    let positionZ = 0;
                    if (terrainPlaneVariables.numZ != 0) {
                        positionZ = this.numZ / terrainPlaneVariables.numZ * terrainPlaneVariables.terrainSizeZ;
                    }

                    let positionY = dataManager.getTerrainHeight(terrainPlane.mesh.geometry.vertices, terrainPlaneVariables,
                        positionX, positionZ);
                    this.numY = 0;
                    if (terrainPlaneVariables.terrainSizeY != 0) {
                        this.numY = positionY / terrainPlaneVariables.terrainSizeY * minMaxTerrainValues.max;
                    }

                    // Update position
                    this.mesh.position.x = positionX - terrainPlaneVariables.terrainSizeX / 2;
                    this.mesh.position.y = positionY;
                    this.mesh.position.z = positionZ - terrainPlaneVariables.terrainSizeZ / 2;

                    // Update color
                    material.color = getColorHeight(terrainPlaneVariables, terrainColorVariables, this.mesh.position.y, 0);

                    //// Update arrays
                    // Update mesh arrays
                    if (terrainObjectMeshes.indexOf(this.mesh) < 0) {
                        terrainObjectMeshes.push(this.mesh);
                    }
                    sceneMeshes.add(this.mesh);

                    // Update object arrays
                    // visible, intersected - do nothing
                    const visibleIndex = visibleTerrainObjectsSubjects.indexOf(this);
                    const intersectedIndex = intersectedTerrainObjectsSubjects.indexOf(this);
                    if (visibleIndex < 0 && intersectedIndex < 0) {
                        // invisible - move to visible
                        const invisibleIndex = invisibleTerrainObjectsSubjects.indexOf(this);
                        if (invisibleIndex >= 0) {
                            invisibleTerrainObjectsSubjects.splice(invisibleIndex, 1);
                        }
                        visibleTerrainObjectsSubjects.push(this);
                    }

                    // Object shown
                    return;
                }
            }

            // Hide this object
            //// Update arrays
            // Update mesh arrays
            const index = terrainObjectMeshes.indexOf(this.mesh);
            if (index >= 0) {
                terrainObjectMeshes.splice(index, 1);
            }
            sceneMeshes.remove(this.mesh);

            // Update object arrays
            // invisible - do nothing
            const invisibleIndex = invisibleTerrainObjectsSubjects.indexOf(this);
            if (invisibleIndex < 0) {
                // visible - move to invisible
                const visibleIndex = visibleTerrainObjectsSubjects.indexOf(this);
                if (visibleIndex >= 0) {
                    visibleTerrainObjectsSubjects.splice(visibleIndex, 1);
                }
                // intersected - move to invisible
                const intersectedIndex = intersectedTerrainObjectsSubjects.indexOf(this);
                if (intersectedIndex >= 0) {
                    intersectedTerrainObjectsSubjects.splice(intersectedIndex, 1);
                    // Stop intersecting
                    this.stopIntersection();
                }
                invisibleTerrainObjectsSubjects.push(this);
            }
        }
    };

    this.updateSphere = function (terrainObjectVariables) {
        // Create geometry
        this.mesh.geometry = new THREE.SphereGeometry(terrainObjectVariables.objectRadius,
            terrainObjectVariables.objectSegmentsX, terrainObjectVariables.objectSegmentsY);
    };

    this.updateColor = function (getColorHeight, terrainPlaneVariables, terrainColorVariables) {
        if (this.mesh) {
            material.color = getColorHeight(terrainPlaneVariables, terrainColorVariables, this.mesh.position.y, 0);
        }
    };

    this.removeObject = function () {
        // Remove from mesh arrays
        const index = terrainObjectMeshes.indexOf(this.mesh);
        if (index >= 0) {
            terrainObjectMeshes.splice(index, 1);
        }
        sceneMeshes.remove(this.mesh);
    }
}
