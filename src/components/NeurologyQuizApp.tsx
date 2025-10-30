"use client"

import React, { useState, useEffect } from 'react';
import { Brain, ChevronRight, CheckCircle, XCircle, Award, Plus, Edit2, Trash2, Save, X, Video, Play, BookOpen, Settings, Home, Users, BarChart3 } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const NeurologyQuizApp = () => {
// Convex hooks
const questions = useQuery(api.questions.getAllQuestions) ?? [];
const addQuestion = useMutation(api.questions.addQuestion);
const updateQuestion = useMutation(api.questions.updateQuestion);
const deleteQuestion = useMutation(api.questions.deleteQuestion);

// State
  const [currentPage, setCurrentPage] = useState('landing');
  const [currentSection, setCurrentSection] = useState('diagnosis');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState({ diagnosis: 0, management: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [generatingVideo, setGeneratingVideo] = useState(false);

  // Neuomorphic styling
  const beveledCardStyle = {
    background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
    boxShadow: `
      20px 20px 60px #0a0f1a,
      -20px -20px 60px #1a2332,
      inset 1px 1px 2px rgba(255,255,255,0.1)
    `
  };

  const insetStyle = {
    background: 'linear-gradient(145deg, #0f172a, #1e293b)',
    boxShadow: `
      inset 5px 5px 15px #0a0f1a,
      inset -5px -5px 15px #1a2332
    `
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
    boxShadow: `
      inset 2px 2px 5px rgba(59, 130, 246, 0.4),
      inset -2px -2px 5px rgba(29, 78, 216, 0.4),
      8px 8px 20px #0a0f1a,
      -8px -8px 20px #1a2332
    `,
    border: '1px solid rgba(59, 130, 246, 0.2)'
  };

  const deleteButtonStyle = {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
    boxShadow: `
      inset 2px 2px 5px rgba(239, 68, 68, 0.4),
      inset -2px -2px 5px rgba(185, 28, 28, 0.4),
      8px 8px 20px #0a0f1a,
      -8px -8px 20px #1a2332
    `,
    border: '1px solid rgba(239, 68, 68, 0.2)'
  };

  // Sample questions - will be replaced by Convex data
  const sampleQuestions = [
    {
      id: '1',
      section: 'diagnosis',
      type: 'multiple',
      question: 'A 32-year-old woman presents with severe unilateral throbbing headache, photophobia, and nausea lasting 12 hours. She has a history of similar episodes. According to ICHD-3 criteria, which diagnosis is most likely?',
      options: [
        'Migraine without aura',
        'Tension-type headache',
        'Cluster headache',
        'Medication overuse headache'
      ],
      correctAnswer: 0,
      explanation: 'Migraine without aura is characterized by attacks lasting 4-72 hours with at least two of: unilateral location, pulsating quality, moderate-to-severe intensity, aggravation by routine physical activity. At least one of nausea/vomiting or photophobia and phonophobia must be present.'
    },
    {
      id: '2',
      section: 'diagnosis',
      type: 'trueFalse',
      question: 'Cluster headaches are more common in women than men.',
      correctAnswer: false,
      explanation: 'False. Cluster headaches have a male predominance with a ratio of approximately 3-4:1 (men:women).'
    },
    {
      id: '3',
      section: 'diagnosis',
      type: 'fillBlank',
      question: 'The classic triad of symptoms in giant cell arteritis includes headache, jaw claudication, and ________ symptoms.',
      correctAnswer: 'visual',
      explanation: 'Giant cell arteritis (temporal arteritis) classically presents with new headache, jaw claudication, and visual symptoms (including diplopia, vision loss). ESR and CRP are typically elevated.'
    },
    {
      id: '4',
      section: 'management',
      type: 'multiple',
      question: 'Which medication is FDA-approved for the acute treatment of migraine and works as a CGRP receptor antagonist?',
      options: [
        'Sumatriptan',
        'Ubrogepant',
        'Topiramate',
        'Propranolol'
      ],
      correctAnswer: 1,
      explanation: 'Ubrogepant (Ubrelvy) is a CGRP receptor antagonist approved for acute migraine treatment. Sumatriptan is a triptan, while topiramate and propranolol are preventive medications.'
    },
    {
      id: '5',
      section: 'management',
      type: 'trueFalse',
      question: 'High-flow oxygen therapy is an effective abortive treatment for cluster headaches.',
      correctAnswer: true,
      explanation: 'True. High-flow oxygen (100% oxygen at 12-15 L/min via non-rebreather mask for 15-20 minutes) is highly effective for aborting cluster headache attacks.'
    },
    {
      id: '6',
      section: 'management',
      type: 'fillBlank',
      question: 'The first-line preventive medication class for migraine prophylaxis includes beta-blockers, with ________ being the most commonly prescribed.',
      correctAnswer: 'propranolol',
      explanation: 'Propranolol is the most commonly used beta-blocker for migraine prevention, typically dosed at 80-240 mg daily. Other options include metoprolol and timolol.'
    }
  ];

  useEffect(() => {
    // In production, this would fetch from Convex
    setQuestions(sampleQuestions);
  }, []);

  const diagnosisQuestions = questions.filter(q => q.section === 'diagnosis');
  const managementQuestions = questions.filter(q => q.section === 'management');

    // Admin Functions
  const handleAddQuestion = () => {
    setEditingQuestion({
      section: 'diagnosis',
      type: 'multiple',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  const handleSaveQuestion = async () => {
    if (editingQuestion._id && questions.find(q => q._id === editingQuestion._id)) {
      // Update existing
      await updateQuestion({
        id: editingQuestion._id,
        section: editingQuestion.section,
        type: editingQuestion.type,
        question: editingQuestion.question,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
      });
    } else {
      // Add new
      await addQuestion({
        section: editingQuestion.section,
        type: editingQuestion.type,
        question: editingQuestion.question,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
      });
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      await deleteQuestion({ id });
    }
  };

  // Quiz Functions
  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    const currentQuestions = currentSection === 'diagnosis' ? diagnosisQuestions : managementQuestions;
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection === 'diagnosis') {
      setCurrentSection('management');
      setCurrentQuestion(0);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let diagScore = 0;
    let mgmtScore = 0;

    diagnosisQuestions.forEach(q => {
      if (q.type === 'trueFalse') {
        if (answers[q.id] === q.correctAnswer) diagScore++;
      } else if (q.type === 'fillBlank') {
        if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) diagScore++;
      } else {
        if (answers[q.id] === q.correctAnswer) diagScore++;
      }
    });

    managementQuestions.forEach(q => {
      if (q.type === 'trueFalse') {
        if (answers[q.id] === q.correctAnswer) mgmtScore++;
      } else if (q.type === 'fillBlank') {
        if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) mgmtScore++;
      } else {
        if (answers[q.id] === q.correctAnswer) mgmtScore++;
      }
    });

    const diagPercentage = diagnosisQuestions.length > 0 ? (diagScore / diagnosisQuestions.length) * 100 : 0;
    const mgmtPercentage = managementQuestions.length > 0 ? (mgmtScore / managementQuestions.length) * 100 : 0;
    
    setScore({ 
      diagnosis: diagPercentage, 
      management: mgmtPercentage,
      total: (diagPercentage * 0.75) + (mgmtPercentage * 0.25)
    });
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentSection('diagnosis');
    setCurrentQuestion(0);
    setAnswers({});
    setScore({ diagnosis: 0, management: 0 });
    setShowResults(false);
    setCurrentPage('quiz');
  };

  // Video Generation (HeyGen Integration)
  const handleGenerateVideo = async () => {
    setGeneratingVideo(true);
    try {
      // This will call your Convex function that integrates with HeyGen
      console.log('Generating video for prompt:', videoPrompt);
      // await generateVideo({ prompt: videoPrompt });
      alert('Video generation started! You will receive a notification when it\'s ready.');
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setGeneratingVideo(false);
      setShowVideoModal(false);
      setVideoPrompt('');
    }
  };

  // Landing Page
  const LandingPage = () => (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-3xl" style={beveledCardStyle}>
              <Brain className="w-20 h-20 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Headache Neurology Quiz</h1>
          <p className="text-xl text-gray-300">Master headache diagnosis and management</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <button
            onClick={() => setCurrentPage('quiz')}
            className="p-8 rounded-3xl transition-all duration-300 hover:scale-105"
            style={beveledCardStyle}
          >
            <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Start Quiz</h2>
            <p className="text-gray-300">Test your knowledge with {questions.length} questions</p>
            <p className="text-sm text-gray-400 mt-2">75% Diagnosis • 25% Management</p>
          </button>

          <button
            onClick={() => setShowVideoModal(true)}
            className="p-8 rounded-3xl transition-all duration-300 hover:scale-105"
            style={beveledCardStyle}
          >
            <Video className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">AI Video Explainer</h2>
            <p className="text-gray-300">Generate custom educational videos</p>
            <p className="text-sm text-gray-400 mt-2">Powered by HeyGen</p>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
            style={buttonStyle}
          >
            <Settings className="inline-block w-5 h-5 mr-2" />
            {isAdmin ? 'User Mode' : 'Admin Mode'}
          </button>
        </div>
      </div>
    </div>
  );

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Settings className="w-10 h-10 text-blue-400" />
            Admin Dashboard
          </h1>
          <button
            onClick={() => setCurrentPage('landing')}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300"
            style={buttonStyle}
          >
            <Home className="inline-block w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl" style={beveledCardStyle}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Questions</p>
                <p className="text-3xl font-bold text-white">{questions.length}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <div className="p-6 rounded-2xl" style={beveledCardStyle}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Diagnosis Questions</p>
                <p className="text-3xl font-bold text-white">{diagnosisQuestions.length}</p>
              </div>
              <Brain className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <div className="p-6 rounded-2xl" style={beveledCardStyle}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Management Questions</p>
                <p className="text-3xl font-bold text-white">{managementQuestions.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
        </div>

        {/* Add Question Button */}
        <div className="mb-6">
          <button
            onClick={handleAddQuestion}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300"
            style={buttonStyle}
          >
            <Plus className="inline-block w-5 h-5 mr-2" />
            Add New Question
          </button>
        </div>

        {/* Question Editor Modal */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl" style={beveledCardStyle}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {questions.find(q => q.id === editingQuestion.id) ? 'Edit Question' : 'Add Question'}
                </h2>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Section */}
                <div>
                  <label className="block text-gray-300 mb-2">Section</label>
                  <select
                    value={editingQuestion.section}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, section: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 text-white border border-slate-700"
                  >
                    <option value="diagnosis">Diagnosis</option>
                    <option value="management">Management</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-gray-300 mb-2">Question Type</label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 text-white border border-slate-700"
                  >
                    <option value="multiple">Multiple Choice</option>
                    <option value="trueFalse">True/False</option>
                    <option value="fillBlank">Fill in the Blank</option>
                  </select>
                </div>

                {/* Question */}
                <div>
                  <label className="block text-gray-300 mb-2">Question</label>
                  <textarea
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 text-white border border-slate-700 h-32"
                    placeholder="Enter your question..."
                  />
                </div>

                {/* Options (for multiple choice) */}
                {editingQuestion.type === 'multiple' && (
                  <div>
                    <label className="block text-gray-300 mb-2">Options</label>
                    {editingQuestion.options?.map((option, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editingQuestion.options];
                            newOptions[index] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          className="flex-1 p-3 rounded-xl bg-slate-900 text-white border border-slate-700"
                          placeholder={`Option ${index + 1}`}
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={editingQuestion.correctAnswer === index}
                          onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: index })}
                          className="w-5 h-5 self-center"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Correct Answer (for other types) */}
                {editingQuestion.type === 'trueFalse' && (
                  <div>
                    <label className="block text-gray-300 mb-2">Correct Answer</label>
                    <select
                      value={editingQuestion.correctAnswer}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value === 'true' })}
                      className="w-full p-3 rounded-xl bg-slate-900 text-white border border-slate-700"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                )}

                {editingQuestion.type === 'fillBlank' && (
                  <div>
                    <label className="block text-gray-300 mb-2">Correct Answer</label>
                    <input
                      type="text"
                      value={editingQuestion.correctAnswer}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-900 text-white border border-slate-700"
                      placeholder="Enter the correct answer..."
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-gray-300 mb-2">Explanation</label>
                  <textarea
                    value={editingQuestion.explanation}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 text-white border border-slate-700 h-24"
                    placeholder="Explain the correct answer..."
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveQuestion}
                  className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-300"
                  style={buttonStyle}
                >
                  <Save className="inline-block w-5 h-5 mr-2" />
                  Save Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">All Questions</h2>
          {questions.map((q) => (
            <div key={q.id} className="p-6 rounded-2xl" style={beveledCardStyle}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                      {q.section}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                      {q.type}
                    </span>
                  </div>
                  <p className="text-white text-lg mb-2">{q.question}</p>
                  {q.type === 'multiple' && (
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      {q.options.map((opt, idx) => (
                        <li key={idx} className={idx === q.correctAnswer ? 'text-green-400 font-semibold' : ''}>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.type === 'trueFalse' && (
                    <p className="text-green-400 font-semibold text-sm">
                      Answer: {q.correctAnswer ? 'True' : 'False'}
                    </p>
                  )}
                  {q.type === 'fillBlank' && (
                    <p className="text-green-400 font-semibold text-sm">
                      Answer: {q.correctAnswer}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingQuestion(q)}
                    className="p-2 rounded-lg text-white transition-all duration-300 hover:scale-110"
                    style={buttonStyle}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-lg text-white transition-all duration-300 hover:scale-110"
                    style={deleteButtonStyle}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Quiz Page
  const QuizPage = () => {
    const currentQuestions = currentSection === 'diagnosis' ? diagnosisQuestions : managementQuestions;
    const question = currentQuestions[currentQuestion];

    if (!question) return null;

    return (
      <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('landing')}
              className="px-4 py-2 rounded-xl text-white font-semibold"
              style={buttonStyle}
            >
              <Home className="inline-block w-5 h-5 mr-2" />
              Home
            </button>
            <div className="text-white">
              <span className="text-lg font-semibold">
                {currentSection === 'diagnosis' ? 'Diagnosis' : 'Management'} Section
              </span>
              <span className="text-gray-400 ml-4">
                Question {currentQuestion + 1} of {currentQuestions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 p-2 rounded-full" style={insetStyle}>
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="p-8 rounded-3xl mb-8" style={beveledCardStyle}>
            <h2 className="text-2xl font-bold text-white mb-6">{question.question}</h2>

            {/* Multiple Choice */}
            {question.type === 'multiple' && (
              <div className="space-y-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(question.id, index)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      answers[question.id] === index
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-slate-700'
                    }`}
                    style={answers[question.id] === index ? buttonStyle : insetStyle}
                  >
                    <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* True/False */}
            {question.type === 'trueFalse' && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer(question.id, true)}
                  className={`flex-1 p-6 rounded-xl font-semibold transition-all duration-300 ${
                    answers[question.id] === true
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                  style={answers[question.id] === true ? buttonStyle : insetStyle}
                >
                  <CheckCircle className="inline-block w-6 h-6 mr-2" />
                  True
                </button>
                <button
                  onClick={() => handleAnswer(question.id, false)}
                  className={`flex-1 p-6 rounded-xl font-semibold transition-all duration-300 ${
                    answers[question.id] === false
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                  style={answers[question.id] === false ? buttonStyle : insetStyle}
                >
                  <XCircle className="inline-block w-6 h-6 mr-2" />
                  False
                </button>
              </div>
            )}

            {/* Fill in the Blank */}
            {question.type === 'fillBlank' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-900 text-white border-2 border-slate-700 focus:border-blue-500 outline-none"
                placeholder="Type your answer..."
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={answers[question.id] === undefined}
              className="px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={buttonStyle}
            >
              {currentQuestion === currentQuestions.length - 1 && currentSection === 'management'
                ? 'Submit Quiz'
                : 'Next Question'}
              <ChevronRight className="inline-block w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Results Page
  const ResultsPage = () => (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-3xl" style={beveledCardStyle}>
              <Award className="w-20 h-20 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Quiz Complete!</h1>
          <p className="text-xl text-gray-300">Here's how you performed</p>
        </div>

        {/* Scores */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-8 rounded-3xl" style={beveledCardStyle}>
            <h3 className="text-gray-400 text-lg mb-2">Diagnosis Score</h3>
            <p className="text-5xl font-bold text-blue-400 mb-2">{score.diagnosis.toFixed(1)}%</p>
            <p className="text-gray-300 text-sm">Weight: 75%</p>
          </div>
          <div className="p-8 rounded-3xl" style={beveledCardStyle}>
            <h3 className="text-gray-400 text-lg mb-2">Management Score</h3>
            <p className="text-5xl font-bold text-purple-400 mb-2">{score.management.toFixed(1)}%</p>
            <p className="text-gray-300 text-sm">Weight: 25%</p>
          </div>
        </div>

        {/* Total Score */}
        <div className="p-8 rounded-3xl mb-8 text-center" style={beveledCardStyle}>
          <h3 className="text-gray-400 text-lg mb-2">Final Score</h3>
          <p className="text-6xl font-bold text-yellow-400 mb-4">{score.total.toFixed(1)}%</p>
          <p className="text-gray-300">
            {score.total >= 90
              ? '🎉 Excellent! You have mastery-level knowledge!'
              : score.total >= 75
              ? '👍 Great job! You have strong understanding!'
              : score.total >= 60
              ? '📚 Good effort! Review key concepts to improve.'
              : '💪 Keep studying! Focus on fundamental principles.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={resetQuiz}
            className="px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300"
            style={buttonStyle}
          >
            Retake Quiz
          </button>
          <button
            onClick={() => setCurrentPage('landing')}
            className="px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300"
            style={buttonStyle}
          >
            <Home className="inline-block w-5 h-5 mr-2" />
            Home
          </button>
        </div>
      </div>
    </div>
  );

  // Video Modal
  const VideoModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full p-8 rounded-3xl" style={beveledCardStyle}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-400" />
            Generate AI Video
          </h2>
          <button
            onClick={() => setShowVideoModal(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          Enter a topic or question about headache neurology, and we'll generate a custom educational video using AI.
        </p>

        <textarea
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-900 text-white border-2 border-slate-700 focus:border-blue-500 outline-none h-32 mb-6"
          placeholder="Example: Explain the pathophysiology of migraine aura..."
        />

        <button
          onClick={handleGenerateVideo}
          disabled={!videoPrompt.trim() || generatingVideo}
          className="w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={buttonStyle}
        >
          {generatingVideo ? (
            <>Generating Video...</>
          ) : (
            <>
              <Play className="inline-block w-5 h-5 mr-2" />
              Generate Video
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Main Render
  return (
    <div>
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <>
          {currentPage === 'landing' && <LandingPage />}
          {currentPage === 'quiz' && !showResults && <QuizPage />}
          {showResults && <ResultsPage />}
        </>
      )}
      {showVideoModal && <VideoModal />}
    </div>
  );
};

export default NeurologyQuizApp;