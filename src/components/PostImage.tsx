import Image from "next/image";
import { useState } from "react";
import {
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ImageType = {
  imageUrls: string[];
  className?: string;
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
        {imageUrls.length > 1 && (
          <div
            className={`carousel relative w-full snap-y scroll-py-12 
            ${props.className || ""}
            `}
          >
            <Image
              className="image w-full select-none bg-base-300 object-contain"
              src={imageUrls[activeImage - 1] || imageUrls[0]}
              width={1024}
              height={1024}
              alt={"An image"}
            />
            <div className="absolute flex h-full w-full items-center">
              <button
                onClick={prevImage}
                className="btn-ghost btn-circle btn absolute left-4 "
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button
                onClick={nextImage}
                className="btn-ghost btn-circle btn absolute right-4"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            <div className="badge absolute right-0 top-0 m-2 select-none bg-base-300 text-xs">
              {activeImage} / {imageUrls.length}
            </div>
          </div>
        )}

        {imageUrls.length === 1 && (
          <figure className="w-full">
            <Image
              className="image max-h-[36rem] w-full select-none bg-base-100 object-contain"
              src={imageUrls[0]}
              width={1024}
              height={1024}
              alt={"An image"}
            />
          </figure>
        )}
      </>
    );
};

export default PostImages;
