import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CityioGridMakerService {
  constructor() {}

  makeGridFromCityIO(cityiodata: any): GeoJsonPolygon[] {
    /**
     * Constructs and returns the GeoJsonPolygon grid cells from the
     * passed in CityIO data.
     *
     * @param nrows: number of rows in the cityIO grid
     * @param ncols: number of columns in the cityIO grid
     * @param gridCellSize: size of grid cell in meters
     * @returns and array of GeoJsonPolygons.
     **/

    let gridCellSize = cityiodata.header.spatial.cellSize,
      nrows = cityiodata.header.spatial.nrows,
      ncols = cityiodata.header.spatial.ncols,
      grid = cityiodata.grid;

    let polygons = [];
    for (var row = 0; row < nrows; row++) {
      for (var col = 0; col < ncols; col++) {
        // Make geoJsonPolygon
        let polygonCoordinates = this.generateCoordinatesFromCityIOData(
          row,
          col,
          gridCellSize
        );
        let polygon = new GeoJsonPolygon(polygonCoordinates);
        polygons.push(polygon);
      }
    }
    return polygons;
  }

  private generateCoordinatesFromCityIOData(
    /**
     * make polygon coordinates array
     *
     * @param row: number of rows in the cityIO grid
     * @param col: number of columns in the cityIO grid
     * @param gridCellSize: size of grid cell in meters
     * @returns and array of .
     **/
    row: number,
    col: number,
    gridCellSize: number
  ): number[][] {
    let squareSize = gridCellSize;
    let polygonCoordinates = [
      [0, 0],
      [0, 0, squareSize, 0],
      [0, 0, squareSize, squareSize],
      [0, 0, 0, squareSize],
      [0, 0]
    ];
    return polygonCoordinates;
  }
}

export class GeoJsonPolygon {
  type = "Feature";
  geometry: IGeometry;
  constructor(coordinates, public properties?) {
    this.geometry = {
      type: "Polygon",
      coordinates: [coordinates]
    };
    this.properties = properties ? properties : defaultGeoJsonProperties;
  }
}

export interface IGeometry {
  type: string;
  coordinates: number[];
}

export interface IGeoJson {
  type: string;
  geometry: IGeometry;
  properties?: any;
  $key?: string;
}

export const defaultGeoJsonProperties = {
  name: "empty",
  color: "gray",
  baseHeight: 0,
  height: 0
};
