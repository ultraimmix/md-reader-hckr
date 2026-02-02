import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build steps
function build() {
  console.log('🚀 Starting build process...\n');

  // Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true });
  }
  fs.mkdirSync(distPath, { recursive: true });

  // Build background
  console.log('📦 Building background script...');
  execSync('npm run build:background', { stdio: 'inherit' });

  // Build content script
  console.log('📦 Building content script...');
  execSync('npm run build:content', { stdio: 'inherit' });

  // Build popup
  console.log('📦 Building popup...');
  execSync('npm run build:popup', { stdio: 'inherit' });

  // Build options
  console.log('📦 Building options...');
  execSync('npm run build:options', { stdio: 'inherit' });

  // Copy three-column files
  console.log('📦 Copying three-column files...');
  fs.copyFileSync(
    path.join(__dirname, 'src/content/three-column.js'),
    path.join(__dirname, 'dist/content/three-column.js')
  );
  fs.copyFileSync(
    path.join(__dirname, 'src/content/three-column.css'),
    path.join(__dirname, 'dist/content/three-column.css')
  );

  // Copy manifest
  console.log('📄 Copying manifest.json...');
  fs.copyFileSync(
    path.join(__dirname, 'manifest.json'),
    path.join(__dirname, 'dist/manifest.json')
  );

  // Copy assets
  console.log('🖼️ Copying assets...');
  const assetsSrc = path.join(__dirname, 'assets');
  const assetsDist = path.join(__dirname, 'dist/assets');
  if (!fs.existsSync(assetsDist)) {
    fs.mkdirSync(assetsDist, { recursive: true });
  }

  const logoFiles = ['logo.png'];
  logoFiles.forEach(file => {
    const srcPath = path.join(assetsSrc, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(assetsDist, file));
    }
  });

  // Copy _locales
  console.log('🌍 Copying locales...');
  const localesSrc = path.join(__dirname, '_locales');
  const localesDist = path.join(__dirname, 'dist/_locales');
  if (fs.existsSync(localesSrc)) {
    copyDir(localesSrc, localesDist);
  }

  console.log('\n✅ Build complete!');
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run build
build();
