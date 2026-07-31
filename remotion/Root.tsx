import { Composition } from 'remotion';
import { PrecomposedDemo } from './PrecomposedDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PrecomposedDemo"
        component={PrecomposedDemo}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
