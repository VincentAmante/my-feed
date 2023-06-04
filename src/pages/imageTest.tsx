/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, useRef } from "react";
import UploadWidget from "~/components/UploadWidget";

const TestPage = () => {
    const submitRef = useRef<HTMLButtonElement>(null);

    const handleOnUpload = (imageUrl: string | null) => {
        return <></>
    }


    return (
        <>
            <UploadWidget submitRef={submitRef} onUpload={handleOnUpload}></UploadWidget>
            <button onClick={() => submitRef.current?.click()}>Submit</button>
        </>
    )
}

export default TestPage;