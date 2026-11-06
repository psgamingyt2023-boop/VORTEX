# VORTEX AI

Premium multi-provider coding workspace. Source bundle: `vortex-ai-source.tar.gz.b64`.

The Vercel project uses an install hook to unpack the committed source bundle before installing dependencies and building. Push a new bundle to trigger the connected Vercel deployment.

For local setup, decode the source bundle and extract it with `tar -xzf vortex-ai-source.tar.gz`, then run `npm install` and `npm run dev`.

See the full setup and architecture documentation in the extracted project README.