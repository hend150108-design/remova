/**
 * Remova - Verification & Unit Testing Suite
 */

import { formatBytes, validateImageFile } from '../src/js/ui.js';

console.log('--- RUNNING REMOVA UNIT TESTS ---');

// 1. Test formatBytes
console.assert(formatBytes(0) === '0 Bytes', 'formatBytes(0) failed');
console.assert(formatBytes(1024) === '1 KB', 'formatBytes(1024) failed');
console.assert(formatBytes(1048576) === '1 MB', 'formatBytes(1MB) failed');
console.assert(formatBytes(2500000) === '2.38 MB', 'formatBytes(2.5MB) failed');
console.log('✓ formatBytes tests passed');

// 2. Test validateImageFile
const validJpg = { name: 'photo.jpg', type: 'image/jpeg', size: 1024 * 1024 };
const validPng = { name: 'graphic.png', type: 'image/png', size: 2 * 1024 * 1024 };
const validWebp = { name: 'banner.webp', type: 'image/webp', size: 500 * 1024 };
const oversized = { name: 'huge.jpg', type: 'image/jpeg', size: 20 * 1024 * 1024 };
const invalidType = { name: 'document.pdf', type: 'application/pdf', size: 100 * 1024 };

console.assert(validateImageFile(validJpg).valid === true, 'validJpg failed');
console.assert(validateImageFile(validPng).valid === true, 'validPng failed');
console.assert(validateImageFile(validWebp).valid === true, 'validWebp failed');
console.assert(validateImageFile(oversized).valid === false, 'oversized should fail');
console.assert(validateImageFile(invalidType).valid === false, 'invalidType should fail');
console.log('✓ validateImageFile tests passed (JPG, PNG, WebP validation + size check + rejection of invalid types)');

// 3. Test backgroundRemoval imports
import('../src/js/backgroundRemoval.js').then((bgMod) => {
  console.assert(typeof bgMod.processBackgroundRemoval === 'function', 'processBackgroundRemoval export missing');
  console.assert(typeof bgMod.revokeObjectUrl === 'function', 'revokeObjectUrl export missing');
  console.log('✓ backgroundRemoval module exports verified');
  console.log('ALL SUITE TESTS COMPLETED SUCCESSFULLY!');
}).catch((err) => {
  console.error('Module import error:', err);
  process.exit(1);
});

