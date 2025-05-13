import subprocess
import os
import shutil
from PIL import Image, ImageSequence

# Directories
MOTION_DIR = '/scripts/config/motion/'
RETARGET_DIR = '/scripts/config/retarget/'
IMG = 'drawings/Testing.jpeg'
output_dir = "output"
temp_output_dir = "garlic_out"
background_image = "background.jpeg"  # Background image file

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Get motion and retarget configuration files
motionArray = [os.path.join(MOTION_DIR, f) for f in os.listdir(MOTION_DIR) if f.endswith('.yaml')]
retargetArray = [os.path.join(RETARGET_DIR, f) for f in os.listdir(RETARGET_DIR) if f.endswith('.yaml')]

def add_background_to_gif(gif_path, background_path, output_path):
    """Adds a background image to the generated GIF and saves it."""
    background = Image.open(background_path).convert("RGBA")
    bg_width, bg_height = background.size

    gif = Image.open(gif_path)
    frames = []

    for frame in ImageSequence.Iterator(gif):
        frame = frame.convert("RGBA").resize((bg_width, bg_height), Image.LANCZOS)
        combined = Image.alpha_composite(background, frame)
        frames.append(combined.convert("RGB"))

    frames[0].save(output_path, save_all=True, append_images=frames[1:], loop=0, duration=gif.info['duration'])

for motion_cfg in motionArray:
    for retarget_cfg in retargetArray:
        print(f"Running with Motion: {motion_cfg}, Retarget: {retarget_cfg}")

        # Run the script
        result = subprocess.run(
            ["python", "image_to_animation.py", IMG, temp_output_dir, motion_cfg, retarget_cfg],
            capture_output=True,
            text=True
        )

        # Check if video.gif was created
        video_path = os.path.join(temp_output_dir, "video.gif")
        if os.path.exists(video_path):
            # Create unique filenames
            base_filename = f"{os.path.basename(motion_cfg).replace('.yaml', '')}_{os.path.basename(retarget_cfg).replace('.yaml', '')}.gif"
            output_path = os.path.join(output_dir, base_filename)
            output_with_bg = os.path.join(output_dir, f"bg_{base_filename}")

            # Move the original GIF
            shutil.move(video_path, output_path)
            print(f"Saved: {output_path}")

            # Add background
            add_background_to_gif(output_path, background_image, output_with_bg)
            print(f"Saved GIF with background: {output_with_bg}")

        else:
            print(f"Skipping {motion_cfg} + {retarget_cfg}, video not generated.")

        shutil.rmtree(temp_output_dir, ignore_errors=True)
        print(f"Deleted folder: {temp_output_dir}")
