import { useAuth } from "@clerk/nextjs";
import UserPost from "~/components/UserPost";

const Test = () => {
  const example = {
    id: "1",
    content: "This is a sample post",
    image: "https://picsum.photos/200",
    createdAt: new Date(),
    authorId: "1",
    feedId: "1",
    likedByIDs: ["1", "2"],
    updatedAt: new Date(),
  };
  const likesCount = example.likedByIDs.length;

  return (
    <>
      <main>
        <UserPost
          id={example.id}
          content={example.content}
          image={""}
          published={true}
          authorId={example.authorId}
          createdAt={example.createdAt}
          updatedAt={example.updatedAt}
          likedByIDs={[]}
          feedId={example.feedId}
        ></UserPost>
      </main>
    </>
  );
};

export default Test;
