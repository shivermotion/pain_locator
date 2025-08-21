// 3D Model Configuration
export const modelConfig = {
  // Your GLB model file path (place your file in public/models/)
  modelPath: '/models/man.glb',
  
  // Model transformation settings
  scale: 3.0, // Adjust if your model is too large or small
  position: [0, -3, 0] as [number, number, number], // [x, y, z] position
  rotation: [0, 0, 0] as [number, number, number], // [x, y, z] rotation in radians
  
  // Rendering settings
  enableShadows: true,
  enableClickDetection: true,
  
  // Camera settings for your model
  cameraSettings: {
    position: [0, 0, 5] as [number, number, number],
    fov: 50,
    minDistance: 2,
    maxDistance: 10,
  },
  
  // Lighting settings
  lighting: {
    ambient: {
      intensity: 0.5,
    },
    directional: {
      position: [10, 10, 5] as [number, number, number],
      intensity: 1,
    },
  },
};

// Common model adjustments
export const modelPresets = {
  // For a human body model
  humanBody: {
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  
  // For a larger model
  large: {
    scale: 0.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  
  // For a smaller model
  small: {
    scale: 2.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  
  // For a model that needs rotation
  rotated: {
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0], // Rotate 180 degrees around Y axis
  },
};
