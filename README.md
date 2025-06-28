 Custom Mark Feature
 
     The custom highlight feature is implemented in src/features/mark/.


Key files: 

      MarkToolbarButton.tsx: Defines the toolbar button logic and when it is active.
      MarkIcon.tsx: Provides the FontAwesome highlighter icon.
      markFeature.client.ts: Registers the button and feature with the Lexical editor on the client side.
      markFeature.server.ts: Registers the feature for server-side rendering and import mapping.
      index.ts: Exports the feature for easy import in the config.
