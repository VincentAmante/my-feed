import { useState, ChangeEvent, FormEvent } from "react";

const ImageTestPage = () => {
    const [imageSrc, setImageSrc] = useState<string | undefined>();
    const [uploadData, setUploadData] = useState<any>();

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log('running handleOnChange')
        const reader = new FileReader();

        reader.onload = function (onLoadEvent) {

            if (!onLoadEvent.target) return;

            setImageSrc(onLoadEvent.target.result as string);
            setUploadData(undefined);
        };

        if (e.target.files && e.target.files.length > 0 && e.target.files[0])
            reader.readAsDataURL(e.target.files[0]);
    };

    async function handleOnSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const fileInput = Array.from(form.elements).find(({
            name
        }) => name === 'file');

        const formData = new FormData();

        for (const file of fileInput.files) {
            formData.append('file', file);
        }


        console.log(event);
        console.log('fileInput', fileInput);
    }

    return <>
        <form method="post" onChange={handleOnChange} onSubmit={handleOnSubmit}>
            <input type="file" name="file" className="file-input" />

            <img src={imageSrc}></img>
            {imageSrc && uploadData && <button className="button">Upload Files</button>}
            {uploadData && (
                <code><pre>{JSON.stringify(uploadData, null, 2)}</pre></code>
            )}
        </form>
    </>
}

export default ImageTestPage;