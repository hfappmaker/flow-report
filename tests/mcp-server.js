#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

class PlaywrightMCPServer {
  constructor() {
    this.testResults = [];
  }

  async runTest(testFile, testName, options = {}) {
    const args = ['playwright', 'test'];
    
    if (testFile) {
      args.push(testFile);
    }
    
    if (testName) {
      args.push('--grep', testName);
    }
    
    if (options.headed) {
      args.push('--headed');
    }
    
    if (options.debug) {
      args.push('--debug');
    }

    return new Promise((resolve, reject) => {
      const child = spawn('npx', args, {
        cwd: process.cwd(),
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          exitCode: code,
          stdout,
          stderr,
          success: code === 0
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async takeScreenshot(url, selector) {
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.goto(url);
      
      let screenshot;
      if (selector) {
        const element = await page.locator(selector);
        screenshot = await element.screenshot();
      } else {
        screenshot = await page.screenshot();
      }
      
      await browser.close();
      
      return {
        screenshot: screenshot.toString('base64'),
        success: true
      };
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  async handleRequest(request) {
    const { method, params } = request;

    switch (method) {
      case 'run_test':
        return await this.runTest(
          params.testFile,
          params.testName,
          params.options
        );
      
      case 'take_screenshot':
        return await this.takeScreenshot(
          params.url,
          params.selector
        );
      
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }
}

// Start the MCP server
const server = new PlaywrightMCPServer();

process.stdin.on('data', async (data) => {
  try {
    const request = JSON.parse(data.toString());
    const response = await server.handleRequest(request);
    
    process.stdout.write(JSON.stringify({
      id: request.id,
      result: response
    }) + '\n');
  } catch (error) {
    process.stdout.write(JSON.stringify({
      id: request.id || null,
      error: {
        code: -1,
        message: error.message
      }
    }) + '\n');
  }
});

console.log('Playwright MCP Server started');