/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { useRef } from "react";
import { faImage, faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Allows parent component to trigger upload and receive image url
type _ImageUploader = {
    onUpload: (imageUrl: string | null) => void;
    submitRef: React.RefObject<HTMLButtonElement>;
    imageUrl: string  | null | undefined;
}
const UpdateIconWidget = (props: _ImageUploader) => {
    const { onUpload, submitRef, imageUrl } = props;
    const [imageSrc, setImageSrc] = useState<string | undefined>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const submitInternal = useRef<HTMLButtonElement>(null);

    const oldImageUrl = imageUrl;

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

    function triggerUpload() {
        submitInternal.current?.click();
    }
    function reset() {
        setImageSrc(undefined);

        if (fileInputRef.current) {   
            fileInputRef.current.value = '';
        }
    }

    return (
        <>

            <form method="post"
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onSubmit={(e) => handleOnSubmit(e)}
                className="group relative flex flex-col items-center justify-center"
            >
                <input
                    onChange={handleOnChange}
                    type="file"
                    name="file"
                    className="hidden"
                    ref={fileInputRef}
                />
                {imageSrc &&
                    <div className="avatar bg-base-300 rounded-lg">
                        <div className="w-24">
                            <Image className="rounded-lg" src={imageSrc} alt="Avatar" width={100} height={100} />
                        </div>
                    </div>
                }
                {
                    !imageSrc &&
                    <div className="avatar placeholder bg-base-300 rounded-lg aspect-square">
                            <div className="w-24">
                                {
                                    (oldImageUrl) ? 
                                    <Image className="rounded-lg" src={oldImageUrl} alt="Avatar" width={100} height={100} />
                                    :
                                    <FontAwesomeIcon icon={faImage} className="text-4xl text-base-content opacity-20" />
                                }
                        </div>
                    </div>
                }

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg absolute w-full aspect-square  flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer group-hover:bg-white group-hover:bg-opacity-10">
                    <FontAwesomeIcon icon={faArrowUpFromBracket} className="text-4xl text-base-content" />
                </div>
                <button className="button hidden" ref={submitRef}>Upload Files</button>
                <button className="button hidden" ref={submitInternal}>Upload Files</button>
            </form>

            <div className="flex flex-col gap-2">
                {imageSrc &&
                    <>
                        <button onClick={triggerUpload} className="btn btn-ghost">Upload</button>
                        <button onClick={reset} className="btn btn-error">Cancel</button>
                    </>
                }
                {
                    !imageSrc &&
                    <>
                        <button className="btn btn-ghost disabled:opacity-50" disabled>Upload</button>
                        <button className="btn btn-error disabled:opacity-50" disabled>Cancel</button>
                    </>
                }
            </div>
        </>
    )
}
export default UpdateIconWidget;