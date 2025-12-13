/**
 * Clear-Cause Logic
 * Handles dynamic form generation, rule evaluation, and explanation generation.
 */

// --- Configuration & Rules Engine ---

const SCENARIOS = {
    business_grant: {
        title: "Small Business Resilience Grant",
        description: "Eligibility check for the 2025 Small Business Resilience Fund.",
        inputs: [
            { id: "revenue", label: "Annual Revenue (₹)", type: "number", placeholder: "e.g. 1500000" },
            { id: "years", label: "Years in Operation", type: "number", placeholder: "e.g. 3" },
            { id: "employees", label: "Full-time Employees", type: "number", placeholder: "e.g. 5" },
            { id: "sector", label: "Business Sector", type: "select", options: ["Technology", "Retail", "Hospitality", "Manufacturing", "Other"] }
        ],
        evaluate: (data) => {
            const revenue = parseFloat(data.revenue);
            const years = parseFloat(data.years);
            const employees = parseFloat(data.employees);
            const sector = data.sector;

            // Rule Constants (INR)
            const MAX_REVENUE = 10000000; // 1 Crore
            const MIN_YEARS = 2;
            const MIN_EMPLOYEES = 3;
            const PRIORITY_SECTORS = ["Retail", "Hospitality", "Manufacturing"];

            // Logic
            let outcome = "Approved";
            let keyFactor = "All Criteria Met";
            let explanation = "Your business meets all eligibility requirements for this grant.";
            let guidance = "Proceed to the document upload stage to verify your details.";
            let ruleSummary = `Requires revenue under ₹1 Cr, 2+ years operation, and 3+ employees.`;
            let resource = { label: "Read the Small Business Resilience Act Guidelines", url: "https://www.msme.gov.in/" };
            let legalClause = "Section 4(b) of the Small Business Resilience Act 2025: 'Eligibility is restricted to enterprises with annual gross receipts not exceeding ₹1 Crore and a minimum operational history of 24 months.'";

            if (revenue >= MAX_REVENUE) {
                outcome = "Denied";
                keyFactor = "Annual Revenue";
                explanation = `Your annual revenue of ₹${revenue.toLocaleString('en-IN')} exceeds the maximum threshold of ₹${MAX_REVENUE.toLocaleString('en-IN')} (1 Crore) for this specific grant program, which targets smaller enterprises.`;
                guidance = "Consider applying for the 'Growth Enterprise Fund' which supports businesses with higher revenue streams.";
                legalClause = "Section 4(b)(i): 'Entities exceeding the revenue cap of ₹10,000,000 shall be classified as mid-sized and are ineligible for Tier-1 resilience funding.'";
            } else if (years < MIN_YEARS) {
                outcome = "Denied";
                keyFactor = "Years in Operation";
                explanation = `The grant requires a minimum of ${MIN_YEARS} years in operation to ensure business stability. You currently have ${years} year(s).`;
                guidance = `You will become eligible for this grant in ${MIN_YEARS - years} year(s). In the meantime, check our 'Startup Incubator' resources.`;
                legalClause = "Section 4(b)(ii): 'Applicants must demonstrate continuous business operations for a period of no less than two fiscal years prior to the date of application.'";
            } else if (employees < MIN_EMPLOYEES) {
                outcome = "Denied";
                keyFactor = "Employee Count";
                explanation = `This program aims to support job creators. It requires a minimum of ${MIN_EMPLOYEES} full-time employees, but you reported ${employees}.`;
                guidance = "Hiring additional full-time staff would align your business with the goals of this grant program.";
                legalClause = "Section 5(a): 'To qualify as a job-creating entity, the applicant must maintain a payroll of at least three full-time equivalent employees.'";
            } else if (!PRIORITY_SECTORS.includes(sector)) {
                // Soft denial / Review
                outcome = "Review";
                keyFactor = "Business Sector";
                explanation = `While you meet the financial metrics, the '${sector}' sector is not currently listed as a high-priority category for this specific funding round.`;
                guidance = "Your application has been flagged for manual review. Providing a strong impact statement in the next step may help your case.";
                legalClause = "Appendix A, Schedule III: 'Priority funding is allocated to sectors deemed critical for economic recovery, including Retail, Hospitality, and Manufacturing. Other sectors are subject to discretionary review.'";
            }

            return { outcome, keyFactor, explanation, guidance, ruleSummary, resource, legalClause };
        }
    },
    housing_loan: {
        title: "First-Time Homebuyer Loan",
        description: "Pre-qualification check for the State First-Time Homebuyer Program.",
        inputs: [
            { id: "creditScore", label: "CIBIL Score (300-900)", type: "number", placeholder: "e.g. 750" },
            { id: "income", label: "Annual Household Income (₹)", type: "number", placeholder: "e.g. 1200000" },
            { id: "debt", label: "Monthly Debt Payments (₹)", type: "number", placeholder: "e.g. 15000" }
        ],
        evaluate: (data) => {
            const score = parseFloat(data.creditScore);
            const income = parseFloat(data.income);
            const monthlyDebt = parseFloat(data.debt);

            // Derived
            const monthlyIncome = income / 12;
            const dti = (monthlyDebt / monthlyIncome) * 100; // Debt to Income Ratio

            // Rule Constants
            const MIN_SCORE = 700;
            const MAX_DTI = 40; // 40%

            let outcome = "Approved";
            let keyFactor = "Credit & DTI";
            let explanation = `Your CIBIL score of ${score} is healthy, and your Debt-to-Income ratio of ${dti.toFixed(1)}% is well within the safe lending limit of ${MAX_DTI}%.`;
            let guidance = "You are in a strong position. Contact a loan officer to lock in your rate.";
            let ruleSummary = `Requires CIBIL Score 700+ and Debt-to-Income Ratio under 40%.`;
            let resource = { label: "RBI Master Directions on Housing Finance", url: "https://www.rbi.org.in/" };
            let legalClause = "RBI Master Direction - Housing Finance (2024), Section 12.1: 'Lenders must ensure the borrower satisfies the minimum creditworthiness criteria and debt service coverage ratios.'";

            if (score < MIN_SCORE) {
                outcome = "Denied";
                keyFactor = "CIBIL Score";
                explanation = `Your CIBIL score of ${score} is below the minimum requirement of ${MIN_SCORE} for this program. This metric is used to assess repayment reliability.`;
                guidance = "Improving your score by paying down balances or correcting errors on your report could change this result. Re-apply once your score reaches 700.";
                legalClause = "Credit Risk Management Guidelines, Para 4.2: 'Loans shall not be extended to applicants with a credit score below the risk floor of 700, barring exceptional circumstances.'";
            } else if (dti > MAX_DTI) {
                outcome = "Denied";
                keyFactor = "Debt-to-Income Ratio";
                explanation = `Your Debt-to-Income (DTI) ratio is ${dti.toFixed(1)}%, which exceeds the maximum of ${MAX_DTI}%. This suggests that taking on a mortgage might overextend your finances.`;
                guidance = `To qualify, you would need to reduce your monthly debt payments by approximately ₹${(monthlyDebt - (monthlyIncome * (MAX_DTI / 100))).toFixed(0)} or increase your income.`;
                legalClause = "Prudential Norms on Income Recognition, Clause 8: 'The Debt-to-Income (DTI) ratio for unsecured or secured housing loans must not exceed 40% to prevent borrower over-leverage.'";
            }

            return { outcome, keyFactor, explanation, guidance, ruleSummary, resource, legalClause };
        },
    },
    student_loan: {
        title: "Student Education Loan",
        description: "Eligibility for government-subsidized higher education loans.",
        inputs: [
            { id: "admission", label: "Admission Secured?", type: "select", options: ["Yes", "No"] },
            { id: "fees", label: "Total Course Fees (₹)", type: "number", placeholder: "e.g. 500000" },
            { id: "parentIncome", label: "Annual Parental Income (₹)", type: "number", placeholder: "e.g. 600000" }
        ],
        evaluate: (data) => {
            const admission = data.admission;
            const fees = parseFloat(data.fees);
            const income = parseFloat(data.parentIncome);

            const MAX_LOAN_WITHOUT_COLLATERAL = 750000; // 7.5 Lakhs
            const INCOME_SUBSIDY_LIMIT = 450000; // 4.5 Lakhs for interest subsidy

            let outcome = "Approved";
            let keyFactor = "Admission & Limits";
            let explanation = "You are eligible for the education loan based on your admission status.";
            let guidance = "Submit your admission letter and fee structure to the bank.";
            let ruleSummary = "Requires confirmed admission. Loans > ₹7.5L need collateral.";
            let resource = { label: "Vidya Lakshmi Portal - Education Loan Scheme", url: "https://www.vidyalakshmi.co.in/" };
            let legalClause = "Model Educational Loan Scheme (IBA), Clause 4.1: 'Student eligibility is contingent upon secured admission to a recognized higher education course.'";

            if (admission === "No") {
                outcome = "Denied";
                keyFactor = "Admission Status";
                explanation = "Loans can only be sanctioned after admission is confirmed in a recognized institution.";
                guidance = "Please apply once you have a confirmed admission letter.";
                ruleSummary = "Requires confirmed admission.";
                legalClause = "Model Educational Loan Scheme (IBA), Clause 4.1: 'No loan shall be disbursed without valid proof of admission (e.g., Offer Letter or ID card) from the institution.'";
            } else if (fees > MAX_LOAN_WITHOUT_COLLATERAL) {
                outcome = "Review";
                keyFactor = "Loan Amount";
                explanation = `Your requested loan amount of ₹${fees.toLocaleString('en-IN')} exceeds the collateral-free limit of ₹${MAX_LOAN_WITHOUT_COLLATERAL.toLocaleString('en-IN')}.`;
                guidance = "You will need to provide third-party guarantee or collateral for the amount exceeding ₹7.5 Lakhs.";
                ruleSummary = `Collateral required for loans above ₹${(MAX_LOAN_WITHOUT_COLLATERAL / 100000)} Lakhs.`;
                legalClause = "Credit Guarantee Fund Scheme for Education Loans (CGFSEL): 'Loans up to ₹7.5 Lakhs are eligible for guarantee cover without collateral. Amounts exceeding this limit require tangible security.'";
            } else if (income < INCOME_SUBSIDY_LIMIT) {
                outcome = "Approved";
                keyFactor = "Income Subsidy";
                explanation = `You are eligible for the loan. Additionally, since your parental income is below ₹${INCOME_SUBSIDY_LIMIT.toLocaleString('en-IN')}, you qualify for the Central Sector Interest Subsidy Scheme.`;
                guidance = "Ensure you apply for the interest subsidy certificate along with your loan application.";
                resource = { label: "Central Sector Interest Subsidy Scheme (CSIS) Guidelines", url: "https://www.education.gov.in/" };
                legalClause = "CSIS Scheme Guidelines, Para 3.2: 'Students from Economically Weaker Sections (EWS) with parental income up to ₹4.5 Lakhs are eligible for full interest subsidy during the moratorium period.'";
            }

            return { outcome, keyFactor, explanation, guidance, ruleSummary, resource, legalClause };
        }
    },
    scholarship: {
        title: "Merit-Cum-Means Scholarship",
        description: "Financial aid for meritorious students from economically weaker sections.",
        inputs: [
            { id: "percentage", label: "Previous Year Percentage (%)", type: "number", placeholder: "e.g. 85", min: 0, max: 100 },
            { id: "income", label: "Annual Family Income (₹)", type: "number", placeholder: "e.g. 250000" }
        ],
        evaluate: (data) => {
            const percentage = parseFloat(data.percentage);
            const income = parseFloat(data.income);

            const MIN_PERCENTAGE = 80;
            const MAX_INCOME = 800000; // 8 Lakhs

            let outcome = "Approved";
            let keyFactor = "Merit & Means";
            let explanation = `Congratulations! With ${percentage}% marks and family income within the ₹${MAX_INCOME.toLocaleString('en-IN')} limit, you are eligible for this scholarship.`;
            let guidance = "Prepare your income certificate and marksheets for verification.";
            let ruleSummary = `Requires 80%+ marks and family income under ₹8 Lakhs.`;
            let resource = { label: "National Scholarship Portal - Scheme Details", url: "https://scholarships.gov.in/" };
            let legalClause = "State Scholarship Regulations 2024, Section 8: 'Awards are granted to students demonstrating academic excellence (top 20th percentile) and financial need.'";

            if (percentage < MIN_PERCENTAGE) {
                outcome = "Denied";
                keyFactor = "Academic Merit";
                explanation = `The scholarship requires a minimum of ${MIN_PERCENTAGE}% in the previous academic year. You reported ${percentage}%.`;
                guidance = "Focus on improving your academic performance for the next cycle.";
                legalClause = "State Scholarship Regulations 2024, Section 8(a): 'Minimum Academic Standard: Applicants must have secured at least 80% marks or equivalent grade in the preceding examination.'";
            } else if (income >= MAX_INCOME) {
                outcome = "Denied";
                keyFactor = "Income Threshold";
                explanation = `Your family income of ₹${income.toLocaleString('en-IN')} exceeds the eligibility cap of ₹${MAX_INCOME.toLocaleString('en-IN')} for this means-based scholarship.`;
                guidance = "You may still be eligible for purely merit-based scholarships that do not have income restrictions.";
                legalClause = "State Scholarship Regulations 2024, Section 8(b): 'Means Test: Gross annual family income from all sources must not exceed ₹8,00,000 to qualify for the EWS category.'";
            }

            return { outcome, keyFactor, explanation, guidance, ruleSummary, resource, legalClause };
        }
    }
};

// --- DOM Elements ---

const scenarioSelect = document.getElementById('scenarioSelect');
const dynamicInputsContainer = document.getElementById('dynamicInputs');
const evaluateBtn = document.getElementById('evaluateBtn');
const decisionForm = document.getElementById('decisionForm');

const resultCard = document.getElementById('resultCard');
const emptyState = document.getElementById('emptyState');
const decisionBadge = document.getElementById('decisionBadge');
const timestamp = document.getElementById('timestamp');
const decisionTitle = document.getElementById('decisionTitle');
const decisionMainText = document.getElementById('decisionMainText');
const appliedRuleText = document.getElementById('appliedRuleText');
const keyFactorText = document.getElementById('keyFactorText');
const narrativeText = document.getElementById('narrativeText');
const guidanceText = document.getElementById('guidanceText');
const guidanceBox = document.getElementById('guidanceBox');
const resourceLink = document.getElementById('resourceLink');
const resourceLabel = document.getElementById('resourceLabel');
const legalText = document.getElementById('legalText');

// --- Event Listeners ---

scenarioSelect.addEventListener('change', (e) => {
    const scenarioKey = e.target.value;
    renderInputs(scenarioKey);
    evaluateBtn.disabled = false;

    // Reset output
    resultCard.classList.add('hidden');
    emptyState.classList.remove('hidden');
});

decisionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const scenarioKey = scenarioSelect.value;
    if (!scenarioKey) return;

    // Gather data
    const formData = new FormData(decisionForm);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Evaluate
    const result = SCENARIOS[scenarioKey].evaluate(data);

    // Render Result
    renderResult(result);
});

// --- Functions ---

function renderInputs(scenarioKey) {
    const scenario = SCENARIOS[scenarioKey];
    dynamicInputsContainer.innerHTML = ''; // Clear existing

    scenario.inputs.forEach((field, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group input-fade-in';
        wrapper.style.animationDelay = `${index * 0.1}s`;

        const label = document.createElement('label');
        label.htmlFor = field.id;
        label.textContent = field.label;

        let input;
        if (field.type === 'select') {
            const selectWrapper = document.createElement('div');
            selectWrapper.className = 'select-wrapper';
            input = document.createElement('select');
            input.id = field.id;
            input.name = field.id;

            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                input.appendChild(option);
            });
            selectWrapper.appendChild(input);
            wrapper.appendChild(label);
            wrapper.appendChild(selectWrapper);
        } else {
            input = document.createElement('input');
            input.type = field.type;
            input.id = field.id;
            input.name = field.id;
            input.placeholder = field.placeholder || '';
            if (field.min !== undefined) input.min = field.min;
            if (field.max !== undefined) input.max = field.max;
            input.required = true;

            wrapper.appendChild(label);
            wrapper.appendChild(input);
        }

        dynamicInputsContainer.appendChild(wrapper);
    });
}

function renderResult(result) {
    // Hide empty state, show card
    emptyState.classList.add('hidden');
    resultCard.classList.remove('hidden');

    // Animate card
    resultCard.style.opacity = '0';
    resultCard.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
        resultCard.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        resultCard.style.opacity = '1';
        resultCard.style.transform = 'translateY(0)';
    });

    // Populate Content
    decisionBadge.textContent = result.outcome;
    timestamp.textContent = new Date().toLocaleString('en-IN');

    // Reset classes
    resultCard.className = 'result-card card';
    if (result.outcome === 'Approved') resultCard.classList.add('approved');
    else if (result.outcome === 'Denied') resultCard.classList.add('denied');
    else resultCard.classList.add('review');

    decisionTitle.textContent = result.outcome === 'Approved' ? 'Decision: Approved' : (result.outcome === 'Denied' ? 'Decision: Not Eligible' : 'Decision: Under Review');

    // Main Text
    decisionMainText.textContent = result.explanation;

    // Details
    appliedRuleText.textContent = result.ruleSummary;
    keyFactorText.textContent = result.keyFactor;
    narrativeText.textContent = `Based on the information provided, the system evaluated your application against the standard ${SCENARIOS[scenarioSelect.value].title} criteria. ${result.explanation}`;

    // Legal
    legalText.textContent = result.legalClause;

    // Resource
    resourceLabel.textContent = result.resource.label;
    resourceLink.href = result.resource.url;

    // Guidance
    guidanceText.textContent = result.guidance;
}
