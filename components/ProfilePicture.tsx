"use client"

import Image from "next/image";
import { useAppContext } from "@/app/context"

export default function ProfilePicture(props){

    const {picture} =useAppContext();
    if (props.size==="small"){
        var widthHeight='w-8 h-8'
        var resolution=50
    }
    else if (props.size==="big"){
        var widthHeight='w-32 h-32'
        var resolution=100
    }
    else if (props.size==="medium"){
        var widthHeight='w-24 h-24'
        var resolution=100
    }
    return(
        <div  className={`block relative ${props.className}`}>
            <Image className={` object-cover rounded-full ${widthHeight} border-2 border-white `} priority alt="Profile Picture" width={resolution} height={resolution} src={picture} />
        </div>
    )
}