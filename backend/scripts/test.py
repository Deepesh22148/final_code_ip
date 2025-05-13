from image_to_annotations import image_to_annotations
from annotations_to_animation import annotations_to_animation
import os
import time
import sys

def image_to_animation(char_anno_dir: str, motion_cfg_fn: str, retarget_cfg_fn: str, output_dir: str):
    """Process image through animation pipeline"""
    annotations_to_animation(char_anno_dir, motion_cfg_fn, retarget_cfg_fn, output_dir)

if __name__ == "__main__":
    start_time = time.time()
    
    # Get arguments from command line
    if len(sys.argv) < 4:
        print("Usage: python test.py <input_image> <output_dir> <annotation_dir>")
        sys.exit(1)
        
    IMG = sys.argv[1]
    OUTPUT = sys.argv[2]
    OUTPUT_ANNOTATE = sys.argv[3]

    # Configuration paths
        # Directories
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    MOTION_DIR = os.path.join(SCRIPT_DIR, 'config/motion/')
    RETARGET_DIR = os.path.join(SCRIPT_DIR, 'config/retarget/')

    # Create directories if they don't exist
    os.makedirs(OUTPUT_ANNOTATE, exist_ok=True)
    os.makedirs(OUTPUT, exist_ok=True)

    # Motion to retarget mapping
    compatible_retarget_map = {
        'dab': ['fair1_ppf.yaml'],
        'jesse_dance': ['fair1_ppf.yaml'],
        'jumping_jacks': ['fair1_ppf.yaml', 'cmu1_pfp.yaml'],
        'jumping': ['fair1_ppf.yaml'],
        'wave_hello': ['fair1_ppf.yaml'],
        'zombie': ['fair1_ppf.yaml'],
    }

    # Process image
    try:
        print(f"Processing image: {IMG}")
        image_to_annotations(IMG, OUTPUT_ANNOTATE)
        
        # Process each motion configuration
        motion_files = [f for f in os.listdir(MOTION_DIR) if f.endswith('.yaml')]
        for motion_file in motion_files:
            motion_name = os.path.splitext(motion_file)[0]
            motion_cfg = os.path.join(MOTION_DIR, motion_file)
            
            if motion_name in compatible_retarget_map:
                for retarget_file in compatible_retarget_map[motion_name]:
                    retarget_cfg = os.path.join(RETARGET_DIR, retarget_file)
                    print(f"Processing: Motion={motion_name}, Retarget={retarget_file}")
                    try:
                        image_to_animation(OUTPUT_ANNOTATE, motion_cfg, retarget_cfg, OUTPUT)
                    except Exception as e:
                        print(f"Error processing {motion_name}: {str(e)}")
                        continue

    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)

    print(f"\nTotal Execution Time: {time.time() - start_time:.2f} seconds")