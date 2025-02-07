import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Radio, Badge, Typography, Layout, Space, Row, Col, Alert, Tag, Divider, App, Modal, } from 'antd';
import { CheckCircleFilled, FireFilled, CrownFilled, SafetyCertificateFilled, CheckCircleOutlined } from '@ant-design/icons';
import { PayPalScriptProvider, PayPalButtons, PayPalButtonsComponentProps } from '@paypal/react-paypal-js';
import { v4 as uuidv4 } from 'uuid';
import { axiosInstance, PAYPAL_CLIENT_ID, supabase } from '../../../config';
import { AppContext } from "../../../appContext";

type PlanType = 'premium' | 'deluxe';
type DurationType = '12' | '3' | '1';

// Define the structure of the plan data
interface Plan {
    basePrice: number;
    durations: {
        [key in DurationType]: {
            price: number;
            discount: number;
            PaypalPlanId: string;
            StripePriceId: string;
            NowpaymentsPlanId: string;
            totalPrice: number;
            orderId: string;
        };
    };
}

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const PLAN_DISCOUNTS: Record<DurationType, number> = {
    '12': 70,
    '3': 60,
    '1': 50,
};

const PLAN_PAYPAL_IDS: Record<PlanType, Record<DurationType, string>> = {
    premium: {
        '12': 'P-9R858333W0070884AM5PMZGY',
        '3': 'P-3NU73511FF987244KM5PMYUA',
        '1': 'P-31U24557YL656873KM5PMR5Y'
    },
    deluxe: {
        '12': 'P-83P64670461239417M5PM26Y',
        '3': 'P-7MJ26483KB159394TM5PM2PI',
        '1': 'P-2DW03121K6237493RM5PMZYA'
    }
};

const PLAN_STRIPE_IDS: Record<PlanType, Record<DurationType, string>> = {
    premium: {
        '12': 'price_1QSewMK2tw1lar2S5hasoz9x',
        '3': 'price_1QSevjK2tw1lar2S4Lw8EL2c',
        '1': 'price_1QSPJBK2tw1lar2S7i0kSELb'
    },
    deluxe: {
        '12': 'price_1QSeyLK2tw1lar2SSKw7Uwaa',
        '3': 'price_1QSexgK2tw1lar2SxseuUrT5',
        '1': 'price_1QSex1K2tw1lar2Sv7OQXfms'
    }
};

const PLAN_NOWPAYMENTS_IDS: Record<PlanType, Record<DurationType, string>> = {
    premium: {
        '12': '1341561217',
        '3': '1601892049',
        '1': '1253822653'
    },
    deluxe: {
        '12': '1323939645',
        '3': '683509208',
        '1': '471567332'
    }
};


const ORDER_IDS: Record<PlanType, Record<DurationType, string>> = {
    premium: {
        '12': 'Premium_3',
        '3': 'Premium_2',
        '1': 'Premium_1'
    },
    deluxe: {
        '12': 'Deluxe_3',
        '3': 'Deluxe_2',
        '1': 'Deluxe_1'
    }
};

const NOWPAYMENT_URL: Record<PlanType, Record<DurationType, string>> = {
    premium: {
        '12': 'https://nowpayments.io/payment/?iid=4821045171',
        '3': 'https://nowpayments.io/payment/?iid=5322246968',
        '1': 'https://nowpayments.io/payment/?iid=5437271265'
    },
    deluxe: {
        '12': 'https://nowpayments.io/payment/?iid=5872429614',
        '3': 'https://nowpayments.io/payment/?iid=6230073660',
        '1': 'https://nowpayments.io/payment/?iid=5179602806'
    }
};

const TOTALPRICE: Record<PlanType, Record<DurationType, number>> = {
    premium: {
        '12': 71.88,
        '3': 23.97,
        '1': 9.99
    },
    deluxe: {
        '12': 29.99,
        '3': 71.97,
        '1': 215.88
    }
};

const BASE_PRICES: Record<PlanType, number> = {
    premium: 19.99,
    deluxe: 59.99
};

const PLAN_FEATURES: Record<PlanType, string[]> = {
    premium: [
        '5,000 top-tier AI messages monthly',
        'Uncensored chat',
        'Real-like responses',
        'Enhanced Chat memory (4K)',
        'Longer and fast responses',
        'Access to 5K+ public characters',
        'Create custom private characters',
        'Secure messaging with strong encryption',
        'Chats are private and not used for training'
    ],
    deluxe: [
        '20,000 top-tier AI messages monthly',
        'Uncensored chat',
        'Real-like responses',
        'Enhanced Chat memory (8K)',
        'Longer and fast responses',
        'Access to 5K+ public characters',
        'Create custom private characters',
        'Secure messaging with strong encryption',
        'Chats are private and not used for training',
        'Priority access to new features & support'
    ]
};

const calculatePlanPrice = (basePrice: number, discount: number): number => {
    const price = basePrice * (1 - discount / 100) - 0.01;
    return Math.ceil(price * 100) / 100; // Rounds up to 2 decimal places
};

const PLANS: Record<PlanType, Plan> = {
    premium: {
        basePrice: BASE_PRICES.premium,
        durations: {
            '12': {
                price: calculatePlanPrice(BASE_PRICES.premium, PLAN_DISCOUNTS['12']),
                discount: PLAN_DISCOUNTS['12'],
                PaypalPlanId: PLAN_PAYPAL_IDS.premium['12'],
                StripePriceId: PLAN_STRIPE_IDS.premium['12'],
                NowpaymentsPlanId: PLAN_NOWPAYMENTS_IDS.premium['12'],
                totalPrice: TOTALPRICE.premium['12'],
                orderId: ORDER_IDS.premium['12']
            },
            '3': {
                price: calculatePlanPrice(BASE_PRICES.premium, PLAN_DISCOUNTS['3']),
                discount: PLAN_DISCOUNTS['3'],
                PaypalPlanId: PLAN_PAYPAL_IDS.premium['3'],
                StripePriceId: PLAN_STRIPE_IDS.premium['3'],
                NowpaymentsPlanId: PLAN_NOWPAYMENTS_IDS.premium['3'],
                totalPrice: TOTALPRICE.premium['3'],
                orderId: ORDER_IDS.premium['3']
            },
            '1': {
                price: calculatePlanPrice(BASE_PRICES.premium, PLAN_DISCOUNTS['1']),
                discount: PLAN_DISCOUNTS['1'],
                PaypalPlanId: PLAN_PAYPAL_IDS.premium['1'],
                StripePriceId: PLAN_STRIPE_IDS.premium['1'],
                NowpaymentsPlanId: PLAN_NOWPAYMENTS_IDS.premium['1'],
                totalPrice: TOTALPRICE.premium['1'],
                orderId: ORDER_IDS.premium['1']
            }
        }
    },
    deluxe: {
        basePrice: BASE_PRICES.deluxe,
        durations: {
            '12': {
                price: calculatePlanPrice(BASE_PRICES.deluxe, PLAN_DISCOUNTS['12']),
                discount: PLAN_DISCOUNTS['12'],
                PaypalPlanId: PLAN_PAYPAL_IDS.deluxe['12'],
                StripePriceId: PLAN_STRIPE_IDS.deluxe['12'],
                NowpaymentsPlanId: PLAN_NOWPAYMENTS_IDS.deluxe['12'],
                totalPrice: TOTALPRICE.deluxe['12'],
                orderId: ORDER_IDS.deluxe['12']
            },
            '3': {
                price: calculatePlanPrice(BASE_PRICES.deluxe, PLAN_DISCOUNTS['3']),
                discount: PLAN_DISCOUNTS['3'],
                PaypalPlanId: PLAN_PAYPAL_IDS.deluxe['3'],
                StripePriceId: PLAN_STRIPE_IDS.deluxe['3'],
                NowpaymentsPlanId: PLAN_NOWPAYMENTS_IDS.deluxe['3'],
                totalPrice: TOTALPRICE.premium['3'],
                orderId: ORDER_IDS.deluxe['3']
            },
            '1': {
                price: calculatePlanPrice(BASE_PRICES.deluxe, PLAN_DISCOUNTS['1']),
                discount: PLAN_DISCOUNTS['1'],
                PaypalPlanId: PLAN_PAYPAL_IDS.deluxe['1'],
                StripePriceId: PLAN_STRIPE_IDS.deluxe['1'],
                NowpaymentsPlanId: PLAN_NOWPAYMENTS_IDS.deluxe['1'],
                totalPrice: TOTALPRICE.premium['1'],
                orderId: ORDER_IDS.deluxe['1']
            }
        }
    }
};


export const Pricing: React.FC = () => {
    const { message } = App.useApp();
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('premium');
    const [selectedDuration, setSelectedDuration] = useState<DurationType>('3');
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 12, seconds: 56 });
    const [planDetails, setPlanDetails] = useState({ price: 7.99, discount: PLAN_DISCOUNTS['3'], PaypalPlanId: PLAN_PAYPAL_IDS.premium['3'], StripePriceId: PLAN_STRIPE_IDS.premium['3'], NowpaymentsPlanId: PLAN_NOWPAYMENTS_IDS.premium['3'], totalPrice: TOTALPRICE.premium['3'] });
    const [status, setStatus] = useState<string>("");
    const { profile } = useContext(AppContext);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('');
    const [reservedPlan, setReservedPlan] = useState<string>('');
    const [userType, setUserType] = useState<number>(1);
    const [isOtherPaymentOptionModalVisible, setOtherPaymentOptionModalVisible] = useState(false);
    const showModal = () => {
        setOtherPaymentOptionModalVisible(true);
    };
    const closeModal = () => {
        setOtherPaymentOptionModalVisible(false);
    };
    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
                    return prev; // Don't update if timer reached zero
                }

                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        async function run() {
            const response = await supabase.auth.getSession();
            const email = response.data.session?.user?.email || null;
            setUserEmail(email);
            if (email) {
                const { data: user, error: userError } = await supabase
                    .from("user_profiles")
                    .select("id, user_type")
                    .eq("user_email", email)
                    .single();

                setUserType(user?.user_type);

                const { data: subscription, error: subcriptionError } = await supabase
                    .from("subscriptions")
                    .select("current_plan, reserved_plan")
                    .eq("user_id", user?.id)
                    .single();
                setCurrentPlan(subscription?.current_plan);
                setReservedPlan(subscription?.reserved_plan)
            }
            console.log("sdfdsf")
        }
        run();
    }, []);

    useEffect(() => {
        const getPlanDetails = () => {
            const plan = PLANS[selectedPlan]; // Get the plan based on selectedPlan
            return plan ? plan.durations[selectedDuration] : undefined; // Return the duration details
        };
        const currentPlanDetails = getPlanDetails();
        if (currentPlanDetails)
            setPlanDetails(currentPlanDetails);

    }, [selectedPlan, selectedDuration])

    const handleStripePayment = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await axiosInstance.post("/subscription/stripe/create-checkout-session", {
                email: profile?.user_email,
                priceId: planDetails.StripePriceId

            });

            const data = await response.data;

            console.log(data, data.url, "data", "data.url")

            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            } else {
                alert('Unable to create session');
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }

    const createSubscription1 = (
        data: Record<string, unknown>,
        actions: any
    ): Promise<string> => {
        // Call PayPal API with dynamic planId
        return actions.subscription.create({
            plan_id: PLAN_PAYPAL_IDS.premium['3'], // Pass the dynamically selected plan_id
        });
    };

    const createSubscription2 = (
        data: Record<string, unknown>,
        actions: any
    ): Promise<string> => {
        // Call PayPal API with dynamic planId
        return actions.subscription.create({
            plan_id: PLAN_PAYPAL_IDS.premium['12'], // Pass the dynamically selected plan_id
        });
    };

    const createSubscription3 = (
        data: Record<string, unknown>,
        actions: any
    ): Promise<string> => {
        // Call PayPal API with dynamic planId
        return actions.subscription.create({
            plan_id: PLAN_PAYPAL_IDS.premium['1'], // Pass the dynamically selected plan_id
        });
    };

    const createSubscription4 = (
        data: Record<string, unknown>,
        actions: any
    ): Promise<string> => {
        // Call PayPal API with dynamic planId
        return actions.subscription.create({
            plan_id: PLAN_PAYPAL_IDS.deluxe['12'], // Pass the dynamically selected plan_id
        });
    };

    const createSubscription5 = (
        data: Record<string, unknown>,
        actions: any
    ): Promise<string> => {
        // Call PayPal API with dynamic planId
        return actions.subscription.create({
            plan_id: PLAN_PAYPAL_IDS.deluxe['3'], // Pass the dynamically selected plan_id
        });
    };

    const createSubscription6 = (
        data: Record<string, unknown>,
        actions: any
    ): Promise<string> => {
        // Call PayPal API with dynamic planId
        return actions.subscription.create({
            plan_id: PLAN_PAYPAL_IDS.deluxe['1'], // Pass the dynamically selected plan_id
        });
    };

    const onApprove = async (
        data: { subscriptionID?: string | null },
        actions: any
    ): Promise<void> => {
        if (!data.subscriptionID) {
            console.error("Subscription ID is missing.");
            setStatus("Error: Subscription ID is missing.");
            return;
        }

        console.log("Subscription Successful:", data, actions.subscription.get(), "subscription");
        setStatus("Subscription created successfully!");
        const subscription = await actions.subscription.get();

        try {
            // const saveSubscription = await axiosInstance.post("/subscription/create", {
            //     subscriptionID: data.subscriptionID,
            //     subscriptionInfo: subscription

            const saveSubscription = await axiosInstance.post("/subscription/create", {
                subscriptionID: data.subscriptionID,
                subscriptionInfo: subscription
            });
            message.success("Subscription created successfully!");
            window.location.href = "/account?checkout=true";
            // console.log(saveSubscription.data, "saveSubscription");
        } catch (err) {
            console.error("Error during onApprove:", err);
            setStatus("There was an error processing your subscription.");
            message.error("There was an error processing your subscription.");
        }
    };

    const onError = (err: any): void => {
        console.error("Error during subscription:", err);
        setStatus("There was an error processing your subscription.");
        message.error("There was an error processing your subscription.");
    };

    const handleCryptoPayment = async (event: React.FormEvent) => {
        event.preventDefault();
        const userEmail = profile?.user_email; // Replace with actual user's email
        const subscriptionAmount = planDetails.totalPrice + 0.1;        // Subscription amount (e.g., $50)
        const currency = "USD";               // Currency (e.g., USD)
        const subscriptionId = planDetails.NowpaymentsPlanId;       // Your NOWPayments Subscription ID
        try {
            const response = await axiosInstance.post("/subscription/nowpayments/generate-payment-link", {
                userEmail,
                subscriptionAmount,
                currency,
                subscriptionId
            });

            if (response.data.paymentUrl) {
                // Redirect user to the payment page on NOWPayments
                window.location.href = response.data.paymentUrl;
            } else {
                message.error("Error generating payment link.");
            }
        } catch (err) {
            message.error("An error occurred while generating the payment link.");
            console.error(err);
        }

    };

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, vault: "true" }}>
            <div style={{
                minHeight: 'calc(100vh - 134px)',
                background: '#242525',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px'
            }}>
                <div className="pricing-container" style={{
                    width: '100%',
                    maxWidth: 1200,
                    margin: '0 auto'
                }}>
                    {/* Improved Urgency Banner */}
                    <div style={{ marginBottom: 32, width: '100%' }}>
                        <Alert
                            banner
                            showIcon={false}
                            message={
                                <Row justify="center" align="middle" style={{ width: '100%' }}>
                                    <Space
                                        align="center"
                                        size={[8, 8]}
                                        wrap
                                        style={{
                                            justifyContent: 'center',
                                            width: '100%',
                                            padding: '8px 0'
                                        }}
                                    >
                                        <Space align="center" size={8}>
                                            <FireFilled style={{
                                                fontSize: 20,
                                                color: '#fff',
                                                animation: 'pulse 2s infinite'
                                            }} />
                                            <Text strong style={{
                                                color: '#fff',
                                                fontSize: '16px',
                                                textAlign: 'center',
                                                display: 'block'
                                            }}>
                                                Limited Time Offer
                                            </Text>
                                        </Space>
                                        <Text strong style={{
                                            color: '#fff',
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '16px',
                                            fontFamily: 'monospace'
                                        }}>
                                            Save up to 70% OFF
                                        </Text>
                                        <Text strong style={{
                                            color: '#fff',
                                            fontSize: '16px',
                                            fontFamily: 'monospace',
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {`${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
                                        </Text>
                                    </Space>
                                </Row>
                            }
                            style={{
                                background: 'linear-gradient(90deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: 0
                            }}
                        />
                    </div>

                    {/* Main Content - Two Columns */}
                    <Row gutter={[24, 24]} style={{ margin: 0 }}>
                        {/* Left Column - Pricing */}
                        <Col xs={24} lg={12} style={{ display: 'flex' }}>
                            <Card
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    background: 'rgba(31, 31, 31, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    {/* Plan Selection */}
                                    <Radio.Group
                                        value={selectedPlan}
                                        onChange={e => setSelectedPlan(e.target.value)}
                                        style={{ width: '100%' }}
                                        buttonStyle="solid"
                                    >
                                        <Row gutter={16}>
                                            {/* <Col span={12}> */}
                                            <Radio.Button
                                                value="premium"
                                                style={{
                                                    width: '100%',
                                                    height: '44px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <Space align="center" size={8}>
                                                    <SafetyCertificateFilled style={{ fontSize: 16 }} />
                                                    <span>Premium</span>
                                                </Space>
                                            </Radio.Button>
                                            {/* </Col> */}
                                            {/* <Col span={12}>
                                                <Radio.Button
                                                    value="deluxe"
                                                    style={{
                                                        width: '100%',
                                                        height: '44px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    <Space align="center" size={8}>
                                                        <CrownFilled style={{ fontSize: 16 }} />
                                                        <span>Deluxe</span>
                                                    </Space>
                                                </Radio.Button>
                                            </Col> */}
                                        </Row>
                                    </Radio.Group>

                                    <Divider style={{ margin: '24px 0' }} />

                                    {/* Duration Options */}
                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        {Object.entries(PLANS[selectedPlan as keyof typeof PLANS].durations).map(([months, details]) => (
                                            <Card
                                                key={months}
                                                hoverable
                                                styles={{ body: { padding: '16px' } }}
                                                style={{
                                                    background: selectedDuration === months ? '#2b2b2b' : '#1f1f1f',
                                                    borderColor: selectedDuration === months ? '#1890ff' : '#434343',
                                                    cursor: 'pointer'
                                                }}

                                                onClick={() => {
                                                    if (['12', '3', '1'].includes(months)) {
                                                        setSelectedDuration(months as DurationType);
                                                    }
                                                }}
                                            >

                                                {/* Add the Badge (check icon) */}
                                                {currentPlan == details.orderId && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0, // Positions the badge 10px from the top
                                                        right: 5, // Positions the badge 10px from the right
                                                        zIndex: 1, // Ensures the badge stays on top of the card content
                                                    }}>
                                                        <Badge
                                                            count={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />}
                                                        />
                                                    </div>
                                                )}

                                                {reservedPlan == details.orderId && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0, // Positions the badge 10px from the top
                                                            left: -15, // Positions the badge 10px from the left
                                                            zIndex: 1, // Ensures the badge stays on top of the card content
                                                            transform: 'rotate(-15deg)', // Rotates the badge by 45 degrees
                                                            transformOrigin: ' top left', // Adjusts the origin of the rotation to the top-left corner
                                                        }}
                                                    >
                                                        <Badge
                                                            count={<span style={{ color: '#52c41a', fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic' }}>Reserved</span>}
                                                            style={{
                                                                backgroundColor: '#333', // Dark background for the "Reserved" badge
                                                                padding: '5px 5px', // Adds some padding to the badge for better appearance
                                                                borderRadius: '10px', // Optional: Adds rounded corners to the badge
                                                            }}
                                                        />
                                                    </div>
                                                )}


                                                <Row
                                                    justify="space-between"
                                                    align="middle"
                                                    wrap={false}
                                                    gutter={16}
                                                >
                                                    <Col flex="auto">
                                                        <Row gutter={[8, 4]}>
                                                            <Col span={24}>
                                                                <Space size={8} wrap={false}>
                                                                    <Text strong style={{ color: '#fff', fontSize: 16, whiteSpace: 'nowrap' }}>
                                                                        {months} months
                                                                    </Text>
                                                                    <Tag color="blue" style={{ margin: 0 }}>
                                                                        {details.discount}% OFF
                                                                    </Tag>
                                                                </Space>
                                                            </Col>
                                                            <Col span={24}>
                                                                <Text type="secondary" delete style={{ fontSize: 13 }}>
                                                                    Was ${PLANS[selectedPlan as keyof typeof PLANS].basePrice}/month
                                                                </Text>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col flex="none">
                                                        <Title level={2} style={{
                                                            margin: 0,
                                                            color: '#fff',
                                                            whiteSpace: 'nowrap',
                                                            fontSize: 24
                                                        }}>
                                                            ${details.price}
                                                            <Text style={{ fontSize: 14, color: '#8c8c8c' }}>/mo</Text>
                                                        </Title>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        ))}
                                    </Space>
                                    {/* {(currentPlan && reservedPlan) ? (
                                        <>
                                            <Button
                                                type="primary"
                                                size="large"
                                                onClick={showModal}
                                                block
                                                className="payment-button"
                                            >
                                                CANCEL
                                            </Button>
                                        </>) : (
                                        <> */}

                                    {(userType == 1) && (<>
                                        {planDetails.PaypalPlanId === PLAN_PAYPAL_IDS.premium['3'] && <PayPalButtons
                                            createSubscription={createSubscription1}
                                            onApprove={onApprove} // Now correctly returns a Promise<void>
                                            onError={onError}
                                        />}
                                        {planDetails.PaypalPlanId === PLAN_PAYPAL_IDS.premium['12'] && <PayPalButtons
                                            createSubscription={createSubscription2}
                                            onApprove={onApprove} // Now correctly returns a Promise<void>
                                            onError={onError}
                                        />}
                                        {planDetails.PaypalPlanId === PLAN_PAYPAL_IDS.premium['1'] && <PayPalButtons
                                            createSubscription={createSubscription3}
                                            onApprove={onApprove} // Now correctly returns a Promise<void>
                                            onError={onError}
                                        />}
                                        {planDetails.PaypalPlanId === PLAN_PAYPAL_IDS.deluxe['12'] && <PayPalButtons
                                            createSubscription={createSubscription4}
                                            onApprove={onApprove} // Now correctly returns a Promise<void>
                                            onError={onError}
                                        />}
                                        {planDetails.PaypalPlanId === PLAN_PAYPAL_IDS.deluxe['3'] && <PayPalButtons
                                            createSubscription={createSubscription5}
                                            onApprove={onApprove} // Now correctly returns a Promise<void>
                                            onError={onError}
                                        />}
                                        {planDetails.PaypalPlanId === PLAN_PAYPAL_IDS.deluxe['1'] && <PayPalButtons
                                            createSubscription={createSubscription6}
                                            onApprove={onApprove} // Now correctly returns a Promise<void>
                                            onError={onError}
                                        />}
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={showModal}
                                            block
                                            className="payment-button"
                                        >
                                            MORE PAYMENT OPTIONS
                                        </Button>
                                    </>)}

                                    {/* </>)} */}
                                    <Modal
                                        title={
                                            <span style={{
                                                color: '#f75ecd', fontSize: '30px', textAlign: 'center', fontWeight: 'bold', display: 'flex',
                                                justifyContent: 'center', // Horizontal center
                                                alignItems: 'center', // Vertical center
                                                marginBottom: '20px'
                                            }}>
                                                Choose Payment
                                            </span>
                                        }
                                        visible={isOtherPaymentOptionModalVisible}
                                        onCancel={closeModal}
                                        footer={[
                                            <Button key="close" onClick={closeModal}>
                                                Close
                                            </Button>,
                                        ]}
                                        centered
                                    >
                                        <p style={{ textAlign: 'center', marginBottom: '20px', width: '80%', margin: 'auto' }}>
                                            Please use the same account to log in to synchronize plans.
                                        </p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                                            <form onSubmit={handleStripePayment}>
                                                <input type="hidden" value={profile?.user_email} />
                                                <Button
                                                    htmlType="submit"
                                                    type="primary"
                                                    style={{
                                                        padding: '12px 24px',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        borderRadius: '8px',
                                                        width: "100%",
                                                        backgroundColor: '#f75ecd',
                                                    }}
                                                >
                                                    Stripe Checkout
                                                </Button>
                                            </form>

                                            <form onSubmit={handleCryptoPayment}>
                                                <input type="hidden" value={profile?.user_email} />
                                                <Button
                                                    htmlType="submit"
                                                    type="primary"
                                                    style={{
                                                        padding: '12px 24px',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        borderRadius: '8px',
                                                        width: "100%",
                                                        backgroundColor: 'green',
                                                        color: 'white',
                                                    }}
                                                >
                                                    Crypto pay
                                                </Button>
                                            </form>
                                        </div>
                                    </Modal>

                                    <Row justify="center">
                                        <Col>
                                            <Text type="secondary">Secure payment • Cancel anytime</Text>
                                        </Col>
                                    </Row>
                                </Space>
                            </Card>
                        </Col>

                        {/* Right Column - Features */}
                        <Col xs={24} lg={12} style={{ display: 'flex' }}>
                            <Card
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    background: 'rgba(31, 31, 31, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Background Image - Update the path */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: '100%',
                                        height: '250px',
                                        opacity: 0.5,
                                        backgroundImage: 'url(/right-2b8db0e2.png)',
                                        backgroundPosition: 'bottom right',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        pointerEvents: 'none'
                                    }}
                                />

                                {/* Content */}
                                <Space direction="vertical" size="middle" style={{ width: '100%', position: 'relative' }}>
                                    <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                        {selectedPlan === 'premium' ? 'Premium' : 'Deluxe'} Plan Features
                                    </Title>
                                    {PLAN_FEATURES[selectedPlan as keyof typeof PLAN_FEATURES].map((feature, index) => (
                                        <Row key={index} align="top" gutter={8} style={{ flexWrap: 'nowrap' }}>
                                            <Col style={{ flex: '0 0 auto' }}>
                                                <CheckCircleFilled style={{
                                                    color: '#52c41a',
                                                    fontSize: 16,
                                                    marginTop: 4  // Align with first line of text
                                                }} />
                                            </Col>
                                            <Col style={{ flex: '1 1 auto', minWidth: 0 }}> {/* Prevents text from wrapping under icon */}
                                                <Text style={{
                                                    color: '#d9d9d9',
                                                    display: 'block',  // Ensures proper text wrapping
                                                    wordWrap: 'break-word'  // Handles very long words
                                                }}>
                                                    {feature}
                                                </Text>
                                            </Col>
                                        </Row>
                                    ))}
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <style>
                    {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          @media (max-width: 575px) {
            .ant-space-wrap {
              flex-direction: column !important;
              gap: 8px !important;
            }
            
            .ant-card-body {
              padding: 12px !important;
            }
            
            .ant-space-vertical {
              gap: 12px !important;
            }

            .ant-alert-banner {
              padding: 8px !important;
            }

            .ant-space-align-center {
              gap: 8px !important;
            }
          }

          @media (min-width: 768px) {
            .pricing-container {
              padding: 32px 24px;
            }
          }
        `}
                </style>
            </div>
        </PayPalScriptProvider>
    );
};