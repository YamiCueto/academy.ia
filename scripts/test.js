#!/usr/bin/env node

/**
 * 🧪 Basic Test Script
 * Runs basic functionality tests for the static site
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

function testHTMLStructure() {
    console.log('🧪 Testing HTML structure...');
    
    const indexPath = path.join(PROJECT_ROOT, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const tests = [
        {
            name: 'HTML5 doctype',
            test: () => content.includes('<!DOCTYPE html>'),
            critical: true
        },
        {
            name: 'Viewport meta tag',
            test: () => content.includes('<meta name="viewport"'),
            critical: true
        },
        {
            name: 'ES6 module loading',
            test: () => content.includes('type="module"'),
            critical: false
        },
        {
            name: 'Main navigation',
            test: () => content.includes('class="sidebar"') || content.includes('id="sidebar"'),
            critical: true
        },
        {
            name: 'ARIA accessibility',
            test: () => /aria-|role=/.test(content),
            critical: false
        }
    ];
    
    let passed = 0;
    let critical_failed = 0;
    
    tests.forEach(test => {
        if (test.test()) {
            console.log(`  ✅ ${test.name}`);
            passed++;
        } else {
            console.log(`  ${test.critical ? '❌' : '⚠️'} ${test.name}`);
            if (test.critical) critical_failed++;
        }
    });
    
    console.log(`  📊 Passed: ${passed}/${tests.length}`);
    return critical_failed === 0;
}

function testCSSFiles() {
    console.log('🎨 Testing CSS files...');
    
    const cssFiles = [
        'assets/css/main.css',
        'assets/css/layout.css', 
        'assets/css/components.css',
        'assets/css/responsive.css'
    ];
    
    let passed = 0;
    
    cssFiles.forEach(file => {
        const filePath = path.join(PROJECT_ROOT, file);
        if (fs.existsSync(filePath)) {
            console.log(`  ✅ ${file}`);
            
            // Basic CSS validation
            const content = fs.readFileSync(filePath, 'utf8');
            const hasRules = content.includes('{') && content.includes('}');
            if (hasRules) {
                console.log(`    📋 Has CSS rules`);
            } else {
                console.log(`    ⚠️ No CSS rules found`);
            }
            
            passed++;
        } else {
            console.log(`  ❌ ${file} missing`);
        }
    });
    
    // Test responsive design
    const responsiveFile = path.join(PROJECT_ROOT, 'assets/css/responsive.css');
    if (fs.existsSync(responsiveFile)) {
        const content = fs.readFileSync(responsiveFile, 'utf8');
        if (content.includes('@media')) {
            console.log(`  ✅ Responsive media queries found`);
        } else {
            console.log(`  ⚠️ No media queries in responsive.css`);
        }
    }
    
    console.log(`  📊 CSS Files: ${passed}/${cssFiles.length}`);
    return passed >= cssFiles.length * 0.75;
}

function testJavaScriptModules() {
    console.log('⚡ Testing JavaScript modules...');
    
    const jsFiles = [
        'assets/js/app.js',
        'assets/js/components/dashboard.js',
        'assets/js/components/students.js',
        'assets/js/utils/storage.js',
        'assets/js/config/constants.js'
    ];
    
    let passed = 0;
    let hasModules = 0;
    
    jsFiles.forEach(file => {
        const filePath = path.join(PROJECT_ROOT, file);
        if (fs.existsSync(filePath)) {
            console.log(`  ✅ ${file}`);
            
            // Check for ES6 module syntax
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('import') || content.includes('export')) {
                console.log(`    📦 ES6 module syntax`);
                hasModules++;
            }
            
            passed++;
        } else {
            console.log(`  ❌ ${file} missing`);
        }
    });
    
    console.log(`  📊 JS Files: ${passed}/${jsFiles.length}`);
    console.log(`  📦 ES6 Modules: ${hasModules}/${passed}`);
    
    return passed >= jsFiles.length * 0.6; // 60% minimum
}

function testProjectStructure() {
    console.log('📁 Testing project structure...');
    
    const requiredDirs = [
        'assets',
        'assets/css',
        'assets/js',
        'assets/js/components',
        'assets/js/utils'
    ];
    
    let passed = 0;
    
    requiredDirs.forEach(dir => {
        const dirPath = path.join(PROJECT_ROOT, dir);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            console.log(`  ✅ ${dir}/`);
            passed++;
        } else {
            console.log(`  ❌ ${dir}/ missing`);
        }
    });
    
    console.log(`  📊 Directories: ${passed}/${requiredDirs.length}`);
    return passed === requiredDirs.length;
}

function main() {
    console.log('🧪 ACADEMY.IA BASIC TESTS');
    console.log('='.repeat(40));
    
    const tests = [
        { name: 'Project Structure', fn: testProjectStructure },
        { name: 'HTML Structure', fn: testHTMLStructure },
        { name: 'CSS Files', fn: testCSSFiles },
        { name: 'JavaScript Modules', fn: testJavaScriptModules }
    ];
    
    let passed = 0;
    const results = [];
    
    tests.forEach(test => {
        console.log(`\n🔍 ${test.name}:`);
        const result = test.fn();
        results.push({ name: test.name, passed: result });
        if (result) {
            passed++;
        }
    });
    
    // Summary
    console.log('\n' + '='.repeat(40));
    console.log('📊 TEST SUMMARY:');
    results.forEach(result => {
        console.log(`  ${result.passed ? '✅' : '❌'} ${result.name}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${tests.length} tests passed`);
    
    if (passed === tests.length) {
        console.log('🎉 All tests passed! The project is working correctly.');
        process.exit(0);
    } else {
        console.log('⚠️ Some tests failed. Please check the issues above.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testHTMLStructure, testCSSFiles, testJavaScriptModules, testProjectStructure };