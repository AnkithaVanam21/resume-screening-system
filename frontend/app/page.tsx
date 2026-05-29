"use client";

import { useState } from "react";
import axios from "axios";

type Candidate = {
  name: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
};

export default function Home() {
  const [jd, setJd] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!files) {
      alert("Please upload at least one resume");
      return;
    }

    if (!jd.trim() && !jdFile) {
      alert("Please enter or upload a Job Description");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    if (jd.trim()) formData.append("jd", jd);
    if (jdFile) formData.append("jd_file", jdFile);

    for (let i = 0; i < files.length; i++) {
      formData.append("resumes", files[i]);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/analyze",
        formData
      );

      setResults(response.data);
    } catch (error) {
      console.error(error);
      alert("Error analyzing resumes");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Score",
      "Matched Skills",
      "Missing Skills",
    ];

    const rows = results.map((candidate) => [
      candidate.name,
      candidate.score,
      candidate.matched_skills.join(", "),
      candidate.missing_skills.join(", "),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "candidate_results.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter((candidate) =>
    candidate.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 text-black">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-8 shadow-xl mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center">
          Resume Screening System
        </h1>

        <p className="text-center mt-3 text-lg opacity-90">
          AI-Powered Candidate Ranking Platform
        </p>
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-gray-500">Total Resumes</h3>
            <p className="text-3xl font-bold">
              {results.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-gray-500">Top Score</h3>
            <p className="text-3xl font-bold text-green-600">
              {Math.max(...results.map(r => r.score))}%
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-gray-500">Candidates</h3>
            <p className="text-3xl font-bold">
              {results.length}
            </p>
          </div>

        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">

        <div className="flex justify-between items-center flex-wrap gap-4 mb-3">

          <h2 className="font-bold text-xl">
            Job Description
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">
              OR Upload JD
            </span>

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) =>
                setJdFile(
                  e.target.files ? e.target.files[0] : null
                )
              }
            />
          </div>

        </div>

        <textarea
          placeholder="Paste Job Description here..."
          rows={6}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          className="w-full border border-gray-300 rounded-2xl p-4 mb-6"
        />

        <div className="mb-6">
          <p className="font-bold text-lg mb-2">
            Upload Resume(s)
          </p>

          <input
            type="file"
            multiple
            accept=".pdf,.docx"
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>

        <div className="flex gap-4 flex-wrap">

          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Analyze Resumes
          </button>

          <button
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Export CSV
          </button>

        </div>

        {loading && (
          <div className="mt-5 text-blue-600 font-semibold">
            Analyzing resumes...
          </div>
        )}

      </div>

      {results.length > 0 && (
  <input
    type="text"
    placeholder="🔍 Search candidate name..."
    className="w-full p-4 rounded-2xl border bg-white shadow-md mb-8"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
)}

      {/* Results */}
      {filteredResults.map((candidate, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-6 hover:shadow-2xl transition"
        >

          <h2 className="text-3xl font-bold text-yellow-600 mb-4">
            🏆 Rank #{index + 1}
          </h2>

          <p className="text-xl font-semibold mb-2">
            {candidate.name}
          </p>

          <p className="text-2xl font-bold text-green-600 mb-4">
            Match Score: {candidate.score}%
          </p>

          <div className="mb-4">
            <strong>Matched Skills</strong>

            <div className="flex flex-wrap gap-2 mt-2">
              {candidate.matched_skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <strong>Missing Skills</strong>

            <div className="flex flex-wrap gap-2 mt-2">
              {candidate.missing_skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                >
                  ✗ {skill}
                </span>
              ))}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}