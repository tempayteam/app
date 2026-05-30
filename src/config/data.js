import { DIRECT_PAYMENT, RECEIVE, SEND, TRACKED_PAYMENT } from "../constant/constant"
import { coinIcon, directPaymentIcon, disputeIcon, getPaidIcon, homeIcon, onGoingIcon, receiveIcon, sendIcon, trackedPaymentIcon } from "../constant/icon"

export const navigation = [
    { id: 1, name: 'Home', href: '/', current: true, icon: homeIcon },
    { id: 2, name: 'Pay', href: '/pay', current: false, icon: coinIcon },
    { id: 3, name: 'Get Paid', href: '/get-paid', current: false, icon: getPaidIcon },
    { id: 4, name: 'On Going', href: '/on-going', current: false, icon: onGoingIcon },
    { id: 5, name: 'Dispute', href: '/dispute', current: false, icon: disputeIcon },
]

/** Sidebar + mobile drawer: `path` for React Router, `icon` as Font Awesome class string */
export const menuList = navigation.map((item) => ({
    id: item.id,
    name: item.name,
    path: item.href === '/' ? '/home' : item.href,
    icon: item.icon,
}))
export const adminNavigation = [
    { id: 1, name: 'Home', href: '/', current: true, icon: homeIcon },
    { id: 7, name: 'Pay', href: '/pay', current: false, icon: coinIcon },
    { id: 3, name: 'Get Paid', href: '/get-paid', current: false, icon: getPaidIcon },
    { id: 4, name: 'On Going', href: '/on-going', current: false, icon: onGoingIcon },
    { id: 5, name: 'My Dispute', href: '/dispute', current: false, icon: disputeIcon },
    { id: 2, name: 'All Disputes', href: '/admin-dispute', current: false, icon: disputeIcon },
]

export const homeFilterData = [
    { id: 1, name: SEND, icon: sendIcon },
    { id: 2, name: RECEIVE, icon: receiveIcon },
]
export const RequestFilterData = [
    { id: 1, name: DIRECT_PAYMENT, icon: directPaymentIcon },
    { id: 2, name: TRACKED_PAYMENT, icon: trackedPaymentIcon },
]

export const getPaidPaymentType = [
    { id: 1, name: DIRECT_PAYMENT, value: 'direct-payment' },
    { id: 2, name: TRACKED_PAYMENT, value: 'tracked-payment' },
    // { id: 3, name: 'Send Request', value: 'send-request' },
]

export const mileStoneDuration = [
    // { id: 0, name: '1 Minute', value: "one_minute", timestamp: 2 * 60 },                   // 1 minute in ms
    { id: 1, name: '1 Hour', value: "one_hour", timestamp: 3600 },                    // 1 hour in seconds
    { id: 2, name: '2 Hour', value: "two_hours", timestamp: 7200 },                   // 2 hours in seconds
    { id: 3, name: '3 Hour', value: "three_hours", timestamp: 10800 },                // 3 hours in seconds
    { id: 4, name: '6 Hour', value: "six_hours", timestamp: 21600 },                  // 6 hours in seconds
    { id: 5, name: '12 Hour', value: "twelve_hours", timestamp: 43200 },              // 12 hours in seconds
    { id: 6, name: '1 Day', value: "one_day", timestamp: 86400 },                     // 1 day in seconds
    { id: 7, name: '1 Week', value: "one_week", timestamp: 604800 },                  // 1 week in seconds
    { id: 8, name: '1 Month', value: "one_month", timestamp: 2592000 },               // 30 days in seconds
    { id: 9, name: '2 Month', value: "two_months", timestamp: 5184000 },              // 60 days in seconds
    { id: 10, name: '6 Month', value: "six_months", timestamp: 15552000 },            // 180 days in seconds
    { id: 11, name: '1 Year', value: "one_year", timestamp: 31536000 }                // 365 days in seconds
];

export const supportCategories = [
    {
        id: 1,
        category: "Payment Gateway Integration",
        subcategories: [
            { value: "compatibility_issues", label: "Compatibility Issues" },
            { value: "developer_resources", label: "Developer Resources" }
        ]
    },
    {
        id: 2,
        category: "Transactions and Processing",
        subcategories: [
            { value: "payment_processing_delays", label: "Payment Processing Delays" },
            { value: "transaction_status", label: "Transaction Status & Tracking" },
            { value: "refunds_chargebacks", label: "Refunds & Chargebacks" },
            { value: "cross_border_payments", label: "Cross-Border Payments" }
        ]
    },
    {
        id: 3,
        category: "Account and Compliance",
        subcategories: [
            { value: "account_verification", label: "Account Verification for Payments" },
            { value: "kyc_compliance", label: "KYC & AML Compliance" },
            { value: "tax_compliance", label: "Tax Compliance and Reporting" },
            { value: "regulatory_requirements", label: "Regulatory Requirements by Region" }
        ]
    },
    {
        id: 4,
        category: "Security and Fraud Prevention",
        subcategories: [
            { value: "fraudulent_transactions", label: "Fraudulent Transactions" },
            { value: "gateway_security", label: "Payment Gateway Security Features" },
            { value: "chargeback_prevention", label: "Chargeback Prevention & Management" },
            { value: "user_authentication", label: "User Authentication and Security" }
        ]
    }
];

export const filterTypes = [
    'Milestone',
    'Direct Payment',
    'Sending',
    'Receive',
    'Accepted',
    'Rejected',
    'Need Response',
    'Latest'
];
