import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/clerk-react";
import { useRef } from "react";

const UserDisplay = () => {
  return (
    <>
      <SignedIn>
        {/* Mount the UserButton component */}
        <div>
          <UserButton />
        </div>
      </SignedIn>
      <SignedOut>
        {/* Signed out users get sign in button */}
        <SignInButton />
      </SignedOut>
    </>
  );
};

export default UserDisplay;
