import { useRouter } from "next/router";
import { NextPageWithLayout } from "../_app";
import { FeedContext } from "../components/DefaultLayout";
import { useContext } from "react";


const SpacePage = () => {
    const router = useRouter();

    return <>
        <main>
            <p>Space</p>
            <p>{router.query.id}</p>
        </main>
    </>
}

export default SpacePage;  