# Icon Generation Instructions

Since the `sharp` library is not available in this environment, please generate the PNG icon manually using one of these methods:

## Method 1: Online Converter (Recommended)

1. Visit **CloudConvert**: https://cloudconvert.com/svg-to-png
2. Upload `icons/aws-eum-x.svg`
3. Set dimensions: **512x512** pixels
4. Click "Convert"
5. Download the result
6. Save as `icons/aws-eum-x.png`

## Method 2: ImageMagick (Command Line)

If you have ImageMagick installed locally:

```bash
convert icons/aws-eum-x.svg -resize 512x512 icons/aws-eum-x.png
```

## Method 3: Inkscape (GUI/CLI)

If you have Inkscape installed:

**GUI:**
1. Open `icons/aws-eum-x.svg` in Inkscape
2. File → Export PNG Image
3. Set width/height: 512 pixels
4. Export as `icons/aws-eum-x.png`

**CLI:**
```bash
inkscape icons/aws-eum-x.svg --export-type=png -w 512 -h 512 -o icons/aws-eum-x.png
```

## Method 4: GIMP (GUI)

1. Open `icons/aws-eum-x.svg` in GIMP
2. Set import size to 512x512
3. File → Export As
4. Save as `icons/aws-eum-x.png`
5. Set PNG compression to maximum

## Verification

After generating the PNG, verify:

```bash
# Check file exists
ls -lh icons/aws-eum-x.png

# Check dimensions (requires ImageMagick)
identify icons/aws-eum-x.png
# Expected: aws-eum-x.png PNG 512x512 ...

# Check file size (should be <100KB)
du -h icons/aws-eum-x.png
```

## Automation (Future)

To automate PNG generation in CI/CD, add `sharp` to devDependencies:

```json
{
  "devDependencies": {
    "sharp": "^0.33.0"
  }
}
```

Then run:
```bash
npm install --only=dev
npm run generate-png-icon
```

This will execute `scripts/generate-png-icon.js` which handles the conversion programmatically.
