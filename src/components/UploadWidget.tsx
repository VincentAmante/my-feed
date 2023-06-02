/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";

// Allows parent component to trigger upload and receive image url
type _ImageUploader = {
    onUpload: (imageUrl: string | null) => void;
    submitRef: React.RefObject<HTMLButtonElement>;
}

const UploadWidget = (props: _ImageUploader) => {
    const { onUpload, submitRef } = props;
    const [imageSrc, setImageSrc] = useState<string | undefined>();


    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader();
        reader.onload = function (onLoadEvent) {
            if (!onLoadEvent.target) return;
            setImageSrc(onLoadEvent.target.result as string);
        };
        if (e.target.files && e.target.files.length > 0 && e.target.files[0])
            reader.readAsDataURL(e.target.files[0]);
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // To ensure that the post uploads with an image if existing, this component will always upload
        if (!imageSrc) {
            console.log('imageSrc is undefined');
            onUpload(null);
            return;
        }


        // Handles retrieval of form data
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


        // TODO: Check to see if env is exposed
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
        const data = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""}/image/upload`,
            {
                method: 'POST',
                body: formData
            })
            .then((r: any) => r.json());

        // Resets
        setImageSrc(undefined);

        onUpload(data.secure_url);
    }

    return (
        <form method="post"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={(e) => handleOnSubmit(e)}>
            <input onChange={handleOnChange} type="file" name="file" className="file-input" />

            {imageSrc && <Image
                width={300}
                alt="An image you're uploadeding"
                height={300}
                className="rounded-lg max-w-sm"
                src={imageSrc} />}
            <button className="button hidden" ref={submitRef}>Upload Files</button>
        </form>
    )
}

export default UploadWidget;