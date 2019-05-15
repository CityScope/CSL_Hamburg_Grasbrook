import { Injectable } from "@angular/core";
import * as THREE from "THREE";
import * as mapboxgl from "mapbox-gl";
import {CityIOService} from "../service/cityio.service";

@Injectable({
  providedIn: "root"
})
export class GridLayer {
  cityIOData: any;

  constructor(private cityio: CityIOService) {
      if(this.cityio.table_data == null) {
          this.cityio.fetchCityIOdata().subscribe(data => {this.cityIOData = data});
      } else {
          this.cityIOData = this.cityio.table_data;
      }
    this.subscribeToMapClick();
  }

  subscribeToMapClick() {
    this.cityio.mapPosition.subscribe((data) => {
      console.log('Now trigger your THREE ray trace event that triggers cell editing: ', data);
    });
  }

  makeGridFromCityIO(): any {
    // parameters to ensure the model is georeferenced correctly on the map
    let {latitude, longitude, rotation} = this.cityIOData.header.spatial;
    let modelOrigin = [latitude, longitude];
    let modelAltitude = 0;
    let modelRotate = [
      0,
      0,
      (rotation * Math.PI) / 180
    ];
    let modelScale = 5.41843220338983e-8;
    console.log(modelRotate);

    // transformation parameters to position, rotate and scale the 3D model onto the map
    // mapboxgl.MercatorCoordinate doesnt work for me

    var modelTransform = {
      translateX: (<any>mapboxgl).MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).x,
      translateY: (<any>mapboxgl).MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).y,
      translateZ: (<any>mapboxgl).MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      ).z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelScale
    };

    let cityIOgrid = this.makeThreeScene();
    let mapboxCityIOGridLayer = this.makeMapboxLayerOfThreeScene(
      cityIOgrid,
      modelTransform
    );
    return mapboxCityIOGridLayer;
  }

  makeMapboxLayerOfThreeScene(cityIOgrid: [any], modelTransform: any): any {
    return {
      id: "3d-model",
      type: "custom",
      renderingMode: "3d",
      onAdd: function(map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();
        // create two three.js lights to illuminate the model
        let directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);
        let directionalLight2 = new THREE.DirectionalLight(0xffffff);
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
        let rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        let rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        let rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );
        let m = new THREE.Matrix4().fromArray(matrix);
        let l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              // ! note negative
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
      },
      addOnMapInitialisation: true
    };
  }

  makeThreeScene(): any {
    /**
     * makes the initial 3js grid of meshes and texts
     * @param sizeX, sizeY of grid
     */
    //  build threejs initial grid on load
    let { ncols, nrows, cellSize} = this.cityIOData.header.spatial;
    let grid_columns = ncols;
    let grid_rows = nrows;
    //get table dims
    let cell_size_in_meters = cellSize;
    let cell_rescale_precentage = 0.75;
    let this_mesh = null;
    let three_grid_group = new THREE.Object3D();
    let geometry = null;
    let material = null;

    //loop through grid rows and cols and create the grid
    for (let this_row = 0; this_row < grid_rows; this_row++) {
      for (let this_column = 0; this_column < grid_columns; this_column++) {
        geometry = new THREE.BoxBufferGeometry(
          cell_size_in_meters * cell_rescale_precentage,
          cell_size_in_meters * cell_rescale_precentage,
          this_column * this_row
        );
        //make material for each cell

        material = new THREE.MeshPhongMaterial({
          color: "hsl(" + this_row + "," + 100 + "%,50%)"
          // "white"
        });
        //make mesh for cell
        this_mesh = new THREE.Mesh(geometry, material);
        this_mesh.position.set(
          this_column * cell_size_in_meters,
          // !note negative
          -this_row * cell_size_in_meters,
          0.5 * (this_column * this_row)
        );
        three_grid_group.add(this_mesh);
      }
    }
    //  adds this groups to storage for later updates
    return three_grid_group;
  }
}
