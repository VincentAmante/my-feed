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

        // Read uploaded images and call the onImageDrop function with the image data
        uploadedImages.forEach((image) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imageDataUrl = reader.result as string;
                onImageDrop(imageDataUrl);
                setImages((prevImages) => [...prevImages, imageDataUrl]);
            };
            reader.readAsDataURL(image);
        });

        // Reset file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
    );
};

export default DragAndDropImages;