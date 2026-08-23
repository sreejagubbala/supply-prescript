import React from "react";


const roiSummary = {
    totalSavings: 125000,
    totalDecisions: 120,
    averageROI: 18.5,
    successRate: 82
};


const costData = [
    {
        month: "Jan",
        expected: 100000,
        actual: 92000
    },
    {
        month: "Feb",
        expected: 120000,
        actual: 105000
    },
    {
        month: "Mar",
        expected: 110000,
        actual: 97000
    },
    {
        month: "Apr",
        expected: 135000,
        actual: 112000
    },
    {
        month: "May",
        expected: 150000,
        actual: 125000
    }
];


const roiData = [
    {
        month: "Jan",
        roi: 8
    },
    {
        month: "Feb",
        roi: 12
    },
    {
        month: "Mar",
        roi: 15
    },
    {
        month: "Apr",
        roi: 19
    },
    {
        month: "May",
        roi: 24
    }
];


function DecisionROI() {

    return (
        <div className="roi-page">

            {/* Header */}

            <div className="roi-header">

                <div>
                    <h1>Decision ROI</h1>

                    <p>
                        Monitor the financial impact and
                        effectiveness of supply-chain decisions.
                    </p>
                </div>

                <div className="roi-period">
                    Last 5 Months
                </div>

            </div>


            {/* KPI Cards */}

            <div className="roi-kpi-grid">

                <div className="roi-kpi-card">

                    <span>Total Savings</span>

                    <h2>
                        ₹{roiSummary.totalSavings.toLocaleString()}
                    </h2>

                    <p>
                        Savings generated from decisions
                    </p>

                </div>


                <div className="roi-kpi-card">

                    <span>Total Decisions</span>

                    <h2>
                        {roiSummary.totalDecisions}
                    </h2>

                    <p>
                        Decisions evaluated
                    </p>

                </div>


                <div className="roi-kpi-card">

                    <span>Average ROI</span>

                    <h2>
                        {roiSummary.averageROI}%
                    </h2>

                    <p>
                        Average return generated
                    </p>

                </div>


                <div className="roi-kpi-card">

                    <span>Success Rate</span>

                    <h2>
                        {roiSummary.successRate}%
                    </h2>

                    <p>
                        Successful decisions
                    </p>

                </div>

            </div>


            {/* Cost Comparison */}

            <div className="roi-section">

                <div className="roi-section-header">

                    <h2>
                        Expected vs Actual Cost
                    </h2>

                    <p>
                        Comparison of expected and actual
                        operational costs.
                    </p>

                </div>


                <div className="cost-chart">

                    {costData.map((item) => {

                        const expectedWidth =
                            Math.min(
                                item.expected / 1500,
                                100
                            );

                        const actualWidth =
                            Math.min(
                                item.actual / 1500,
                                100
                            );

                        return (
                            <div
                                className="cost-row"
                                key={item.month}
                            >

                                <div className="cost-month">
                                    {item.month}
                                </div>

                                <div className="cost-bars">

                                    <div
                                        className="expected-bar"
                                        style={{
                                            width:
                                                `${expectedWidth}%`
                                        }}
                                    >
                                        <span>
                                            ₹
                                            {(
                                                item.expected /
                                                1000
                                            ).toFixed(0)}
                                            k
                                        </span>
                                    </div>


                                    <div
                                        className="actual-bar"
                                        style={{
                                            width:
                                                `${actualWidth}%`
                                        }}
                                    >
                                        <span>
                                            ₹
                                            {(
                                                item.actual /
                                                1000
                                            ).toFixed(0)}
                                            k
                                        </span>
                                    </div>

                                </div>

                            </div>
                        );

                    })}

                </div>


                <div className="chart-legend">

                    <span>
                        <i className="legend expected"></i>
                        Expected Cost
                    </span>

                    <span>
                        <i className="legend actual"></i>
                        Actual Cost
                    </span>

                </div>

            </div>


            {/* Bottom Section */}

            <div className="roi-two-column">


                {/* ROI Trend */}

                <div className="roi-section">

                    <div className="roi-section-header">

                        <h2>
                            ROI Trend
                        </h2>

                        <p>
                            ROI performance over time.
                        </p>

                    </div>


                    <div className="roi-trend">

                        {roiData.map((item) => {

                            return (
                                <div
                                    className="roi-point"
                                    key={item.month}
                                >

                                    <div
                                        className="roi-column"
                                        style={{
                                            height:
                                                `${item.roi * 8}px`
                                        }}
                                    >
                                        <span>
                                            {item.roi}%
                                        </span>
                                    </div>

                                    <label>
                                        {item.month}
                                    </label>

                                </div>
                            );

                        })}

                    </div>

                </div>


                {/* Decision Success */}

                <div className="roi-section">

                    <div className="roi-section-header">

                        <h2>
                            Decision Success
                        </h2>

                        <p>
                            Overall decision performance.
                        </p>

                    </div>


                    <div className="success-container">

                        <div
                            className="success-circle"
                            style={{
                                background:
                                    `conic-gradient(
                                        #2563eb
                                        ${roiSummary.successRate}%,
                                        #e5e7eb
                                        ${roiSummary.successRate}%
                                    )`
                            }}
                        >

                            <div className="success-inner">

                                <strong>
                                    {roiSummary.successRate}%
                                </strong>

                                <span>
                                    Success
                                </span>

                            </div>

                        </div>


                        <div className="success-details">

                            <div>
                                <strong>
                                    {Math.round(
                                        roiSummary.totalDecisions *
                                        roiSummary.successRate /
                                        100
                                    )}
                                </strong>

                                <span>
                                    Successful
                                </span>
                            </div>


                            <div>
                                <strong>
                                    {roiSummary.totalDecisions -
                                        Math.round(
                                            roiSummary.totalDecisions *
                                            roiSummary.successRate /
                                            100
                                        )}
                                </strong>

                                <span>
                                    Unsuccessful
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default DecisionROI;