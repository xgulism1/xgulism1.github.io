function TerrainPlane(sceneMeshes) {
    const faceIndices = ['a', 'b', 'c'];

    // Create material
    let material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        flatShading: true,
        vertexColors: THREE.VertexColors,
        shininess: 0
    });

    // Create mesh
    this.mesh = new THREE.Mesh(undefined, material);
    this.mesh.rotation.x = -Math.PI / 2;
    sceneMeshes.add(this.mesh);

    this.updateData = function (getColorHeight, terrainData, minMaxTerrainValues,
                                terrainPlaneVariables, terrainColorVariables) {
        // Create geometry
        let geometry = new THREE.PlaneGeometry(
            terrainPlaneVariables.terrainSizeX, terrainPlaneVariables.terrainSizeZ,
            terrainPlaneVariables.terrainSegmentsX - 1, terrainPlaneVariables.terrainSegmentsZ - 1);

        // Update height
        for (let i = 0; i < geometry.vertices.length; i++) {
            if (minMaxTerrainValues.max != 0) {
                geometry.vertices[i].z = terrainData[i] / minMaxTerrainValues.max * terrainPlaneVariables.terrainSizeY;
            } else {
                geometry.vertices[i].z = 0;
            }
        }

        // Add colors
        for (let face of geometry.faces) {
            for (let i = 0; i < 3; i++) {
                vertexIndex = face[faceIndices[i]];
                p = geometry.vertices[vertexIndex];
                face.vertexColors[i] = getColorHeight(terrainPlaneVariables, terrainColorVariables, p.z, 0);
            }
        }

        // Use geometry
        this.mesh.geometry = geometry;
    };

    this.updateColor = function (getColorHeight, terrainPlaneVariables, terrainColorVariables) {
        // Add colors
        if (this.mesh.geometry) {
            for (let face of this.mesh.geometry.faces) {
                for (let i = 0; i < 3; i++) {
                    vertexIndex = face[faceIndices[i]];
                    p = this.mesh.geometry.vertices[vertexIndex];
                    face.vertexColors[i] = getColorHeight(terrainPlaneVariables, terrainColorVariables, p.z, 0);
                }
            }
            this.mesh.geometry.elementsNeedUpdate = true;
        }
    };
}
