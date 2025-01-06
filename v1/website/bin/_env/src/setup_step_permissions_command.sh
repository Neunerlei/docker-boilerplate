echo "[Setup]: Setting up permissions of files and folders"

# This file can be modified to set the permissions of files and folders in your project when you set it up locally

sudo find "$PROJECT_ROOT_DIR/bin" -type f -iname "*.sh" -exec chmod +x {} \;