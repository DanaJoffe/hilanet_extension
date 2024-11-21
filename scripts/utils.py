import json
import unicodedata
import pandas as pd


def total_seconds2hours_and_minutes(total_seconds):
    hours = total_seconds // 60**2
    minutes = total_seconds % 60**2 / 60**2 * 60
    return hours, minutes


def get_idays(data):
    idays = []
    for i, row in enumerate(data):
        if type(row[0]) is str:
            idays.append(i)
    return idays


def parse_special_day_row(row):  # TODO: delete
    assert len(row) == 2
    return row[1][0][1]


def parse_report(report_list):
    assert len(report_list) in {1, 2}
    if len(report_list) == 1:
        return report_list[0]
    return report_list[1]
    

def parse_work_data(work_table, **kwargs):
    TEKEN=10
    HOURS=8
    REPORT=5

    work_stat = []

    for row in work_table:
        assert len(row) == 13
        work_stat.append({
            **kwargs,
            **dict(
                teken=0 if row[TEKEN] == '' else row[TEKEN],
                hours=0 if row[HOURS] == '' else row[HOURS],
                len_report=len(row[REPORT].split('\n')),
                report=parse_report(row[REPORT].split('\n')),
                ),
                # **{f"_{i}": row[i] for i in [0,1,2,3,4,6,7,9,11,12]},
                })
    return work_stat


def parse_holiday(day_table, **kwargs):
    """
    assume: len(day_table) == 2
    add field 'notes'
    """
    # first row - holiday_row
    holiday_row = day_table[0]
    assert len(holiday_row) == 2
    holiday = holiday_row[1][0][1]
    
    # second row - attendance
    work_row = day_table[1]
    assert len(work_row) == 3
    work_stat = parse_work_data(work_row[1], notes=holiday, **kwargs)
    return work_stat
    # return [{**d, 'notes': holiday} for d in work_stat]


def parse_one_day_old(day_table):
    days_stat = []
    date = unicodedata.normalize("NFKD", day_table[0][0])
    nrows = len(day_table)
    assert nrows in {1,2}
    
    notes = ''
    if nrows == 2:
        # work_stat = parse_holiday(day_table)
        notes = parse_special_day_row(day_table[0])
    
    for i, row in enumerate(day_table):
        days_stat.append(dict(
            date=date,
            nrows=nrows,
            row_i=i,
            row_i_len=len(row),
            row_i_val=row,
            notes=notes,
            row_i_val_len=len(row,)
        ))
    return days_stat


def parse_one_day(day_table):
    date = unicodedata.normalize("NFKD", day_table[0][0])
    nrows = len(day_table)
    assert nrows in {1,2}
    
    if nrows == 2:
        work_stat = parse_holiday(day_table, date=date, nrows=nrows)
    else:
        work_row = day_table[0]
        work_stat = parse_work_data(work_row[2], date=date, nrows=nrows)
    return work_stat


def parse_data(data):
    idays = get_idays(data)
    days_stat = []
    for i, j in zip(idays[:-1], idays[1:]):
        day_table = data[i: j]
        days_stat += parse_one_day(day_table)
    df = pd.DataFrame(days_stat)
    return df

def parse(json_str):
    print(f"parse python: param {type(json_str)}")

    data = json.loads(json_str)
    parse_data(data)

    return data[0][0]