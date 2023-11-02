"use client"

import { DayOptions, HourOptions, MinuteOptions } from "@/constants/sharedLinks"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type PollProps = {
    pollDayDuration: string,
    pollHourDuration: string,
    pollMinuteDuration: string
    setPollDayDuration: React.Dispatch<React.SetStateAction<string>>,
    setPollHourDuration: React.Dispatch<React.SetStateAction<string>>,
    setPollMinuteDuration: React.Dispatch<React.SetStateAction<string>>,
}

function Poll({ pollDayDuration, setPollDayDuration, pollHourDuration, setPollHourDuration,
    pollMinuteDuration, setPollMinuteDuration }: PollProps) {
    return (
        <div className="border-gray-700 border-y mt-3 pb-4 text-white px-3 py-2 ">
            <h2 className="text-[16px]">Poll Length</h2>
            <div className="flex gap-6 flex-wrap mt-2">

                <div className="flex flex-col gap-0.5 " >
                    <InputLabel style={{ color: 'white', minWidth: '120px' }} id="demo-simple-select-label">Day</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={pollDayDuration}
                        label="Day"
                        onChange={(e) => setPollDayDuration(e.target.value)}
                        style={{
                            color: 'white',
                            boxShadow: '0 0 0 0.5px white'  // Add a white border on top of the existing border
                        }}
                    >
                        {
                            DayOptions.map((option) =>
                                <MenuItem key={option} value={option}>{option}</MenuItem>)
                        }

                    </Select>
                </div>

                <div className="flex flex-col gap-0.5">
                    <InputLabel style={{ color: 'white', backgroundColor: 'black', minWidth: '120px' }} id="demo-simple-select-label2">Hours</InputLabel>
                    <Select
                        labelId="demo-simple-select-label2"
                        id="demo-simple-select"
                        value={pollHourDuration}
                        label="poll hour duration"
                        onChange={(e) => setPollHourDuration(e.target.value)}
                        style={{
                            color: 'white',
                            boxShadow: '0 0 0 0.5px white'  // Add a white border on top of the existing border
                        }}
                    >
                        {
                            HourOptions.map((option) =>
                                <MenuItem key={option} value={option}>{option}</MenuItem>)
                        }
                    </Select>
                </div>



                <div className="flex flex-col gap-0.5 " >
                    <InputLabel style={{ color: 'white', minWidth: '120px' }} id="demo-simple-select-label3">Minutes</InputLabel>
                    <Select
                        labelId="demo-simple-select-label3"
                        id="demo-simple-select"
                        value={pollMinuteDuration}
                        label="poll minute duration"
                        onChange={(e) => setPollMinuteDuration(e.target.value)}
                        style={{
                            color: 'white',
                            boxShadow: '0 0 0 0.5px white'  // Add a white border on top of the existing border
                        }}
                    >
                        {
                            MinuteOptions.map((option) =>
                                <MenuItem key={option} value={option}>{option}</MenuItem>)
                        }

                    </Select>
                </div>



            </div>
            <style>
                {`
          .MuiSelect-icon {
            fill: white;
          }
        `}
            </style>
        </div>
    )
}



export default Poll









