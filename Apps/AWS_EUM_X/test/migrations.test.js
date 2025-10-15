const fs = require('fs');
const path = require('path');

const TEST_DATA_DIR = path.join(__dirname, 'tmp-mig');
process.env.DATA_DIR = TEST_DATA_DIR;

beforeAll(() => { if (!fs.existsSync(TEST_DATA_DIR)) fs.mkdirSync(TEST_DATA_DIR, { recursive: true }); });
afterAll(() => { try { fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true }); } catch (e) {} });

const app = require('../server');

describe('migrations runner', () => {
  test('runMigrations creates metadata.json and applies initial migration', async () => {
    const res = await app.runMigrations();
    expect(res.ok).toBeTruthy();
    const metaFile = path.join(TEST_DATA_DIR, 'metadata.json');
    expect(fs.existsSync(metaFile)).toBe(true);
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    expect(meta.schemaVersion).toBeGreaterThanOrEqual(1);
  });
});
