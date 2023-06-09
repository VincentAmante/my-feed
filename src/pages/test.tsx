import { useState, useRef } from "react";
import DragAndDropImages from "~/components/DragAndDropImages";

const Test = () => {
  const [files, setFiles] = useState<string[]>([]);
  const uploadRef = useRef<HTMLButtonElement>(null);
  function onImageDrop(acceptedFile: string) {
    console.log(acceptedFile);
    setFiles((prevFiles: string[]) => [...prevFiles, acceptedFile]);
  }

  function onImagesUploaded(imageUrls: string[]) {
    console.log(imageUrls);
  }

  return (
    <>
      <main>
        <DragAndDropImages submitRef={uploadRef} onImagesUploaded={onImagesUploaded} onImageDrop={onImageDrop} />
        <button onClick={() => uploadRef.current?.click()}>Submit</button>
      </main>
    </>
  );
};

export default Test;
