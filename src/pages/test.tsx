import { useAuth } from "@clerk/nextjs";
import UserPost from "~/components/UserPost";

const Test = () => {
  const example = {
    id: "1",
    content: "This is a sample post",
    image: "https://picsum.photos/200",
    createdAt: new Date(),
    authorId: "1",
    spaceId: "1",
    likedByIDs: ["1", "2"],
    updatedAt: new Date(),
    Space: {
      name: 'Test Space'
    }
  };
  const likesCount = example.likedByIDs.length;

  return (
    <>
      <main>
      </main>
    </>
  );
};

export default Test;
