import json
import unicodedata
import pandas as pd
import numpy as np
import re
from datetime import timedelta



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
    else:  # nrows == 1
        work_row = day_table[0]
        work_stat = parse_work_data(work_row[2], date=date, nrows=nrows)
    return work_stat


def parse_raw_data(data):
    idays = get_idays(data)
    idays.append(len(data))
    days_stat = []
    for i, j in zip(idays[:-1], idays[1:]):
        day_table = data[i: j]
        days_stat += parse_one_day(day_table)
    df = pd.DataFrame(days_stat)
    return df


def parse_time(time_str):
    h, m = time_str.split(':')
    return int(h) + int(m) / 60


def time_float2str(float_time):
    """ 
    float_time of the format hh.mp where mp is minutes percentage
    return hh:mm
    """
    h = int(float_time)
    return f"{h}:{int((float_time-h)*60)}"


def parse_df_date(df):
    pattern = "(\d+)\/(\d+) (.*)"
    prog = re.compile(pattern)

    for i, str_date in enumerate(df.date):
        result = prog.match(str_date)
        day = result.group(1)
        month = result.group(2)
        weekday = result.group(3)

        df.at[i, 'day'] = int(day)
        df.at[i, 'month'] = int(month)
        df.at[i, 'weekday'] = weekday
    return df


def parse_df_times(df):
    # teken: str => float
    df.teken = df.teken.apply(lambda str_t:  timedelta(hours=int(str_t.split('.')[0]), minutes=int(str_t.split('.')[1]) *60/100) if str_t!=0 else timedelta(hours=0, minutes=0))
    
    # str hours => datetime.timedelta
    df.hours = df.hours.apply(lambda str_t:  timedelta(hours=int(str_t.split(':')[0]), minutes=int(str_t.split(':')[1])) if str_t!=0 else timedelta(hours=0, minutes=0))
    
    # one row per date
    def sum_day_hours(subdf):
        s = subdf.iloc[0:1].copy()
        s.hours = subdf.hours.sum()
        return s
    df = df.groupby('date').apply(sum_day_hours).reset_index(drop=True)
    
    # # phours = the hours that count
    # df['phours'] = df.apply(lambda r: r.teken if r.report == 'חופשה' else r.hours, axis=1)
    return df



def get_last_working_day_ind(df):
    a = [i for i in reversed((df.hours_parsed != 0).astype(int))]
    i = -np.argmax(a)


def add_df_columns(df):
    """
    parse raw df data and add customized columns for further insights
    """
    df = parse_df_date(df)
    df = parse_df_times(df)
    return df


def parse_data(data):
    df = parse_raw_data(data)
    df = add_df_columns(df)
    return df


def sum_tiedelta(df_column):
    hours, remainder = divmod(df_column.sum().total_seconds(), 3600)
    minutes = remainder // 60
    return int(hours), int(minutes)


def agg_results(df) -> dict:
    # df['hours_parsed'] = df.hours.apply(lambda time_str: parse_time(time_str) if time_str != 0 else time_str)
    
    ret = {
        'total_hours': "{}:{:02}".format(*sum_tiedelta(df.hours)),
        'total_vacation': "{}:{:02}".format(*sum_tiedelta(df[df.report == 'חופשה'].teken)),       
        'total_teken': "{}:{:02}".format(*sum_tiedelta(df.teken)),
    }
    return ret


def parse(json_str):
    print(f"parse python: param {type(json_str)}")

    data = json.loads(json_str)
    df = parse_data(data)
    results = agg_results(df)
    return str(results)