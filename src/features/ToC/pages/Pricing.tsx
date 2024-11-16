import React, { useState, useEffect } from 'react';
import { Button, Card, Radio, Badge, Typography, Layout, Space, Row, Col, Alert, Tag, Divider } from 'antd';
import { CheckCircleFilled, FireFilled, CrownFilled, SafetyCertificateFilled } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

export const Pricing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [selectedDuration, setSelectedDuration] = useState('3');
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 12, seconds: 56 });

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

  const plans = {
    premium: {
      basePrice: 19.99,
      durations: {
        '12': { price: 5.99, discount: 70 },
        '3': { price: 7.99, discount: 60 },
        '1': { price: 9.99, discount: 50 }
      }
    },
    deluxe: {
      basePrice: 59.99,
      durations: {
        '12': { price: 17.99, discount: 70 },
        '3': { price: 23.99, discount: 60 },
        '1': { price: 29.99, discount: 50 }
      }
    }
  };

  const planFeatures = {
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

  return (
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
                    <Col span={12}>
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
                    </Col>
                    <Col span={12}>
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
                    </Col>
                  </Row>
                </Radio.Group>

                <Divider style={{ margin: '24px 0' }} />

                {/* Duration Options */}
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {Object.entries(plans[selectedPlan as keyof typeof plans].durations).map(([months, details]) => (
                    <Card
                      key={months}
                      hoverable
                      styles={{ body: { padding: '16px' } }}
                      style={{
                        background: selectedDuration === months ? '#2b2b2b' : '#1f1f1f',
                        borderColor: selectedDuration === months ? '#1890ff' : '#434343',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedDuration(months)}
                    >
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
                                Was ${plans[selectedPlan as keyof typeof plans].basePrice}/month
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

                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ height: 50, fontSize: 18, marginTop: 24 }}
                >
                  Get Started Now
                </Button>

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
                {planFeatures[selectedPlan as keyof typeof planFeatures].map((feature, index) => (
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
  );
};