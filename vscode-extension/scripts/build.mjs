import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWatch = process.argv.includes('--watch');

// Ensure dist and resources dirs exist
const distDir = path.resolve(rootDir, 'dist');
const resourcesDir = path.resolve(rootDir, 'resources');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
if (!fs.existsSync(resourcesDir)) fs.mkdirSync(resourcesDir, { recursive: true });

// Copy or create icon.svg if not present
const iconSvgPath = path.resolve(resourcesDir, 'icon.svg');
if (!fs.existsSync(iconSvgPath)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#FBBC05" stroke="#4285F4"/>
</svg>`;
  fs.writeFileSync(iconSvgPath, svg, 'utf-8');
}

const buildOptions = {
  entryPoints: [path.resolve(rootDir, 'src/extension.ts')],
  bundle: true,
  outfile: path.resolve(distDir, 'extension.js'),
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  minify: !isWatch,
  logLevel: 'info'
};

async function run() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('[AlgoPulse VSCode] Watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('✓ [AlgoPulse VSCode] Built dist/extension.js successfully!');
  }
}

run().catch((err) => {
  console.error('[AlgoPulse VSCode] Build failed:', err);
  process.exit(1);
});
