# Arix Encrypted Pensieve – Memory Convergence

A 3D interactive magical experience + encrypted diary tool, inspired by the Pensieve from Harry Potter.

## Features

*   **Client-Side Encryption**: All encryption/decryption happens in the browser using `AES-GCM` via `window.crypto.subtle`.
*   **URL-Based Storage**: Encrypted memories are encoded directly into the URL, making them easy to share (and ensuring the server sees nothing).
*   **3D Magical Scene**:
    *   Realistic 3D stone basin with procedural textures.
    *   Interactive liquid simulation with shaders.
    *   Glowing runes and floating memory particles.
    *   Cinematic lighting and post-processing (Bloom, Vignette, Noise).
*   **Immersive UI**: No standard web forms; text and inputs float magically in the scene.

## Tech Stack

*   React + TypeScript + Vite
*   Three.js + @react-three/fiber + @react-three/drei
*   Postprocessing
*   Zustand (State Management)

## Usage

1.  **Create Memory**:
    *   Click the basin.
    *   Whisper (type) your memory and a secret passphrase.
    *   Click the sigil to "Cast" the memory.
    *   Copy the generated URL.

2.  **Unlock Memory**:
    *   Open a memory URL.
    *   Click the basin/prompt.
    *   Speak (type) the passphrase.
    *   Watch the memory reveal itself.

## Security Note

The passphrase and plaintext diary content are **never** sent to any backend server. They exist only in your browser's memory during the session.
