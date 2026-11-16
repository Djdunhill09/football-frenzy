# Level data for the 800x450 canvas. The field's top edge is at y = 394 (450 - 56).
# Blitz jumps about 140 px high, so every platform top is at most ~90 px above
# the surface he jumps from (the field or another platform).
LEVELS = {
    1: {
        "number": 1,
        "name": "Practice Field",
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
}


def get_level(level_number):
    return LEVELS.get(level_number)
