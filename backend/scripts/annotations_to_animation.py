# Copyright (c) Meta Platforms, Inc. and affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import animated_drawings.render
import logging
from pathlib import Path
import sys
import yaml
from pkg_resources import resource_filename


def annotations_to_animation(char_anno_dir: str, motion_cfg_fn: str, retarget_cfg_fn: str, output_dir: str):
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)

    animated_drawing_dict = {
        'character_cfg': str(Path(char_anno_dir, 'char_cfg.yaml').resolve()),
        'motion_cfg': str(Path(motion_cfg_fn).resolve()),
        'retarget_cfg': str(Path(retarget_cfg_fn).resolve())
    }

    mvc_cfg = {
        'scene': {'ANIMATED_CHARACTERS': [animated_drawing_dict]},
        'controller': {
            'MODE': 'video_render',
            'OUTPUT_VIDEO_PATH': str(output_dir / f"video_{Path(motion_cfg_fn).stem}.gif"),
            'FPS': 1,  
        },
        'renderer': {  
            'resolution': (320, 240),
            'shadows': False,
            'antialiasing': False,
        }
    }

    (Path(char_anno_dir) / 'mvc_cfg.yaml').write_text(yaml.dump(mvc_cfg))
    animated_drawings.render.start(str(Path(char_anno_dir) / 'mvc_cfg.yaml'))


if __name__ == '__main__':

    log_dir = Path('./logs')
    log_dir.mkdir(exist_ok=True, parents=True)
    logging.basicConfig(filename=f'{log_dir}/log.txt', level=logging.DEBUG)
    output_dir = "animation"
    char_anno_dir = sys.argv[1]
    if len(sys.argv) > 2:
        motion_cfg_fn = sys.argv[2]
    else:
        motion_cfg_fn = resource_filename(__name__, 'config/motion/dab.yaml')
    if len(sys.argv) > 3:
        retarget_cfg_fn = sys.argv[3]
    else:
        retarget_cfg_fn = resource_filename(__name__, 'config/retarget/fair1_ppf.yaml')

    annotations_to_animation(char_anno_dir, motion_cfg_fn, retarget_cfg_fn , output_dir)
