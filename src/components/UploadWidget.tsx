/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, } from "react";
import type { ChangeEvent } from "react";

type _ImageUploader = {
    onUpload: (imageUrl: string | null) => void;
    submitRef: React.RefObject<HTMLButtonElement>;
}

const UploadWidget = (props: _ImageUploader) => {
    const { onUpload, submitRef } = props;

    const [imageSrc, setImageSrc] = useState<string | undefined>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const [uploadData, setUploadData] = useState<any>();

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log('running handleOnChange');
        const reader = new FileReader();

        reader.onload = function (onLoadEvent) {
            if (!onLoadEvent.target) return;
            setImageSrc(onLoadEvent.target.result as string);
            setUploadData(undefined);
        };


        if (e.target.files && e.target.files.length > 0 && e.target.files[0])
            reader.readAsDataURL(e.target.files[0]);
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!imageSrc) {
            console.log('imageSrc is undefined');
            onUpload(null);
            return;
        }

        const form = event.currentTarget;
        const fileInput = Array.from(form.elements).find(
            (element) => (element as HTMLInputElement).name === 'file'
        ) as HTMLInputElement | undefined;

        const formData = new FormData();

        if (fileInput && fileInput.files) {
            for (const file of fileInput.files) {
                formData.append('file', file);
            }
        }

        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
        const data = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""}/image/upload`,
            {
                method: 'POST',
                body: formData
            })
            .then((r: any) => r.json());

        setImageSrc(undefined);
        setUploadData(undefined);
        onUpload(data.secure_url);

        console.log(event);
        console.log('fileInput', fileInput);
    }

    return (
        <form method="post"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={(e) => handleOnSubmit(e)}>
            <input onChange={handleOnChange} type="file" name="file" className="file-input" />

            <img src={imageSrc} />
            <button className="button hidden" ref={submitRef}>Upload Files</button>
        </form>
    )
}

export default UploadWidget;