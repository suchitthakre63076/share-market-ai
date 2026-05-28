// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Animate hamburger icon
    const spans = mobileMenuBtn.querySelectorAll('span');
    if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Smooth scrolling for anchor links (fallback for browsers that don't support scroll-behavior: smooth)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Simple entrance animations for product cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Learning Hub - Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active panel
        tabPanels.forEach(panel => {
            if (panel.id === targetTab) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Reset any expanded cards in other panels to keep it clean
        document.querySelectorAll('.concept-card.expanded').forEach(card => {
            if (!card.closest('.tab-panel.active')) {
                card.classList.remove('expanded');
                const content = card.querySelector('.card-content');
                if (content) content.style.maxHeight = null;
            }
        });
    });
});

// Learning Hub - Card Expand/Collapse
const conceptCards = document.querySelectorAll('.concept-card');

conceptCards.forEach(card => {
    const header = card.querySelector('.card-header');
    const content = card.querySelector('.card-content');
    
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const isExpanded = card.classList.contains('expanded');
        
        if (isExpanded) {
            card.classList.remove('expanded');
            content.style.maxHeight = null;
        } else {
            card.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});

// ==========================================
// Corporate Action Calculator Integration
// ==========================================

let activeCalcTab = 'dividend';

const calcTabButtons = document.querySelectorAll('.calc-tab-btn');
const calcPanels = document.querySelectorAll('.calc-panel');

function switchCalcTab(tab) {
    activeCalcTab = tab;
    
    // Toggle Active tab button
    calcTabButtons.forEach(btn => {
        if (btn.getAttribute('data-calc-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Toggle Active panel
    calcPanels.forEach(panel => {
        if (panel.id === `calc-${tab}-panel`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // Run active calculations
    triggerCalculation();
}

calcTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-calc-tab');
        switchCalcTab(tab);
    });
});

// Format currency
function fmtRupees(amt) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amt);
}

// Trigger active calculations based on selected tab
function triggerCalculation() {
    if (activeCalcTab === 'dividend') {
        runCalcDividend();
    } else if (activeCalcTab === 'bonus') {
        runCalcBonus();
    } else if (activeCalcTab === 'split') {
        runCalcSplit();
    }
}

// Dividend Calculation
function runCalcDividend() {
    const shares = parseFloat(document.getElementById('c-div-shares').value) || 0;
    const price = parseFloat(document.getElementById('c-div-price').value) || 0.1;
    const divType = document.getElementById('c-div-type').value;
    const divVal = parseFloat(document.getElementById('c-div-val').value) || 0;
    const fvGroup = document.getElementById('c-div-fv-group');

    let divPerShare = divVal;
    if (divType === 'percentage') {
        if(fvGroup) fvGroup.style.display = 'block';
        const fv = parseFloat(document.getElementById('c-div-fv').value) || 10;
        divPerShare = fv * (divVal / 100);
        const label = document.getElementById('c-div-val-label');
        const prefix = document.getElementById('c-div-val-prefix');
        if(label) label.innerText = 'Dividend Declared (%)';
        if(prefix) prefix.innerText = '%';
    } else {
        if(fvGroup) fvGroup.style.display = 'none';
        const label = document.getElementById('c-div-val-label');
        const prefix = document.getElementById('c-div-val-prefix');
        if(label) label.innerText = 'Dividend Per Share (₹)';
        if(prefix) prefix.innerText = '₹';
    }

    const totalPayout = shares * divPerShare;
    const divYield = (divPerShare / price) * 100;
    const totalVal = shares * price;

    // Inject metrics
    const grid = document.getElementById('c-results-metric-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(divPerShare)}</div>
                <div class="calc-result-label">Dividend Per Share</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value" style="color: var(--success);">${fmtRupees(totalPayout)}</div>
                <div class="calc-result-label">Total Cash Payout</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${divYield.toFixed(2)}%</div>
                <div class="calc-result-label">Dividend Yield</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(totalVal)}</div>
                <div class="calc-result-label">Total Portfolio Value</div>
            </div>
        `;
    }

    // Inject explanations
    const expEn = document.getElementById('c-explanation-en');
    const expHi = document.getElementById('c-explanation-hi');
    if (expEn) {
        expEn.innerHTML = `
            You will receive a total cash dividend of <strong>${fmtRupees(totalPayout)}</strong> for your <strong>${shares} shares</strong>, paid at <strong>${fmtRupees(divPerShare)} per share</strong>. This cash will be credited directly to your bank account. Your Dividend Yield stands at <strong>${divYield.toFixed(2)}%</strong> relative to the current market price of ${fmtRupees(price)}.
        `;
    }
    if (expHi) {
        expHi.innerHTML = `
            Aapko aapke <strong>${shares} shares</strong> par total <strong>${fmtRupees(totalPayout)}</strong> ka cash dividend milega, jo ki <strong>${fmtRupees(divPerShare)} per share</strong> ke hisab se hai. Ye paisa seedhe aapke bank account me transfer kiya jayega. Aapka Dividend Yield <strong>${divYield.toFixed(2)}%</strong> hai, yaani aapke stock investment par itna extra cash return mila hai!
        `;
    }
}

// Bonus Calculation
function runCalcBonus() {
    const shares = parseFloat(document.getElementById('c-bonus-shares').value) || 0;
    const price = parseFloat(document.getElementById('c-bonus-price').value) || 0.1;
    const ratioA = parseFloat(document.getElementById('c-bonus-ratio-a').value) || 1;
    const ratioB = parseFloat(document.getElementById('c-bonus-ratio-b').value) || 1;

    const newShares = Math.floor(shares / ratioB) * ratioA;
    const totalShares = shares + newShares;
    
    const exPrice = (price * ratioB) / (ratioA + ratioB);
    const totalValBefore = shares * price;

    const grid = document.getElementById('c-results-metric-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="calc-result-box">
                <div class="calc-result-value" style="color: var(--success);">${newShares}</div>
                <div class="calc-result-label">Bonus Shares Received</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${totalShares}</div>
                <div class="calc-result-label">New Total Shares</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(exPrice)}</div>
                <div class="calc-result-label">Ex-Bonus Share Price</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(totalValBefore)}</div>
                <div class="calc-result-label">Total Portfolio Value</div>
            </div>
        `;
    }

    const expEn = document.getElementById('c-explanation-en');
    const expHi = document.getElementById('c-explanation-hi');
    if (expEn) {
        expEn.innerHTML = `
            With a bonus ratio of <strong>${ratioA}:${ratioB}</strong>, you will receive <strong>${newShares} free shares</strong> for your existing <strong>${shares} shares</strong>. Your total share quantity will increase to <strong>${totalShares} shares</strong>. The share price will adjust from <strong>${fmtRupees(price)}</strong> to <strong>${fmtRupees(exPrice)} per share</strong>. Your total portfolio value remains identical at <strong>${fmtRupees(totalValBefore)}</strong>.
        `;
    }
    if (expHi) {
        expHi.innerHTML = `
            <strong>${ratioA}:${ratioB}</strong> Bonus Ratio ke mutabik, aapko aapke <strong>${shares} shares</strong> par bilkul free me <strong>${newShares} naye shares</strong> milenge. Isse aapki total quantity badh kar <strong>${totalShares} shares</strong> ho jayegi. Price ratio ke hisab se adjust ho kar <strong>${fmtRupees(price)}</strong> se kam ho kar <strong>${fmtRupees(exPrice)} per share</strong> ho jayega. **Aapki total investment value (${fmtRupees(totalValBefore)}) bilkul same rahegi!**
        `;
    }
}

// Split Calculation
function runCalcSplit() {
    const shares = parseFloat(document.getElementById('c-split-shares').value) || 0;
    const price = parseFloat(document.getElementById('c-split-price').value) || 0.1;
    const oldFV = parseFloat(document.getElementById('c-split-old-fv').value) || 10;
    const newFV = parseFloat(document.getElementById('c-split-new-fv').value) || 1;

    const splitFactor = oldFV / newFV;
    
    if (newFV >= oldFV) {
        const grid = document.getElementById('c-results-metric-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="calc-result-box" style="grid-column: span 2; border-color: red;">
                    <div class="calc-result-value" style="color: red; font-size: 1.1rem;">⚠️ Invalid Face Value Split</div>
                    <div class="calc-result-label">New FV must be lower than Old FV!</div>
                </div>
            `;
        }
        const expEn = document.getElementById('c-explanation-en');
        const expHi = document.getElementById('c-explanation-hi');
        if (expEn) expEn.innerText = 'Please select a New Face Value that is smaller than the Old Face Value to calculate stock split details.';
        if (expHi) expHi.innerText = 'Kripya New Face Value ko Old Face Value se chota chunein taaki stock split ka calculation ho sake.';
        return;
    }

    const totalShares = shares * splitFactor;
    const exPrice = price / splitFactor;
    const totalValBefore = shares * price;

    const grid = document.getElementById('c-results-metric-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="calc-result-box">
                <div class="calc-result-value" style="color: var(--success);">${splitFactor}x</div>
                <div class="calc-result-label">Split Multiplier</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${totalShares}</div>
                <div class="calc-result-label">New Total Shares</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(exPrice)}</div>
                <div class="calc-result-label">Ex-Split Share Price</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(totalValBefore)}</div>
                <div class="calc-result-label">Total Portfolio Value</div>
            </div>
        `;
    }

    const expEn = document.getElementById('c-explanation-en');
    const expHi = document.getElementById('c-explanation-hi');
    if (expEn) {
        expEn.innerHTML = `
            The stock split reduces Face Value from <strong>₹${oldFV}</strong> to <strong>₹${newFV}</strong> (split factor of <strong>${splitFactor}:1</strong>). Your <strong>${shares} shares</strong> will multiply to <strong>${totalShares} shares</strong>. The share price adjusts down from <strong>${fmtRupees(price)}</strong> to <strong>${fmtRupees(exPrice)} per share</strong>. Total investment value remains identical at <strong>${fmtRupees(totalValBefore)}</strong>.
        `;
    }
    if (expHi) {
        expHi.innerHTML = `
            Face Value <strong>₹${oldFV}</strong> se ghat kar <strong>₹${newFV}</strong> ho rahi hai, yaani split factor <strong>${splitFactor}:1</strong> hai. Aapke <strong>${shares} shares</strong> badh kar <strong>${totalShares} shares</strong> ho jayenge. Market price adjust ho kar <strong>${fmtRupees(price)}</strong> se ghat kar <strong>${fmtRupees(exPrice)} per share</strong> ho jayega. **Aapki total investment value (${fmtRupees(totalValBefore)}) par koi asar nahi padega!**
        `;
    }
}

// Bind calculator inputs
const bindCalcInputs = () => {
    // Dividend bindings
    const divInputs = ['c-div-shares', 'c-div-price', 'c-div-type', 'c-div-val', 'c-div-fv'];
    divInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', runCalcDividend);
    });

    // Bonus bindings
    const bonusInputs = ['c-bonus-shares', 'c-bonus-price', 'c-bonus-ratio-a', 'c-bonus-ratio-b'];
    bonusInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', runCalcBonus);
    });

    // Split bindings
    const splitInputs = ['c-split-shares', 'c-split-price', 'c-split-old-fv', 'c-split-new-fv'];
    splitInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', runCalcSplit);
    });
};

// Initialize Website features on load
const initAllFeatures = () => {
    bindCalcInputs();
    triggerCalculation();
    initPricingSwitcher();
    initPerformanceDashboard();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllFeatures);
} else {
    initAllFeatures();
}

// ==========================================
// Premium Product Pricing Switcher Logic
// ==========================================
function initPricingSwitcher() {
    const switcherButtons = document.querySelectorAll('.switcher-btn');
    const oldValEl = document.getElementById('p-old-val');
    const newValEl = document.getElementById('p-new-val');
    const durLabelEl = document.getElementById('p-dur-label');
    const discValEl = document.getElementById('p-disc-val');

    if (!switcherButtons.length) return;

    switcherButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            switcherButtons.forEach(b => b.classList.remove('active'));
            // Add active to current
            btn.classList.add('active');

            // Read data attributes
            const price = btn.getAttribute('data-price');
            const origPrice = btn.getAttribute('data-orig');
            const discount = btn.getAttribute('data-discount');
            const duration = btn.getAttribute('data-duration');

            // Update UI elements with smooth transitions
            if (oldValEl) oldValEl.innerText = `₹${origPrice}`;
            if (newValEl) newValEl.innerText = `₹${price}`;
            if (durLabelEl) durLabelEl.innerText = `/ ${duration}`;
            if (discValEl) discValEl.innerText = discount;
        });
    });
}

// ==========================================
// Performance Analytics Dashboard Logic
// ==========================================
let tradesData = [];
let filteredTrades = [];
let currentLogPage = 1;
const logsPerPage = 10;
let equityChartInstance = null;

function initPerformanceDashboard() {
    // 1. Dashboard Tab Switches
    const perfTabBtns = document.querySelectorAll('[data-perf-tab]');
    const perfPanels = document.querySelectorAll('.perf-panel');

    perfTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-perf-tab');

            // Toggle active tab button class
            perfTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle active panel visibility
            perfPanels.forEach(panel => {
                if (panel.id === `perf-${targetTab}-panel`) {
                    panel.style.display = 'block';
                } else {
                    panel.style.display = 'none';
                }
            });

            // If switching to chart, trigger resize to ensure proper scaling
            if (targetTab === 'chart' && equityChartInstance) {
                equityChartInstance.resize();
            }
        });
    });

    // 2. Render Monthly Summary Table
    renderMonthlySummaryTable();

    // 3. Trade Logs Integration (Search, Filter, Pagination)
    tradesData = BACKTEST_DATA['All Trades'] || [];
    filteredTrades = [...tradesData];

    const searchInput = document.getElementById('log-search');
    const instrumentSelect = document.getElementById('log-filter-instrument');
    const resultSelect = document.getElementById('log-filter-result');
    const clearFiltersBtn = document.getElementById('clear-log-filters');

    if (searchInput) searchInput.addEventListener('input', handleFilterChange);
    if (instrumentSelect) instrumentSelect.addEventListener('change', handleFilterChange);
    if (resultSelect) resultSelect.addEventListener('change', handleFilterChange);
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (instrumentSelect) instrumentSelect.value = 'ALL';
            if (resultSelect) resultSelect.value = 'ALL';
            handleFilterChange();
        });
    }

    // Trigger initial logs render
    handleFilterChange();

    // 4. Create Cumulative Net Profit Chart
    createEquityCurveChart();
}

// Format currency locally matching existing structure
function fmtLocalRupees(amt) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amt);
}

// Render Month-on-Month Summary Table
function renderMonthlySummaryTable() {
    const tbody = document.getElementById('monthly-summary-table-body');
    if (!tbody) return;

    const data = BACKTEST_DATA['Monthly Summary'] || [];
    tbody.innerHTML = '';

    data.forEach(row => {
        const netPL = parseFloat(row.Net_Profit_Loss || 0);
        const points = parseFloat(row.Points || 0);
        const winRate = parseFloat(row['Win Rate %'] || 0);
        const plClass = netPL >= 0 ? 'style="color: #10B981; font-weight: 700;"' : 'style="color: #B91C1C; font-weight: 700;"';
        
        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 12px 16px; font-weight: 600;">${row.Instrument}</td>
                <td style="padding: 12px 16px;">${row.Month}</td>
                <td style="padding: 12px 16px; text-align: center;">${row.Trades}</td>
                <td style="padding: 12px 16px; text-align: center;">${row.Wins}</td>
                <td style="padding: 12px 16px; text-align: center;">${row.Losses}</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 600; font-family: monospace;">${points >= 0 ? '+' : ''}${points.toFixed(2)}</td>
                <td style="padding: 12px 16px; text-align: right; font-family: monospace;" ${plClass}>${netPL >= 0 ? '+' : ''}${fmtLocalRupees(netPL)}</td>
                <td style="padding: 12px 16px; text-align: center;">
                    <span class="badge-${winRate >= 50 ? 'win' : 'loss'}">${winRate.toFixed(1)}%</span>
                </td>
            </tr>
        `;
    });
}

// Filters Handler
function handleFilterChange() {
    const searchVal = document.getElementById('log-search') ? document.getElementById('log-search').value.toLowerCase().trim() : '';
    const instrumentVal = document.getElementById('log-filter-instrument') ? document.getElementById('log-filter-instrument').value : 'ALL';
    const resultVal = document.getElementById('log-filter-result') ? document.getElementById('log-filter-result').value : 'ALL';

    filteredTrades = tradesData.filter(trade => {
        // Search filter: Date, Side, Result or Exit Reason
        const dateMatch = String(trade.Date || '').toLowerCase().includes(searchVal);
        const sideMatch = String(trade.Side || '').toLowerCase().includes(searchVal);
        const reasonMatch = String(trade.Exit_Reason || trade['Exit Reason'] || '').toLowerCase().includes(searchVal);
        const matchesSearch = !searchVal || dateMatch || sideMatch || reasonMatch;

        // Instrument filter
        const matchesInstrument = instrumentVal === 'ALL' || trade.Instrument === instrumentVal;

        // Result filter
        const matchesResult = resultVal === 'ALL' || String(trade.Result || '').toUpperCase() === resultVal;

        return matchesSearch && matchesInstrument && matchesResult;
    });

    currentLogPage = 1;
    renderTradeLogsTable();
}

// Render Trade Logs Table with Pagination
function renderTradeLogsTable() {
    const tbody = document.getElementById('trade-logs-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    const start = (currentLogPage - 1) * logsPerPage;
    const end = Math.min(start + logsPerPage, filteredTrades.length);
    const pageData = filteredTrades.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--light-text); font-weight: 500;">
                    No verified trades matched your filter criteria.
                </td>
            </tr>
        `;
        updateLogsPagination(0);
        return;
    }

    pageData.forEach(trade => {
        const side = String(trade.Side || '').toUpperCase();
        const result = String(trade.Result || '').toUpperCase();
        const netPL = parseFloat(trade.Net_PL || trade['Net P&L'] || 0);
        const points = parseFloat(trade.Points || 0);
        const exitReason = trade.Exit_Reason || trade['Exit Reason'] || '-';
        const plClass = netPL >= 0 ? 'style="color: #10B981; font-weight: 600;"' : 'style="color: #B91C1C; font-weight: 600;"';
        
        const sideBadge = side === 'BUY' ? '<span class="badge-buy">BUY</span>' : '<span class="badge-sell">SELL</span>';
        const resultBadge = result === 'WIN' ? '<span class="badge-win">WIN</span>' : '<span class="badge-loss">LOSS</span>';

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px 14px; font-weight: 600;">${trade.Date}</td>
                <td style="padding: 10px 14px;">${trade.Instrument}</td>
                <td style="padding: 10px 14px; text-align: center;">${sideBadge}</td>
                <td style="padding: 10px 14px; text-align: right; font-family: monospace;">${parseFloat(trade.Entry_Price || trade['Entry Price'] || 0).toFixed(2)}</td>
                <td style="padding: 10px 14px; text-align: right; font-family: monospace;">${parseFloat(trade.Exit_Price || trade['Exit Price'] || 0).toFixed(2)}</td>
                <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-weight: 600;">${points >= 0 ? '+' : ''}${points.toFixed(2)}</td>
                <td style="padding: 10px 14px; text-align: right; font-family: monospace;" ${plClass}>${netPL >= 0 ? '+' : ''}${fmtLocalRupees(netPL)}</td>
                <td style="padding: 10px 14px; text-align: center; font-size: 0.8rem; color: var(--light-text);">${exitReason}</td>
                <td style="padding: 10px 14px; text-align: center;">${resultBadge}</td>
            </tr>
        `;
    });

    updateLogsPagination(filteredTrades.length);
}

// Generate pagination controls
function updateLogsPagination(totalItems) {
    const infoSpan = document.getElementById('log-pagination-info');
    const buttonsDiv = document.getElementById('log-pagination-buttons');
    if (!infoSpan || !buttonsDiv) return;

    if (totalItems === 0) {
        infoSpan.innerText = 'Showing 0 of 0 trades';
        buttonsDiv.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(totalItems / logsPerPage);
    const startItem = (currentLogPage - 1) * logsPerPage + 1;
    const endItem = Math.min(startItem + logsPerPage - 1, totalItems);

    infoSpan.innerText = `Showing ${startItem}-${endItem} of ${totalItems} trades`;
    buttonsDiv.innerHTML = '';

    // 1. Previous page button
    const prevBtn = document.createElement('button');
    prevBtn.className = `pagination-btn ${currentLogPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '‹';
    prevBtn.disabled = currentLogPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentLogPage > 1) {
            currentLogPage--;
            renderTradeLogsTable();
        }
    });
    buttonsDiv.appendChild(prevBtn);

    // 2. Centered Page buttons
    let startPage = Math.max(1, currentLogPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i < 1) continue;
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${currentLogPage === i ? 'active' : ''}`;
        pageBtn.innerText = i;
        pageBtn.addEventListener('click', () => {
            currentLogPage = i;
            renderTradeLogsTable();
        });
        buttonsDiv.appendChild(pageBtn);
    }

    // 3. Next page button
    const nextBtn = document.createElement('button');
    nextBtn.className = `pagination-btn ${currentLogPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '›';
    nextBtn.disabled = currentLogPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentLogPage < totalPages) {
            currentLogPage++;
            renderTradeLogsTable();
        }
    });
    buttonsDiv.appendChild(nextBtn);
}

// Create beautifully shaded Equity Growth Chart
function createEquityCurveChart() {
    const canvas = document.getElementById('equityCurveChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dailyData = BACKTEST_DATA['Daily Total Capital'] || [];
    
    // Sort chronological
    const sortedDaily = [...dailyData].sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const labels = [];
    const points = [];
    let runningSum = 0;

    // Add initial zero point
    if (sortedDaily.length > 0) {
        const firstDate = new Date(sortedDaily[0].Date);
        firstDate.setDate(firstDate.getDate() - 1);
        labels.push(firstDate.toISOString().split('T')[0]);
        points.push(0);
    }

    sortedDaily.forEach(row => {
        runningSum += parseFloat(row.Total_Net_Profit_Loss || 0);
        labels.push(row.Date);
        points.push(runningSum);
    });

    const blueGradient = ctx.createLinearGradient(0, 0, 0, 300);
    blueGradient.addColorStop(0, 'rgba(0, 86, 210, 0.25)');
    blueGradient.addColorStop(1, 'rgba(0, 86, 210, 0.00)');

    equityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Net Profit (1 Lot)',
                data: points,
                borderColor: '#0056D2',
                borderWidth: 2.5,
                backgroundColor: blueGradient,
                fill: true,
                tension: 0.25,
                pointBackgroundColor: '#0056D2',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 1,
                pointRadius: 1,
                pointHoverRadius: 6,
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1E293B',
                    titleColor: '#FFFFFF',
                    bodyColor: '#E2E8F0',
                    borderColor: '#475569',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 4,
                    callbacks: {
                        label: function(context) {
                            let valStr = context.parsed.y >= 0 ? '+' : '';
                            valStr += fmtLocalRupees(context.parsed.y);
                            return ` Net Growth: ${valStr}`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 10
                        },
                        color: '#64748B'
                    }
                },
                y: {
                    grid: {
                        color: '#F1F5F9'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 10
                        },
                        color: '#64748B',
                        callback: function(value) {
                            return (value >= 0 ? '₹' : '-₹') + Math.abs(value);
                        }
                    }
                }
            }
        }
    });
}

