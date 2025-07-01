
## Prerequisites

     - [Node.js](https://nodejs.org/) (v18+ recommended)
     - [pnpm](https://pnpm.io/) (recommended for workspace compatibility)
     - [MongoDB](https://www.mongodb.com/) (local or Atlas)

---

## Installation

    1. **Clone the repository:**
       ```sh
       git clone https://github.com/your-username/custom-lexical-features.git
       cd custom-lexical-features
 
 
    2. Install dependencies:
          pnpm install


    3. Configure environment variables:
           Copy .env.example to .env (if provided) or create a .env file.
           Set your MongoDB connection string

 
 
 
 ## Running the Project
     pnpm dev
 
 
 ## Custom Mark Feature
 
     The custom highlight feature is implemented in src/features/mark/.


     Key files: 
     
           MarkToolbarButton.tsx: Defines the toolbar button logic and when it is active.
           MarkIcon.tsx: Provides the FontAwesome highlighter icon.
           markFeature.client.ts: Registers the button and feature with the Lexical editor on the client side.
           markFeature.server.ts: Registers the feature for server-side rendering and import mapping.
           index.ts: Exports the feature for easy import in the config.



## Footnote Feature (working on it for now !)

     Users can add footnotes to text while editing content.
     Footnotes are displayed as superscript numbers with corresponding content at the bottom.
     Footnotes should be editable and persist with content.


          Main Implementation Steps
          
          1. **Custom Node:**  
             - `src/lexical/nodes/FootnoteNode.ts`  
             Defines a `FootnoteNode` that renders as a superscript marker and stores footnote content.
          
          2. **Client Feature:**  
             - `src/lexical/features/FootnoteFeature.client.tsx`  
             Registers the node, modal, popup, and toolbar button for the editor UI.
          
          3. **Server Feature:**  
             - `src/lexical/features/FootnoteFeature.server.ts`  
             Registers the node and links the client feature for Payload's server-side config.
          
          4. **Modal & Popup:**  
             - `src/lexical/plugins/Modal.tsx`  
               Minimal, dark-themed modal for adding/editing footnotes.
             - `src/lexical/plugins/Popup.tsx`  
               Minimal popup for previewing, editing, or deleting footnotes.
          
          5. **State Management:**  
             - `src/lexical/modalStore.ts`  
             Uses Valtio for modal open/close and state.
<img width="365" alt="image" src="https://github.com/user-attachments/assets/28d10bec-0475-4c06-88d2-13ca99719b01" />
