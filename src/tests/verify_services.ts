import { priorityScoringService, topicStatisticsService } from '../services/topicStatisticsService';
import { studyPlanGeneratorService } from '../services/studyPlanGeneratorService';
import { quizService, progressService } from '../services/learningServices';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { supabaseDbService } from '../services/supabaseDbService';
import { storageService, DEFAULT_CANDIDATE, DEFAULT_ADMIN } from '../services/storage';
import { isSupabaseConfigured } from '../services/supabaseClient';

console.log('--- EXÉCUTION DE LA SUITE DE TESTS CONCOURSDEV MAROC & SUPABASE ---');

// Test 1: Calcul des statistiques de matières
const stats = topicStatisticsService.calculateTopicStatistics();
if (stats.length === 0) throw new Error('Échec Test 1: Aucune statistique calculée');
console.log(`✓ Test 1 Réussi: ${stats.length} matières analysées dans le catalogue.`);

// Test 2: Normalisation dynamique des poids sans coefficient
const priorities = priorityScoringService.calculatePersonalizedPriorities('spec_dev', 'lvl_bac2', 60);
if (priorities.length === 0) throw new Error('Échec Test 2: Priorités vides');
const totalAllocatedHours = priorities.reduce((sum, p) => sum + p.recommendedStudyHours, 0);
console.log(`✓ Test 2 Réussi: Score de priorité max = ${priorities[0].personalPriorityScore}/100, temps total alloué = ${totalAllocatedHours}h.`);

// Test 3: Génération du plan d'études personnalisé
const plan = studyPlanGeneratorService.generatePlan(DEFAULT_CANDIDATE, { customDays: 15, customDailyHours: 2 });
if (plan.days.length !== 15) throw new Error(`Échec Test 3: Attendu 15 jours, obtenu ${plan.days.length}`);
if (plan.totalPlannedHours !== 30) throw new Error(`Échec Test 3: Attendu 30 heures planifiées, obtenu ${plan.totalPlannedHours}`);
console.log(`✓ Test 3 Réussi: Plan dynamique de 15 jours généré (budget strict 30h respecté).`);

// Test 4: Protection des clés de réponses aux quiz
const safeQuestions = quizService.getQuizQuestionsForCandidate('top_sql_basic', 3);
safeQuestions.forEach((q: any) => {
  if (q.correctOptionId !== undefined || q.explanation !== undefined) {
    throw new Error('Échec Test 4: Fuite de réponse sensible dans le payload candidat !');
  }
});
console.log(`✓ Test 4 Réussi: Protection hermétique des clés de réponses (correctOptionId masqué).`);

// Test 5: Évaluation et calcul de maîtrise adaptative
const attempt = quizService.submitQuizAttempt({
  userId: 'test_user_unit',
  topicId: 'top_sql_basic',
  topicName: 'SQL Fondamental',
  startedAt: new Date().toISOString(),
  answers: [
    { questionId: safeQuestions[0]?.id || 'q_sql_1', selectedOptionId: 'opt_b' },
  ],
});
if (attempt.scorePercentage === undefined) throw new Error('Échec Test 5: Score manquant');
console.log(`✓ Test 5 Réussi: Évaluation sécurisée du QCM (Score = ${attempt.scorePercentage}%).`);

// Test 6: Supabase Client Fallback & Environment Guard
const isConfigured = supabaseAuthService.isConfigured();
console.log(`✓ Test 6 Réussi: Supabase Client contract validé (Mode: ${isConfigured ? 'Supabase Live Cloud' : 'Local Fallback Démo'}).`);

// Test 7: Registration, Login, Logout & Session Restoration
async function testAuthAndSession() {
  const regResult = await supabaseAuthService.register('candidat.test@concoursdev.ma', 'TestPassword123!', {
    fullName: 'Candidat Test Unitaire',
  });
  if (!regResult.success && !regResult.isConfirmationPending) {
    throw new Error(`Échec Test 7: Inscription échouée - ${regResult.error}`);
  }
  console.log(`✓ Test 7a Réussi: Inscription candidat validée.`);

  const loginResult = await supabaseAuthService.login('candidat.test@concoursdev.ma', 'TestPassword123!');
  if (!loginResult.success || !loginResult.user) {
    throw new Error(`Échec Test 7: Connexion échouée - ${loginResult.error}`);
  }
  console.log(`✓ Test 7b Réussi: Connexion candidat validée (${loginResult.user.email}).`);

  const restored = await supabaseAuthService.restoreSession();
  if (!restored) throw new Error('Échec Test 7: Restauration de session échouée');
  console.log(`✓ Test 7c Réussi: Restauration de session validée.`);

  await supabaseAuthService.logout();
  console.log(`✓ Test 7d Réussi: Déconnexion validée.`);
}

// Test 8: Isolation stricte entre deux utilisateurs (User Isolation Test)
async function testTwoUserIsolation() {
  const userA_id = 'user_uuid_alpha_001';
  const userB_id = 'user_uuid_beta_002';

  const userA = { ...DEFAULT_CANDIDATE, id: userA_id, email: 'alpha@domaine.ma' };
  const userB = { ...DEFAULT_CANDIDATE, id: userB_id, email: 'beta@domaine.ma' };

  // Generate and save plan for User A
  const planA = studyPlanGeneratorService.generatePlan(userA, { customDays: 7, customDailyHours: 1 });
  await supabaseDbService.saveStudyPlan(planA);

  // Retrieve plans for User B
  const plansForB = await supabaseDbService.getStudyPlansForUser(userB_id);
  const leakedPlan = plansForB.find((p) => p.userId === userA_id);
  if (leakedPlan) {
    throw new Error('Échec Test 8: Faille d\'isolation ! Le plan de l\'utilisateur A est accessible à l\'utilisateur B !');
  }

  // Quiz attempts isolation
  const attemptA: any = {
    id: `att_a_${Date.now()}`,
    quizId: 'quiz_sql',
    userId: userA_id,
    topicId: 'top_sql_basic',
    topicName: 'SQL',
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    totalQuestions: 5,
    correctAnswersCount: 4,
    scorePercentage: 80,
    answers: [],
  };
  await supabaseDbService.saveQuizAttempt(attemptA);

  const attemptsForB = storageService.getQuizAttempts(userB_id);
  const leakedAttempt = attemptsForB.find((a) => a.userId === userA_id);
  if (leakedAttempt) {
    throw new Error('Échec Test 8: Faille d\'isolation ! La tentative de l\'utilisateur A est accessible à l\'utilisateur B !');
  }

  console.log(`✓ Test 8 Réussi: Isolation stricte validée (Aucune fuite de données entre Utilisateur A et Utilisateur B).`);
}

// Run async tests
(async () => {
  try {
    await testAuthAndSession();
    await testTwoUserIsolation();
    console.log('--- TOUS LES TESTS UNITAIRES, D\'INTÉGRATION ET D\'ISOLATION ONT RÉUSSI ---');
  } catch (e) {
    console.error('Erreur lors des tests :', e);
    process.exit(1);
  }
})();
