import { clsx } from "clsx";
import type { DivIconOptions } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinIcon } from "lucide-react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import type {
    CircleMarkerProps,
    CircleProps,
    MapContainerProps,
    MarkerProps,
    PolylineProps,
    PopupProps,
    TileLayerProps,
    ZoomControlProps,
} from "react-leaflet";
import {
    Circle as LeafletCircle,
    CircleMarker as LeafletCircleMarker,
    Marker as LeafletMarker,
    Polyline as LeafletPolyline,
    Popup as LeafletPopup,
    MapContainer,
    TileLayer,
    ZoomControl,
} from "react-leaflet";

function Map({
  zoom = 15,
  maxZoom = 18,
  className,
  ...props
}: Omit<MapContainerProps, "zoomControl">) {
  return (
    <MapContainer
      zoom={zoom}
      maxZoom={maxZoom}
      attributionControl={false}
      zoomControl={false}
      className={clsx("z-0 h-full w-full", className)}
      {...props}
    />
  );
}

function MapTileLayer({
  url = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  attribution =
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
  ...props
}: Partial<TileLayerProps>) {
  return <TileLayer url={url} attribution={attribution} {...props} />;
}

function MapMarker({
  icon = <MapPinIcon className="h-5 w-5 text-brand-500" />,
  iconAnchor = [12, 12],
  bgPos,
  popupAnchor,
  tooltipAnchor,
  ...props
}: Omit<MarkerProps, "icon"> &
  Pick<
    DivIconOptions,
    "iconAnchor" | "bgPos" | "popupAnchor" | "tooltipAnchor"
  > & {
    icon?: ReactNode;
  }) {
  const markerIcon = L.divIcon({
    className: "",
    html: renderToString(icon),
    iconAnchor,
    ...(bgPos ? { bgPos } : {}),
    ...(popupAnchor ? { popupAnchor } : {}),
    ...(tooltipAnchor ? { tooltipAnchor } : {}),
  });

  return <LeafletMarker icon={markerIcon} riseOnHover {...props} />;
}

function MapPopup({ className, ...props }: PopupProps) {
  return <LeafletPopup className={className} {...props} />;
}

function MapZoomControl({ position = "topright", ...props }: ZoomControlProps) {
  return <ZoomControl position={position} {...props} />;
}

function MapCircle(props: CircleProps) {
  return <LeafletCircle {...props} />;
}

function MapCircleMarker(props: CircleMarkerProps) {
  return <LeafletCircleMarker {...props} />;
}

function MapPolyline(props: PolylineProps) {
  return <LeafletPolyline {...props} />;
}

export {
    Map,
    MapCircle,
    MapCircleMarker,
    MapMarker,
    MapPolyline,
    MapPopup,
    MapTileLayer,
    MapZoomControl
};

