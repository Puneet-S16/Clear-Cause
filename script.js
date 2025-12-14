/**
 * Clear-Cause Logic | Audit System
 * Handles official record input retrieval and explanation generation.
 */

// --- Configuration & Rules Engine ---

const SCENARIOS = {
    business_grant: {
        title: "Small Business Resilience Grant (SBG-25)",
        description: "Review of compliance with the 2025 Small Business Resilience Fund criteria.",
        inputs: [
            { id: "revenue", label: "Recorded Annual Revenue (₹)", type: "number", placeholder: "e.g. 1500000" },
            { id: "years", label: "Recorded Years in Operation", type: "number", placeholder: "e.g. 3" },
            { id: "employees", label: "Recorded Full-time Employees", type: "number", placeholder: "e.g. 5" },
            { id: "sector", label: "Business Sector", type: "select", options: ["Technology", "Retail", "Hospitality", "Manufacturing", "Other"] }
        ],
        evaluate: (data) => {
            const revenue = parseFloat(data.revenue);
            const years = parseFloat(data.years);
            const employees = parseFloat(data.employees);
            const sector = data.sector;

            const MAX_REVENUE = 10000000;
            const MIN_YEARS = 2;
            const MIN_EMPLOYEES = 3;
            const PRIORITY_SECTORS = ["Retail", "Hospitality", "Manufacturing"];

            let outcome = "APPROVED";
            let outcomeCheck = "ALL ELIGIBILITY CONDITIONS MET";
            let whySummary = "<strong>Basis of Determination:</strong> The application record demonstrates full compliance with all financial, operational, and sector-based statutory requirements.";
            let trace = [];
            let counterfactuals = [];

            const revenuePass = revenue < MAX_REVENUE;
            trace.push({
                label: "Revenue Cap Compliance",
                detail: `Limit: < ₹1,00,00,000 | Recorded: ₹${revenue.toLocaleString()}`,
                status: revenuePass ? 'pass' : 'fail'
            });

            const yearsPass = years >= MIN_YEARS;
            trace.push({
                label: "Operational Stability Check",
                detail: `Min. Duration: 2 Years | Recorded: ${years} Years`,
                status: yearsPass ? 'pass' : 'fail'
            });

            const employeesPass = employees >= MIN_EMPLOYEES;
            trace.push({
                label: "Employment Impact Threshold",
                detail: `Min. Employees: 3 | Recorded: ${employees}`,
                status: employeesPass ? 'pass' : 'fail'
            });

            const sectorPass = PRIORITY_SECTORS.includes(sector);
            trace.push({
                label: "Sector Priority Verification",
                detail: `Required: Priority List | Recorded: '${sector}'`,
                status: sectorPass ? 'pass' : 'neutral' // Neutral if fail but maybe review
            });

            // Logic
            if (!revenuePass) {
                outcome = "REJECTED";
                outcomeCheck = "REVENUE THRESHOLD EXCEEDED";
                whySummary = `<strong>Basis of Determination:</strong> The recorded annual revenue of ₹${revenue.toLocaleString()} exceeds the statutory maximum limit of ₹${MAX_REVENUE.toLocaleString()}.`;
                counterfactuals.push("Future fiscal year revenue falls below ₹1 Crore.");
                counterfactuals.push("Policy amendment to increase revenue caps for mid-sized enterprises.");
                trace.push({ label: "Final Determination", detail: "Statutory limits exceeded -> Application rejected.", status: 'final-fail' });
            } else if (!yearsPass) {
                outcome = "REJECTED";
                outcomeCheck = "INSUFFICIENT OPERATIONAL HISTORY";
                whySummary = `<strong>Basis of Determination:</strong> The entity has been in operation for ${years} years, failing to meet the minimum stability requirement of ${MIN_YEARS} years.`;
                counterfactuals.push(`Entity completes ${MIN_YEARS} years of continuous operation.`);
                trace.push({ label: "Final Determination", detail: "Minimum tenure not met -> Application rejected.", status: 'final-fail' });
            } else if (!employeesPass) {
                outcome = "REJECTED";
                outcomeCheck = "EMPLOYMENT QUOTA NOT MET";
                whySummary = `<strong>Basis of Determination:</strong> The recorded workforce count (${employees}) is below the mandatory minimum of ${MIN_EMPLOYEES} full-time employees.`;
                counterfactuals.push(`Workforce expansion to meets the ${MIN_EMPLOYEES} employee threshold.`);
                trace.push({ label: "Final Determination", detail: "Impact criteria not met -> Application rejected.", status: 'final-fail' });
            } else if (!sectorPass) {
                outcome = "UNDER REVIEW";
                outcomeCheck = "SECTOR MISMATCH - REFERRAL";
                whySummary = `<strong>Basis of Determination:</strong> The '${sector}' sector is not on the automatic approval list, necessitating manual economic impact assessment.`;
                counterfactuals.push("Sector is added to the priority list in future gazette notifications.");
                counterfactuals.push("Manual review verifies significant local economic contribution.");
                trace.push({ label: "Final Determination", detail: "Automatic criteria not met -> Referred for manual audit.", status: 'final-neutral' });
            } else {
                trace.push({ label: "Final Determination", detail: "All statutory criteria satisfied -> Application approved.", status: 'final-pass' });
            }

            return {
                outcome,
                outcomeCheck,
                whySummary,
                trace,
                factors: [
                    { label: "Revenue Limit", value: `Max ₹1 Cr` },
                    { label: "Min. Employees", value: `${MIN_EMPLOYEES}` }
                ],
                legal: {
                    text: "Eligibility is restricted to enterprises with annual gross receipts not exceeding ₹1 Crore and a minimum operational history of 24 months.",
                    source: "Small Business Resilience Act 2025, Section 4(b)",
                    link: "https://www.msme.gov.in/"
                },
                counterfactuals
            };
        }
    },
    housing_loan: {
        title: "First-Time Homebuyer Loan (FTH-LV)",
        description: "Review of pre-qualification data for the State First-Time Homebuyer Program.",
        inputs: [
            { id: "creditScore", label: "Recorded CIBIL Score", type: "number", placeholder: "e.g. 750" },
            { id: "income", label: "Recorded Annual Household Income (₹)", type: "number", placeholder: "e.g. 1200000" },
            { id: "debt", label: "Recorded Monthly Debt (₹)", type: "number", placeholder: "e.g. 15000" }
        ],
        evaluate: (data) => {
            const score = parseFloat(data.creditScore);
            const income = parseFloat(data.income);
            const monthlyDebt = parseFloat(data.debt);
            const monthlyIncome = income / 12;
            const dti = (monthlyDebt / monthlyIncome) * 100;

            const MIN_SCORE = 700;
            const MAX_DTI = 40;

            let outcome = "APPROVED";
            let outcomeCheck = "RISK & AFFORDABILITY CRITERIA MET";
            let whySummary = "<strong>Basis of Determination:</strong> The applicant satisfies both the credit risk floor (Score > 700) and the debt-to-income affordability ratio (< 40%).";
            let trace = [];
            let counterfactuals = [];

            const scorePass = score >= MIN_SCORE;
            trace.push({
                label: "Credit Risk Assessment",
                detail: `Minimum Score: 700 | Recorded: ${score}`,
                status: scorePass ? 'pass' : 'fail'
            });

            const dtiPass = dti <= MAX_DTI;
            trace.push({
                label: "DTI Affordability Ratio",
                detail: `Max Limit: 40% | Calculated: ${dti.toFixed(1)}%`,
                status: dtiPass ? 'pass' : 'fail'
            });

            if (!scorePass) {
                outcome = "REJECTED";
                outcomeCheck = "CREDIT RISK THRESHOLD FAILURE";
                whySummary = `<strong>Basis of Determination:</strong> The recorded credit score of ${score} is below the mandatory risk floor of ${MIN_SCORE} for this product category.`;
                counterfactuals.push(`Applicant credit score improves to ${MIN_SCORE} or higher.`);
                counterfactuals.push("Application resubmitted with a compliant co-borrower.");
                trace.push({ label: "Final Determination", detail: "Risk criteria failure -> Application rejected.", status: 'final-fail' });
            } else if (!dtiPass) {
                outcome = "REJECTED";
                outcomeCheck = "AFFORDABILITY RATIO FAILURE (DTI)";
                whySummary = `<strong>Basis of Determination:</strong> Existing debt obligations consume ${dti.toFixed(1)}% of monthly income, violating the ${MAX_DTI}% prudential lending limit.`;
                counterfactuals.push(`Reduction of monthly debt obligations by approx. ₹${(monthlyDebt - (monthlyIncome * (MAX_DTI / 100))).toFixed(0)}.`);
                counterfactuals.push("Increase in verifiable household income.");
                trace.push({ label: "Final Determination", detail: "Affordability criteria failure -> Application rejected.", status: 'final-fail' });
            } else {
                trace.push({ label: "Final Determination", detail: "All lending criteria satisfied -> Application approved.", status: 'final-pass' });
            }

            return {
                outcome,
                outcomeCheck,
                whySummary,
                trace,
                factors: [
                    { label: "Min Credit Score", value: `${MIN_SCORE}` },
                    { label: "Max DTI Ratio", value: `${MAX_DTI}%` }
                ],
                legal: {
                    text: "Lenders must ensure the borrower satisfies the minimum creditworthiness criteria and debt service coverage ratios not exceeding 40%.",
                    source: "RBI Master Direction - Housing Finance (2024), Section 12.1",
                    link: "https://www.rbi.org.in/"
                },
                counterfactuals
            };
        },
    },
    // ... (Compact placeholders for brevity if needed, but implementing logic for previous types)
    student_loan: {
        title: "Student Education Loan (ELS-GX)",
        description: "Review of eligibility for government-subsidized higher education loans.",
        inputs: [
            { id: "admission", label: "Recorded Admission Status", type: "select", options: ["Yes", "No"] },
            { id: "fees", label: "Recorded Course Fees (₹)", type: "number", placeholder: "e.g. 500000" },
            { id: "parentIncome", label: "Recorded Parental Income (₹)", type: "number", placeholder: "e.g. 600000" }
        ],
        evaluate: (data) => {
            const admission = data.admission;
            const fees = parseFloat(data.fees);
            const MAX_NO_COLLATERAL = 750000;

            let outcome = "APPROVED";
            let outcomeCheck = "LOAN SANCTIONED (COLLATERAL-FREE)";
            let whySummary = "<strong>Basis of Determination:</strong> Application meets admission proof requirements and falls within the collateral-free guarantee limit.";
            let trace = [];
            let counterfactuals = [];

            const admissionPass = admission === "Yes";
            trace.push({
                label: "Admission Verification",
                detail: `Required: Confirmed | Recorded: ${admission}`,
                status: admissionPass ? 'pass' : 'fail'
            });

            const collateralCheck = fees <= MAX_NO_COLLATERAL;
            trace.push({
                label: "Collateral Limit Check",
                detail: `Limit: ₹7.5 Lakhs | Requested: ₹${fees.toLocaleString()}`,
                status: collateralCheck ? 'pass' : 'neutral'
            });

            if (!admissionPass) {
                outcome = "REJECTED";
                outcomeCheck = "MISSING ADMISSION PROOF";
                whySummary = "<strong>Basis of Determination:</strong> The record lacks verifiable proof of admission to a recognized institution, a statutory prerequisite.";
                trace.push({ label: "Final Determination", detail: "Prerequisite missing -> Application rejected.", status: 'final-fail' });
                counterfactuals.push("Submission of valid Offer Letter or Student ID.");
            } else if (!collateralCheck) {
                outcome = "UNDER REVIEW";
                outcomeCheck = "COLLATERAL REQUIREMENT TRIGGERED";
                whySummary = `<strong>Basis of Determination:</strong> The requested loan amount (₹${fees.toLocaleString()}) exceeds the collateral-free limit (₹7.5L), triggering security requirements.`;
                trace.push({ label: "Final Determination", detail: "Limit exceeded -> Referred for security verification.", status: 'final-neutral' });
                counterfactuals.push("Provision of tangible security or third-party guarantee.");
            } else {
                trace.push({ label: "Final Determination", detail: "All conditions met -> Application approved.", status: 'final-pass' });
            }

            return {
                outcome,
                outcomeCheck,
                whySummary,
                trace,
                factors: [
                    { label: "Collateral Limit", value: `₹7.5 Lakhs` },
                    { label: "Subsidy Limit", value: "₹4.5 Lakhs Income" }
                ],
                legal: {
                    text: "No loan shall be disbursed without valid proof of admission. Loans up to ₹7.5 Lakhs are eligible for guarantee cover without collateral.",
                    source: "Model Educational Loan Scheme (IBA), Clause 4.1",
                    link: "https://www.vidyalakshmi.co.in/"
                },
                counterfactuals
            };
        }
    },
    scholarship: {
        title: "Merit-Cum-Means Scholarship (MCM-SCH)",
        description: "Review of financial aid application (Merit-Cum-Means Category).",
        inputs: [
            { id: "percentage", label: "Recorded Percentage (%)", type: "number", placeholder: "e.g. 85", min: 0, max: 100 },
            { id: "income", label: "Recorded Family Income (₹)", type: "number", placeholder: "e.g. 250000" }
        ],
        evaluate: (data) => {
            const percentage = parseFloat(data.percentage);
            const income = parseFloat(data.income);
            const MIN_PERCENTAGE = 80;
            const MAX_INCOME = 800000;

            let outcome = "APPROVED";
            let outcomeCheck = "MERIT & MEANS CONDITIONS SATISFIED";
            let whySummary = "<strong>Basis of Determination:</strong> Applicant record meets strict academic percentile (>80%) and financial need (<₹8L) criteria.";
            let trace = [];
            let counterfactuals = [];

            const meritPass = percentage >= MIN_PERCENTAGE;
            trace.push({
                label: "Academic Merit Assessment",
                detail: `Minimum: 80% | Recorded: ${percentage}%`,
                status: meritPass ? 'pass' : 'fail'
            });

            const incomePass = income < MAX_INCOME;
            trace.push({
                label: "Financial Means Test",
                detail: `Income Cap: ₹8,00,000 | Recorded: ₹${income.toLocaleString()}`,
                status: incomePass ? 'pass' : 'fail'
            });

            if (!meritPass) {
                outcome = "REJECTED";
                outcomeCheck = "ACADEMIC MERIT FAILURE";
                whySummary = `<strong>Basis of Determination:</strong> The recorded academic score of ${percentage}% falls below the 80% cutoff required for merit consideration.`;
                counterfactuals.push("Applicant secures >80% in subsequent academic term.");
                trace.push({ label: "Final Determination", detail: "Merit criteria failure -> Application rejected.", status: 'final-fail' });
            } else if (!incomePass) {
                outcome = "REJECTED";
                outcomeCheck = "MEANS TEST FAILURE (INCOME)";
                whySummary = `<strong>Basis of Determination:</strong> Recorded family income (₹${income.toLocaleString()}) exceeds the statutory EWS cap of ₹${MAX_INCOME.toLocaleString()}.`;
                counterfactuals.push("Application under non-means-tested merit categories.");
                trace.push({ label: "Final Determination", detail: "Means criteria failure -> Application rejected.", status: 'final-fail' });
            } else {
                trace.push({ label: "Final Determination", detail: "All conditions met -> Application approved.", status: 'final-pass' });
            }

            return {
                outcome,
                outcomeCheck,
                whySummary,
                trace,
                factors: [
                    { label: "Req. Percentage", value: `${MIN_PERCENTAGE}%` },
                    { label: "Income Limit", value: `₹${MAX_INCOME.toLocaleString()}` }
                ],
                legal: {
                    text: "Awards are granted to students demonstrating academic excellence (top 20th percentile) and financial need (income < ₹8L).",
                    source: "State Scholarship Regulations 2024, Section 8",
                    link: "https://scholarships.gov.in/"
                },
                counterfactuals
            };
        }
    }
};

// --- DOM References ---

const scenarioSelect = document.getElementById('scenarioSelect');
const dynamicInputsContainer = document.getElementById('dynamicInputs');
const evaluateBtn = document.getElementById('evaluateBtn');
const decisionForm = document.getElementById('decisionForm');

const resultCard = document.getElementById('resultCard');
const emptyState = document.getElementById('emptyState');
const decisionBadge = document.getElementById('decisionBadge');
const timestamp = document.getElementById('timestamp');
const refIdDisplay = document.getElementById('refId');

const decisionTitle = document.getElementById('decisionTitle');
const whySummary = document.getElementById('whySummary');
const decisionTrace = document.getElementById('decisionTrace');

const factor1Label = document.getElementById('factor1Label');
const factor1Value = document.getElementById('factor1Value');
const factor2Label = document.getElementById('factor2Label');
const factor2Value = document.getElementById('factor2Value');

const legalText = document.getElementById('legalText');
const resourceLink = document.getElementById('resourceLink');
const guidanceList = document.getElementById('guidanceList');

// --- Listeners ---

scenarioSelect.addEventListener('change', (e) => {
    const scenarioKey = e.target.value;
    renderInputs(scenarioKey);
    evaluateBtn.disabled = false;
    resultCard.classList.add('hidden');
    emptyState.classList.remove('hidden');
});

decisionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const scenarioKey = scenarioSelect.value;
    if (!scenarioKey) return;

    const formData = new FormData(decisionForm);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    const result = SCENARIOS[scenarioKey].evaluate(data);
    renderResult(result);
});

// --- Core Functions ---

function renderInputs(scenarioKey) {
    const scenario = SCENARIOS[scenarioKey];
    dynamicInputsContainer.innerHTML = '';

    scenario.inputs.forEach((field, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group input-fade-in';
        wrapper.style.animationDelay = `${index * 0.05}s`;

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
    emptyState.classList.add('hidden');
    resultCard.classList.remove('hidden');

    // Generate Meta Data
    // Use the exact time provided: 2025-12-15T02:31:04+05:30
    const now = new Date("2025-12-15T02:31:04+05:30");
    timestamp.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + " UTC";
    refIdDisplay.textContent = `REF-${Math.floor(100000 + Math.random() * 900000)}-AUD`;

    // Status Badge
    decisionBadge.textContent = result.outcome;
    // Reset classes
    decisionBadge.className = 'status-badge';
    // Logic for color isn't needed if using the generated specific classes, but let's keep it simple for now or strictly strictly styling in CSS
    // Actually, in the HTML creation step I didn't make specific classes for badges, just one style. Let's add modifier classes if needed.
    // For now, it stays gray/neutral as per "informational not emotional" request, or we can add slight tint.

    // Title
    decisionTitle.textContent = result.outcomeCheck;
    whySummary.innerHTML = result.whySummary;

    // Trace
    decisionTrace.innerHTML = '';
    result.trace.forEach(step => {
        const row = document.createElement('div');
        const isFinal = step.status.startsWith('final');
        let rowStatusClass = '';
        if (step.status.includes('pass')) rowStatusClass = 'row-pass';
        else if (step.status.includes('fail')) rowStatusClass = 'row-fail';
        else rowStatusClass = 'row-neutral';

        row.className = `log-row ${isFinal ? 'final-row' : ''} ${rowStatusClass}`;

        // status class
        let statusClass = 'status-neutral';
        let icon = '○';
        if (step.status.includes('pass')) { statusClass = 'status-pass'; icon = '✓'; }
        if (step.status.includes('fail')) { statusClass = 'status-fail'; icon = '✕'; }

        row.innerHTML = `
            <div class="log-icon">${icon}</div>
            <div class="log-content">
                <h4>${step.label}</h4>
                <div class="log-detail">${step.detail}</div>
            </div>
            <div class="log-status">
                <span class="${statusClass}">${isFinal ? 'CONFIRMED' : (step.status.includes('pass') ? 'COMPLIANT' : 'NON-COMPLIANT')}</span>
            </div>
        `;
        decisionTrace.appendChild(row);
    });

    // Factors
    if (result.factors && result.factors.length >= 2) {
        factor1Label.textContent = result.factors[0].label;
        factor1Value.textContent = result.factors[0].value;
        factor2Label.textContent = result.factors[1].label;
        factor2Value.textContent = result.factors[1].value;
    }

    // Legal
    legalText.textContent = `"${result.legal.text}"`;
    resourceLink.href = result.legal.link;

    // Guidance
    guidanceList.innerHTML = '';
    if (result.outcome === 'APPROVED') {
        const li = document.createElement('li');
        li.textContent = "Current record status meets all standing regulatory requirements. No action required.";
        guidanceList.appendChild(li);
    }
    result.counterfactuals.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        guidanceList.appendChild(li);
    });
}
