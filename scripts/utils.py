import json


def total_seconds2hours_and_minutes(total_seconds):
    hours = total_seconds // 60**2
    minutes = total_seconds % 60**2 / 60**2 * 60
    return hours, minutes


def parse(json_str):
    print(f"parse python: param {type(json_str)}")

    data = json.loads(json_str)

    return data[0][0]