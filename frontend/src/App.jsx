import React from 'react';
import Chatbot from './chatbox';
import SoftAurora from './SoftAurora';
import './App.css';

function App() {
  return (
    <div className="app-root">
      {/* Full-screen aurora background */}
      <div className="aurora-bg">
        <SoftAurora
          speed={0.5}
          scale={1.8}
          brightness={1.2}
          color1="#7c3aed"
          color2="#4f46e5"
          noiseFrequency={2.2}
          noiseAmplitude={0.9}
          bandHeight={0.45}
          bandSpread={1.2}
          octaveDecay={0.12}
          layerOffset={0.8}
          colorSpeed={0.8}
          enableMouseInteraction={true}
          mouseInfluence={0.18}
        />
      </div>

      {/* Chat UI on top */}
      <div className="app-content">
        <Chatbot />
      </div>
    </div>
  );
}

export default App;
