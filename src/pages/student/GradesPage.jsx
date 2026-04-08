import { useMemo, useState } from "react";

function GradesPage() {
    const [selectedCourse, setSelectedCourse] = useState("ICS 202 - SEC 03");

    // dummy data (link to server later I think)
    const gradesData = {
        "ICS 202 - SEC 03": [
            {
                id: 8,
                lab: "LinkedList",
                score: 94,
                testsPassed: 5,
                testsTotal: 5,
                grade: "A",
                feedback: "Excellent O(1) insert. Watch edge cases.",
                status: "Graded",
                submittedAt: "2025-04-21 10:45 PM",
            },
            {
                id: 7,
                lab: "Recursion",
                score: 78,
                testsPassed: 4,
                testsTotal: 5,
                grade: "B+",
                feedback: "Good base case. Improve memoization.",
                status: "Graded",
                submittedAt: "2025-04-17 08:10 PM",
            },
            {
                id: 9,
                lab: "Stacks & Queues",
                score: 90,
                testsPassed: 5,
                testsTotal: 5,
                grade: "A",
                feedback: "Clean implementation. Add type hints.",
                status: "Graded",
                submittedAt: "2025-04-25 06:30 PM",
            },
            {
                id: 6,
                lab: "Binary Trees",
                score: null,
                testsPassed: 3,
                testsTotal: 5,
                grade: "—",
                feedback: "Not submitted yet",
                status: "In Progress",
                submittedAt: "—",
            },
        ],
        "COE 301 - SEC 02": [
            {
                id: 4,
                lab: "Logic Gates",
                score: 88,
                testsPassed: 4,
                testsTotal: 5,
                grade: "B+",
                feedback: "Solid work. Improve circuit simplification.",
                status: "Graded",
                submittedAt: "2025-04-11 01:15 PM",
            },
            {
                id: 5,
                lab: "Assembly Basics",
                score: 92,
                testsPassed: 5,
                testsTotal: 5,
                grade: "A",
                feedback: "Very good register usage and clean logic.",
                status: "Graded",
                submittedAt: "2025-04-19 03:00 PM",
            },
            {
                id: 6,
                lab: "Memory Access",
                score: null,
                testsPassed: 0,
                testsTotal: 5,
                grade: "—",
                feedback: "Pending submission",
                status: "Pending",
                submittedAt: "—",
            },
        ],
    };

    const currentGrades = gradesData[selectedCourse];

    const gradedLabs = useMemo(
        () => currentGrades.filter((item) => item.score !== null),
        [currentGrades],
    );

    const avgScore = useMemo(() => {
        if (gradedLabs.length === 0) return 0;
        const total = gradedLabs.reduce((sum, item) => sum + item.score, 0);
        return (total / gradedLabs.length).toFixed(1);
    }, [gradedLabs]);

    const bestScore = useMemo(() => {
        if (gradedLabs.length === 0) return 0;
        return Math.max(...gradedLabs.map((item) => item.score));
    }, [gradedLabs]);

    const labsDone = useMemo(() => {
        return `${gradedLabs.length}/${currentGrades.length}`;
    }, [gradedLabs, currentGrades]);

    const overallGrade = useMemo(() => {
        const avg = Number(avgScore);

        if (avg >= 95) return "A+";
        if (avg >= 90) return "A";
        if (avg >= 85) return "B+";
        if (avg >= 80) return "B";
        if (avg >= 75) return "C+";
        if (avg >= 70) return "C";
        if (avg >= 60) return "D";
        return "F";
    }, [avgScore]);

    const trendHeights = gradedLabs.map((item) => `${Math.max(item.score, 20)}%`);

    const getGradeColor = (grade) => {
        if (grade === "A" || grade === "A+") return "text-green-400";
        if (grade === "B+" || grade === "B") return "text-cyan-400";
        if (grade === "C+" || grade === "C") return "text-yellow-400";
        if (grade === "D" || grade === "F") return "text-red-400";
        return "text-gray-400";
    };

    const getStatusClass = (status) => {
        if (status === "Graded") return "text-green-400";
        if (status === "In Progress") return "text-yellow-400";
        if (status === "Pending") return "text-gray-400";
        return "text-gray-400";
    };

    const handleExportPDF = () => {
        alert("Export PDF is not implemented in this prototype yet.");
    };

    return (
        <div className="min-h-screen bg-[#050b18] text-white">
            <div className="mx-auto max-w-7xl px-6 py-6">
                {/* Header */}
                <div className="mb-6 rounded-xl border border-cyan-500/40 bg-[#0b1424] shadow-lg">
                    <div className="flex flex-col gap-4 border-b border-cyan-500/30 px-6 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-cyan-400">LabTrack</h1>
                            <p className="text-sm text-gray-400">
                                Collaborative Programming Platform
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="rounded-md bg-[#0f1b33] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                {Object.keys(gradesData).map((course) => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={handleExportPDF}
                                className="rounded-md bg-cyan-500 px-4 py-3 text-sm font-semibold hover:bg-cyan-600"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4">
                        <h2 className="text-center text-2xl font-bold text-white">
                            Grades & Feedback
                        </h2>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-[#0b1424] p-6 shadow-lg">
                        <div className="flex flex-col items-center justify-center">
                            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-green-400 text-4xl font-bold text-green-400">
                                {overallGrade}
                            </div>
                            <p className="mt-4 text-center text-lg font-semibold text-gray-400">
                                Overall Grade
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-[#0b1424] p-6 shadow-lg">
                        <h3 className="text-4xl font-bold text-green-400">{avgScore}</h3>
                        <p className="mt-1 text-sm text-gray-400">Avg Score</p>
                    </div>

                    <div className="rounded-xl bg-[#0b1424] p-6 shadow-lg">
                        <h3 className="text-4xl font-bold text-cyan-400">{labsDone}</h3>
                        <p className="mt-1 text-sm text-gray-400">Labs Done</p>
                    </div>

                    <div className="rounded-xl bg-[#0b1424] p-6 shadow-lg">
                        <h3 className="text-4xl font-bold text-green-400">{bestScore}</h3>
                        <p className="mt-1 text-sm text-gray-400">Best Score</p>
                    </div>
                </div>

                {/* Trend Graph */}
                <div className="mb-6 rounded-xl bg-[#0b1424] p-6 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">Performance Trend</h3>
                            <p className="text-sm text-gray-400">
                                Grade progression across completed labs
                            </p>
                        </div>
                    </div>

                    {gradedLabs.length === 0 ? (
                        <p className="text-sm text-gray-400">No grades available yet.</p>
                    ) : (
                        <div className="flex h-64 items-end justify-between gap-4">
                            {gradedLabs.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="flex flex-1 flex-col items-center justify-end"
                                >
                                    <div className="mb-2 text-sm font-semibold text-gray-400">
                                        {item.score}
                                    </div>
                                    <div
                                        className="w-full rounded-t-md bg-cyan-500/80"
                                        style={{ height: trendHeights[index] }}
                                    />
                                    <div className="mt-3 text-center text-xs text-gray-400">
                                        {item.lab}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grades Table */}
                <div className="overflow-hidden rounded-xl bg-[#0b1424] shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-[#0f1b33]">
                            <tr>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-400">
                                    #
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-400">
                                    Lab
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-400">
                                    Score
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-400">
                                    Tests
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-400">
                                    Grade
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-400">
                                    Status
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-400">
                                    Submitted
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-400">
                                    Instructor Feedback
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {currentGrades.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-[#162238] hover:bg-[#0f1b33]/60"
                                >
                                    <td className="px-4 py-4 text-sm font-semibold text-gray-400">
                                        {item.id}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-semibold text-white">
                                        {item.lab}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-300">
                                        {item.score !== null ? `${item.score}/100` : "In Progress"}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-300">
                                        {item.testsPassed}/{item.testsTotal}
                                    </td>
                                    <td
                                        className={`px-4 py-4 text-sm font-bold ${getGradeColor(item.grade)}`}
                                    >
                                        {item.grade}
                                    </td>
                                    <td
                                        className={`px-4 py-4 text-sm font-semibold ${getStatusClass(item.status)}`}
                                    >
                                        {item.status}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-300">
                                        {item.submittedAt}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-400">
                                        "{item.feedback}"
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-4 text-sm text-gray-400">
                    View instructor feedback, track your average, and monitor progress by
                    course.
                </div>
            </div>
        </div>
    );
}

export default GradesPage;