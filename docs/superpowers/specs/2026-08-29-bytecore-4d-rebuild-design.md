# ByteCore 4D Spatial Rebuild Design

**Goal:** Rebuild Home and Academic Vault around real WebGL 3D artifacts with time-based motion, tactile interaction, and spatial page transitions while preserving the static HSBTE curriculum architecture.

**Architecture:** A shared vanilla Three.js runtime renders page-specific scenes into isolated stages. Core math and interaction contracts remain framework-free and testable. DOM content stays in normal document flow; WebGL never replaces the semantic content layer.

**Visual direction:** The reference project's bold showcase composition and interaction behavior are adapted into ByteCore's dark engineering palette: `#03090D`, `#2EACB9`, `#8BE1E8`, `#B8E66B`, and white. The 4D effect means 3D geometry evolving through time and camera space, not a literal fourth spatial axis.

**Interaction:** Slow idle rotation, faster but restrained hover spin, direct pointer/touch drag, momentum decay, floating/bobbing motion, pointer-reactive lighting/camera, and scroll-driven camera depth. Reduced motion disables autonomous animation.

**Home:** One dominant high-detail ByteCore artifact with nested shells, energy core, orbit bands, academic nodes, labels, particles, and depth-separated links. Hero copy remains outside the canvas.

**Academic Vault:** A distinct dimensional curriculum artifact with six semester portals arranged on a depth-aware ring, central vault core, animated connectors, and hover expansion. Semester controls remain semantic DOM controls below the stage.

**Performance:** Desktop DPR capped at 2.25 with high-detail geometry; compact and mobile profiles reduce geometry, particles and antialiasing. WebGL is optional and must fail back without removing semantic content.

**Verification:** Every stage gets focused tests, then the complete Node test suite and content validation. No PR until source diff checks and two verification passes are green.
