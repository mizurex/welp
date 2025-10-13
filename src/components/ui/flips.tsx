import React from "react";
import { FlipWords } from "./flip-words";

export default function Flips() {
  const words = [
    "welp?",
    "study?",
    "visualize?"
    
  ];
  return (<FlipWords words={words} />);
}
