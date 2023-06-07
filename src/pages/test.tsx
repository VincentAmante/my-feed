
import DragAndDropImages from "~/components/DragAndDropImages";

const Test = () => {
  
  function onImageDrop(acceptedFile: string) {
    console.log(acceptedFile);
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
