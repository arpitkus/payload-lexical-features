
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
