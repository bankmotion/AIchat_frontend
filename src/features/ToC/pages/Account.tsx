import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button, Divider } from "antd";
import { SITE_NAME, supabase } from "../../../config";
import { AppContext } from "../../../appContext";

export const Account: React.FC = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const { profile, setSession, setProfile } = useContext(AppContext);
    const userId = profile?.id;
    const userType = profile?.user_type;

    const deleteUser = async (userId: any) => {

        console.log(userId);
        const { data, error } = await supabase
            .from("user_profiles")
            .update({
                is_able: false
            })
            .eq("id", userId);
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);

        if (error) {
            console.error("Error deleting user:", error.message);
        } else {
            console.log("User deleted successfully:", data);
            location.href = '/';
        }
    }

    useEffect(() => {
        async function run() {
            const response = await supabase.auth.getSession();
            // Make sure to handle the case where email might be undefined
            const email = response.data.session?.user?.email || null;
            setUserEmail(email);
        }
        run();
    }, []); // Only run once when the component mounts

    return (
        <div className="mt-4">
            <Helmet>
                <title>{`${SITE_NAME} - Account`}</title>
                <meta name="description" content="Account settings and plan details" />
            </Helmet>

            <h1>Account</h1>

            <section>
                <h2>Email</h2>
                <h3>{userEmail || "Loading..."}</h3>
            </section>

            <Divider style={{ borderWidth: "2px", borderColor: "white", marginTop: "-4px" }} />

            <section>
                <h2>Plan</h2>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between", // Centers the button within the container
                        width: "100%",
                        whiteSpace: "nowrap",
                    }}
                >
                    <h3 style={{ margin: 0 }}>{userType === 1 && 'Free Trial'}{userType === 2 && 'Premium'}{userType === 3 && 'Deluxe'}</h3>
                    <Button
                        type="primary"
                        onClick={() => navigate("/pricing")}
                        style={{ height: "auto" }}
                    >
                        {userType === 1 && 'Upgrade'}{(userType === 2 || 3) && 'Upgrade Plan'}
                    </Button>
                    <div></div>
                </div>
            </section>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    paddingTop: "50px",
                    color: "green",
                }}
            >
                <h3 style={{ margin: 0 }}>Just Enjoy :)</h3>
            </div>

            <section>
                <h2>Advanced</h2>
                <Button
                    type="primary"
                    onClick={() => deleteUser(userId)}
                    style={{ height: "auto" }}
                >
                    Delete Account
                </Button>
            </section>
        </div>
    );
};
