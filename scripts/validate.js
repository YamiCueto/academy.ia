#!/usr/bin/env node

/**
 * 📊 Project Validation Script
 * Validates project structure and essential files
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

// 📄 Essential files that must exist
const ESSENTIAL_FILES = [
    'index.html',
    'README.md',
    '.nojekyll',
    'package.json'
];

// 📁 Essential directories that must exist
const ESSENTIAL_DIRS = [
    'assets',
    'assets/css',
    'assets/js',
    'assets/js/components',
    'assets/js/utils',
    'assets/js/config'
];

// 🎨 CSS files that should exist
const CSS_FILES = [
    'assets/css/main.css',
    'assets/css/layout.css',
    'assets/css/components.css',
    'assets/css/responsive.css'
];

// ⚡ JavaScript files that should exist
const JS_FILES = [
    'assets/js/app.js',
    'assets/js/components/dashboard.js',
    'assets/js/components/students.js',
    'assets/js/components/attendance.js',
    'assets/js/components/reports.js',
    'assets/js/utils/storage.js',
    'assets/js/utils/date-utils.js',
    'assets/js/utils/validators.js',
    'assets/js/config/constants.js'
];

function checkFileExists(filePath) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    return fs.existsSync(fullPath);
}

function checkDirectoryExists(dirPath) {
    const fullPath = path.join(PROJECT_ROOT, dirPath);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

function validateHTML() {
    console.log('🌐 Validating HTML structure...');
    
    const indexPath = path.join(PROJECT_ROOT, 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.log('❌ index.html not found');
        return false;
    }
    
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check for essential HTML5 elements
    const checks = [
        { test: /<!DOCTYPE html>/i, name: 'HTML5 doctype' },
        { test: /<meta name="viewport"/i, name: 'Viewport meta tag' },
        { test: /type="module"/i, name: 'ES6 modules' },
        { test: /aria-/i, name: 'ARIA attributes' },
        { test: /<main/i, name: 'Semantic HTML (main)' },
        { test: /<nav/i, name: 'Semantic HTML (nav)' }
    ];
    
    let passed = 0;
    checks.forEach(check => {
        if (check.test.test(htmlContent)) {
            console.log(`✅ ${check.name} found`);
            passed++;
        } else {
            console.log(`⚠️ ${check.name} missing`);
        }
    });
    
    return passed >= checks.length * 0.8; // 80% pass rate
}

function validateCSS() {
    console.log('🎨 Validating CSS files...');
    
    let passed = 0;
    CSS_FILES.forEach(file => {
        if (checkFileExists(file)) {
            console.log(`✅ ${file} exists`);
            passed++;
        } else {
            console.log(`❌ ${file} missing`);
        }
    });
    
    // Check for responsive design
    const responsiveCSS = path.join(PROJECT_ROOT, 'assets/css/responsive.css');
    if (fs.existsSync(responsiveCSS)) {
        const cssContent = fs.readFileSync(responsiveCSS, 'utf8');
        if (cssContent.includes('@media')) {
            console.log('✅ Responsive CSS media queries found');
            passed++;
        } else {
            console.log('⚠️ No media queries found in responsive.css');
        }
    }
    
    return passed >= CSS_FILES.length;
}

function validateJavaScript() {
    console.log('⚡ Validating JavaScript files...');
    
    let passed = 0;
    JS_FILES.forEach(file => {
        if (checkFileExists(file)) {
            console.log(`✅ ${file} exists`);
            
            // Check for ES6 module syntax
            const jsPath = path.join(PROJECT_ROOT, file);
            const jsContent = fs.readFileSync(jsPath, 'utf8');
            if (jsContent.includes('import') || jsContent.includes('export')) {
                console.log(`  📦 ES6 modules detected in ${file}`);
            }
            passed++;
        } else {
            console.log(`❌ ${file} missing`);
        }
    });
    
    return passed >= JS_FILES.length * 0.8; // 80% pass rate
}

function main() {
    console.log('📊 ACADEMY.IA PROJECT VALIDATION');
    console.log('='.repeat(40));
    
    let allPassed = true;
    
    // Check essential files
    console.log('📄 Checking essential files...');
    ESSENTIAL_FILES.forEach(file => {
        if (checkFileExists(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} missing`);
            allPassed = false;
        }
    });
    
    // Check essential directories
    console.log('\n📁 Checking essential directories...');
    ESSENTIAL_DIRS.forEach(dir => {
        if (checkDirectoryExists(dir)) {
            console.log(`✅ ${dir}/`);
        } else {
            console.log(`❌ ${dir}/ missing`);
            allPassed = false;
        }
    });
    
    // Validate HTML
    console.log('');
    if (!validateHTML()) {
        console.log('⚠️ HTML validation issues found');
    }
    
    // Validate CSS
    console.log('');
    if (!validateCSS()) {
        console.log('⚠️ CSS validation issues found');
    }
    
    // Validate JavaScript
    console.log('');
    if (!validateJavaScript()) {
        console.log('⚠️ JavaScript validation issues found');
    }
    
    console.log('\n' + '='.repeat(40));
    if (allPassed) {
        console.log('🎉 All validations passed! Project structure is correct.');
        process.exit(0);
    } else {
        console.log('⚠️ Some validations failed. Please check the issues above.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateHTML, validateCSS, validateJavaScript };