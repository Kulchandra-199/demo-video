import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import { NagaVideo } from "./NagaVideo";
import { FontLoader } from "./FontLoader";

import { NagaProductVideo } from "./NagaProductVideo";
import { NagaProductVideoAwesome } from "./NagaProductVideoAwesome";
import { NagaProductVideoCinematic } from "./NagaProductVideoCinematic";
import { NagaDemoVideo } from "./NagaDemoVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <FontLoader />
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NagaVideo"
        component={NagaVideo}
        durationInFrames={2048}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NagaProductVideo"
        component={NagaProductVideo}
        durationInFrames={2340}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NagaProductVideoAwesome"
        component={NagaProductVideoAwesome}
        durationInFrames={2340}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NagaProductVideoCinematic"
        component={NagaProductVideoCinematic}
        durationInFrames={2340}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="NagaDemoVideo"
        component={NagaDemoVideo}
        durationInFrames={10981}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};