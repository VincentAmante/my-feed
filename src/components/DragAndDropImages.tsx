/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faX } from '@fortawesome/free-solid-svg-icons';

type Props = {
    onImageDrop: (imageData: string) => void;
};

const DragAndDropImages = ({ onImageDrop }: Props) => {
    const [images, setImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        const droppedImages = Array.from(files).filter(
            (file) => file.type.startsWith('image/')
        );

        // Read dropped images and call the onImageDrop function with the image data
        droppedImages.forEach((image) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imageDataUrl = reader.result as string;
                onImageDrop(imageDataUrl);
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

        // Reset file input value
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
        for (const file of files) {
            const url = await uploadToCloudinary(file);
            console.log(url);
        }
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageRemove = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        event.stopPropagation();
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    return (
        <>
        
        <form className='p-4'>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleClick}
                className='border-2 border-info border-dashed border-opacity-60 transition-all flex flex-wrap max-w-lg rounded-md cursor-pointer hover:bg-info hover:bg-opacity-10'
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className='hidden'
                    multiple
                />
                {images && images.length == 0 &&
                    <div className='select-none flex text-info text-opacity-60 items-center justify-center w-full h-full min-h-[10rem]'>
                        <FontAwesomeIcon icon={faArrowUpFromBracket} />
                        <p>Drag and drop images here</p>
                    </div>
                }
                {images.map((image, index) => (
                    <div
                        key={index}
                        className='m-1 w-full max-w-[12rem] group transition-all relative  rounded-md overflow-hidden'>
                        <Image
                            src={image}
                            alt={`Dropped Image ${index}`}
                            width={256}
                            height={256}
                            className='w-full aspect-square object-cover object-center'
                        />
                        <div className='absolute top-0 right-0 w-full h-full flex flex-col items-end'>
                            <button
                                
                            onClick={(event) => handleImageRemove(event, index)}
                                className='btn hover:btn-error btn-xs btn-circle m-1'>
                            <FontAwesomeIcon icon={faX} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </form>
            <button onClick={() => void submitOnClick()} className='btn btn-primary'>Submit</button>
        </>
    );
};

export default DragAndDropImages;