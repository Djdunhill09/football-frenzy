# Level data for the 800x450 canvas. The field's top edge is at y = 394 (450 - 56).
# Blitz jumps about 140 px high, so every platform top is at most ~90 px above
# the surface he jumps from (the field or another platform).
LEVELS = {
    1: {
        "number": 1,
        "name": "Practice Field",
        "sky": "day",
        # Field segments (x and width). Level 1 is one full-width stretch of turf.
        "ground": [{"x": 0, "width": 800}],
        "platforms": [
            {"x": 100, "y": 310, "width": 140, "height": 30},  # 84 above field
            {"x": 320, "y": 230, "width": 140, "height": 30},  # 80 above platform 1
            {"x": 520, "y": 310, "width": 150, "height": 30},  # 84 above field
            {"x": 650, "y": 220, "width": 130, "height": 30},  # 90 above platform 3
        ],
        # Blitz spawns (and respawns after a hit) at the far left, standing on the field.
        "start": {"x": 40, "y": 354},
        # Tackling sleds on the field (top y = 394 - 30 = 364). Each sits in a gap with
        # no platform overhead, so Blitz has to jump over it from the open field.
        "hazards": [
            {"x": 260, "y": 364, "width": 50, "height": 30},  # between platforms 1 and 2
            {"x": 465, "y": 364, "width": 50, "height": 30},  # between platforms 2 and 3
        ],
        # End zone at the right edge, standing on the field (field top y = 394).
        "goal": {"x": 720, "y": 294, "width": 80, "height": 100},
    },
    2: {
        "number": 2,
        "name": "Opening Game Day",
        "sky": "night",
        # Turf with two gaps: 250-360 (110 wide) and 560-690 (130 wide). Blitz only falls
        # when his whole 40 px body is over a gap, and a standing jump carries him ~225 px,
        # so he must travel just (gap - 40) px = 70 and 90 px to cross. Both are easy.
        "ground": [
            {"x": 0, "width": 250},
            {"x": 360, "width": 200},
            {"x": 690, "width": 110},
        ],
        # Bleacher stepping stones (field top y = 394, so at most 94 above it).
        "platforms": [
            {"x": 275, "y": 330, "width": 60, "height": 30},   # 64 above field, over gap 1
            {"x": 400, "y": 300, "width": 110, "height": 30},  # 94 above field, over turf 2
            {"x": 585, "y": 320, "width": 80, "height": 30},   # 74 above field, over gap 2
        ],
        "start": {"x": 40, "y": 354},
        # Stationary defenders (50 px tall, top y = 394 - 50 = 344), each on open turf away
        # from the take-off and landing spots next to the gaps.
        "hazards": [
            {"kind": "defender", "x": 130, "y": 344, "width": 30, "height": 50},  # turf 1
            {"kind": "defender", "x": 450, "y": 344, "width": 30, "height": 50},  # turf 2
        ],
        "goal": {"x": 720, "y": 294, "width": 80, "height": 100},
    },
    3: {
        "number": 3,
        "name": "The Final Drive",
        "sky": "night",
        "weather": "rain",
        # Turf with gaps 180-270 and 420-510 (90 wide each), easy to cross like Level 2.
        "ground": [
            {"x": 0, "width": 180},
            {"x": 270, "width": 150},
            {"x": 510, "width": 290},
        ],
        # Mud puddles lying on the turf (field top y = 394, puddles are 8 px deep).
        "mud": [
            {"x": 80, "y": 386, "width": 70, "height": 8},    # turf 1
            {"x": 545, "y": 386, "width": 80, "height": 8},   # under the stairs
        ],
        # The climb. Rises: field -> 330 is 64, -> 265 is 65, -> 200 is 65, and the last
        # jump to the raised end zone (top 115) is 85 up across a 55 px gap, the hardest
        # in the game. Blitz jumps 140 high and ~225 across, so all of these are possible.
        "platforms": [
            {"x": 490, "y": 330, "width": 45, "height": 30},
            {"x": 550, "y": 265, "width": 50, "height": 30},
            {"x": 620, "y": 200, "width": 45, "height": 30},
            {"x": 720, "y": 115, "width": 80, "height": 30},  # end zone platform
        ],
        # Start is on turf 1 (x 40-80), left of every patrol range.
        "start": {"x": 40, "y": 354},
        # Moving defenders patrol between minX and maxX (left edge x), speed in px/s.
        "hazards": [
            {"kind": "defender", "x": 300, "y": 344, "width": 30, "height": 50,
             "minX": 300, "maxX": 385, "speed": 70},   # turf 2 (spans 300-415)
            {"kind": "defender", "x": 650, "y": 344, "width": 30, "height": 50,
             "minX": 650, "maxX": 750, "speed": 90},   # turf 3, under the stairs
        ],
        "goal": {"x": 720, "y": 35, "width": 80, "height": 80},
    },
}


def get_level(level_number):
    return LEVELS.get(level_number)
