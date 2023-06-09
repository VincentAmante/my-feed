import { useState } from "react";
import DragAndDropImages from "~/components/DragAndDropImages";

const Test = () => {

  const [files, setFiles] = useState<string[]>([]);
  function onImageDrop(acceptedFile: string) {
    console.log(acceptedFile);
    setFiles((prevFiles: string[]) => [...prevFiles, acceptedFile]);
  }

  function onUpload() {
    
  }

  return (
    <>
      <main>
        <DragAndDropImages onImageDrop={onImageDrop} />
      </main>
    </>
  );
};

export default Test;
