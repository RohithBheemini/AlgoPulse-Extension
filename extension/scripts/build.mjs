import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const isWatch = process.argv.includes('--watch');

async function compileCss() {
  const cssInputPath = path.resolve(rootDir, 'src/styles/index.css');
  const cssOutputPath = path.resolve(distDir, 'styles.css');

  const css = fs.readFileSync(cssInputPath, 'utf8');
  const result = await postcss([
    tailwindcss(path.resolve(rootDir, 'tailwind.config.js')),
    autoprefixer()
  ]).process(css, { from: cssInputPath, to: cssOutputPath });

  fs.writeFileSync(cssOutputPath, result.css);
  console.log('✓ Compiled styles.css');
}

function copyStaticAssets() {
  // Copy manifest.json
  fs.copyFileSync(
    path.resolve(rootDir, 'manifest.json'),
    path.resolve(distDir, 'manifest.json')
  );

  // Copy popup.html
  fs.copyFileSync(
    path.resolve(rootDir, 'popup.html'),
    path.resolve(distDir, 'popup.html')
  );

  console.log('✓ Copied manifest.json and popup.html');

  // Copy icons if present
  const iconsSrc = path.resolve(rootDir, 'icons');
  const iconsDist = path.resolve(distDir, 'icons');
  if (fs.existsSync(iconsSrc)) {
    if (!fs.existsSync(iconsDist)) {
      fs.mkdirSync(iconsDist, { recursive: true });
    }
    fs.readdirSync(iconsSrc).forEach((file) => {
      fs.copyFileSync(path.resolve(iconsSrc, file), path.resolve(iconsDist, file));
    });
    console.log('✓ Copied icons to dist/icons');
  }
}

async function build() {
  console.log(`Building AlgoPulse extension... (watch=${isWatch})`);

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Compile CSS
  await compileCss();

  // 2. Copy static files
  copyStaticAssets();

  // 3. Build scripts with esbuild
  const commonOptions = {
    bundle: true,
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    target: ['chrome110'],
    define: {
      'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
    }
  };

  // Background worker
  await esbuild.build({
    ...commonOptions,
    entryPoints: [path.resolve(rootDir, 'src/background/index.ts')],
    outfile: path.resolve(distDir, 'background.js'),
    format: 'iife'
  });

  // Injected MAIN world script
  await esbuild.build({
    ...commonOptions,
    entryPoints: [path.resolve(rootDir, 'src/content/injected.ts')],
    outfile: path.resolve(distDir, 'injected.js'),
    format: 'iife'
  });

  // Injected ISOLATED content script
  await esbuild.build({
    ...commonOptions,
    entryPoints: [path.resolve(rootDir, 'src/content/index.tsx')],
    outfile: path.resolve(distDir, 'content.js'),
    format: 'iife'
  });

  // Popup script
  await esbuild.build({
    ...commonOptions,
    entryPoints: [path.resolve(rootDir, 'src/popup/index.tsx')],
    outfile: path.resolve(distDir, 'popup.js'),
    format: 'iife'
  });

  console.log('✓ Built background.js, injected.js, content.js, popup.js');
  console.log('🎉 AlgoPulse extension successfully built to dist/ directory!');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
