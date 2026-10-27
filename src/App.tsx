import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { AnalysisModal } from './components/AnalysisModal';
import { LandingPage } from './pages/LandingPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { DashboardPage } from './pages/DashboardPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { LessonPage } from './pages/LessonPage';
import { QuizPage } from './pages/QuizPage';
import { ResultsPage } from './pages/ResultsPage';
import { PastExamsPage } from './pages/PastExamsPage';
import { ExamDetailPage } from './pages/ExamDetailPage';
import { TopicStatisticsPage } from './pages/TopicStatisticsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { LegalPrivacyPage } from './pages/LegalPrivacyPage';

import { UserProfile, StudyPlan, QuizAttempt } from './types';
import { storageService, DEFAULT_CANDIDATE } from './services/storage';
import { studyPlanGeneratorService } from './services/studyPlanGeneratorService';
import { supabaseAuthService } from './services/supabaseAuthService';
import { supabaseDbService } from './services/supabaseDbService';
import { supabase } from './services/supabaseClient';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [pendingUserForPlan, setPendingUserForPlan] = useState<UserProfile | null>(null);

  // Active state for detailed views
  const [selectedLessonId, setSelectedLessonId] = useState<string>('les_sql_queries');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('top_sql_basic');
  const [selectedTopicName, setSelectedTopicName] = useState<string>('SQL Fondamental et Requêtes Mixtes');
  const [selectedExamId, setSelectedExamId] = useState<string>('exam_mef_2023_tech3');
  const [latestQuizAttempt, setLatestQuizAttempt] = useState<QuizAttempt | null>(null);

  // Active study plan
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(() => {
    const plans = storageService.getStudyPlansForUser(currentUser.id);
    if (plans.length > 0) return plans[0];
    return studyPlanGeneratorService.generatePlan(currentUser);
  });

  // Supabase Auth Session Restoration & URL hash checks
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const restoredUser = await supabaseAuthService.restoreSession();
      if (isMounted && restoredUser) {
        setCurrentUser(restoredUser);
        const plans = await supabaseDbService.getStudyPlansForUser(restoredUser.id);
        if (plans.length > 0) {
          setStudyPlan(plans[0]);
        }
      }
    }

    initSession();

    // Check for password recovery callback in URL
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery') || hash.includes('reset-password')) {
      setIsResetPasswordModalOpen(true);
    }

    // Subscribe to auth state changes if Supabase is active
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsResetPasswordModalOpen(true);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const user = await supabaseAuthService.restoreSession();
          if (isMounted && user) {
            setCurrentUser(user);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setCurrentUser(DEFAULT_CANDIDATE);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep study plan in sync if user changes
  useEffect(() => {
    let isMounted = true;

    async function syncUserPlan() {
      const plans = await supabaseDbService.getStudyPlansForUser(currentUser.id);
      if (!isMounted) return;

      if (plans.length > 0) {
        setStudyPlan(plans[0]);
      } else {
        const newPlan = studyPlanGeneratorService.generatePlan(currentUser);
        await supabaseDbService.saveStudyPlan(newPlan);
        if (isMounted) setStudyPlan(newPlan);
      }
    }

    syncUserPlan();

    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  const handleStartOnboarding = () => {
    setCurrentTab('onboarding');
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setPendingUserForPlan(updatedUser);
    setIsAnalysisModalOpen(true);
  };

  const handleAnalysisComplete = async () => {
    setIsAnalysisModalOpen(false);
    if (pendingUserForPlan) {
      const newPlan = studyPlanGeneratorService.generatePlan(pendingUserForPlan);
      await supabaseDbService.saveStudyPlan(newPlan);
      await supabaseDbService.updateProfile(pendingUserForPlan);
      setStudyPlan(newPlan);
      setPendingUserForPlan(null);
      setCurrentTab('plan');
    }
  };

  const handleOpenLesson = (lessonId: string, topicId: string) => {
    setSelectedLessonId(lessonId);
    setSelectedTopicId(topicId);
    setCurrentTab('lessons');
  };

  const handleOpenQuiz = (topicId: string, topicName: string) => {
    setSelectedTopicId(topicId);
    setSelectedTopicName(topicName);
    setCurrentTab('quiz');
  };

  const handleQuizCompleted = async (attempt: QuizAttempt) => {
    setLatestQuizAttempt(attempt);

    // Save attempt to Supabase / local
    await supabaseDbService.saveQuizAttempt(attempt);

    // If active plan has a day with this topic, mark it as completed
    if (studyPlan) {
      const updatedDays = studyPlan.days.map((d) => {
        if (d.topicId === attempt.topicId && !d.isCompleted) {
          return {
            ...d,
            isCompleted: true,
            completedAt: new Date().toISOString(),
            score: attempt.scorePercentage,
          };
        }
        return d;
      });

      const updatedPlan: StudyPlan = {
        ...studyPlan,
        days: updatedDays,
      };
      await supabaseDbService.saveStudyPlan(updatedPlan);
      setStudyPlan(updatedPlan);
    }

    setCurrentTab('results');
  };

  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    setCurrentTab('exam_detail');
  };

  const handleResetData = () => {
    storageService.resetAllData();
    const freshUser = DEFAULT_CANDIDATE;
    storageService.setCurrentUser(freshUser);
    setCurrentUser(freshUser);
    const freshPlan = studyPlanGeneratorService.generatePlan(freshUser);
    supabaseDbService.saveStudyPlan(freshPlan);
    setStudyPlan(freshPlan);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-emerald-500 selection:text-white">
      {/* Global Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onStartOnboarding={handleStartOnboarding}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentTab === 'landing' && (
          <LandingPage
            onStartOnboarding={handleStartOnboarding}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            currentUser={currentUser}
            studyPlan={studyPlan}
            onNavigateTab={setCurrentTab}
            onOpenLesson={handleOpenLesson}
            onOpenQuiz={handleOpenQuiz}
            onStartOnboarding={handleStartOnboarding}
          />
        )}

        {currentTab === 'plan' && (
          <StudyPlanPage
            currentUser={currentUser}
            studyPlan={studyPlan}
            onPlanUpdated={async (updatedPlan) => {
              setStudyPlan(updatedPlan);
              await supabaseDbService.saveStudyPlan(updatedPlan);
            }}
            onOpenLesson={handleOpenLesson}
            onOpenQuiz={handleOpenQuiz}
            onStartOnboarding={handleStartOnboarding}
          />
        )}

        {currentTab === 'onboarding' && (
          <OnboardingWizard
            currentUser={currentUser}
            onPlanGenerated={handleOnboardingComplete}
            onCancel={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'lessons' && (
          <LessonPage
            lessonId={selectedLessonId}
            topicId={selectedTopicId}
            onBack={() => setCurrentTab('plan')}
            onStartQuiz={handleOpenQuiz}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizPage
            currentUser={currentUser}
            topicId={selectedTopicId}
            topicName={selectedTopicName}
            onQuizCompleted={handleQuizCompleted}
            onCancel={() => setCurrentTab('plan')}
          />
        )}

        {currentTab === 'results' && latestQuizAttempt && (
          <ResultsPage
            attempt={latestQuizAttempt}
            onRetry={() => setCurrentTab('quiz')}
            onReturnToPlan={() => setCurrentTab('plan')}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'annales' && (
          <PastExamsPage onSelectExam={handleSelectExam} />
        )}

        {currentTab === 'exam_detail' && (
          <ExamDetailPage
            examId={selectedExamId}
            onBack={() => setCurrentTab('annales')}
            onStartQuizWithExamTopic={handleOpenQuiz}
          />
        )}

        {currentTab === 'stats' && (
          <TopicStatisticsPage currentUser={currentUser} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard currentUser={currentUser} />
        )}

        {currentTab === 'profile' && (
          <ProfileSettingsPage
            currentUser={currentUser}
            onUserUpdated={async (u) => {
              setCurrentUser(u);
              await supabaseDbService.updateProfile(u);
            }}
            onResetData={handleResetData}
          />
        )}

        {currentTab === 'legal' && (
          <LegalPrivacyPage onBack={() => setCurrentTab('landing')} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onSelectTab={setCurrentTab} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentTab('dashboard');
        }}
      />

      {/* Password Reset Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSuccess={() => {
          setIsResetPasswordModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Analysis Pipeline Animation Modal */}
      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onComplete={handleAnalysisComplete}
        targetAdminName={pendingUserForPlan?.targetAdminId}
      />
    </div>
  );
}
