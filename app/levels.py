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
        # End zone at the right edge, standing on the field (field top y = 394).
        "goal": {"x": 720, "y": 294, "width": 80, "height": 100},
    },
}


def get_level(level_number):
    return LEVELS.get(level_number)
