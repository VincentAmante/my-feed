import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";

const UserDisplay = () => 
<>
    <SignedIn>
    {/* Mount the UserButton component */}
        <UserButton />
    </SignedIn>
    <SignedOut>
            {/* Signed out users get sign in button */}
        <SignInButton />
    </SignedOut>
</>

export default UserDisplay;