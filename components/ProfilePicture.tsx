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
        var widthHeight='w-full h-full'
        var resolution=200
    }
    else if (props.size==="medium"){
        var widthHeight='w-24 h-24'
        var resolution=100
    }
    return(
        <Image className={`rounded-full object-cover ${widthHeight} ${props.className}`} priority alt="Profile Picture" width={resolution} height={resolution} src={picture} />
    )
}