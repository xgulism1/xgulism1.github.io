function AxisLine(sceneMeshes) {
    // Create material
    let material = new THREE.LineBasicMaterial();

    // Create geometry
    let geometry = new THREE.Geometry();

    // Create mesh
    let line = new THREE.Line(geometry, material);
    sceneMeshes.add(line);

    this.updatePoints = function (point1, point2) {
        // Remove existing vertices
        while (geometry.vertices.length > 0) {
            geometry.vertices.pop();
        }

        // Add new vertices
        geometry.vertices.push(
            point1,
            point2
        );
        geometry.verticesNeedUpdate = true;
    };

    this.updateColor = function (color) {
        material.color = new THREE.Color(color);
    };
}