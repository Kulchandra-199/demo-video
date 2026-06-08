import React from "react";
import { staticFile } from "remotion";

const medium = staticFile("fonts/SofiaPro-Medium.woff2");
const semi = staticFile("fonts/SofiaPro-SemiBold.woff2");
const bold = staticFile("fonts/SofiaPro-Bold.woff2");

const fontStyles = `
  @font-face {
    font-family: 'Sofia Pro';
    src: url('${medium}') format('woff2');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Sofia Pro';
    src: url('${semi}') format('woff2');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Sofia Pro';
    src: url('${bold}') format('woff2');
    font-weight: 700;
    font-style: normal;
  }
`;

export const FontLoader: React.FC = () => {
  return <style dangerouslySetInnerHTML={{ __html: fontStyles }} />;
};
