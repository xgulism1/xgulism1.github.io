function AxisScaleNumbers(sceneMeshes, camera) {
    let meshes = [];
    let axisDir;

    function createText(font, text, offsetXMul, offsetYMul, offsetZMul, offsetXAbs, offsetYAbs, offsetZAbs) {
        let shapes = font.generateShapes(text, 1);

        // Center the number
        let geometry = new THREE.ShapeGeometry(shapes);
        geometry.computeBoundingBox();
        let xMid = offsetXMul * (geometry.boundingBox.max.x - geometry.boundingBox.min.x) + offsetXAbs;
        let yMid = offsetYMul * (geometry.boundingBox.max.y - geometry.boundingBox.min.y) + offsetYAbs;
        let zMid = offsetZMul * (geometry.boundingBox.max.z - geometry.boundingBox.min.z) + offsetZAbs;
        geometry.translate(xMid, yMid, zMid);

        let textShape = new THREE.BufferGeometry();
        textShape.fromGeometry(geometry);

        // Create material
        let material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });

        // Create mesh
        return new THREE.Mesh(textShape, material);
    }

    this.updatePoints = function (point1, point2, segmentNum, segmentSize, label) {
        // Remove existing meshes
        while (meshes.length > 0) {
            sceneMeshes.remove(meshes[0]);
            meshes.splice(0, 1);
        }

        let loader = new THREE.FontLoader();
        loader.load('fonts/helvetiker_regular.typeface.json', onLoad);

        function onLoad(font) {
            // Find axis direction
            if (Math.abs(point2.x - point1.x) > Math.abs(point2.y - point1.y)
                && Math.abs(point2.x - point1.x) > Math.abs(point2.z - point1.z)) {
                axisDir = "X";
            } else if (Math.abs(point2.y - point1.y) > Math.abs(point2.z - point1.z)) {
                axisDir = "Y";
            } else {
                axisDir = "Z";
            }

            //// Add the numbers
            const direction = new THREE.Vector3(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z).normalize();
            const segmentCount = point1.distanceTo(point2) / segmentSize;
            for (let i = 0; i < segmentCount; i++) {
                // Create mesh
                let mesh;
                if (axisDir == "X" || axisDir == "Z") { // Below
                    mesh = createText(font, (i * segmentNum).toFixed(2), -0.5, -1, -0.5, 0, -2, 0);
                } else if (axisDir == "Y") { // Beside
                    mesh = createText(font, (i * segmentNum).toFixed(2), -1, -0.5, -0.5, -2, 0, 0);
                }

                // Position the mesh
                mesh.position.x = point1.x + direction.x * i * segmentSize;
                mesh.position.y = point1.y + direction.y * i * segmentSize;
                mesh.position.z = point1.z + direction.z * i * segmentSize;

                // Add mesh to array - to be able to update them
                meshes.push(mesh);
                sceneMeshes.add(mesh);
            }

            //// Add the axis label
            // Create mesh
            let mesh;
            if (axisDir == "X" || axisDir == "Z") { // Below
                mesh = createText(font, label, -0.5, 0, -0.5, 0, 2, 0);
            } else if (axisDir == "Y") { // Beside
                mesh = createText(font, label, 0, -0.5, -0.5, 2, 0, 0);
            }

            // Position the mesh
            mesh.position.x = point2.x;
            mesh.position.y = point2.y;
            mesh.position.z = point2.z;

            // Add mesh to array - to be able to update them
            meshes.push(mesh);
            sceneMeshes.add(mesh);
        }
    };

    this.render = function () {
        for (let mesh of meshes) {
            mesh.lookAt(camera.position);
        }
    }
}