import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

type SpaceIconProps = {
  imageSrc?: string;
};

const AppIcon = (props: SpaceIconProps) => {
  const { imageSrc } = props;

  return (
    <>
      {imageSrc && (
        <div className="avatar rounded-lg bg-base-300">
          <div className="w-14 lg:w-16">
            <Image
              className="rounded-lg"
              src={imageSrc}
              alt="Avatar"
              width={100}
              height={100}
            />
          </div>
        </div>
      )}
      {!imageSrc && (
        <div className="placeholder avatar aspect-square rounded-lg bg-base-300">
          <div className="w-14 lg:w-16">
            {
              <FontAwesomeIcon
                icon={faImage}
                className="text-4xl text-base-content opacity-20"
              />
            }
          </div>
        </div>
      )}
    </>
  );
};

export default AppIcon;
