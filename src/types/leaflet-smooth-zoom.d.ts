import "leaflet";

declare module "leaflet" {
  export interface MapOptions {
    smoothWheelZoom?: boolean | "center";
    smoothSensitivity?: number;
  }

  export namespace Map {
    interface Map {
      addHandler(name: string, HandlerClass: typeof Handler): void;
    }
    let SmoothWheelZoom: typeof Handler;
  }
}
