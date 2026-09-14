// Groww Login Helper - Saves session for auto trading
// Run: node groww-login.js
// This opens Groww website, you login manually with OTP, session is saved

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SESSION_FILE = process.env.GROWW_SESSION_FILE || './groww-session.json';

async function loginGroww() {
    console.log('🔐 Groww Login Helper');
    console.log('====================');
    console.log('');
    console.log('This will open Groww website in a browser.');
    console.log('Please login manually with your phone/email + OTP.');
    console.log('After login, session will be saved for auto trading.');
    console.log('');

    let playwright;
    try {
        playwright = require('playwright');
    } catch (e) {
        console.error('❌ Playwright not installed');
        console.log('Run: npm install playwright && npx playwright install chromium');
        process.exit(1);
    }

    const { chromium } = playwright;

    console.log('🚀 Launching browser...');
    const browser = await chromium.launch({
        headless: false, // Must be false to see and login
        args: ['--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    console.log('🌐 Opening https://groww.in/...');
    await page.goto('https://groww.in/', { waitUntil: 'networkidle' });

    console.log('');
    console.log('👉 Please login in the opened browser window');
    console.log('👉 After login, wait for dashboard to load');
    console.log('👉 Then press ENTER in this terminal to save session');
    console.log('');

    // Wait for user to press enter
    await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
    });

    console.log('💾 Saving session...');

    // Check if logged in
    const isLoggedIn = await page.evaluate(() => {
        return {
            hasJWT: !!localStorage.getItem('groww_jwt'),
            hasToken: !!localStorage.getItem('token'),
            bodyContainsLogout: document.body.innerHTML.includes('Logout') || document.body.innerHTML.includes('logout'),
            url: window.location.href,
            localStorage: Object.keys(localStorage)
        };
    });

    console.log('Login check:', isLoggedIn);

    if (!isLoggedIn.hasJWT && !isLoggedIn.hasToken && !isLoggedIn.bodyContainsLogout) {
        console.log('⚠️ Warning: May not be logged in. No JWT token found.');
        console.log('LocalStorage keys:', isLoggedIn.localStorage);
        console.log('Do you want to save anyway? Press ENTER to save, Ctrl+C to cancel');
        await new Promise(resolve => {
            process.stdin.once('data', () => resolve());
        });
    }

    // Save storage state
    await context.storageState({ path: SESSION_FILE });
    console.log(`✅ Session saved to ${SESSION_FILE}`);

    // Also try to extract token
    const token = await page.evaluate(() => {
        return localStorage.getItem('groww_jwt') || localStorage.getItem('token') || sessionStorage.getItem('groww_jwt');
    });

    if (token) {
        console.log('');
        console.log('🔑 Groww JWT Token (for API method):');
        console.log(token.substring(0, 50) + '...');
        console.log('');
        console.log('You can also use this token in .env as GROWW_TOKEN for API method');
        
        // Save token to file for reference
        fs.writeFileSync('./groww-token.txt', token);
        console.log('Token saved to groww-token.txt (keep it secret!)');
    }

    console.log('');
    console.log('✅ Done! You can now close browser and run: npm start');
    console.log(`Session file: ${path.resolve(SESSION_FILE)}`);
    console.log('');
    console.log('Note: Groww session expires daily, you need to run this again when token expires');

    await browser.close();
}

loginGroww().catch(console.error);
