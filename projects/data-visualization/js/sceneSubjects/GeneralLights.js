function GeneralLights(sceneMeshes) {

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 100, 100);
    light.castShadow = true;
    const dLight = 200;
    const sLight = dLight * 0.25;
    light.shadow.camera.left = -sLight;
    light.shadow.camera.right = sLight;
    light.shadow.camera.top = sLight;
    light.shadow.camera.bottom = -sLight;

    light.shadow.camera.near = dLight / 30;
    light.shadow.camera.far = dLight;

    light.shadow.mapSize.x = 1024 * 2;
    light.shadow.mapSize.y = 1024 * 2;

    sceneMeshes.add(light);
}