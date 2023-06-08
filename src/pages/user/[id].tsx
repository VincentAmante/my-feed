import DefaultLayout from "~/components/Layouts"
import { NextPageWithLayout } from "../_app"
import { api } from "~/utils/api"

const UserPage: NextPageWithLayout<{username: string}> = ({ username }) => {

    const { data, isLoading, isError } = api.users.getUserByUsername.useQuery(username)
    return <></>
}