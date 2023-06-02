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
        <UserPost
          id={example.id}
          content={example.content}
          image={"https://picsum.photos/500"}
          published={true}
          authorId={example.authorId}
          createdAt={example.createdAt}
          updatedAt={example.updatedAt}
          likedByIDs={[]}
          spaceId={example.spaceId}
          softDeleted={false}
          author={{
            id: "1",
            username: "test",
            profileImageUrl: "https://picsum.photos/100",
            firstName: "Test",
            lastName: "User",
          }}
          Space={example.Space}
        ></UserPost>
      </main>
    </>
  );
};

export default Test;
