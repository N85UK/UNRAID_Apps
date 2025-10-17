# Download and use the Unraid XML template via CLI

This guide installs the AWS EUM v3 Unraid Docker template directly into the correct folder so it appears under **Docker → Add Container → User templates**.

## Steps

1. SSH into your Unraid server:

   ```bash
   ssh root@YOUR_UNRAID_IP
   ```

2. Download the XML template (use the RAW GitHub link):

   ```bash
   wget -O /boot/config/plugins/dockerMan/templates-user/my-AWS_EUM.xml \
        https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/Apps/AWS_EUM/my-aws-eum.xml
   chmod 644 /boot/config/plugins/dockerMan/templates-user/my-AWS_EUM.xml
   ```

3. Refresh Docker templates (if required):

   ```bash
   /etc/rc.d/rc.docker restart
   ```

   Or simply refresh the Docker page in Unraid GUI.

4. Add the container from the Unraid GUI:
   - Go to **Docker** tab
   - Click **Add Container**
   - Select **AWS_EUM** from the **User templates** dropdown
   - Configure your AWS credentials
   - Click **Apply**

## Template Features

✅ **Auto-Updates**: Uses `:latest` tag with Watchtower integration  
✅ **Network Compatible**: Works on bridge, br0.x, and custom networks  
✅ **Environment Variables**: All correctly mapped to container expectations  
✅ **Security**: AWS credentials are masked in the UI  
✅ **Timezone**: Defaults to Europe/London for UK users  

## Troubleshooting

- **Template not showing**: Ensure the file is in `/boot/config/plugins/dockerMan/templates-user/`
- **Permission issues**: Check file permissions with `ls -la /boot/config/plugins/dockerMan/templates-user/`
- **Custom networks**: Set `DISABLE_CSP=true` for br0.x networks

## Direct Download URL

The template can also be downloaded directly:

```
https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/Apps/AWS_EUM/my-aws-eum.xml
```
