import raccoon from "../assets/raccoon.png";
import bear from "../assets/bear.png";
import bunny from "../assets/bunny.png";
import cat from "../assets/cat.png";
import chick from "../assets/chick.png";
import chicken from "../assets/chicken.png";
import cow from "../assets/cow.png";
import dog from "../assets/dog.png";
import goat from "../assets/goat.png";
import koala from "../assets/koala.png";
import lion from "../assets/lion.png";
import monkey from "../assets/monkey.png";
import pig from "../assets/pig.png";
import sheep from "../assets/sheep.png";
import tiger from "../assets/tiger.png";
import turtle from "../assets/turtle.png";

export const CHARACTERS = {
  bear:    { id:"bear",    label:"Bear",    src: bear,    focusX:50,  focusY:-10, zoom:0.95, previewScale:0.84, previewX:-20, previewY:-6, profilePreview:{x: -8, y: 9, scale: 0.8}},
  bunny:   { id:"bunny",   label:"Bunny",   src: bunny,   focusX:50,  focusY:40,  zoom:0.95, previewScale:0.75, previewX:-20, previewY:-37, profilePreview:{x: -8, y: -8, scale: 0.72} },
  cat:     { id:"cat",     label:"Cat",     src: cat,     focusX:-30, focusY:-8,  zoom:1.1,  previewScale:0.93, previewX:3,   previewY:0, profilePreview:{x: 3, y: 12, scale: 0.88} },
  chick:   { id:"chick",   label:"Chick",   src: chick,   focusX:50,  focusY:15,  zoom:0.9,  previewScale:0.75, previewX:-20, previewY:-13, profilePreview:{x: -7, y: 4, scale: 0.72} },
  chicken: { id:"chicken", label:"Chicken", src: chicken, focusX:50,  focusY:23,  zoom:0.9,  previewScale:0.75, previewX:-20, previewY:-25, profilePreview:{x: -8, y: -1, scale: 0.71} },
  cow:     { id:"cow",     label:"Cow",     src: cow,     focusX:50,  focusY:0,   zoom:0.93, previewScale:0.83, previewX:-20, previewY:-11, profilePreview:{x: -8, y: 6, scale: 0.79} },
  dog:     { id:"dog",     label:"Dog",     src: dog,     focusX:50,  focusY:-3,  zoom:0.98, previewScale:0.78, previewX:-20, previewY:2, profilePreview:{x: -9, y: 12, scale: 0.74} },
  goat:    { id:"goat",    label:"Goat",    src: goat,    focusX:50,  focusY:-5,  zoom:0.99, previewScale:0.86, previewX:-20, previewY:-7, profilePreview:{x: -9, y: 7, scale: 0.82} },
  koala:   { id:"koala",   label:"Koala",   src: koala,   focusX:50,  focusY:0,   zoom:1.6,  previewScale:1.3,  previewX:-20, previewY:2, profilePreview:{x: -7, y: 12, scale: 1.25} },
  lion:    { id:"lion",    label:"Lion",    src: lion,    focusX:50,  focusY:0,   zoom:1.08, previewScale:1.1,  previewX:-20, previewY:-24, profilePreview:{x: -7, y: -2, scale: 1.04} },
  monkey:  { id:"monkey",  label:"Monkey",  src: monkey,  focusX:50,  focusY:17,  zoom:1.3,  previewScale:1.1,  previewX:-15, previewY:3, profilePreview:{x: -7, y: 6.5, scale: 1.12} },
  turtle:  { id:"turtle",  label:"Turtle",  src: turtle,  focusX:50,  focusY:-5,  zoom:0.95, previewScale:0.76, previewX:-20, previewY:5, profilePreview:{x: -8, y: 13, scale: 0.73} },
  pig:     { id:"pig",     label:"Pig",     src: pig,     focusX:50,  focusY:-15, zoom:0.95, previewScale:0.8,  previewX:-20, previewY:5, profilePreview:{x: -8, y: 14.5, scale: 0.76} },
  raccoon: { id:"raccoon", label:"Raccoon", src: raccoon, focusX:-18, focusY:-20, zoom:1.1,  previewScale:1,    previewX:0,   previewY:0, profilePreview:{x: 3, y: 12, scale: 0.95} },
  sheep:   { id:"sheep",   label:"Sheep",   src: sheep,   focusX:50,  focusY:24,  zoom:1,    previewScale:0.8,  previewX:-20, previewY:-22, profilePreview:{x: -9, y: 4, scale: 0.73} },
  tiger:   { id:"tiger",   label:"Tiger",   src: tiger,   focusX:25,  focusY:-8,  zoom:1.2,  previewScale:0.99, previewX:-8,  previewY:3, profilePreview:{x: -1, y: 12, scale: 0.95} },
};

export const COLORS = {
  blue:   "#0F348F",
  yellow: "#FFCD00",
  orange: "#FF7700",
  pink:   "#E34680",
  mint:   "#8BBD0C",
};

export const charById = (id) => CHARACTERS[id] || CHARACTERS.raccoon;
export const colorById = (id) => COLORS[id] || COLORS.blue;

export function getPreviewFor(char, context="profile"){
  const override= (context === "profile" && char.profilePreview) || null;
  const x = override?.x ?? char.previewX ?? 0;
  const y = override?.y ?? char.preview ?? 0;
  const scale = override?.scale ?? char.previewScale ?? 1;

  return {
    x, y, scale
  };
}
