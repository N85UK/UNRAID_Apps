Publishing to GitHub Container Registry (GHCR)

1. Push this project to `https://github.com/N85UK/UnRiaid_Apps` in a subfolder `AWS_EUM`.
2. Ensure the repository has GitHub Actions enabled.
3. The workflow `build-and-publish.yml` will run on push to `main` and on release.
4. After the workflow completes, your image will be available at `ghcr.io/N85UK/aws-eum:latest`.

Make the package public (optional):
- Go to https://github.com/orgs/N85UK/packages/container/package/aws-eum
- Click 'Package settings' and set the package visibility to Public if you want the image to be pullable without authentication.

Notes:
- The workflow uses `${{ secrets.GITHUB_TOKEN }}` to authenticate with GHCR automatically.
- You can change tags in the workflow to include `${{ github.sha }}` or release tags instead of `latest`.
