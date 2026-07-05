const fs = require('fs');
const path = require('path');

// Extract translation keys from files with UTF-8 encoding
function extractKeysFromFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(content);
  } catch (e) {
    return {};
  }
}

// All namespaces
const namespaces = ['landing', 'referral', 'portfolio', 'investments', 'deposit', 'withdraw', 'transactions', 'settings', 'dashboardmain', 'dashboard', 'auth', 'common'];
const languages = ['en', 'es', 'pt', 'fr', 'ar', 'ph', 'zh'];
const baseDir = 'public/locales';

// Load English translations to compare against
const enTranslations = {};
namespaces.forEach(ns => {
  const filePath = path.join(baseDir, 'en', `${ns}.json`);
  enTranslations[ns] = extractKeysFromFile(filePath);
});

// List of all keys actually used in code (from comprehensive grep)
const usedKeysFromCode = {
  landing: ['nav_features', 'nav_performance', 'nav_plans', 'nav_testimonials', 'nav_login', 'nav_dashboard', 'nav_get_started', 'nav_investing', 'hero_badge', 'hero_title_part1', 'hero_title_part2', 'hero_description', 'hero_cta_primary', 'hero_cta_primary_logged', 'hero_cta_secondary', 'hero_cta_secondary_logged', 'features_label', 'features_title', 'features_description', 'stats_title', 'plans_label', 'plans_title', 'plans_description', 'plans_popular', 'plans_annual_return', 'plans_min_investment', 'plans_cta', 'plans_invest_now', 'plans_disclaimer', 'testimonials_label', 'testimonials_title', 'cta_title', 'cta_description', 'cta_button', 'cta_button_logged', 'cta_footnote', 'footer_tagline', 'footer_platform', 'footer_features', 'footer_pricing', 'footer_testimonials', 'footer_company', 'footer_about', 'footer_contact', 'footer_blog', 'footer_legal', 'footer_terms', 'footer_privacy', 'footer_copyright'],
  referral: ['title', 'description', 'code', 'copyCode', 'copiedCode', 'shareWithFriends', 'referralLink', 'activeReferrals', 'totalEarned', 'availableBalance', 'linkClicks', 'signups', 'earnCommission', 'minimum', 'inviteFriends', 'loading', 'my_referrals', 'withdraw', 'shareYourCode', 'referralCode', 'howItWorks', 'step1Title', 'step2Title', 'step3Title'],
  portfolio: ['title', 'description', 'last_update', 'overview', 'analysis', 'history', 'performance_analysis', 'best_performing', 'ytd_return', 'volatility', 'low', 'diversified_portfolio', 'portfolio_history', 'balance'],
  investments: ['plans_title', 'plans_subtitle', 'no_plans_available', 'curating_portfolios', 'talk_to_advisor', 'most_popular', 'download_factsheet', 'factsheet_not_available', 'no_fees_withdraw_anytime', 'review_invest', 'invest_in', 'investment_plan', 'low_risk', 'medium_risk', 'high_risk', 'minimum', 'maximum', 'estimated_annual_return', 'investmentAmount', 'unlimited', 'duration', 'duration_365_days_recommended', 'duration_180_days', 'duration_90_days', 'duration_60_days', 'duration_30_days', 'duration_14_days', 'duration_7_days', 'longer_duration_max_returns', 'investment_summary', 'investment_amount_label', 'return_rate', 'expected_profit', 'total_return', 'processing', 'confirm_investment', 'will_start_immediately', 'plans_tab', 'plans_tab_short', 'active_investments_tab', 'active_investments_tab_short', 'calculator_tab', 'calculator_tab_short', 'portfolio_tab', 'portfolio_tab_short', 'total_invested_header', 'accumulated_profit_header', 'active_investments_count', 'choose_your_plan', 'select_plans_description', 'pro_tip', 'your_active_investments', 'track_monitor_positions', 'no_active_investments', 'no_investments_description', 'view_investment_plans', 'view_active_investments', 'investment_calculator', 'calculate_potential_returns', 'portfolio_performance', 'analyze_investment_performance', 'portfolio_value_over_time', 'total_invested_amount', 'accumulated_profit', 'no_portfolio_data', 'start_investing_for_portfolio', 'ready_to_invest_more', 'explore_plans_grow_portfolio', 'view_your_positions', 'review_detailed_analytics', 'investment_confirmed', 'has_been_started', 'select_investment_plan', 'investment_duration', 'investment_amount_usd', 'longer_duration_higher_profit', 'estimated_returns', 'below_minimum', 'above_maximum', 'loading_calculator'],
  deposit: ['title', 'description', 'selectCoin', 'choosecryptocurrency', 'selectNetwork', 'chooseNetwork', 'enterAmount', 'minimumDeposit', 'estimatedAmount', 'generateAddress', 'cancel', 'processing'],
  withdraw: ['title', 'description', 'selectCryptocurrency', 'chooseWithdraw', 'withdrawalDetails', 'enterDetails', 'withdrawalAmount', 'enterAmount', 'withdrawalAddress', 'enterAddress', 'warningAddress', 'cancel', 'processing', 'withdraw'],
  transactions: ['title', 'description', 'totalDeposited', 'totalWithdrawn', 'totalReturns', 'recentTransactions', 'all', 'noTransactions', 'amount'],
  settings: ['title', 'description', 'accountInformation', 'updatePersonalDetails', 'firstName', 'lastName', 'emailAddress', 'phone', 'dateOfBirth', 'save', 'saved', 'emailIsChangeable', 'phoneIsChangeable', 'dateOfBirthCannotChange', 'securitySettings', 'managePasswordDesc', 'currentPassword', 'newPassword', 'confirmPassword', 'updatePassword', 'updating', 'authentication', 'twoFactorAuthentication', 'addExtraLayerSecurity', 'biometricLogin', 'useFingerprintFace', 'changePassword', 'lastPasswordChange', 'allFieldsRequired', 'passwordMinimum', 'passwordsDoNotMatch', 'passwordUpdatedSuccess', 'failedUpdatePassword', 'notificationSettings', 'controlUpdates', 'emailNotifications', 'receiveUpdatesEmail', 'pushNotifications', 'instantBrowserAlerts', 'transactionAlerts', 'depositsWithdrawals', 'investmentUpdates', 'updatesActiveInvestments', 'marketingEmails', 'specialOffersPromo', 'privacySettings', 'managePrivacy', 'profileVisibility', 'privateRecommended', 'friendsOnly', 'public', 'activityLogging', 'keepRecordActivity', 'dangerZone', 'irreversibleActions', 'deleteAccount', 'logoutAllDevices', 'deleteAccountWarning', 'requestDeletion', 'deletionReason', 'provideReasonDeletion', 'failedRequestDeletion', 'errorOccurred', 'deletionRequestSent', 'logout'],
  dashboardmain: ['welcome_back', 'portfolio_performing', 'total_balance', 'monthly_gain', 'total_return_rate', 'syncing', 'syncing_label', 'last_updated', 'net_balance', 'monthly_delta', 'active_investments', 'recent_transactions', 'portfolio_overview', 'quick_actions', 'deposit_funds', 'withdraw_funds', 'invest_now', 'view_plans', 'my_referrals', 'earnings', 'available_balance', 'total_invested', 'pending_lower', 'ready_to_invest', 'active_plans_label', 'growing', 'tracking', 'total_withdrawal', 'no_pending', 'daily_learning_tip', 'plan_name', 'invested_amount', 'expected_profit', 'start_date', 'end_date', 'progress', 'status', 'no_active_investments', 'start_investing', 'track_investments', 'referral_program', 'earn_on_referrals', 'active_referrals', 'can_withdraw', 'more_needed', 'ready_to_transfer', 'view_details', 'portfolio_performance', 'no_transactions_yet', 'this_month', 'no_recent_activity', 'activity_sign_in', 'activity_sign_out', 'activity_deposit', 'activity_withdrawal', 'activity_investment', 'activity_password_changed', 'activity_profile_updated', 'activity_deletion_request', 'just_now', 'min_ago', 'hours_ago', 'days_ago', 'settings', 'light_mode', 'dark_mode', 'support', 'sign_out'],
  dashboard: ['title', 'welcome', 'balance', 'totalEarned', 'transactions', 'viewAll', 'recentActivity', 'noActivity', 'loading'],
  auth: ['welcome_back', 'sign_in_to_account', 'create_account', 'join_platform', 'email_label', 'email_placeholder', 'password_label', 'password_placeholder', 'confirm_password_label', 'confirm_password_placeholder', 'first_name_label', 'last_name_label', 'phone_label', 'phone_placeholder', 'date_of_birth_label', 'forgot_password', 'sign_in', 'sign_up', 'sign_up_button', 'login_button', 'back_to_home', 'have_account', 'no_account', 'invalid_credentials', 'email_required', 'password_required', 'password_too_short', 'passwords_do_not_match', 'email_already_exists', 'account_created', 'redirecting', 'loading', 'error', 'success', 'allFieldsRequired', 'email_sent', 'verify_email', 'email_verification_required', 'resend_email', 'low', 'medium', 'high']
};

// Find missing keys
const report = {
  missingByNamespace: {},
  missingByLanguage: {},
  summary: { total: 0, namespaces: 0 }
};

// Check each namespace
for (const [ns, usedKeys] of Object.entries(usedKeysFromCode)) {
  const enKeys = Object.keys(enTranslations[ns] || {});
  const missing = usedKeys.filter(k => !enKeys.includes(k));
  
  if (missing.length > 0) {
    report.missingByNamespace[ns] = {
      used: usedKeys.length,
      available: enKeys.length,
      missing: missing,
      count: missing.length
    };
    report.summary.total += missing.length;
    report.summary.namespaces++;
  }
}

// Check by language
for (const lang of languages) {
  report.missingByLanguage[lang] = {};
  
  for (const [ns, usedKeys] of Object.entries(usedKeysFromCode)) {
    const filePath = path.join(baseDir, lang, `${ns}.json`);
    const langData = extractKeysFromFile(filePath);
    const langKeys = Object.keys(langData);
    const missing = usedKeys.filter(k => !langKeys.includes(k));
    
    if (missing.length > 0) {
      report.missingByLanguage[lang][ns] = missing;
    }
  }
}

// Output report
console.log('TRANSLATION AUDIT REPORT');
console.log('='.repeat(80));
console.log(`Scan Date: ${new Date().toISOString()}`);
console.log(`Namespaces Analyzed: ${namespaces.length}`);
console.log(`Languages Checked: ${languages.length}`);
console.log();

console.log('SUMMARY');
console.log('-'.repeat(80));
console.log(`Total Missing Keys: ${report.summary.total}`);
console.log(`Namespaces with Issues: ${report.summary.namespaces}`);
console.log();

if (report.summary.total === 0) {
  console.log('✓ ALL TRANSLATION KEYS ARE PRESENT');
} else {
  console.log('MISSING KEYS BY NAMESPACE');
  console.log('-'.repeat(80));
  for (const [ns, data] of Object.entries(report.missingByNamespace)) {
    console.log(`\n${ns.toUpperCase()}`);
    console.log(`  Available: ${data.available} keys, Used: ${data.used} keys,  Missing: ${data.count}`);
    data.missing.forEach(k => console.log(`    ✗ ${k}`));
  }

  console.log('\n' + '='.repeat(80));
  console.log('MISSING KEYS BY LANGUAGE');
  console.log('-'.repeat(80));
  
  for (const lang of languages) {
    const missingInLang = report.missingByLanguage[lang] || {};
    const totalMissingInLang = Object.values(missingInLang).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalMissingInLang === 0) {
      console.log(`${lang.toUpperCase()}: ✓ Complete`);
    } else {
      console.log(`${lang.toUpperCase()}: ${totalMissingInLang} missing keys`);
      for (const [ns, keys] of Object.entries(missingInLang || {})) {
        console.log(`  ${ns}: ${keys.length} keys missing`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('CRITICAL COMPONENTS WITH MISSING KEYS');
  console.log('-'.repeat(80));
  
  const critical = ['auth', 'landing', 'investments', 'dashboardmain'];
  for (const ns of critical) {
    if (report.missingByNamespace[ns]) {
      console.log(`\n${ns.toUpperCase()}: ${report.missingByNamespace[ns].count} missing keys`);
      report.missingByNamespace[ns].missing.slice(0, 10).forEach(k => console.log(`  - ${k}`));
      if (report.missingByNamespace[ns].missing.length > 10) {
        console.log(`  ... and ${report.missingByNamespace[ns].missing.length - 10} more`);
      }
    }
  }
}

console.log('\n' + '='.repeat(80));
