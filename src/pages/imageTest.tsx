import { useState, } from "react";
import type { ChangeEvent } from "react";

const ImageTestPage = () => {
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

        setImageSrc(data.secure_url);
        setUploadData(data);


        console.log(event);
        console.log('fileInput', fileInput);
    }

    return <>
        <form method="post"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={(e) => handleOnSubmit(e)}>
            <input onChange={handleOnChange} type="file" name="file" className="file-input" />

            <img src={imageSrc}></img>
            {imageSrc && uploadData && <button className="button">Upload Files</button>}
            {uploadData && (
                <code><pre>{JSON.stringify(uploadData, null, 2)}</pre></code>
            )}
        </form>
    </>
}

export default ImageTestPage;