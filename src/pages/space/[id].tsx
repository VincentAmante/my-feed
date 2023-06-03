import { useRouter } from "next/router";

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