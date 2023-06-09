import { useState, useRef } from "react";
import DragAndDropImages from "~/components/DragAndDropImages";

const Test = () => {
  const uploadRef = useRef<HTMLButtonElement>(null);

  function onImagesUploaded(imageUrls: string[]) {
    console.log(imageUrls);
  }

  return (
    <>
      <main>
        <DragAndDropImages submitRef={uploadRef} onImagesUploaded={onImagesUploaded} />
        <button onClick={() => uploadRef.current?.click()}>Submit</button>
      </main>
    </>
  );
};

export default Test;
