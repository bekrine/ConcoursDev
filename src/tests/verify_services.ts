import { priorityScoringService, topicStatisticsService } from '../services/topicStatisticsService';
import { studyPlanGeneratorService } from '../services/studyPlanGeneratorService';
import { quizService, progressService } from '../services/learningServices';
import { DEFAULT_CANDIDATE } from '../services/storage';

console.log('--- EXÉCUTION DE LA SUITE DE TESTS CONCOURSDEV MAROC ---');

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

console.log('--- TOUS LES TESTS UNITAIRES ET D\'INTÉGRATION ONT RÉUSSI AVEC SUCCÈS ---');
