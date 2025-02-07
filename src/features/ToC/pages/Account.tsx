import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button, Divider, Modal } from "antd";
import { format } from "date-fns";
import { axiosInstance, SITE_NAME, supabase } from "../../../config";
import { AppContext } from "../../../appContext";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { size } from "lodash-es";

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { profile, setSession, setProfile } = useContext(AppContext);
  const [userType, setUserType] = useState<any>(profile?.user_type);
  const [term, setTerm] = useState<number>();
  const [reversedTerm, setReservedTerm] = useState<number>();
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [reservedPlan, setReservedPlan] = useState<string>("");
  const [freeCreditCount, setFreeCreditCount] = useState<number>();
  const [paidCreditCount, setPaidCreditCount] = useState<number>();
  const [freeCreditDate, setFreeCreditDate] = useState<any>();
  const [paidCreditDate, setPaidCreditDate] = useState<any>();
  const [currentMethod, setCurrentMethod] = useState<string>("");
  const [isCancelCurrentPlan, setIsCancelCurrentPlan] = useState<boolean>();
  const userId = profile?.id;

  // State for modal visibility
  const [isUpgradePlanModalVisible, setIsUpgradePlanModalVisible] = useState(false);

  // Function to handle modal show
  const showCancelPlanModal = () => {
    setIsUpgradePlanModalVisible(true);
  };

  // Function to handle modal close
  const handleCancelModal = () => {
    setIsUpgradePlanModalVisible(false);
  };

  // Function to handle the modal confirm action
  const handleConfirmCancel = () => {
    setIsUpgradePlanModalVisible(false);
    // Redirect or any other logic to upgrade plan
    if (currentMethod === "stripe") {
      window.open("https://billing.stripe.com/p/login/test_7sI9DjbcE0Bh4CY000", "_blank");
    }

    if (currentMethod === "paypal") {
      window.open("https://www.sandbox.paypal.com/myaccount/autopay/", "_blank");
    }
  };

  const deleteUser = async (userId: any) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        is_able: false,
      })
      .eq("id", userId);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);

    if (error) {
      console.error("Error deleting user:", error.message);
    } else {
      console.log("User deleted successfully:", data);
      location.href = "/";
    }
  };

  useEffect(() => {
    const run = async () => {
      const response = await supabase.auth.getSession();
      const email = response.data.session?.user?.email || null;
      setUserEmail(email);
      if (email) {
        try {
          const response = await axiosInstance.post("/subscription/checkStatus", {
            email: email,
          });

          console.log(response, "response_update_status");

          if (response.data.result == false) {
            console.error("response.data.result :", response.data.result);
          }
        } catch (error) {
          console.error("Error:", error);
        }

        const { data: user, error: userError } = await supabase
          .from("user_profiles")
          .select(
            "id, is_able, user_email, user_type, admin_api_usage_count, paid_api_usage_count, admin_api_usage_updatedAt, paid_api_usage_updatedAt"
          )
          .eq("user_email", email)
          .single();

        if (userError) {
          console.error(userError, "userError");
          throw new Error(`Failed to userError: ${userError.message}`);
        } else {
          setUserType(user?.user_type);
          setFreeCreditCount(user?.admin_api_usage_count);
          setPaidCreditCount(user?.paid_api_usage_count);
          setFreeCreditDate(
            format(
              new Date(
                new Date(user?.admin_api_usage_updatedAt).setMonth(
                  new Date(user?.admin_api_usage_updatedAt).getMonth() + 1
                )
              ),
              "dd.MM.yyyy"
            )
          );
          setPaidCreditDate(
            format(
              new Date(
                new Date(user?.paid_api_usage_updatedAt).setMonth(
                  new Date(user?.paid_api_usage_updatedAt).getMonth() + 1
                )
              ),
              "dd.MM.yyyy"
            )
          );
        }

        const { data: subscription, error: subcriptionError } = await supabase
          .from("subscriptions")
          .select("current_plan, reserved_plan, current_method, cancel_at_period_end")
          .eq("user_id", user?.id)
          .single();

        console.log(subscription, subcriptionError, "subscription, subcriptionError");

        if (subscription) {
          setCurrentPlan(subscription?.current_plan);
          console.log(currentPlan, "curretplan");
          setTerm(parseInt(subscription?.current_plan.split("_")[1], 10));
          setCurrentMethod(subscription?.current_method);
          setIsCancelCurrentPlan(subscription?.cancel_at_period_end);
          setReservedPlan((subscription?.reserved_plan).split("_")[0]);
          setReservedTerm(parseInt(subscription?.reserved_plan.split("_")[1], 10));
        }

        console.log(
          user?.admin_api_usage_count,
          user?.admin_api_usage_updatedAt,
          "ghjgjghjhgjghg65567556"
        );
      }
    };
    run();
    // Set up interval to run the function every 60 seconds
    const intervalId = setInterval(run, 1000*60);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  console.log(freeCreditCount, freeCreditDate, "ghjgjghjj", currentMethod, "currentMethod");

  return (
    <div
      className="mt-4"
      style={{
        fontFamily: "Roboto, sans-serif",
        backgroundColor: "transparent",
        padding: "20px",
        borderRadius: "10px",
        color: "#fff",
      }}
    >
      <Helmet>
        <title>{`${SITE_NAME} - Account`}</title>
        <meta name="description" content="Account settings and plan details" />
      </Helmet>

      <h1 style={{ fontSize: "2.5em", color: "#fff" }}>Account</h1>

      <section>
        <h2 style={{ fontSize: "1.5em", color: "#bbb" }}>Email</h2>
        <h3 style={{ fontSize: "1.2em", color: "#ccc" }}>{userEmail || "Loading..."}</h3>
      </section>

      <Divider style={{ borderWidth: "2px", borderColor: "#333", marginTop: "-4px" }} />

      <section>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr>
              <th
                style={{ textAlign: "left", padding: "12px", fontSize: "1.2em", color: "#4CAF50" }}
              >
                <h2>Plan</h2>
              </th>
              <th
                style={{ textAlign: "left", padding: "12px", fontSize: "1.2em", color: "#4CAF50" }}
              >
                <h2>Term</h2>
              </th>
              <th style={{ padding: "12px" }}></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "12px", fontSize: "1em", color: "#bbb" }}>
                {userType === 1 && "Free Trial"}
                {userType === 2 && "Premium"}
                {userType === 3 && "Deluxe"}
              </td>
              <td style={{ padding: "12px", fontSize: "1em", color: "#bbb" }}>
                {userType === 2 && term === 1 && "Monthly"}
                {userType === 2 && term === 2 && "Quarterly"}
                {userType === 2 && term === 3 && "Annually"}
              </td>
              <td style={{ padding: "12px", textAlign: "center" }}>
                {reservedPlan ? (
                  <>
                    {reservedPlan} / {reversedTerm === 1 && "Monthly"}
                    {reversedTerm === 2 && "Quarterly"}
                    {reversedTerm === 3 && "Annually"} Reserved.
                  </>
                ) : (
                  <>
                    {userType === 1 && (
                      <Button
                        type="primary"
                        onClick={() => {
                          if (isCancelCurrentPlan == null) {
                            navigate("/pricing");
                          }
                        }}
                        style={{
                          height: "auto",
                          backgroundColor: "#4CAF50",
                          borderColor: "#4CAF50",
                          padding: "8px 20px",
                          transition: "all 0.3s ease",
                          borderRadius: "5px",
                          marginRight: "10px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45a049")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")}
                      >
                        Upgrade
                      </Button>
                    )}
                  </>
                )}
                {userType !== 1 &&
                  (isCancelCurrentPlan ? (
                    "  Your current plan has been canceled."
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => {
                        if (currentMethod === "stripe") {
                          window.open(
                            "https://billing.stripe.com/p/login/test_7sI9DjbcE0Bh4CY000",
                            "_blank"
                          );
                        }

                        if (currentMethod === "paypal") {
                          window.open(
                            "https://www.sandbox.paypal.com/myaccount/autopay/",
                            "_blank"
                          );
                        }
                      }}
                      style={{
                        height: "auto",
                        backgroundColor: "#ff4d4f",
                        borderColor: "#ff4d4f",
                        padding: "8px 20px",
                        transition: "all 0.3s ease",
                        borderRadius: "5px",
                        marginLeft: "10px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ff4d4f";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ff4d4f";
                      }}
                    >
                      Cancel
                    </Button>
                  ))}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          flexDirection: "column",
          marginBottom: "30px",
        }}
      >
        <table
          style={{
            width: "60%",
            borderCollapse: "collapse",
            marginTop: "20px",
            backgroundColor: "#1e1e1e",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "15px", textAlign: "left", fontSize: "1em", color: "#bbb" }}>
                Free Credits: {freeCreditCount} out of 5
              </td>
              <td style={{ padding: "15px", textAlign: "left", fontSize: "1em", color: "#bbb" }}>
                Free Credits reset on {freeCreditDate}
              </td>
            </tr>
            {userType !== 1 && (
              <tr>
                <td style={{ padding: "15px", textAlign: "left", fontSize: "1em", color: "#bbb" }}>
                  Paid Credits: {paidCreditCount} out of {userType === 2 ? 5000 : 20000}
                </td>
                <td style={{ padding: "15px", textAlign: "left", fontSize: "1em", color: "#bbb" }}>
                  Paid Credits reset on {paidCreditDate}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <h3 style={{ marginTop: "20px", fontSize: "1.5em", color: "#28a745", fontWeight: "bold" }}>
          Just Enjoy :)
        </h3>
      </div>

      <section>
        <h2 style={{ fontSize: "1.5em", color: "#bbb" }}>Advanced</h2>
        <Button
          onClick={() => deleteUser(userId)}
          style={{
            height: "auto",
            backgroundColor: "#f44336",
            borderColor: "#f44336",
            padding: "8px 20px",
            transition: "all 0.3s ease",
            borderRadius: "5px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e53935")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f44336")}
        >
          Delete Account
        </Button>
      </section>

      {/* Modal for canceling the plan */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", color: "#f1f1f1" }}>
            <ExclamationCircleOutlined
              style={{ color: "#FF7A00", marginRight: "8px", fontSize: "1.5rem" }}
            />
            Cancel Current Plan to Upgrade
          </div>
        }
        visible={isUpgradePlanModalVisible}
        onOk={handleConfirmCancel}
        onCancel={handleCancelModal}
        okText="Confirm"
        cancelText="Cancel"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              onClick={handleCancelModal}
              style={{ background: "#333", color: "#f1f1f1", border: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCancel}
              style={{ background: "#f44336", color: "#fff", border: "none" }}
            >
              Confirm
            </Button>
          </div>
        }
        bodyStyle={{ color: "#f1f1f1", fontSize: "1rem", lineHeight: "1.5" }}
        style={{ borderRadius: "8px", overflow: "hidden" }}
      >
        <p style={{ marginBottom: "1rem", textAlign: "center", fontWeight: "500" }}>
          To upgrade your plan, kindly cancel your current plan first. Would you like to proceed
          with this step?
        </p>
      </Modal>
    </div>
  );
};
