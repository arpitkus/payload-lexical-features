import fs from 'fs'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { FootnoteFeature } from './lexical/features/FootnoteFeature.server'
import { fileURLToPath } from 'url'
import { MarkFeature } from './features/mark'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    
  },
  collections: [Users, Media , Posts],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => {
      const removeFeatures = ['link', 'image', 'video', 'audio']
      return [
        ...defaultFeatures.filter((feature) => !removeFeatures.includes(feature.key)),
        //  i will add features here
        MarkFeature(),
        FootnoteFeature(),
        
      ]
    },
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
  ],
})
