import { Injectable } from "@angular/core";
import * as THREE from "THREE";
import * as mapboxgl from "mapbox-gl";

@Injectable({
  providedIn: "root"
})
export class CityGridThreeService {
  cityIOData: any;

  constructor() {}

  makeGridFromCityIO(cityiodata: any): any {
    // parameters to ensure the model is georeferenced correctly on the map
    var modelOrigin = [
      cityiodata.header.spatial.latitude,
      cityiodata.header.spatial.longitude
    ];
    var modelAltitude = 0;
    var modelRotate = [
      0,
      0,
      (cityiodata.header.spatial.rotation * Math.PI) / 180
    ];
    var modelScale = 5.41843220338983e-8;

    // transformation parameters to position, rotate and scale the 3D model onto the map
    var modelTransform = {
      translateX: mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).x,
      translateY: mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).y,
      translateZ: mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelScale
    };
    let cityIOgrid = this.makeThreeScene(cityiodata);

    return {
      id: "3d-model",
      type: "custom",
      renderingMode: "3d",
      onAdd: function(map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();
        // create two three.js lights to illuminate the model
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);
        var directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, 70, 100).normalize();
        this.scene.add(directionalLight2);
        this.scene.add(cityIOgrid);
        this.map = map;
        // use the Mapbox GL JS map canvas for three.js
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl
        });
        this.renderer.autoClear = false;
      },
      render: function(gl, matrix) {
        var rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        var rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        var rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );
        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
      }
    };
  }

  makeThreeScene(cityiodata: any): any {
    /**
     * makes the initial 3js grid of meshes and texts
     * @param sizeX, sizeY of grid
     */
    //  build threejs initial grid on load
    var grid_columns = cityiodata.header.spatial.ncols;
    var grid_rows = cityiodata.header.spatial.nrows;
    //get table dims
    var cell_size_in_meters = cityiodata.header.spatial.cellSize;
    var cell_rescale_precentage = 0.95;
    var this_mesh = null;
    var three_grid_group = new THREE.Object3D();
    var geometry = null;
    var material = null;

    //loop through grid rows and cols and create the grid
    for (var this_row = 0; this_row < grid_rows; this_row++) {
      for (var this_column = 0; this_column < grid_columns; this_column++) {
        let randomZ = Math.random() * 10;
        geometry = new THREE.BoxBufferGeometry(
          cell_size_in_meters * cell_rescale_precentage,
          cell_size_in_meters * cell_rescale_precentage,
          randomZ
        );
        //make material for each cell
        material = new THREE.MeshPhongMaterial({
          color: "red"
        });
        //make mesh for cell
        this_mesh = new THREE.Mesh(geometry, material);
        this_mesh.position.set(
          this_column * -cell_size_in_meters,
          this_row * cell_size_in_meters,
          randomZ / 2
        );
        three_grid_group.add(this_mesh);
      }
    }
    //  adds this groups to storage for later updates
    return three_grid_group;
  }
}
