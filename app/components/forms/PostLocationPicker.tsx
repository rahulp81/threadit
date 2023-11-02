"use client"

import { Autocomplete, Input, TextField } from '@mui/material';
import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react'

type PostLocationProps = {
    postLocationOptions: any[],
    postThreadAt: any,
    setPostThreadAt: React.Dispatch<React.SetStateAction<any>>,
}

function PostLocation({ postLocationOptions, postThreadAt, setPostThreadAt }: PostLocationProps) {
    const [isCommunityActve, setIsCommunityActive] = useState(false)
    const inputImgSrc = isCommunityActve ? `/assets/search-gray.svg` : postThreadAt?.image ? postThreadAt.image : '/assets/search-gray.svg';
    return (
        <div className="flex flex-col  mt-3 relative  ">
            <div className="relative">
                <div className="text-white mb-1">Where to Post?</div>
                <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={postLocationOptions}
                    value={postThreadAt}
                    onOpen={() => setIsCommunityActive(true)}
                    onClose={() => setIsCommunityActive(false)}
                    onChange={(_, newValue) => {
                        console.log(newValue);
                        setPostThreadAt(newValue!); // Update the state with the selected value
                    }}
                    sx={{
                        width: 300,
                        '& .css-i4bv87-MuiSvgIcon-root': {
                            fill: 'black'
                        },
                        '.css-154xyx0-MuiInputBase-root-MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'black'
                        }
                    }}
                    renderOption={(props, option) => (
                        <li key={option.name}   {...props}>
                            <img height={30} width={30} className='rounded-full mr-2' src={option.image} alt="icon" />
                            <span>{option.name}</span>
                        </li>
                    )}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                        <Label htmlFor={params.id} className="relative bg-white py-2 px-2 gap-2 flex items-center  rounded"
                            ref={params.InputProps.ref}>
                            <img className='rounded-full' width={30} height={30} src={inputImgSrc} />
                            <input
                                style={{ outline: 'none' }}
                                type="text" // Or the desired input type
                                {...params.inputProps} // Include inputProps to maintain Autocomplete functionality
                                placeholder='Where to Post at??'
                            />
                        </Label>
                    )}
                />
            </div>
        </div>
    )
}

export default PostLocation

