
import Image from "next/image";
import { useMemo } from "react";

type ImageType = {
    imageUrls: string[];
};
const PostImages = (props: ImageType) => {
    const { imageUrls } = props;

    function calculateNextSlide(currentSlide: number, totalSlides: number) {
        let answer = currentSlide === totalSlides ? 1 : currentSlide + 1;
        if (answer > totalSlides) answer = 1;
        return `#slide${answer}`;
    }
    function calculatePreviousSlide(currentSlide: number, totalSlides: number) {
        let answer = currentSlide === 1 ? totalSlides : currentSlide - 1;
        if (answer < 1) answer = totalSlides;
        return `#slide${answer}`;
    }

    if (!imageUrls || imageUrls.length <= 0 || !imageUrls[0]) return <></>;
    else
        return (
            <>
                {(imageUrls.length > 1) && (
                    <div className="carousel w-full">
                        {imageUrls.map((url, index) => (
                            <div key={index}
                                className="carousel-item relative w-full"
                                id={`slide${index + 1}`}
                            >
                                <Image
                                    className="image object-cover w-full select-none"
                                    src={url}
                                    width={400}
                                    height={400}
                                    alt={"An image"}
                                />
                                <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                                    <a href={calculateNextSlide(index + 1, imageUrls.length)} className="btn btn-circle">❮</a>
                                    <a href={calculatePreviousSlide(index + 1, imageUrls.length)} className="btn btn-circle">❯</a>
                                </div>
                            </div>
                        ))}
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


    // (
    //     <>
    //         <figure className="w-full">
    //             <Image
    //                 className="image object-cover w-full select-none"
    //                 src={imageUrls[0]}
    //                 width={400}
    //                 height={400}
    //                 alt={"An image"}
    //             />
    //         </figure>
    //     </>
    // );
};

export default PostImages;