
import Image from "next/image";
import { useMemo } from "react";

type ImageType = {
    src: string | undefined | null;
    alt: string | undefined;
};
const PostImage = (props: ImageType) => {
    const image = useMemo(() => props.src || "", [props.src]);
    const alt = useMemo(() => props.alt || "", [props.alt]);

    if (!image || image === "") return <></>;
    else
        return (
            <>
                <figure className="w-full">
                    <Image
                        className="image object-cover w-full select-none"
                        src={image}
                        width={400}
                        height={400}
                        alt={alt}
                    />
                </figure>
            </>
        );
};

export default PostImage;