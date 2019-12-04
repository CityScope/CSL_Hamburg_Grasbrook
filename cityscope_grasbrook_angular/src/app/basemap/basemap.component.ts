import {AfterViewInit, Component, OnInit, NgZone} from "@angular/core";
import {environment} from "../../environments/environment";
import {interval, throwError} from "rxjs";
import * as mapboxgl from "mapbox-gl";
import {Maptastic} from "maptastic/dist/maptastic.min.js";
import {CsLayer} from "../../typings";
import {LngLat, LngLatBoundsLike, LngLatLike} from "mapbox-gl";
import {GeoJSONSource} from "mapbox-gl";
import {ConfigurationService} from "../services/configuration.service";
import {LayerLoaderService} from "../services/layer-loader.service";
import { CityIOService } from "../services/cityio.service";
import {AuthenticationService} from "../services/authentication.service";
import {MatBottomSheet, MatDialog} from "@angular/material";
import {ExitEditorDialog} from "../menus/exit-editor/exit-editor-dialog";
import {Router} from "@angular/router";
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {AppComponent} from "../app.component";
import {AlertService} from "../services/alert.service";
import {LocalStorageService} from "../services/local-storage.service";
import {RestoreMessage} from "../menus/restore-message/restore-message";
import {GridCell} from "../entities/cell";


@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}

@Component({
    selector: 'app-basemap',
    templateUrl: './basemap.component.html',
    styleUrls: ['./basemap.component.scss']
})
export class BasemapComponent implements OnInit, AfterViewInit {
    map: mapboxgl.Map;
    mapCanvas;
    style;
    mapKeyLayer: CsLayer;
    mapKeyVisible: boolean;
    layers: CsLayer[] = [];
    intervalMap = {};
    selectedCellColor = '#00FF00';

    // Map config
    center: any;
    zoom: number;
    pitch: number;
    bearing: number;


    popUp: mapboxgl.Popup;

    initialExtrusionHeight: any = null;
    isShowMenu = true;

    // Multiple element selection
    start;
    current;
    box;

    //Edit menu
    sliderTop = 200;
    sliderLeft = 200;
    isEditMenu = false;
    editableGridLayer = 'grid';
    selectedFeatures = [];
    selectedGridCell: GridCell;
    menuOutput: GridCell;

    constructor(
        private cityio: CityIOService,
        private layerLoader: LayerLoaderService,
        private config: ConfigurationService,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private _bottomSheet: MatBottomSheet,
        private localStorageService: LocalStorageService,
        public dialog: MatDialog,
        private router: Router,
        private zone: NgZone) {
        // get the acess token
        // mapboxgl.accessToken = environment.mapbox.accessToken;
        (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
    }

    ngOnInit() {
        console.log('init map');
        this.initializeMap([10.0143909533867, 53.53128461384861]);

        // if (this.cityio.table_data == null) {
        //   console.log('null cityIO');
        //   this.cityio.fetchCityIOdata().subscribe(data => {
        //     this.initializeMap(data);
        //   });
        // }
        this.cityio.gridChangeListener.push(this.updateFromCityIO)
    }

    ngAfterViewInit() {
    }

    private initializeMap(cityIOdata) {
        // TODO: more variables from cityIO or we would suggest setting them via config.json since not everyone has a cityio server
        // this.zoom = cityIOdata.header.###;
        this.zoom = this.config.mapZoom;
        // this.bearing = cityIOdata.header.###;
        this.bearing = this.config.bearing;
        // this.pitch = cityIOdata.header.###;
        this.pitch = this.config.pitch;

        this.style = this.config.mapStyle;
        // this.center = [
        //   cityIOdata.header.spatial.longitude,
        //   cityIOdata.header.spatial.latitude
        // ];

        // Just what I would suggest to center GB - more or less
        this.center = cityIOdata;

        // add the base map and config
        this.map = new mapboxgl.Map({
            container: 'basemap',
            style: this.style,
            zoom: this.zoom,
            bearing: this.bearing,
            pitch: this.pitch,
            center: this.center
        });

        this.map.boxZoom.disable();

        this.map.on('load', event => {
            this.mapCanvas = this.map.getCanvasContainer();
            this.updateMapLayers(event);
        });

        this.map.on('mousedown', event => {
            // this.cityio.mapPosition.next(event.point);
        });

        if (this.config.isShowPopUp) {
            this.map.on('mouseenter', this.editableGridLayer, this.initPopup);
            this.map.on('mouseleave', this.editableGridLayer, this.removePopUp);
        }

        this.map.on('error', event => {
            console.log('Map error: ' + event);
        });
    }

    /*
     * Set layer visibility e.g. after interaction with side panels or layer switcher
     */

    updateMapLayers(event) {
        const layers: CsLayer[] = this.layerLoader.getLayers();
        layers.map(l => this.deployLayers(l));
    }

    deployLayers(csLayer: CsLayer) {
        if (csLayer.hasReloadInterval) {
            this.toggleIntervalLayer(csLayer, csLayer.addOnMapInitialisation);
        } else if (csLayer.addOnMapInitialisation) {
            this.map.addLayer(csLayer);
            csLayer.visible = true;
            // Too static - has to go somewhere
            if (csLayer.id === this.editableGridLayer) {
                this.addGridInteraction();
            }
        }
        if (csLayer.showInLayerList) {
            this.zone.run(() => {
                this.layers.push(csLayer);
            });
        }
    }

    toggleLayer() {
        for (let layer of this.layers) {
            if (layer.visible && this.map.getLayer(layer.id) == null) {
                if (layer.hasReloadInterval) {
                    this.toggleIntervalLayer(layer, true);
                } else {
                    this.map.addLayer(layer);
                    // Too static - has to go somewhere
                    if (layer.id === this.editableGridLayer) {
                        this.addGridInteraction();
                    }
                }
            } else if (!layer.visible && this.map.getLayer(layer.id) != null) {
                if (layer.id === this.editableGridLayer) {
                    this.removeGridInteraction();
                }
                this.map.removeLayer(layer.id);
                if (this.map.getSource(layer.id)) {
                    this.map.removeSource(layer.id);
                }
            }
        }
    }

    private toggleIntervalLayer(csLayer: CsLayer, isShowLayer: boolean) {
        if (isShowLayer) {
            this.map.addLayer(csLayer);
            const layerInterval = interval(2000).subscribe(n =>
                this.resetDataUrl(csLayer)
            );
            this.intervalMap[csLayer.id] = layerInterval;
            csLayer.visible = true;
        } else {
            if (this.intervalMap.hasOwnProperty(csLayer.id)) {
                clearInterval(this.intervalMap[csLayer.id]);
            }
        }
    }

    resetDataUrl = (csLayer: CsLayer) => {
        (this.map.getSource(csLayer.id) as GeoJSONSource).setData(
            csLayer['source']['data']
        );
    };

    showMapLegend(layer: CsLayer) {
        // Activate the potential legend for the layer
        this.mapKeyLayer = layer;
        this.mapKeyVisible = true;
    }

    /*
     *   Handle grid interactions
     */

    private addGridInteraction() {
        let localStorageGrid = this.localStorageService.getGrid();
        if (localStorageGrid) {
            this._bottomSheet.open(RestoreMessage);

            this._bottomSheet._openedBottomSheetRef
                .afterDismissed()
                .subscribe(data => {
                    if (data) {
                        this.restoreLocalStorageGrid(localStorageGrid);
                    } else {
                        this.localStorageService.removeGrid();
                    }
                });
        }
        this.map.on('click', this.editableGridLayer, this.clickOnGrid);
        // this.map.on('click', this.clickMenuClose);
        // keyboard event
        this.mapCanvas.addEventListener('keydown', this.keyStrokeOnMap);

        // map multi select for logged in users
        this.mapCanvas.addEventListener('mousedown', this.mouseDown, true);

        this.map.on('dragstart', this.removePopUp);
        this.map.on('zoomstart',  this.removePopUp);
    }

    private removeGridInteraction() {
        this.map.off('click', this.editableGridLayer, this.clickOnGrid);
        this.map.off('click', this.clickMenuClose);
        // keyboard event
        this.mapCanvas.removeEventListener('keydown', this.keyStrokeOnMap);

        this.map.off('dragstart',  this.removePopUp);
        this.map.off('zoomstart',  this.removePopUp);
    }

    //
    // Handle all map keystroke interactions

    keyStrokeOnMap = e => {
        //Keystroke for menu toggle
        if (e.code === 'Space') {
            // TODO: we could make this option only available for superusers
            this.toggleMenu();
        }
    };

    private restoreLocalStorageGrid(localStorageGrid) {
        let {gridLayer, currentSource} = this.getGridSource();
        // Restore the grid but set the features to unselected stage
        for (let feature of localStorageGrid['features']) {
            if (feature.properties['isSelected']) {
                feature.properties['isSelected'] = false;
                feature.properties['color'] = feature.properties['initial-color'];
            }
        }
        gridLayer.setData(localStorageGrid);
    }

    private getGridSource() {
        let gridLayer: GeoJSONSource = this.map.getSource(
            this.editableGridLayer
        ) as GeoJSONSource;
        let currentSource = gridLayer['_data'];
        return {gridLayer, currentSource};
    }

    clickOnGrid = e => {
        let clickedFeature = e.features[0];
        this.showFeaturesSelected([clickedFeature]);
        this.isNewSelectionDifferentType([clickedFeature]);
    };

    private showFeaturesSelected(selectedFeature: any[]) {
        let {gridLayer, currentSource} = this.getGridSource();
        for (let clickedFeature of selectedFeature) {
            for (let feature of currentSource['features']) {
                if (feature.properties['id'] === clickedFeature.properties['id']) {
                    if (feature.properties['color'] === this.selectedCellColor) {
                        feature.properties['color'] = feature.properties['initial-color'];
                        feature.properties['isSelected'] = false;
                        // remove this cell from array
                        for (var i = this.selectedFeatures.length - 1; i >= 0; i--) {
                            if (
                                this.selectedFeatures[i] === clickedFeature.properties['id']
                            ) {
                                this.selectedFeatures.splice(i, 1);
                            }
                        }
                    } else {
                        feature.properties['initial-color'] = feature.properties['color'];
                        feature.properties['isSelected'] = true;
                        feature.properties['color'] = this.selectedCellColor;
                        this.selectedFeatures.push(clickedFeature.properties['id']);
                        this.showEditMenu();
                    }
                }
            }
            gridLayer.setData(currentSource);
        }
        this.isNewSelectionDifferentType(selectedFeature);
    }

    private getFeatureById(id: Number) {
        let {gridLayer, currentSource} = this.getGridSource();
        for (let feature of currentSource['features']) {
            if (feature['id'] === id) {
                return feature;
            }
        }
    }

    private isNewSelectionDifferentType(newSelection: any[]) {
        let featureType = null;
        for (let selectedId of this.selectedFeatures) {
            const selectedFeatureType = this.getFeatureById(selectedId).properties['type'];
            if (!featureType) {
                featureType = selectedFeatureType;
            } else if (featureType !== selectedFeatureType) {
                this.alertService.error('Warning', 'The selected features are of different types', 10000)
                break;
            }

        }

    }


    /*
     *   Handle multiple element selection
     */

    mousePos = e => {
        let rect = this.mapCanvas.getBoundingClientRect();
        return new mapboxgl.Point(
            e.clientX - rect.left - this.mapCanvas.clientLeft,
            e.clientY - rect.top - this.mapCanvas.clientTop
        );
    };

    mouseDown = e => {
        // Continue the rest of the function if the shiftkey is pressed.
        if (!(e.shiftKey && e.button === 0)) return;

        // Disable default drag zooming when the shift key is held down.
        this.map.dragPan.disable();
        // this.map.boxZoom.disable();

        // Call functions for the following events
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('keydown', this.onKeyDown);

        // Capture the first xy coordinates
        this.start = this.mousePos(e);
    };

    onMouseMove = e => {
        // Capture the ongoing xy coordinates
        this.current = this.mousePos(e);

        // Append the box element if it doesnt exist
        if (!this.box) {
            this.box = document.createElement('div');
            this.box.style.cssText =
                'background: rgba(56,135,190,0.1); border: 2px solid #3887be;';
            this.mapCanvas.appendChild(this.box);
        }

        let minX = Math.min(this.start.x, this.current.x),
            maxX = Math.max(this.start.x, this.current.x),
            minY = Math.min(this.start.y, this.current.y),
            maxY = Math.max(this.start.y, this.current.y);

        // Adjust width and xy position of the box element ongoing
        let pos = 'translate(' + minX + 'px,' + minY + 'px)';
        this.box.style.transform = pos;
        this.box.style.WebkitTransform = pos;
        this.box.style.width = maxX - minX + 'px';
        this.box.style.height = maxY - minY + 'px';
    };

    onMouseUp = e => {
        // Capture xy coordinates
        this.finish([this.start, this.mousePos(e)]);
        this.showEditMenu();
    };

    onKeyDown = e => {
        // If the ESC key is pressed
        if (e.keyCode === 27) this.finish(null);
    };

    finish(bbox) {
        // Remove these events now that finish has been called.
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        let features = null;
        if (this.box) {
            this.box.parentNode.removeChild(this.box);
            this.box = null;
        }
        // If bbox exists. use this value as the argument for `queryRenderedFeatures`
        if (bbox) {
            features = this.map.queryRenderedFeatures(bbox, {
                layers: [this.editableGridLayer]
            });
            if (features.length >= 1000) {
                return window.alert('Select a smaller number of features');
            }
            this.showFeaturesSelected(features);
        }
        this.map.dragPan.enable();
    }

    /*
     *   Map menu logic
     */

    public mapSettingsListener(menuOutput: Object[]) {
        switch (menuOutput[0]) {
            case 'resetMap': {
                this.resetMapPosition();
                break;
            }
            case 'csMode': {
                this.map.setPitch(0);
                if (this.initialExtrusionHeight) {
                    this.map.setPaintProperty(
                        'building',
                        'fill-extrusion-height',
                        this.initialExtrusionHeight
                    );
                    this.initialExtrusionHeight = null;
                    this.resetMapPosition();
                } else {
                    this.initialExtrusionHeight = this.map.getPaintProperty(
                        'building',
                        'fill-extrusion-height'
                    );
                    this.map.setPaintProperty('building', 'fill-extrusion-height', 0);
                }
                break;
            }
            case 'maptasticMode': {
                this.toggleMaptasticMode();
                break;
            }
            case 'fitToGrid': {
                this.zoomToBounds();
                break;
            }
        }
    }

    zoomToBounds() {
        const coordinates: LngLatBoundsLike = [
            [10.007443106532065, 53.536988036579146],
            [10.017010433937628, 53.527408296213764]
        ];
        const topLeft: LngLatLike = coordinates[0];
        const bottomRight: LngLatLike = coordinates[1];

        const bounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(LngLat.convert(coord));
        }, new mapboxgl.LngLatBounds(topLeft, bottomRight));

        this.map.fitBounds(bounds, {
            padding: 0,
            bearing: this.config.gridBearing,
            zoom: this.config.gridZoom,
            pitch: this.config.gridPitch
        });
    }

    resetMapPosition() {
        this.map.setZoom(this.zoom);
        this.map.setCenter(this.center);
        this.map.setBearing(this.bearing);
        if (!this.initialExtrusionHeight) {
            this.map.setPitch(this.pitch);
        }
    }

    toggleMaptasticMode() {
        Maptastic('basemap');
    }

    private toggleMenu() {
        this.isShowMenu = !this.isShowMenu;
    }

    // close button function
    private closeAndLogout() {
        if (
            this.authenticationService.currentUserValue &&
            this.localStorageService.getGrid()
        ) {
            this.openDialog();
        } else {
            this.exitEditor();
        }
    }

    private saveCurrentChanges() {
        this.localStorageService.removeGrid();
        // cityio.pending_changes is changed when editing features
        this.cityio.pushAllChanges()
        this.alertService.success('Data saved', '');
    }

    public updateFromCityIO = e => {
        console.log("update grid")

        let {gridLayer, currentSource} = this.getGridSource();
        for (let feature of currentSource['features']) {
            if(this.cityio.table_data["grid"].length <= feature["id"]) break
            if(this.cityio.table_data["grid"][feature["id"]] == null) break

            let typeint = this.cityio.table_data["grid"][feature["id"]][0]
            let typeDict = this.cityio.table_data["header"]["mapping"]["type"][typeint]

            GridCell.fillFeatureByCityIOType(feature, typeDict);

            // Color change has to be done here again!?
            if (feature.properties['changedTypeColor']) {
                feature.properties['color'] = feature.properties['changedTypeColor'];
                delete feature.properties['changedTypeColor'];
            } else {
                feature.properties['color'] = feature.properties['initial-color'];
                delete feature.properties['changedTypeColor'];
            }
            if (feature.properties['type'] !== 0) {
                feature.properties['height'] = 0;
            }

            feature.properties['isSelected'] = false;
        }
        gridLayer.setData(currentSource);
    }

    /*
     *   Slider menu
     */

    private showEditMenu() {
        if (this.selectedFeatures.length > 1) {
            // Snackbox warning
            // Check if features are all the same?
        } else {
            let feature = this.getFeatureById(this.selectedFeatures[0])
            this.selectedGridCell = new GridCell();
            GridCell.fillGridCellByFeature(this.selectedGridCell, feature);
        }

        this.isEditMenu = true;

        // Menu needs to be confirmed or cancelled
        // this.map.on('click', this.clickMenuClose);
    }

    private hideMenu(menuOutput: GridCell) {
        if (menuOutput) {
            this.menuOutput = menuOutput;
            // this.handleMenuOutput(menuOutput);
            this.clickMenuClose(null);
        }
        this.isEditMenu = false;
    }

    updateCityIOgridCell(feature){
        if( !this.cityio.table_data) { return }
        // get properties of changed features
        let typeDefinition = GridCell.featureToTypemap(feature);

        // find or create type in header
        let header = this.cityio.table_data["header"]
        let typeint = header["mapping"]["type"].findIndex(e => {
            // TODO: this is a really bad way to compare two objects!
            const a = JSON.stringify(typeDefinition).split("").sort().join()
            const b = JSON.stringify(e).split("").sort().join()
            return a==b
        })
        if (typeint === -1) {
            // new type
            typeint = header["mapping"]["type"].length;
            header["mapping"]["type"][typeint] = typeDefinition;
            this.cityio.pushCityIOdata("header", header);
        }
        
        let id = feature["id"]
        console.log("write cell",id,"value",typeint)
        this.cityio.pending_changes[id]= [typeint, 0]   // remember change
    }

    clickMenuClose = e => {
        this.isEditMenu = false;
        this.map.off('click', this.clickMenuClose);
        let {gridLayer, currentSource} = this.getGridSource();
        for (let feature of currentSource['features']) {
            if (this.selectedFeatures.indexOf(feature['id']) > -1) {
                GridCell.fillFeatureByGridCell(feature, this.menuOutput);

                // Color change has to be done here again!?
                if (feature.properties['changedTypeColor']) {
                    feature.properties['color'] = feature.properties['changedTypeColor'];
                    delete feature.properties['changedTypeColor'];
                } else {
                    feature.properties['color'] = feature.properties['initial-color'];
                    delete feature.properties['changedTypeColor'];
                }
                if (feature.properties['type'] !== 0) {
                    feature.properties['height'] = 0;
                }

                feature.properties["isSelected"] = false;

                this.updateCityIOgridCell(feature)
            }
        }
        gridLayer.setData(currentSource);
        this.selectedFeatures = [];
        this.menuOutput = null;
        this.alertService.dismiss();
    };

    // public handleMenuOutput(menuOutput: GridCell) {
    //     let {gridLayer, currentSource} = this.getGridSource();
    //     for (let feature of currentSource['features']) {
    //         if (this.selectedFeatures.includes(feature.properties['id'])) {
    //             GridCell.fillFeatureByGridCell(feature, menuOutput)
    //             // for (let key of Object.keys(menuOutput)) {
    //             //     feature.properties[key] = menuOutput[key];
    //             // }
    //         }
    //     }
    //     gridLayer.setData(currentSource);
    // }

    // PopUp

    private createPopUp() {
        this.popUp = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true
        });
    }

    initPopup = e => {
        this.createPopUp();
        const gridCell = new GridCell();
        GridCell.fillGridCellByFeature(gridCell, e.features[0]);

        let description = '<h5> Cell details </h5>';
        for (let gridCellKey of Object.keys(gridCell)) {
            description = description + '<span style="width: 100%; float: left">' + gridCellKey + ': ' + gridCell[gridCellKey] + ' </span>';
        }

        
        this.popUp.setLngLat(e.lngLat)
            .setHTML(description)
            .addTo(this.map);
    };

    removePopUp = e => {
        if (this.popUp) {
            this.popUp.remove();
            this.popUp = null;
        }
    };

    /*
     *   On exit actions
     */

    openDialog(): void {
        const dialogRef = this.dialog.open(ExitEditorDialog, {
            width: '250px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.saveCurrentChanges();
            }
            this.exitEditor();
        });
    }

    private exitEditor() {
        this.localStorageService.removeGrid();
        this.authenticationService.logout();
        this.router.navigate(['']);
    }
}
