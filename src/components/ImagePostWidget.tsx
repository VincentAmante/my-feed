/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faImage, faX } from '@fortawesome/free-solid-svg-icons';
import { on } from 'stream';

type Props = {
    onImagesUploaded: (imageUrls: string[]) => void;
    submitRef: React.RefObject<HTMLButtonElement>;
    fileBtnRef: React.RefObject<HTMLButtonElement>;
};

const DragAndDropImages = ({ onImagesUploaded, submitRef, fileBtnRef }: Props) => {
    const [images, setImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;

        if (files.length > 10 || files.length + droppedFiles.length > 10) {
            return;
        }

        const droppedImages = Array.from(droppedFiles).filter(
            (file) => file.type.startsWith('image/')
        );

        // Read dropped images and call the onImageDrop function with the image data
        droppedImages.forEach((image) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imageDataUrl = reader.result as string;
                // onImageDrop(imageDataUrl);
                setImages((prevImages) => [...prevImages, imageDataUrl]);
            };
            reader.readAsDataURL(image);
        });
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

        const files = event.target.files as FileList;
        const uploadedImages = Array.from(files).filter(
            (file) => file.type.startsWith('image/')
        );

        for (const file of uploadedImages) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageDataUrl = reader.result as string;
                // onImageDrop(imageDataUrl);
                setImages((prevImages) => [...prevImages, imageDataUrl]);
                setFiles((prevFiles) => [...prevFiles, file]);
                console.log(file);
            };
            reader.readAsDataURL(file);
        }

        // Resets
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    async function uploadToCloudinary(file: File) {
        const formData = new FormData();
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
        formData.append('file', file);
        const data = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""}/image/upload`,
            {
                method: 'POST',
                body: formData
            })
            .then((r: any) => r.json());
        console.log(data);
        return data.secure_url;
    }

    async function submitOnClick() {
        setIsLoading(true);
        const imageUrls: string[] = [];
        for (const file of files) {
            const url = await uploadToCloudinary(file);
            imageUrls.push(url);
        }
        setImages([])
        setFiles([])
        setIsLoading(false);
        onImagesUploaded(imageUrls);
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageRemove = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        event.stopPropagation();
        event.preventDefault();
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <>
            <form className='flex flex-col items-center justify-center'>  
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={handleClick}
                    className='border-opacity-60 transition-all 
                grid lg:grid-cols-2 gap-6 rounded-md cursor-pointer hover:bg-white hover:bg-opacity-5 px-2'
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className='hidden'
                        multiple
                    />
                    {
                        isLoading &&
                        <div className='select-none flex text-opacity-60 items-center justify-center w-full h-full min-h-[2rem]'>
                            <div className='loading loading-spinner'></div>
                        </div>
                    }
                    {!isLoading && images.map((image, index) => (
                        <div
                            key={index}
                            className='max-w-[24rem] w-full group transition-all relative rounded-md'>
                            <Image
                                src={image}
                                alt={`Dropped Image ${index}`}
                                width={256}
                                height={256}
                                className='aspect-square object-cover object-center rounded-md'
                            />
                            <div className='absolute top-0 right-0 w-full h-full flex flex-col items-end'>
                                <button
                                    onClick={(event) => handleImageRemove(event, index)}
                                    className='btn bg-opacity-50 btn-sm btn-circle m-1'>
                                    <FontAwesomeIcon icon={faX} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </form>

            {/* These are triggered externally */}
            <button
                onClick={() => fileInputRef.current?.click()}
                ref={fileBtnRef}
                className='hidden'>
            </button>
            <button
                onClick={() => void submitOnClick()}
                ref={submitRef}
                className='btn btn-primary hidden'>
                Submit
            </button>
        </>
    );
};

export default DragAndDropImages;