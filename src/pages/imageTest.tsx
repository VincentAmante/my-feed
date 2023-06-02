import { useState } from 'react';
import type { FormEvent, FormEventHandler } from 'react';
import Head from 'next/head'

type ImageSrc = string | undefined;
type ChangeEvent = {
    target: {
        files: Blob[] | undefined;
    };
}

const UploadTest = () => {
    const [imgSrc, setImgSrc] = useState("" as ImageSrc)
    // const [uploadData, setUploadData] = useState({} as any)

    // function handleOnChange(changeEvent: FormEventHandler<HTMLFormElement>) {
    //     const reader = new FileReader();
    //     reader.onload = (onloadEvent) => {
    //         if (onloadEvent.target && changeEvent.target) {
    //             setImgSrc(onloadEvent.target.result)
    //             setUploadData(undefined)
    //         }
    //     }
    //     if (changeEvent.target.files && changeEvent.target.files[0]) {
    //         reader.readAsDataURL(changeEvent.target.files[0])
    //     }
    // }

    // async function handleOnSubmit(event: FormEvent<HTMLFormElement>) {
    //     event.preventDefault();
    // }


    return (
        <div className="">
            <Head>
                <title>Image Uploader</title>
                <meta name="description" content="Upload your image to Cloudinary!" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <h1>Image Uploader</h1>
                <p>Upload image to Cloudinary</p>
            </main>
        </div>
    )
}

export default UploadTest;