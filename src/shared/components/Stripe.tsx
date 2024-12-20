// src/CheckoutForm.tsx

import React, { useState, useContext } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button, Typography, Space, Spin, Alert, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { axiosInstance } from "../../config";
import { AppContext } from "../../appContext";
// import 'antd/dist/antd.css'; // Import Ant Design styles

interface CheckoutFormProps {
    price: number;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ price }) => {
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const { profile } = useContext(AppContext);
    console.log(profile, "profile")

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        // Create payment method
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement)!,
        });

        if (stripeError) {
            setError(stripeError.message || "An error occurred.");
            setIsProcessing(false);
            return;
        }

        try {
            const response = await axiosInstance.post("/subscription/stripe/create-payment-intent", {
                payment_method_id: paymentMethod.id,
                price
            });
            const paymentIntentResponse = await response.data;

            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                paymentIntentResponse.client_secret
            );

            if (confirmError) {
                setError(confirmError.message || "An error occurred.");
                message.success(confirmError.message || "An error occurred.");
            } else if (paymentIntent?.status === "succeeded") {
                console.log(paymentIntent, 'paymentIntent')
                const saveSubscriptionByStripe = await axiosInstance.post("/subscription/stripe/save", {
                    paymentIntent: paymentIntent,
                    user_email: profile?.user_email
                });
                message.success("Payment successful!");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            message.success("An unexpected error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        // <div style={{ maxWidth: 400, margin: "0 auto", padding: 20, borderRadius: 8, backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        //   <Typography.Title level={3} style={{ textAlign: "center" }}>
        //     Complete Your Payment
        //   </Typography.Title>

        //   <form onSubmit={handleSubmit}>
        //     <div style={{ marginBottom: 20 }}>
        //       <CardElement />
        //     </div>

        //     <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
        //       <Button
        //         type="primary"
        //         htmlType="submit"
        //         block
        //         loading={isProcessing}
        //         style={{ padding: "12px", fontSize: "16px" }}
        //         disabled={isProcessing}
        //       >
        //         {isProcessing ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> : "Pay Now"}
        //       </Button>
        //     </Space>
        //   </form>

        //   {error && (
        //     <Alert
        //       message="Error"
        //       description={error}
        //       type="error"
        //       showIcon
        //       style={{ marginTop: 20 }}
        //     />
        //   )}
        // </div>
        <div
            style={{
                maxWidth:'100%',
                margin: "0 auto",
                padding: 24,
                borderRadius: 12,
                background: "linear-gradient(145deg, #2b2b2b, #1e1e1e)",
                boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.5), inset 0px -4px 8px rgba(0, 0, 0, 0.6)",
                border: "1px solid #333",
                color: "#fff",
            }}
        >
            <Typography.Title
                level={3}
                style={{
                    textAlign: "center",
                    marginBottom: 20,
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#e4e4e4",
                }}
            >
                Stripe Method
            </Typography.Title>

            <form onSubmit={handleSubmit}>
                <div
                    style={{
                        marginBottom: 20,
                        padding: 12,
                        borderRadius: 8,
                        background: "#1a1a1a",
                        border: "1px solid #444",
                        boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.6)",
                    }}
                >
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    color: "#e4e4e4",
                                    "::placeholder": { color: "#777" },
                                },
                            },
                        }}
                    />
                </div>

                <Space
                    direction="vertical"
                    style={{
                        width: "100%",
                        textAlign: "center",
                    }}
                >
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={isProcessing}
                        style={{
                            padding: "12px 0",
                            fontSize: "16px",
                            fontWeight: 600,
                            background: "linear-gradient(145deg, #ff5722, #e64a19)",
                            border: "none",
                            borderRadius: 8,
                            color: "#fff",
                            boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.6)",
                            transition: "all 0.3s",
                        }}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <Spin
                                indicator={<LoadingOutlined style={{ fontSize: 24, color: "#fff" }} spin />}
                            />
                        ) : (
                            "Pay Now"
                        )}
                    </Button>
                </Space>
            </form>

            {error && (
                <Alert
                    message="Payment Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{
                        marginTop: 20,
                        borderRadius: 8,
                        background: "#421010",
                        border: "1px solid #ff4d4f",
                        color: "#ffa39e",
                    }}
                />
            )}
        </div>


    );
};

export default CheckoutForm;
