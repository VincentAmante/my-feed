
import Image from "next/image";
import { useState } from "react";
import { faChevronRight, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ImageType = {
    imageUrls: string[];
};
const PostImages = (props: ImageType) => {
    const { imageUrls } = props;
    const [activeImage, setActiveImage] = useState(1);

    const prevImage = () => {
        if (activeImage === 1) setActiveImage(imageUrls.length);
        else setActiveImage(activeImage - 1);
    };
    const nextImage = () => {
        if (activeImage === imageUrls.length) setActiveImage(1);
        else setActiveImage(activeImage + 1);
    };


    if (!imageUrls || imageUrls.length <= 0 || !imageUrls[0]) return <></>;
    else
        return (
            <>
                {(imageUrls.length > 1) && (
                    <div className="carousel w-full scroll-py-12 snap-y">
                        <Image
                            className="image object-cover w-full select-none"
                            src={imageUrls[activeImage - 1] || imageUrls[0]}
                            width={400}
                            height={400}
                            alt={"An image"}
                        />
                        <div>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 btn btn-circle btn-ghost "
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2  btn btn-circle btn-ghost"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                )}

                {(imageUrls.length === 1) && (
                    <figure className="w-full">
                        <Image
                            className="image object-cover w-full select-none"
                            src={imageUrls[0]}
                            width={400}
                            height={400}
                            alt={"An image"}
                        />
                    </figure>
                )}
            </>
        )
};

export default PostImages;