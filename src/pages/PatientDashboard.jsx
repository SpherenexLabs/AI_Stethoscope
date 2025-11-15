// import React, { useState, useEffect, useRef } from 'react';
// import { ref, get, set, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
// import { database } from '../firebase';
// import HealthForm from '../components/HealthForm';
// import CallNotification from '../components/CallNotification';
// import VideoCall from '../components/VideoCall';
// import MLBedsorePredictor from '../components/MLBedsorePredictor';
// import '../styles/PatientDashboard.css';
// import messageService from '../utils/MessageService';
// import HealthProgressTracker from '../components/HealthProgressTracker';

// const PatientDashboard = ({ userId, onLogout }) => {
//     const [userData, setUserData] = useState(null);
//     const [healthData, setHealthData] = useState(null);
//     const [envData, setEnvData] = useState({
//         sensor1_SR: { humidity: 0, temperature: 0 },
//         sensor2_SL: { humidity: 0, temperature: 0 },
//         sensor3_BR: { humidity: 0, temperature: 0 },
//         sensor4_BL: { humidity: 0, temperature: 0 },
//         sensor5_LR: { humidity: 0, temperature: 0 },
//         sensor6_LL: { humidity: 0, temperature: 0 }
//     });
//     const [patientHealthRecord, setPatientHealthRecord] = useState(null);
//     const [healthHistory, setHealthHistory] = useState([]);
//     const [activeTab, setActiveTab] = useState('home');
//     const [loading, setLoading] = useState(true);
//     const [incomingCall, setIncomingCall] = useState(null);
//     const [activeCall, setActiveCall] = useState(null);
//     const [recentCalls, setRecentCalls] = useState([]);
//     const [bedsoreHistory, setBedsoreHistory] = useState([]);
//     const [selectedRecord, setSelectedRecord] = useState(null);
//     const [warningTimestamp, setWarningTimestamp] = useState(null);


//     const isReassessing = useRef(false);

//     // Moved fetchHealthHistory outside of useEffect
//     const fetchHealthHistory = async () => {
//         try {
//             const historyRef = ref(database, `healthRecords/${userId}`);
//             const snapshot = await get(historyRef);

//             if (snapshot.exists()) {
//                 const records = [];
//                 snapshot.forEach((childSnapshot) => {
//                     records.push({
//                         id: childSnapshot.key,
//                         ...childSnapshot.val()
//                     });
//                 });

//                 records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//                 setHealthHistory(records);
//             } else {
//                 setHealthHistory([]);
//             }
//         } catch (error) {
//             console.error("Error fetching health history:", error);
//         }
//     };

//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 const userRef = ref(database, `users/${userId}`);
//                 const snapshot = await get(userRef);

//                 if (snapshot.exists()) {
//                     setUserData(snapshot.val());
//                 } else {
//                     console.error("No user data found");
//                 }
//                 setLoading(false);
//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//                 setLoading(false);
//             }
//         };

//         const fetchHealthData = () => {
//             const healthDataRef = ref(database, `healthData`);
//             const envDataRef = ref(database, `environmentData`);
//             return () => {
//                 const unsubscribeHealth = onValue(healthDataRef, (snapshot) => {
//                     if (snapshot.exists()) {
//                         const data = snapshot.val();
//                         setHealthData({
//                             Angle: data.Angle || data.angle || 0,
//                             angle: data.angle || data.Angle || 0,
//                             backPressure_L: data.backPressure_L || 0,
//                             backPressure_R: data.backPressure_R || 0,
//                             backPressure: data.backPressure || 0,
//                             bp: {
//                                 systolic: data.bp?.systolic || 0,
//                                 diastolic: data.bp?.diastolic || 0
//                             },
//                             heartRate: data.heartRate || 0,
//                             humidity: data.humidity || 0,
//                             legPressure_L: data.legPressure_L || 0,
//                             legPressure_R: data.legPressure_R || 0,
//                             legPressure: data.legPressure || 0,
//                             shoulderPressure_L: data.shoulderPressure_L || 0,
//                             shoulderPressure_R: data.shoulderPressure_R || 0,
//                             shoulderPressure: data.shoulderPressure || 0,
//                             sittingDuration: data.sittingDuration || 0,
//                             spo2: data.spo2 || 0,
//                             temperature: data.temperature || 0,
//                             warning: data.warning || 0
//                         });
//                     } else {
//                         console.log("No health data available");
//                         setHealthData({
//                             Angle: 0, angle: 0, backPressure_L: 0, backPressure_R: 0, backPressure: 0,
//                             bp: { systolic: 0, diastolic: 0 }, heartRate: 0, humidity: 0, legPressure_L: 0,
//                             legPressure_R: 0, legPressure: 0, shoulderPressure_L: 0, shoulderPressure_R: 0,
//                             shoulderPressure: 0, sittingDuration: 0, spo2: 0, temperature: 0, warning: 0
//                         });
//                     }
//                 });

//                 const unsubscribeEnv = onValue(envDataRef, (snapshot) => {
//                     if (snapshot.exists()) {
//                         const data = snapshot.val();
//                         setEnvData({
//                             sensor1_SR: { humidity: data.sensor1_SR?.humidity || 0, temperature: data.sensor1_SR?.temperature || 0 },
//                             sensor2_SL: { humidity: data.sensor2_SL?.humidity || 0, temperature: data.sensor2_SL?.temperature || 0 },
//                             sensor3_BR: { humidity: data.sensor3_BR?.humidity || 0, temperature: data.sensor3_BR?.temperature || 0 },
//                             sensor4_BL: { humidity: data.sensor4_BL?.humidity || 0, temperature: data.sensor4_BL?.temperature || 0 },
//                             sensor5_LR: { humidity: data.sensor5_LR?.humidity || 0, temperature: data.sensor5_LR?.temperature || 0 },
//                             sensor6_LL: { humidity: data.sensor6_LL?.humidity || 0, temperature: data.sensor6_LL?.temperature || 0 }
//                         });
//                     } else {
//                         console.log("No environment data available");
//                         setEnvData({
//                             sensor1_SR: { humidity: 0, temperature: 0 },
//                             sensor2_SL: { humidity: 0, temperature: 0 },
//                             sensor3_BR: { humidity: 0, temperature: 0 },
//                             sensor4_BL: { humidity: 0, temperature: 0 },
//                             sensor5_LR: { humidity: 0, temperature: 0 },
//                             sensor6_LL: { humidity: 0, temperature: 0 }
//                         });
//                     }
//                 });

//                 return () => {
//                     unsubscribeHealth();
//                     unsubscribeEnv();
//                 };
//             };
//         };

//         const fetchPatientHealthRecord = async () => {
//             try {
//                 const patientRef = ref(database, `patients/${userId}`);
//                 const snapshot = await get(patientRef);

//                 if (snapshot.exists()) {
//                     setPatientHealthRecord(snapshot.val());
//                 } else {
//                     console.log("No patient health record found");
//                 }
//             } catch (error) {
//                 console.error("Error fetching patient health record:", error);
//             }
//         };

//         const fetchBedsoreHistory = async () => {
//             try {
//                 const historyRef = ref(database, `bedsoreAssessments/${userId}`);
//                 const snapshot = await get(historyRef);

//                 if (snapshot.exists()) {
//                     const assessments = [];
//                     snapshot.forEach((childSnapshot) => {
//                         assessments.push({
//                             id: childSnapshot.key,
//                             ...childSnapshot.val()
//                         });
//                     });

//                     assessments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//                     setBedsoreHistory(assessments);
//                 } else {
//                     setBedsoreHistory([]);
//                 }
//             } catch (error) {
//                 console.error("Error fetching bedsore history:", error);
//             }
//         };

//         const setupCallListener = () => {
//             const callsRef = ref(database, 'calls');
//             const patientCallsQuery = query(callsRef, orderByChild('patientId'), equalTo(userId));

//             return onValue(patientCallsQuery, (snapshot) => {
//                 if (snapshot.exists()) {
//                     const calls = [];
//                     let pendingCall = null;

//                     snapshot.forEach((childSnapshot) => {
//                         const call = {
//                             callId: childSnapshot.key,
//                             ...childSnapshot.val()
//                         };

//                         calls.push(call);

//                         if (call.status === 'pending' && !activeCall) {
//                             pendingCall = call;
//                         }

//                         if (activeCall && call.callId === activeCall.callId) {
//                             setActiveCall(call);
//                             if (call.status === 'ended') {
//                                 setTimeout(() => setActiveCall(null), 2000);
//                             }
//                         }
//                     });

//                     calls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//                     setRecentCalls(calls.slice(0, 10));

//                     if (pendingCall && pendingCall.status === 'pending') {
//                         playRingtone();
//                         setIncomingCall(pendingCall);
//                     } else {
//                         stopRingtone();
//                         setIncomingCall(null);
//                     }
//                 }
//             });
//         };

//         if (userId) {
//             fetchUserData();
//             fetchPatientHealthRecord();
//             fetchHealthHistory();
//             fetchBedsoreHistory();
//             const unsubscribeData = fetchHealthData();
//             const unsubscribeCalls = setupCallListener();
//             return () => {
//                 unsubscribeData();
//                 unsubscribeCalls();
//             };
//         }
//     }, [userId, activeCall]);

//     useEffect(() => {
//         if (!patientHealthRecord || !healthData) return;
//         if (bedsoreHistory.length === 0) return;

//         const lastAssessment = bedsoreHistory[0];
//         const lastAssessmentTime = new Date(lastAssessment.timestamp).getTime();
//         const currentTime = new Date().getTime();

//         const sixHoursInMs = 6 * 60 * 60 * 1000;
//         const shouldReassessByTime = (currentTime - lastAssessmentTime) > sixHoursInMs;

//         const hasWarning = healthData.warning > 0;

//         const sittingDurationIncreased =
//             healthData.sittingDuration > 120 &&
//             (!lastAssessment.patientSnapshot?.sittingDuration ||
//                 healthData.sittingDuration > lastAssessment.patientSnapshot.sittingDuration + 60);

//         const hasHighPressure =
//             healthData.backPressure_L > 80 ||
//             healthData.backPressure_R > 80 ||
//             healthData.shoulderPressure_L > 80 ||
//             healthData.shoulderPressure_R > 80 ||
//             healthData.legPressure_L > 80 ||
//             healthData.legPressure_R > 80;

//         const hasHighHumidity =
//             envData.sensor1_SR.humidity > 70 ||
//             envData.sensor2_SL.humidity > 70 ||
//             envData.sensor3_BR.humidity > 70 ||
//             envData.sensor4_BL.humidity > 70 ||
//             envData.sensor5_LR.humidity > 70 ||
//             envData.sensor6_LL.humidity > 70;

//         if (shouldReassessByTime || hasWarning || sittingDurationIncreased || hasHighPressure || hasHighHumidity) {
//             console.log("Trigger conditions met for automatic bedsore risk reassessment");

//             if (!isReassessing.current) {
//                 isReassessing.current = true;

//                 const performReassessment = async () => {
//                     try {
//                         console.log("Performing automatic bedsore risk reassessment");

//                         const currentPatientData = {
//                             ...patientHealthRecord,
//                             currentSittingDuration: healthData.sittingDuration,
//                             currentPressurePoints: {
//                                 backL: healthData.backPressure_L,
//                                 backR: healthData.backPressure_R,
//                                 shoulderL: healthData.shoulderPressure_L,
//                                 shoulderR: healthData.shoulderPressure_R,
//                                 legL: healthData.legPressure_L,
//                                 legR: healthData.legPressure_R
//                             },
//                             currentEnvironment: {
//                                 humidity: envData
//                             },
//                             autoReassessmentReason: hasWarning ? "warning" :
//                                 sittingDurationIncreased ? "extended_sitting" :
//                                     hasHighPressure ? "high_pressure" :
//                                         hasHighHumidity ? "high_humidity" : "scheduled"
//                         };

//                         await saveBedsoreAssessment(currentPatientData, healthData);

//                     } catch (error) {
//                         console.error("Error in automatic reassessment:", error);
//                     } finally {
//                         isReassessing.current = false;
//                     }
//                 };

//                 performReassessment();
//             }
//         }
//     }, [healthData, envData, patientHealthRecord, bedsoreHistory]);

//     const handleHealthFormSubmit = async (formData) => {
//         try {
//             const timestamp = new Date().toISOString();
//             const safeKey = timestamp.replace(/\./g, '_').replace(/:/g, '-');

//             const patientRef = ref(database, `patients/${userId}`);
//             const patientSnapshot = await get(patientRef);

//             if (patientSnapshot.exists()) {
//                 await set(ref(database, `patients/${userId}`), {
//                     ...patientSnapshot.val(),
//                     ...formData,
//                     lastUpdated: timestamp
//                 });
//             } else {
//                 await set(ref(database, `patients/${userId}`), {
//                     ...formData,
//                     userId: userId,
//                     createdAt: timestamp,
//                     lastUpdated: timestamp
//                 });
//             }

//             await set(ref(database, `healthRecords/${userId}/${safeKey}`), {
//                 ...formData,
//                 timestamp,
//                 userId
//             });

//             setPatientHealthRecord({
//                 ...patientHealthRecord,
//                 ...formData,
//                 lastUpdated: timestamp
//             });

//             fetchHealthHistory();

//             if (patientHealthRecord || formData) {
//                 saveBedsoreAssessment({ ...patientHealthRecord, ...formData }, healthData);
//             }

//             alert('Health information submitted successfully!');
//         } catch (error) {
//             console.error("Error submitting health form:", error);
//             alert('Failed to submit health information. Please try again.');
//         }
//     };

//     const saveBedsoreAssessment = async (patientData, metrics) => {
//         try {
//             if (!patientData) return;

//             const timestamp = new Date().toISOString();
//             const safeKey = timestamp.replace(/\./g, '_').replace(/:/g, '-');

//             const predictionResult = simulateMLPrediction(patientData, metrics);

//             let previousAssessment = null;
//             if (bedsoreHistory.length > 0) {
//                 previousAssessment = bedsoreHistory[0];
//             }

//             const isHighRisk = predictionResult.riskLevel === 'high' || predictionResult.riskLevel === 'very-high';

//             const isNewHighRisk = isHighRisk && (
//                 !previousAssessment ||
//                 (previousAssessment.riskLevel !== 'high' && previousAssessment.riskLevel !== 'very-high') ||
//                 (predictionResult.riskScore > previousAssessment.riskScore + 10)
//             );

//             await set(ref(database, `bedsoreAssessments/${userId}/${safeKey}`), {
//                 ...predictionResult,
//                 patientSnapshot: {
//                     mobilityStatus: patientData.mobilityStatus,
//                     age: patientData.age,
//                     hasDiabetes: patientData.hasDiabetes,
//                     incontinence: patientData.incontinence,
//                     height: patientData.height,
//                     weight: patientData.weight
//                 },
//                 timestamp,
//                 userId
//             });

//             await fetchBedsoreHistory();

//             if (isNewHighRisk) {
//                 console.log("New high risk detected! Sending automatic notification to doctor...");
//                 await notifyDoctorOfHighRisk(patientData, predictionResult);
//                 alert(`ALERT: Your bedsore risk level is now ${predictionResult.riskLevel.toUpperCase()}. Your doctor has been automatically notified.`);
//             }
//             else if (predictionResult.riskLevel === 'very-high') {
//                 console.log("Very high risk confirmed! Sending automatic notification to doctor...");
//                 await notifyDoctorOfHighRisk(patientData, predictionResult);
//             }

//             return predictionResult;
//         } catch (error) {
//             console.error("Error saving bedsore assessment:", error);
//             return null;
//         }
//     };

//     const triggerManualRiskAssessment = async () => {
//         try {
//             console.log("Manual risk assessment triggered by user click");

//             if (!patientHealthRecord || !healthData) {
//                 alert("Unable to perform risk assessment. Missing health data.");
//                 return;
//             }

//             setActiveTab('bedsore');

//             const predictionResult = simulateMLPrediction(patientHealthRecord, healthData);
//             console.log("Manual risk assessment result:", predictionResult);

//             const isHighRisk = predictionResult.riskLevel === 'high' || predictionResult.riskLevel === 'very-high';

//             if (isHighRisk) {
//                 console.log(`HIGH RISK DETECTED (${predictionResult.riskLevel})! Sending SMS notification...`);

//                 const doctorInfo = await getAssignedDoctor();
//                 if (!doctorInfo) {
//                     console.error("No doctor found to notify");
//                     alert("Risk assessment complete, but no doctor was found to notify.");
//                     return;
//                 }

//                 const result = await notifyDoctorOfHighRisk(patientHealthRecord, predictionResult);

//                 if (result && result.success) {
//                     alert(`Your bedsore risk level is ${predictionResult.riskLevel.toUpperCase()}. Your doctor has been automatically notified by SMS.`);
//                 } else {
//                     alert(`Your bedsore risk level is ${predictionResult.riskLevel.toUpperCase()}. However, there was an issue notifying your doctor.`);
//                 }
//             } else {
//                 console.log(`Risk level is ${predictionResult.riskLevel} - no SMS notification needed`);
//                 alert(`Your bedsore risk assessment is complete. Your risk level is: ${predictionResult.riskLevel.toUpperCase()}`);
//             }

//             await saveBedsoreAssessment(patientHealthRecord, healthData);

//         } catch (error) {
//             console.error("Error in manual risk assessment:", error);
//             alert("There was an error performing your risk assessment. Please try again.");
//         }
//     };

//     const notifyDoctorOfHighRisk = async (patientData, riskAssessment) => {
//         try {
//             console.log("High risk detected, preparing to notify doctor...");

//             const doctorInfo = await getAssignedDoctor();

//             if (!doctorInfo) {
//                 console.log("No doctor found for notification");
//                 const message = `EMERGENCY: Patient ${patientData.fullName || 'Unknown'} has been identified with ${riskAssessment.riskLevel} bedsore risk (${riskAssessment.riskScore}/100) but has no assigned doctor.`;
//                 await messageService.sendEmergencySms(message);
//                 return;
//             }

//             const doctorRef = ref(database, `users/${doctorInfo.doctorId}`);
//             const doctorSnap = await get(doctorRef);

//             if (!doctorSnap.exists()) {
//                 console.log("Doctor data not found");
//                 const message = `EMERGENCY: Patient ${patientData.fullName || 'Unknown'} has been identified with ${riskAssessment.riskLevel} bedsore risk (${riskAssessment.riskScore}/100) but doctor data is missing.`;
//                 await messageService.sendEmergencySms(message);
//                 return;
//             }

//             const doctorData = doctorSnap.val();
//             const doctorPhone = doctorData.phoneNumber;

//             if (!doctorPhone) {
//                 console.log("Doctor phone number not found");
//                 const message = `EMERGENCY: Patient ${patientData.fullName || 'Unknown'} has been identified with ${riskAssessment.riskLevel} bedsore risk (${riskAssessment.riskScore}/100) but doctor phone is missing.`;
//                 await messageService.sendEmergencySms(message);
//                 return;
//             }

//             const patientName = patientData.fullName || userData?.fullName || 'Patient';
//             const message = `URGENT ALERT: Patient ${patientName} has been identified with ${riskAssessment.riskLevel} bedsore risk (${riskAssessment.riskScore}/100). Immediate attention required.`;

//             const result = await messageService.sendSmsViaTwilio(doctorPhone, message);

//             console.log(`SMS sent to doctor (${doctorData.doctorId}) at ${doctorPhone}: ${result.success ? 'SUCCESS' : 'FAILED'}`);

//             if (riskAssessment.riskLevel === 'very-high' && riskAssessment.riskScore > 80) {
//                 const emergencyMessage = `CRITICAL ALERT: Patient ${patientName} has VERY HIGH bedsore risk (${riskAssessment.riskScore}/100). Immediate medical intervention required.`;
//                 await messageService.sendEmergencySms(emergencyMessage);
//             }

//             return result;
//         } catch (error) {
//             console.error("Error notifying doctor:", error);
//             try {
//                 const emergencyMessage = `${error.message}`;
//                 await messageService.sendEmergencySms(emergencyMessage);
//             } catch (innerError) {
//                 console.error("Failed to send emergency notification:", innerError);
//             }
//             return { success: false, message: error.message };
//         }
//     };

//     const getAssignedDoctor = async () => {
//         try {
//             const patientRef = ref(database, `patients/${userId}`);
//             const patientSnap = await get(patientRef);

//             if (patientSnap.exists() && patientSnap.val().assignedDoctor) {
//                 const assignedDoctorId = patientSnap.val().assignedDoctor;
//                 return { doctorId: assignedDoctorId };
//             }

//             const usersRef = ref(database, 'users');
//             const doctorQuery = query(usersRef, orderByChild('userType'), equalTo('doctor'));
//             const doctorSnap = await get(doctorQuery);

//             if (doctorSnap.exists()) {
//                 let doctorId = null;
//                 doctorSnap.forEach((childSnap) => {
//                     if (!doctorId) doctorId = childSnap.key;
//                 });

//                 if (doctorId) {
//                     return { doctorId };
//                 }
//             }

//             return null;
//         } catch (error) {
//             console.error("Error getting assigned doctor:", error);
//             return null;
//         }
//     };

//     const simulateMLPrediction = (patient, metrics) => {
//         let score = 0;

//         if (patient.mobilityStatus === 'bedbound') score += 40;
//         else if (patient.mobilityStatus === 'chairbound') score += 30;
//         else if (patient.mobilityStatus === 'assistance') score += 20;

//         if (patient.age > 70) score += 20;
//         else if (patient.age > 60) score += 15;

//         if (patient.hasDiabetes === 'yes') score += 15;

//         if (patient.incontinence === 'both') score += 25;
//         else if (patient.incontinence === 'fecal' || patient.incontinence === 'urinary') score += 15;

//         if (patient.height && patient.weight) {
//             const heightInMeters = patient.height / 100;
//             const bmi = patient.weight / (heightInMeters * heightInMeters);

//             if (bmi < 18.5 || bmi >= 30) score += 15;
//         }

//         if (metrics?.sittingDuration > 120) score += 20;

//         const normalizedScore = Math.min(100, Math.max(0, score));

//         let riskLevel;
//         if (normalizedScore < 20) riskLevel = 'low';
//         else if (normalizedScore < 40) riskLevel = 'moderate';
//         else if (normalizedScore < 60) riskLevel = 'high';
//         else riskLevel = 'very-high';

//         return {
//             riskScore: normalizedScore,
//             riskLevel,
//             confidence: Math.round(70 + Math.random() * 25)
//         };
//     };

//     const handleAcceptCall = async (call) => {
//         try {
//             stopRingtone();
//             await update(ref(database, `calls/${call.callId}`), { status: 'accepting' });
//             setActiveCall(call);
//             setIncomingCall(null);
//         } catch (error) {
//             console.error('Error accepting call:', error);
//         }
//     };

//     const handleDeclineCall = async (call) => {
//         try {
//             stopRingtone();
//             await update(ref(database, `calls/${call.callId}`), { status: 'declined' });
//             setIncomingCall(null);
//         } catch (error) {
//             console.error('Error declining call:', error);
//         }
//     };

//     const ringtoneRef = useRef(null);

//     const playRingtone = () => {
//         if (!ringtoneRef.current) {
//             ringtoneRef.current = new Audio('/ringtone.mp3');
//             ringtoneRef.current.loop = true;
//         }

//         ringtoneRef.current.play().catch(err => {
//             console.log('Could not play ringtone (user interaction required):', err);
//         });
//     };

//     const stopRingtone = () => {
//         if (ringtoneRef.current) {
//             ringtoneRef.current.pause();
//             ringtoneRef.current.currentTime = 0;
//         }
//     };

//     const handleEndCall = () => {
//         setActiveCall(null);
//     };

//     const getStatusColor = (metric, value) => {
//         if (metric === 'bp') {
//             const systolic = value.systolic;
//             const diastolic = value.diastolic;

//             if (systolic > 140 || diastolic > 90) return '#f44336';
//             if (systolic < 90 || diastolic < 60) return '#ff9800';
//             return '#4caf50';
//         } else if (metric === 'heartRate') {
//             if (value < 60 || value > 100) return '#ff9800';
//             return '#4caf50';
//         } else if (metric === 'spo2') {
//             if (value < 95) return '#f44336';
//             return '#4caf50';
//         } else if (metric === 'temperature') {
//             if (value > 37.5) return '#f44336';
//             if (value < 36) return '#ff9800';
//             return '#4caf50';
//         } else if (metric === 'warning') {
//             return value > 0 ? '#f44336' : '#4caf50';
//         } else if (metric === 'bedsoreRisk') {
//             if (value === 'low') return '#4caf50';
//             if (value === 'moderate') return '#ff9800';
//             if (value === 'high') return '#f44336';
//             if (value === 'very-high') return '#9c27b0';
//             return '#2196f3';
//         }
//         return '#2196f3';
//     };

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return new Intl.DateTimeFormat('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         }).format(date);
//     };

//     const getBMICategory = (height, weight) => {
//         if (!height || !weight) return "Not calculated";

//         const heightInMeters = height / 100;
//         const bmi = weight / (heightInMeters * heightInMeters);

//         if (bmi < 18.5) return "Underweight";
//         if (bmi < 25) return "Normal";
//         if (bmi < 30) return "Overweight";
//         return "Obese";
//     };

//     const shouldDisplayWarning = (warningValue) => {
//         if (warningValue === 0) return false;
//         if (!warningTimestamp || warningTimestamp.value !== warningValue) return false;
//         const elapsedTime = (Date.now() - warningTimestamp.timestamp) / 1000;
//         return elapsedTime >= 10;
//     };

//     const renderSelectedRecord = () => {
//         if (!selectedRecord) return null;

//         const calculateBMI = (height, weight) => {
//             if (!height || !weight) return "N/A";
//             const heightInMeters = height / 100;
//             return (weight / (heightInMeters * heightInMeters)).toFixed(1);
//         };

//         return (
//             <div className="record-details">
//                 <h3>Health Record Details - {formatDate(selectedRecord.timestamp)}</h3>

//                 <div className="record-section">
//                     <h4>Personal Information</h4>
//                     <div className="detail-item">
//                         <span className="detail-label">Full Name:</span>
//                         <span className="detail-value">{selectedRecord.fullName || "Not recorded"}</span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Phone Number:</span>
//                         <span className="detail-value">{selectedRecord.phoneNumber || "Not recorded"}</span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Age:</span>
//                         <span className="detail-value">{selectedRecord.age || "Not recorded"}</span>
//                     </div>
//                 </div>

//                 <div className="record-section">
//                     <h4>Health Measurements</h4>
//                     <div className="detail-item">
//                         <span className="detail-label">Height:</span>
//                         <span className="detail-value">{selectedRecord.height ? `${selectedRecord.height} cm` : "Not recorded"}</span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Weight:</span>
//                         <span className="detail-value">{selectedRecord.weight ? `${selectedRecord.weight} kg` : "Not recorded"}</span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">BMI:</span>
//                         <span className="detail-value">{calculateBMI(selectedRecord.height, selectedRecord.weight)} - {getBMICategory(selectedRecord.height, selectedRecord.weight)}</span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Blood Pressure:</span>
//                         <span className="detail-value">{selectedRecord.bloodPressure || "Not recorded"}</span>
//                     </div>
//                 </div>

//                 <div className="record-section">
//                     <h4>Medical History</h4>
//                     <div className="detail-item">
//                         <span className="detail-label">Diabetes:</span>
//                         <span className="detail-value">
//                             {selectedRecord.hasDiabetes === 'yes'
//                                 ? `Yes${selectedRecord.diabetesType ? ` - Type ${selectedRecord.diabetesType.replace('type', '')}` : ''}`
//                                 : (selectedRecord.hasDiabetes === 'no' ? 'No' : 'Unknown')}
//                         </span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Surgery History:</span>
//                         <span className="detail-value">
//                             {selectedRecord.surgeryHistory === 'yes'
//                                 ? `Yes - ${selectedRecord.surgeryDetails || 'No details provided'}`
//                                 : 'No'}
//                         </span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Existing Conditions:</span>
//                         <span className="detail-value">
//                             {selectedRecord.existingConditions && selectedRecord.existingConditions.length > 0
//                                 ? selectedRecord.existingConditions.join(', ')
//                                 : 'None reported'}
//                         </span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Additional Issues:</span>
//                         <span className="detail-value">{selectedRecord.additionalIssues || 'None reported'}</span>
//                     </div>
//                 </div>

//                 <div className="record-section">
//                     <h4>Mobility & Bedsore Risk Factors</h4>
//                     <div className="detail-item">
//                         <span className="detail-label">Mobility Status:</span>
//                         <span className="detail-value">{selectedRecord.mobilityStatus ?
//                             selectedRecord.mobilityStatus.charAt(0).toUpperCase() + selectedRecord.mobilityStatus.slice(1) :
//                             "Not recorded"}</span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Incontinence:</span>
//                         <span className="detail-value">{selectedRecord.incontinence ?
//                             (selectedRecord.incontinence === 'no' ? 'None' :
//                                 selectedRecord.incontinence.charAt(0).toUpperCase() + selectedRecord.incontinence.slice(1)) :
//                             "Not recorded"}</span>
//                     </div>
//                     <div className="detail-item">
//                         <span className="detail-label">Skin Condition:</span>
//                         <span className="detail-value">{selectedRecord.skinCondition ?
//                             selectedRecord.skinCondition.charAt(0).toUpperCase() + selectedRecord.skinCondition.slice(1) :
//                             "Not recorded"}</span>
//                     </div>
//                 </div>

//                 <button
//                     className="button back-button"
//                     onClick={() => setSelectedRecord(null)}
//                 >
//                     Back to History List
//                 </button>
//             </div>
//         );
//     };

//     if (loading) return <div>Loading...</div>;
//     if (!userData) return <div>User not found. <button onClick={onLogout}>Return to Login</button></div>;

//     return (
//         <div className="dashboard">
//             <header className="header">
//                 <h1>Patient Dashboard</h1>
//                 <button className="logout-button" onClick={onLogout}>Logout</button>
//             </header>

//             <nav className="nav">
//                 {['home', 'health', 'history', 'calls', 'bedsore', 'progress'].map(tab => (
//                     <div
//                         key={tab}
//                         className={`nav-item ${activeTab === tab ? 'active' : ''}`}
//                         onClick={() => setActiveTab(tab)}
//                     >
//                         {tab === 'bedsore' ? 'Bedsore Risk' :
//                             tab === 'progress' ? 'Health Progress' :
//                                 tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </div>
//                 ))}
//             </nav>

//             <main className="content">
//                 {activeTab === 'home' && (
//                     <div>
//                         <div className="welcome">
//                             <h2>Welcome, {userData.fullName || (healthHistory.length > 0 && healthHistory[0].fullName) || 'Patient'}</h2>
//                             <p>Phone: {userData.phoneNumber}</p>
//                             {userData.email && <p>Email: {userData.email}</p>}
//                         </div>

//                         {healthData && (
//                             <div className="card">
//                                 <h3>Current Health Metrics</h3>
//                                 <div className="health-metrics-container">
//                                     <div className="health-metric">
//                                         <div className="metric-title">Angle</div>
//                                         <div className="metric-value">{healthData.Angle || healthData.angle || 0}</div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Blood Pressure</div>
//                                         <div className="metric-value" style={{ color: getStatusColor('bp', healthData.bp) }}>
//                                             {healthData.bp?.systolic || 0}/{healthData.bp?.diastolic || 0} mmHg
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Heart Rate</div>
//                                         <div className="metric-value" style={{ color: getStatusColor('heartRate', healthData.heartRate) }}>
//                                             {healthData.heartRate || 0} bpm
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Back Pressure (L)</div>
//                                         <div className="metric-value">
//                                             {healthData.backPressure_L || 0} mmHg<br />
//                                             Humidity: {envData.sensor4_BL.humidity || 0}%<br />
//                                             Temp: {envData.sensor4_BL.temperature || 0}°C
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Back Pressure (R)</div>
//                                         <div className="metric-value">
//                                             {healthData.backPressure_R || 0} mmHg<br />
//                                             Humidity: {envData.sensor3_BR.humidity || 0}%<br />
//                                             Temp: {envData.sensor3_BR.temperature || 0}°C
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Leg Pressure (L)</div>
//                                         <div className="metric-value">
//                                             {healthData.legPressure_L || 0} mmHg<br />
//                                             Humidity: {envData.sensor6_LL.humidity || 0}%<br />
//                                             Temp: {envData.sensor6_LL.temperature || 0}°C
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Leg Pressure (R)</div>
//                                         <div className="metric-value">
//                                             {healthData.legPressure_R || 0} mmHg<br />
//                                             Humidity: {envData.sensor5_LR.humidity || 0}%<br />
//                                             Temp: {envData.sensor5_LR.temperature || 0}°C
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Shoulder Pressure (L)</div>
//                                         <div className="metric-value">
//                                             {healthData.shoulderPressure_L || 0} mmHg<br />
//                                             Humidity: {envData.sensor2_SL.humidity || 0}%<br />
//                                             Temp: {envData.sensor2_SL.temperature || 0}°C
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Shoulder Pressure (R)</div>
//                                         <div className="metric-value">
//                                             {healthData.shoulderPressure_R || 0} mmHg<br />
//                                             Humidity: {envData.sensor1_SR.humidity || 0}%<br />
//                                             Temp: {envData.sensor1_SR.temperature || 0}°C
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Oxygen Saturation</div>
//                                         <div className="metric-value" style={{ color: getStatusColor('spo2', healthData.spo2) }}>
//                                             {healthData.spo2 || 0}%
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Temperature</div>
//                                         <div className="metric-value" style={{ color: getStatusColor('temperature', healthData.temperature) }}>
//                                             {healthData.temperature || 0}°C
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Humidity</div>
//                                         <div className="metric-value">
//                                             {healthData.humidity || 0}%
//                                         </div>
//                                     </div>
//                                     <div className="health-metric">
//                                         <div className="metric-title">Sitting Duration</div>
//                                         <div className="metric-value">
//                                             {healthData.sittingDuration || 0} min
//                                         </div>
//                                     </div>
//                                     {bedsoreHistory.length > 0 && (
//                                         <div className="health-metric">
//                                             <div className="metric-title">Bedsore Risk (ML)</div>
//                                             <div
//                                                 className="metric-value"
//                                                 style={{ color: getStatusColor('bedsoreRisk', bedsoreHistory[0].riskLevel) }}
//                                             >
//                                                 {bedsoreHistory[0].riskLevel.charAt(0).toUpperCase() + bedsoreHistory[0].riskLevel.slice(1).replace('-', ' ')}
//                                                 {(bedsoreHistory[0].riskLevel === 'high' || bedsoreHistory[0].riskLevel === 'very-high') && ' ⚠️'}
//                                             </div>
//                                         </div>
//                                     )}
//                                     {healthData.warning > 0 && shouldDisplayWarning(healthData.warning) && (
//                                         <div className={`health-warning ${healthData.warning >= 1 && healthData.warning <= 6 ? 'health-warning-urgent' : ''}`}>
//                                             <div className="warning-icon">{healthData.warning >= 1 && healthData.warning <= 6 ? '🚨' : '⚠️'}</div>
//                                             <div className="warning-text">
//                                                 {healthData.warning === 1
//                                                     ? "ALERT: Left shoulder has been under pressure for a long time!"
//                                                     : healthData.warning === 2
//                                                         ? "ALERT: Right shoulder has been under pressure for a long time!"
//                                                         : healthData.warning === 3
//                                                             ? "ALERT: Left back has been under pressure for a long time!"
//                                                             : healthData.warning === 4
//                                                                 ? "ALERT: Right back has been under pressure for a long time!"
//                                                                 : healthData.warning === 5
//                                                                     ? "ALERT: Left leg has been under pressure for a long time!"
//                                                                     : healthData.warning === 6
//                                                                         ? "ALERT: Right leg has been under pressure for a long time!"
//                                                                         : `Warning: ${healthData.warning} health metrics need attention`}
//                                             </div>
//                                             {healthData.warning >= 1 && healthData.warning <= 6 && (
//                                                 <button className="warning-action-button">
//                                                     Contact Doctor
//                                                 </button>
//                                             )}
//                                         </div>
//                                     )}
//                                     {bedsoreHistory.length > 0 && (bedsoreHistory[0].riskLevel === 'high' || bedsoreHistory[0].riskLevel === 'very-high') && (
//                                         <div className="health-warning health-warning-urgent">
//                                             <div className="warning-icon">🚨</div>
//                                             <div className="warning-text">
//                                                 High bedsore risk detected! Follow prevention guidelines.
//                                             </div>
//                                             <button
//                                                 className="warning-action-button"
//                                                 onClick={() => setActiveTab('bedsore')}
//                                             >
//                                                 View Recommendations
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                         <div className="card">
//                             <h3>Your Health Progress</h3>
//                             <div className="health-progress-preview">
//                                 <p>Track your health metrics over time</p>
//                                 <div className="progress-metrics">
//                                     <div className="metric">
//                                         <span className="metric-label">Weight</span>
//                                         <span className="metric-value">{healthHistory.length > 0 ? `${healthHistory[0].weight || '–'} kg` : '–'}</span>
//                                     </div>
//                                     <div className="metric">
//                                         <span className="metric-label">Blood Pressure</span>
//                                         <span className="metric-value">{healthHistory.length > 0 ? healthHistory[0].bloodPressure || '–' : '–'}</span>
//                                     </div>
//                                     <div className="metric">
//                                         <span className="metric-label">Bedsore Risk</span>
//                                         <span className="metric-value" style={{
//                                             color: bedsoreHistory.length > 0
//                                                 ? (bedsoreHistory[0].riskLevel === 'high' || bedsoreHistory[0].riskLevel === 'very-high')
//                                                     ? '#f44336' : '#4caf50'
//                                                 : 'inherit'
//                                         }}>
//                                             {bedsoreHistory.length > 0
//                                                 ? bedsoreHistory[0].riskLevel.charAt(0).toUpperCase() + bedsoreHistory[0].riskLevel.slice(1).replace('-', ' ')
//                                                 : 'Not assessed'}
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <button
//                                     className="progress-button"
//                                     onClick={() => setActiveTab('progress')}
//                                     style={{
//                                         padding: '10px 15px',
//                                         backgroundColor: '#2196F3',
//                                         color: 'white',
//                                         border: 'none',
//                                         borderRadius: '4px',
//                                         cursor: 'pointer',
//                                         marginTop: '15px',
//                                         display: 'block',
//                                         width: '100%'
//                                     }}
//                                 >
//                                     View Health Progress & Download Reports
//                                 </button>
//                             </div>
//                             <style jsx>{`
//     .health-progress-preview {
//       padding: 10px 0;
//     }
//     .progress-metrics {
//       display: grid;
//       grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
//       gap: 15px;
//       margin-top: 15px;
//     }
//     .metric {
//       background-color: #f5f5f5;
//       padding: 10px;
//       border-radius: 4px;
//       display: flex;
//       flex-direction: column;
//     }
//     .metric-label {
//       font-size: 12px;
//       color: #666;
//       margin-bottom: 5px;
//     }
//     .metric-value {
//       font-size: 16px;
//       font-weight: bold;
//     }
//   `}</style>
//                             <h3>Quick Actions</h3>
//                             <button
//                                 className="button"
//                                 style={{ marginRight: '10px' }}
//                                 onClick={() => setActiveTab('health')}
//                             >
//                                 Fill Health Form
//                             </button>
//                             <button
//                                 className="button"
//                                 style={{ marginRight: '10px' }}
//                                 onClick={() => setActiveTab('history')}
//                             >
//                                 View Health History
//                             </button>
//                             <button
//                                 className="button"
//                                 onClick={triggerManualRiskAssessment}
//                             >
//                                 ML Bedsore Assessment
//                             </button>
//                         </div>
//                     </div>
//                 )}
//                 {activeTab === 'health' && (
//                     <div className="card">
//                         <h2>Health Information Form</h2>
//                         <HealthForm onSubmit={handleHealthFormSubmit} userId={userId} />
//                     </div>
//                 )}
//                 {activeTab === 'history' && (
//                     <div className="card">
//                         <h2>Medical History</h2>
//                         {selectedRecord ? (
//                             renderSelectedRecord()
//                         ) : (
//                             <>
//                                 {healthHistory.length > 0 ? (
//                                     <div className="history-container">
//                                         <div className="history-header">
//                                             <span className="header-date">Date</span>
//                                             <span className="header-bmi">BMI</span>
//                                             <span className="header-bp">Blood Pressure</span>
//                                             <span className="header-conditions">Conditions</span>
//                                             <span className="header-risk">Bedsore Risk</span>
//                                             <span className="header-actions">Actions</span>
//                                         </div>
//                                         {healthHistory.map((record) => {
//                                             const bedsoreEntry = bedsoreHistory.find(assessment =>
//                                                 new Date(assessment.timestamp).toDateString() === new Date(record.timestamp).toDateString()
//                                             );
//                                             let bmiCategory = getBMICategory(record.height, record.weight);
//                                             return (
//                                                 <div key={record.id} className="history-row">
//                                                     <span className="row-date">{formatDate(record.timestamp)}</span>
//                                                     <span className="row-bmi">
//                                                         {record.height && record.weight ? (
//                                                             <span className={`bmi-tag ${bmiCategory.toLowerCase()}`}>
//                                                                 {bmiCategory}
//                                                             </span>
//                                                         ) : "Not recorded"}
//                                                     </span>
//                                                     <span className="row-bp">
//                                                         {record.bloodPressure || "Not recorded"}
//                                                     </span>
//                                                     <span className="row-conditions">
//                                                         {record.existingConditions && record.existingConditions.length > 0
//                                                             ? record.existingConditions.slice(0, 2).join(', ') +
//                                                             (record.existingConditions.length > 2 ? '...' : '')
//                                                             : "None reported"}
//                                                     </span>
//                                                     <span className="row-risk">
//                                                         {bedsoreEntry ? (
//                                                             <span className={`risk-tag ${bedsoreEntry.riskLevel}`}>
//                                                                 {bedsoreEntry.riskLevel.charAt(0).toUpperCase() +
//                                                                     bedsoreEntry.riskLevel.slice(1).replace('-', ' ')}
//                                                             </span>
//                                                         ) : "Not assessed"}
//                                                     </span>
//                                                     <span className="row-actions">
//                                                         <button
//                                                             className="button view-button"
//                                                             onClick={() => setSelectedRecord(record)}
//                                                         >
//                                                             View Details
//                                                         </button>
//                                                     </span>
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 ) : (
//                                     <div className="empty-history">
//                                         <p>No health records found. Please fill out the health form to begin tracking your health history.</p>
//                                         <button
//                                             className="button"
//                                             onClick={() => setActiveTab('health')}
//                                         >
//                                             Fill Health Form
//                                         </button>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 )}
//                 {activeTab === 'calls' && (
//                     <div className="card">
//                         <h2>Video Calls History</h2>
//                         {recentCalls.length > 0 ? (
//                             <table className="calls-list">
//                                 <thead>
//                                     <tr>
//                                         <th className="calls-header">Date</th>
//                                         <th className="calls-header">Doctor</th>
//                                         <th className="calls-header">Status</th>
//                                         <th className="calls-header">Duration</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {recentCalls.map(call => (
//                                         <tr key={call.callId}>
//                                             <td className="calls-data">
//                                                 {new Date(call.timestamp).toLocaleString()}
//                                             </td>
//                                             <td className="calls-data">
//                                                 {call.doctorName || `Dr. ID: ${call.doctorId}`}
//                                             </td>
//                                             <td className="calls-data">
//                                                 {call.status === 'pending' ? 'Waiting' :
//                                                     call.status === 'accepted' ? 'Connected' :
//                                                         call.status === 'declined' ? 'Declined' : 'Ended'}
//                                             </td>
//                                             <td className="calls-data">
//                                                 {call.endTime && call.status === 'ended' ?
//                                                     `${Math.round((new Date(call.endTime) - new Date(call.timestamp)) / 1000 / 60)} min` :
//                                                     call.status === 'pending' ? 'Incoming...' :
//                                                         call.status === 'declined' ? '-' : 'In progress'}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         ) : (
//                             <p>No video calls history.</p>
//                         )}
//                     </div>
//                 )}
//                 {activeTab === 'bedsore' && (
//                     <div>
//                         <div className="card">
//                             <h2>ML-Based Bedsore Risk Assessment</h2>
//                             {patientHealthRecord ? (
//                                 <>
//                                     <MLBedsorePredictor
//                                         patientData={patientHealthRecord}
//                                         healthMetrics={healthData}
//                                     />
//                                     <div style={{ marginTop: '20px', textAlign: 'center' }}>
//                                         {/* <button
//                                             className="button"
//                                             onClick={triggerManualRiskAssessment}
//                                             style={{
//                                                 backgroundColor: '#4CAF50',
//                                                 color: 'white',
//                                                 padding: '10px 20px',
//                                                 border: 'none',
//                                                 borderRadius: '4px',
//                                                 cursor: 'pointer'
//                                             }}
//                                         >
//                                             Run New Assessment & Send SMS if High Risk
//                                         </button> */}
//                                     </div>
//                                 </>
//                             ) : (
//                                 <div>
//                                     <p>No health data available for bedsore risk assessment.</p>
//                                     <button
//                                         className="button"
//                                         onClick={() => setActiveTab('health')}
//                                     >
//                                         Complete Health Form
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//                 {activeTab === 'progress' && (
//                     <div className="card">
//                         <h2>Health Progress Tracking</h2>
//                         <HealthProgressTracker userId={userId} />
//                     </div>
//                 )}
//             </main>
//             {incomingCall && !activeCall && (
//                 <CallNotification
//                     call={incomingCall}
//                     onAccept={handleAcceptCall}
//                     onDecline={handleDeclineCall}
//                 />
//             )}
//             {activeCall && (
//                 <div className="video-modal">
//                     <div className="video-container">
//                         <VideoCall
//                             userId={userId}
//                             role="patient"
//                             callData={activeCall}
//                             onEndCall={handleEndCall}
//                         />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PatientDashboard;




import React, { useState, useEffect, useRef } from 'react';
import { ref, get, set, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '../firebase';
import HealthForm from '../components/HealthForm';
import CallNotification from '../components/CallNotification';
import VideoCall from '../components/VideoCall';
import '../styles/PatientDashboard.css';
import telegramService from '../utils/TelegramService';
import HealthProgressTracker from '../components/HealthProgressTracker';

const PatientDashboard = ({ userId, onLogout }) => {
    const [userData, setUserData] = useState(null);
    const [healthData, setHealthData] = useState(null);
    const [sensorData, setSensorData] = useState({
        heartRate: 0,
        spo2: 0,
        bp: '',
        temperature: 0,
        humidity: 0
    });
    const [patientHealthRecord, setPatientHealthRecord] = useState(null);
    const [healthHistory, setHealthHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('home');
    const [loading, setLoading] = useState(true);
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [recentCalls, setRecentCalls] = useState([]);
    const [healthPredictions, setHealthPredictions] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [warningTimestamp, setWarningTimestamp] = useState(null);

    const isReassessing = useRef(false);

    // Moved fetchHealthHistory outside of useEffect
    const fetchHealthHistory = async () => {
        try {
            const historyRef = ref(database, `healthRecords/${userId}`);
            const snapshot = await get(historyRef);

            if (snapshot.exists()) {
                const records = [];
                snapshot.forEach((childSnapshot) => {
                    records.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });

                records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setHealthHistory(records);
            } else {
                setHealthHistory([]);
            }
        } catch (error) {
            console.error("Error fetching health history:", error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRef = ref(database, `users/${userId}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    setUserData(snapshot.val());
                } else {
                    console.error("No user data found");
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setLoading(false);
            }
        };

        const fetchSensorData = () => {
            // Fetch data from the new Firebase structure
            const sensorDataRef = ref(database, `1_Sensor_Data`);
            
            const unsubscribe = onValue(sensorDataRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    
                    // Parse the data from the new structure
                    const heartRate = parseInt(data["1_HR"]) || 0;
                    const spo2 = parseInt(data["2_SPO2"]) || 0;
                    const bpString = data["3_BP"] || "0/0";
                    const temperature = parseFloat(data["4_Temp"]) || 0;
                    const humidity = parseFloat(data["5_Hum"]) || 0;
                    
                    // Parse BP string (format: "119/80")
                    const bpParts = bpString.split('/');
                    const systolic = parseInt(bpParts[0]) || 0;
                    const diastolic = parseInt(bpParts[1]) || 0;
                    
                    setSensorData({
                        heartRate,
                        spo2,
                        bp: bpString,
                        bpSystolic: systolic,
                        bpDiastolic: diastolic,
                        temperature,
                        humidity
                    });
                    
                    // Also set healthData for compatibility with existing components
                    setHealthData({
                        heartRate,
                        spo2,
                        bp: {
                            systolic,
                            diastolic
                        },
                        temperature,
                        humidity
                    });
                } else {
                    console.log("No sensor data available");
                    setSensorData({
                        heartRate: 0,
                        spo2: 0,
                        bp: "0/0",
                        bpSystolic: 0,
                        bpDiastolic: 0,
                        temperature: 0,
                        humidity: 0
                    });
                }
            });

            return unsubscribe;
        };

        const fetchPatientHealthRecord = async () => {
            try {
                const patientRef = ref(database, `patients/${userId}`);
                const snapshot = await get(patientRef);

                if (snapshot.exists()) {
                    setPatientHealthRecord(snapshot.val());
                } else {
                    console.log("No patient health record found");
                }
            } catch (error) {
                console.error("Error fetching patient health record:", error);
            }
        };

        const fetchHealthPredictions = async () => {
            try {
                const historyRef = ref(database, `healthPredictions/${userId}`);
                const snapshot = await get(historyRef);

                if (snapshot.exists()) {
                    const predictions = [];
                    snapshot.forEach((childSnapshot) => {
                        predictions.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    });

                    predictions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setHealthPredictions(predictions);
                } else {
                    setHealthPredictions([]);
                }
            } catch (error) {
                console.error("Error fetching health predictions:", error);
            }
        };

        const setupCallListener = () => {
            const callsRef = ref(database, 'calls');
            const patientCallsQuery = query(callsRef, orderByChild('patientId'), equalTo(userId));

            return onValue(patientCallsQuery, (snapshot) => {
                if (snapshot.exists()) {
                    const calls = [];
                    let pendingCall = null;

                    snapshot.forEach((childSnapshot) => {
                        const call = {
                            callId: childSnapshot.key,
                            ...childSnapshot.val()
                        };

                        calls.push(call);

                        if (call.status === 'pending' && !activeCall) {
                            pendingCall = call;
                        }

                        if (activeCall && call.callId === activeCall.callId) {
                            setActiveCall(call);
                            if (call.status === 'ended') {
                                setTimeout(() => setActiveCall(null), 2000);
                            }
                        }
                    });

                    calls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setRecentCalls(calls.slice(0, 10));

                    if (pendingCall && pendingCall.status === 'pending') {
                        playRingtone();
                        setIncomingCall(pendingCall);
                    } else {
                        stopRingtone();
                        setIncomingCall(null);
                    }
                }
            });
        };

        if (userId) {
            fetchUserData();
            fetchPatientHealthRecord();
            fetchHealthHistory();
            fetchHealthPredictions();
            const unsubscribeData = fetchSensorData();
            const unsubscribeCalls = setupCallListener();
            return () => {
                unsubscribeData();
                unsubscribeCalls();
            };
        }
    }, [userId, activeCall]);

    useEffect(() => {
        if (!patientHealthRecord || !healthData) return;
        if (bedsoreHistory.length === 0) return;

        const lastAssessment = bedsoreHistory[0];
        const lastAssessmentTime = new Date(lastAssessment.timestamp).getTime();
        const currentTime = new Date().getTime();

        const sixHoursInMs = 6 * 60 * 60 * 1000;
        const shouldReassessByTime = (currentTime - lastAssessmentTime) > sixHoursInMs;

        const hasWarning = healthData.warning > 0;

        const sittingDurationIncreased =
            healthData.sittingDuration > 120 &&
            (!lastAssessment.patientSnapshot?.sittingDuration ||
                healthData.sittingDuration > lastAssessment.patientSnapshot.sittingDuration + 60);

        const hasHighPressure =
            healthData.backPressure_L > 80 ||
            healthData.backPressure_R > 80 ||
            healthData.shoulderPressure_L > 80 ||
            healthData.shoulderPressure_R > 80 ||
            healthData.legPressure_L > 80 ||
            healthData.legPressure_R > 80;

        const hasHighHumidity =
            envData.sensor1_SR.humidity > 70 ||
            envData.sensor2_SL.humidity > 70 ||
            envData.sensor3_BR.humidity > 70 ||
            envData.sensor4_BL.humidity > 70 ||
            envData.sensor5_LR.humidity > 70 ||
            envData.sensor6_LL.humidity > 70;

        if (shouldReassessByTime || hasWarning || sittingDurationIncreased || hasHighPressure || hasHighHumidity) {
            console.log("Trigger conditions met for automatic bedsore risk reassessment");

            if (!isReassessing.current) {
                isReassessing.current = true;

                const performReassessment = async () => {
                    try {
                        console.log("Performing automatic bedsore risk reassessment");

                        const currentPatientData = {
                            ...patientHealthRecord,
                            currentSittingDuration: healthData.sittingDuration,
                            currentPressurePoints: {
                                backL: healthData.backPressure_L,
                                backR: healthData.backPressure_R,
                                shoulderL: healthData.shoulderPressure_L,
                                shoulderR: healthData.shoulderPressure_R,
                                legL: healthData.legPressure_L,
                                legR: healthData.legPressure_R
                            },
                            currentEnvironment: {
                                humidity: envData
                            },
                            autoReassessmentReason: hasWarning ? "warning" :
                                sittingDurationIncreased ? "extended_sitting" :
                                    hasHighPressure ? "high_pressure" :
                                        hasHighHumidity ? "high_humidity" : "scheduled"
                        };

                        await saveBedsoreAssessment(currentPatientData, healthData);

                    } catch (error) {
                        console.error("Error in automatic reassessment:", error);
                    } finally {
                        isReassessing.current = false;
                    }
                };

                performReassessment();
            }
        }
    }, [healthData, envData, patientHealthRecord, bedsoreHistory]);

    const handleHealthFormSubmit = async (formData) => {
        try {
            const timestamp = new Date().toISOString();
            const safeKey = timestamp.replace(/\./g, '_').replace(/:/g, '-');

            const patientRef = ref(database, `patients/${userId}`);
            const patientSnapshot = await get(patientRef);

            if (patientSnapshot.exists()) {
                await set(ref(database, `patients/${userId}`), {
                    ...patientSnapshot.val(),
                    ...formData,
                    lastUpdated: timestamp
                });
            } else {
                await set(ref(database, `patients/${userId}`), {
                    ...formData,
                    userId: userId,
                    createdAt: timestamp,
                    lastUpdated: timestamp
                });
            }

            await set(ref(database, `healthRecords/${userId}/${safeKey}`), {
                ...formData,
                timestamp,
                userId
            });

            setPatientHealthRecord({
                ...patientHealthRecord,
                ...formData,
                lastUpdated: timestamp
            });

            fetchHealthHistory();

            if (patientHealthRecord || formData) {
                saveBedsoreAssessment({ ...patientHealthRecord, ...formData }, healthData);
            }

            alert('Health information submitted successfully!');
        } catch (error) {
            console.error("Error submitting health form:", error);
            alert('Failed to submit health information. Please try again.');
        }
    };

    const saveBedsoreAssessment = async (patientData, metrics) => {
        try {
            if (!patientData) return;

            const timestamp = new Date().toISOString();
            const safeKey = timestamp.replace(/\./g, '_').replace(/:/g, '-');

            const predictionResult = simulateMLPrediction(patientData, metrics);

            let previousAssessment = null;
            if (bedsoreHistory.length > 0) {
                previousAssessment = bedsoreHistory[0];
            }

            const isHighRisk = predictionResult.riskLevel === 'high' || predictionResult.riskLevel === 'very-high';

            const isNewHighRisk = isHighRisk && (
                !previousAssessment ||
                (previousAssessment.riskLevel !== 'high' && previousAssessment.riskLevel !== 'very-high') ||
                (predictionResult.riskScore > previousAssessment.riskScore + 10)
            );

            await set(ref(database, `bedsoreAssessments/${userId}/${safeKey}`), {
                ...predictionResult,
                patientSnapshot: {
                    mobilityStatus: patientData.mobilityStatus,
                    age: patientData.age,
                    hasDiabetes: patientData.hasDiabetes,
                    incontinence: patientData.incontinence,
                    height: patientData.height,
                    weight: patientData.weight
                },
                timestamp,
                userId
            });

            await fetchBedsoreHistory();

            if (isNewHighRisk) {
                console.log("New high risk detected! Sending automatic notification to doctor...");
                await notifyDoctorOfHighRisk(patientData, predictionResult);
                alert(`ALERT: Your bedsore risk level is now ${predictionResult.riskLevel.toUpperCase()}. Your doctor has been automatically notified via Telegram.`);
            }
            else if (predictionResult.riskLevel === 'very-high') {
                console.log("Very high risk confirmed! Sending automatic notification to doctor...");
                await notifyDoctorOfHighRisk(patientData, predictionResult);
            }

            return predictionResult;
        } catch (error) {
            console.error("Error saving bedsore assessment:", error);
            return null;
        }
    };

    const triggerManualRiskAssessment = async () => {
        try {
            console.log("Manual risk assessment triggered by user click");

            if (!patientHealthRecord || !healthData) {
                alert("Unable to perform risk assessment. Missing health data.");
                return;
            }

            setActiveTab('bedsore');

            const predictionResult = simulateMLPrediction(patientHealthRecord, healthData);
            console.log("Manual risk assessment result:", predictionResult);

            const isHighRisk = predictionResult.riskLevel === 'high' || predictionResult.riskLevel === 'very-high';

            if (isHighRisk) {
                console.log(`HIGH RISK DETECTED (${predictionResult.riskLevel})! Sending Telegram notification...`);

                const doctorInfo = await getAssignedDoctor();
                if (!doctorInfo) {
                    console.error("No doctor found to notify");
                    alert("Risk assessment complete, but no doctor was found to notify.");
                    return;
                }

                const result = await notifyDoctorOfHighRisk(patientHealthRecord, predictionResult);

                if (result && result.success) {
                    alert(`Your bedsore risk level is ${predictionResult.riskLevel.toUpperCase()}. Your doctor has been automatically notified via Telegram.`);
                } else {
                    alert(`Your bedsore risk level is ${predictionResult.riskLevel.toUpperCase()}. However, there was an issue notifying your doctor.`);
                }
            } else {
                console.log(`Risk level is ${predictionResult.riskLevel} - no notification needed`);
                alert(`Your bedsore risk assessment is complete. Your risk level is: ${predictionResult.riskLevel.toUpperCase()}`);
            }

            await saveBedsoreAssessment(patientHealthRecord, healthData);

        } catch (error) {
            console.error("Error in manual risk assessment:", error);
            alert("There was an error performing your risk assessment. Please try again.");
        }
    };

    const notifyDoctorOfHighRisk = async (patientData, riskAssessment) => {
        try {
            console.log("High risk detected, preparing to notify doctor via Telegram...");

            const doctorInfo = await getAssignedDoctor();

            if (!doctorInfo) {
                console.log("No doctor found for notification");
                const message = `EMERGENCY: Patient ${patientData.fullName || 'Unknown'} has been identified with ${riskAssessment.riskLevel} bedsore risk (${riskAssessment.riskScore}/100) but has no assigned doctor.`;
                await telegramService.sendEmergencyMessage(message);
                return;
            }

            const doctorRef = ref(database, `users/${doctorInfo.doctorId}`);
            const doctorSnapshot = await get(doctorRef);

            if (!doctorSnapshot.exists()) {
                console.log("Doctor record not found");
                const message = `EMERGENCY: Patient ${patientData.fullName || 'Unknown'} has been identified with ${riskAssessment.riskLevel} bedsore risk (${riskAssessment.riskScore}/100) but doctor data is missing.`;
                await telegramService.sendEmergencyMessage(message);
                return;
            }

            const doctorData = doctorSnapshot.val();
            const chatId = doctorData.telegramChatId;

            if (!chatId) {
                console.log("Doctor Telegram chat ID not found");
                const message = `EMERGENCY: Patient ${patientData.fullName || 'Unknown'} has been identified with ${riskAssessment.riskLevel} bedsore risk (${riskAssessment.riskScore}/100) but doctor's Telegram is not configured.`;
                await telegramService.sendEmergencyMessage(message);
                return;
            }

            const patientName = patientData.fullName || userData?.fullName || 'Patient';
            const message = `🚨 URGENT ALERT: Patient ${patientName} has been identified with ${riskAssessment.riskLevel} bedsore risk (${riskAssessment.riskScore}/100). Immediate attention required.`;

            const result = await telegramService.sendMessage(chatId, message);

            console.log(`Telegram message sent to doctor (${doctorInfo.doctorId}): ${result.success ? 'SUCCESS' : 'FAILED'}`);

            if (riskAssessment.riskLevel === 'very-high' && riskAssessment.riskScore > 80) {
                const emergencyMessage = `🚨 CRITICAL ALERT: Patient ${patientName} has VERY HIGH bedsore risk (${riskAssessment.riskScore}/100). Immediate medical intervention required.`;
                await telegramService.sendEmergencyMessage(emergencyMessage);
            }

            return result;
        } catch (error) {
            console.error("Error notifying doctor:", error);
            try {
                const emergencyMessage = `Error sending notification: ${error.message}`;
                await telegramService.sendEmergencyMessage(emergencyMessage);
            } catch (innerError) {
                console.error("Failed to send emergency notification:", innerError);
            }
            return { success: false, message: error.message };
        }
    };

    const getAssignedDoctor = async () => {
        try {
            const patientRef = ref(database, `patients/${userId}`);
            const patientSnap = await get(patientRef);

            if (patientSnap.exists() && patientSnap.val().assignedDoctor) {
                const assignedDoctorId = patientSnap.val().assignedDoctor;
                return { doctorId: assignedDoctorId };
            }

            const usersRef = ref(database, 'users');
            const doctorQuery = query(usersRef, orderByChild('userType'), equalTo('doctor'));
            const doctorSnap = await get(doctorQuery);

            if (doctorSnap.exists()) {
                let doctorId = null;
                doctorSnap.forEach((childSnap) => {
                    if (!doctorId) doctorId = childSnap.key;
                });

                if (doctorId) {
                    return { doctorId };
                }
            }

            return null;
        } catch (error) {
            console.error("Error getting assigned doctor:", error);
            return null;
        }
    };

    const simulateMLPrediction = (patient, metrics) => {
        let score = 0;

        if (patient.mobilityStatus === 'bedbound') score += 40;
        else if (patient.mobilityStatus === 'chairbound') score += 30;
        else if (patient.mobilityStatus === 'assistance') score += 20;

        if (patient.age > 70) score += 20;
        else if (patient.age > 60) score += 15;

        if (patient.hasDiabetes === 'yes') score += 15;

        if (patient.incontinence === 'both') score += 25;
        else if (patient.incontinence === 'fecal' || patient.incontinence === 'urinary') score += 15;

        if (patient.height && patient.weight) {
            const heightInMeters = patient.height / 100;
            const bmi = patient.weight / (heightInMeters * heightInMeters);

            if (bmi < 18.5 || bmi >= 30) score += 15;
        }

        if (metrics?.sittingDuration > 120) score += 20;

        const normalizedScore = Math.min(100, Math.max(0, score));

        let riskLevel;
        if (normalizedScore < 20) riskLevel = 'low';
        else if (normalizedScore < 40) riskLevel = 'moderate';
        else if (normalizedScore < 60) riskLevel = 'high';
        else riskLevel = 'very-high';

        return {
            riskScore: normalizedScore,
            riskLevel,
            confidence: Math.round(70 + Math.random() * 25)
        };
    };

    const handleAcceptCall = async (call) => {
        try {
            stopRingtone();
            await update(ref(database, `calls/${call.callId}`), { status: 'accepting' });
            setActiveCall(call);
            setIncomingCall(null);
        } catch (error) {
            console.error('Error accepting call:', error);
        }
    };

    const handleDeclineCall = async (call) => {
        try {
            stopRingtone();
            await update(ref(database, `calls/${call.callId}`), { status: 'declined' });
            setIncomingCall(null);
        } catch (error) {
            console.error('Error declining call:', error);
        }
    };

    const ringtoneRef = useRef(null);

    const playRingtone = () => {
        if (!ringtoneRef.current) {
            ringtoneRef.current = new Audio('/ringtone.mp3');
            ringtoneRef.current.loop = true;
        }

        ringtoneRef.current.play().catch(err => {
            console.log('Could not play ringtone (user interaction required):', err);
        });
    };

    const stopRingtone = () => {
        if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
        }
    };

    const handleEndCall = () => {
        setActiveCall(null);
    };

    const getStatusColor = (metric, value) => {
        if (metric === 'bp') {
            const systolic = value.systolic;
            const diastolic = value.diastolic;

            if (systolic > 140 || diastolic > 90) return '#f44336';
            if (systolic < 90 || diastolic < 60) return '#ff9800';
            return '#4caf50';
        } else if (metric === 'heartRate') {
            if (value < 60 || value > 100) return '#ff9800';
            return '#4caf50';
        } else if (metric === 'spo2') {
            if (value < 95) return '#f44336';
            return '#4caf50';
        } else if (metric === 'temperature') {
            if (value > 37.5) return '#f44336';
            if (value < 36) return '#ff9800';
            return '#4caf50';
        } else if (metric === 'warning') {
            return value > 0 ? '#f44336' : '#4caf50';
        } else if (metric === 'bedsoreRisk') {
            if (value === 'low') return '#4caf50';
            if (value === 'moderate') return '#ff9800';
            if (value === 'high') return '#f44336';
            if (value === 'very-high') return '#9c27b0';
            return '#2196f3';
        }
        return '#2196f3';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getBMICategory = (height, weight) => {
        if (!height || !weight) return "Not calculated";

        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);

        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal";
        if (bmi < 30) return "Overweight";
        return "Obese";
    };

    const shouldDisplayWarning = (warningValue) => {
        if (warningValue === 0) return false;
        if (!warningTimestamp || warningTimestamp.value !== warningValue) return false;
        const elapsedTime = (Date.now() - warningTimestamp.timestamp) / 1000;
        return elapsedTime >= 10;
    };

    // Add the rendering functions for warnings
    const renderHighRiskWarning = () => {
        return (
            <div className="health-warning health-warning-urgent">
                <div className="warning-icon">🚨</div>
                <div className="warning-text">
                    High bedsore risk detected! Follow prevention guidelines.
                </div>
                <button
                    className="warning-action-button"
                    onClick={() => setActiveTab('bedsore')}
                >
                    View Recommendations
                </button>
            </div>
        );
    };

    const renderPressureWarning = (warningValue) => {
        return (
            <div className={`health-warning ${warningValue >= 1 && warningValue <= 6 ? 'health-warning-urgent' : ''}`}>
                <div className="warning-icon">{warningValue >= 1 && warningValue <= 6 ? '🚨' : '⚠️'}</div>
                <div className="warning-text">
                    {warningValue === 1
                        ? "ALERT: Left shoulder has been under pressure for a long time!"
                        : warningValue === 2
                            ? "ALERT: Right shoulder has been under pressure for a long time!"
                            : warningValue === 3
                                ? "ALERT: Left back has been under pressure for a long time!"
                                : warningValue === 4
                                    ? "ALERT: Right back has been under pressure for a long time!"
                                    : warningValue === 5
                                        ? "ALERT: Left leg has been under pressure for a long time!"
                                        : warningValue === 6
                                            ? "ALERT: Right leg has been under pressure for a long time!"
                                            : `Warning: ${warningValue} health metrics need attention`}
                </div>
                {warningValue >= 1 && warningValue <= 6 && (
                    <button
                        className="warning-action-button"
                        onClick={() => setActiveTab('bedsore')}
                    >
                        Send Telegram Alert
                    </button>
                )}
            </div>
        );
    };

    const renderSelectedRecord = () => {
        if (!selectedRecord) return null;

        const calculateBMI = (height, weight) => {
            if (!height || !weight) return "N/A";
            const heightInMeters = height / 100;
            return (weight / (heightInMeters * heightInMeters)).toFixed(1);
        };

        return (
            <div className="record-details">
                <h3>Health Record Details - {formatDate(selectedRecord.timestamp)}</h3>

                <div className="record-section">
                    <h4>Personal Information</h4>
                    <div className="detail-item">
                        <span className="detail-label">Full Name:</span>
                        <span className="detail-value">{selectedRecord.fullName || "Not recorded"}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Phone Number:</span>
                        <span className="detail-value">{selectedRecord.phoneNumber || "Not recorded"}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Age:</span>
                        <span className="detail-value">{selectedRecord.age || "Not recorded"}</span>
                    </div>
                </div>

                <div className="record-section">
                    <h4>Health Measurements</h4>
                    <div className="detail-item">
                        <span className="detail-label">Height:</span>
                        <span className="detail-value">{selectedRecord.height ? `${selectedRecord.height} cm` : "Not recorded"}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{selectedRecord.weight ? `${selectedRecord.weight} kg` : "Not recorded"}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">BMI:</span>
                        <span className="detail-value">{calculateBMI(selectedRecord.height, selectedRecord.weight)} - {getBMICategory(selectedRecord.height, selectedRecord.weight)}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Blood Pressure:</span>
                        <span className="detail-value">{selectedRecord.bloodPressure || "Not recorded"}</span>
                    </div>
                </div>

                <div className="record-section">
                    <h4>Medical History</h4>
                    <div className="detail-item">
                        <span className="detail-label">Diabetes:</span>
                        <span className="detail-value">
                            {selectedRecord.hasDiabetes === 'yes'
                                ? `Yes${selectedRecord.diabetesType ? ` - Type ${selectedRecord.diabetesType.replace('type', '')}` : ''}`
                                : (selectedRecord.hasDiabetes === 'no' ? 'No' : 'Unknown')}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Surgery History:</span>
                        <span className="detail-value">
                            {selectedRecord.surgeryHistory === 'yes'
                                ? `Yes - ${selectedRecord.surgeryDetails || 'No details provided'}`
                                : 'No'}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Existing Conditions:</span>
                        <span className="detail-value">
                            {selectedRecord.existingConditions && selectedRecord.existingConditions.length > 0
                                ? selectedRecord.existingConditions.join(', ')
                                : 'None reported'}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Additional Issues:</span>
                        <span className="detail-value">{selectedRecord.additionalIssues || 'None reported'}</span>
                    </div>
                </div>

                <div className="record-section">
                    <h4>Mobility & Bedsore Risk Factors</h4>
                    <div className="detail-item">
                        <span className="detail-label">Mobility Status:</span>
                        <span className="detail-value">{selectedRecord.mobilityStatus ?
                            selectedRecord.mobilityStatus.charAt(0).toUpperCase() + selectedRecord.mobilityStatus.slice(1) :
                            "Not recorded"}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Incontinence:</span>
                        <span className="detail-value">{selectedRecord.incontinence ?
                            (selectedRecord.incontinence === 'no' ? 'None' :
                                selectedRecord.incontinence.charAt(0).toUpperCase() + selectedRecord.incontinence.slice(1)) :
                            "Not recorded"}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Skin Condition:</span>
                        <span className="detail-value">{selectedRecord.skinCondition ?
                            selectedRecord.skinCondition.charAt(0).toUpperCase() + selectedRecord.skinCondition.slice(1) :
                            "Not recorded"}</span>
                    </div>
                </div>

                <button
                    className="button back-button"
                    onClick={() => setSelectedRecord(null)}
                >
                    Back to History List
                </button>
            </div>
        );
    };

    if (loading) return <div>Loading...</div>;
    if (!userData) return <div>User not found. <button onClick={onLogout}>Return to Login</button></div>;

    return (
        <div className="dashboard">
            <header className="header">
                <h1>Patient Dashboard</h1>
                <button className="logout-button" onClick={onLogout}>Logout</button>
            </header>

            <nav className="nav">
                {['home', 'health', 'history', 'calls', 'bedsore', 'progress'].map(tab => (
                    <div
                        key={tab}
                        className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'bedsore' ? 'Health Assessment' :
                            tab === 'progress' ? 'Health Progress' :
                                tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </div>
                ))}
            </nav>

            <main className="content">
                {activeTab === 'home' && (
                    <div>
                        <div className="welcome">
                            <h2>Welcome, {userData.fullName || (healthHistory.length > 0 && healthHistory[0].fullName) || 'Patient'}</h2>
                            <p>Phone: {userData.phoneNumber}</p>
                            {userData.email && <p>Email: {userData.email}</p>}
                        </div>

                        {sensorData && (
                            <div className="card">
                                <h3>Current Health Metrics</h3>
                                <div className="health-metrics-container">
                                    <div className="health-metric">
                                        <div className="metric-title">Heart Rate</div>
                                        <div className="metric-value" style={{ color: getStatusColor('heartRate', sensorData.heartRate) }}>
                                            {sensorData.heartRate} bpm
                                        </div>
                                    </div>
                                    <div className="health-metric">
                                        <div className="metric-title">Oxygen Saturation (SpO2)</div>
                                        <div className="metric-value" style={{ color: getStatusColor('spo2', sensorData.spo2) }}>
                                            {sensorData.spo2}%
                                        </div>
                                    </div>
                                    <div className="health-metric">
                                        <div className="metric-title">Blood Pressure</div>
                                        <div className="metric-value" style={{ color: getStatusColor('bp', { systolic: sensorData.bpSystolic, diastolic: sensorData.bpDiastolic }) }}>
                                            {sensorData.bp} mmHg
                                        </div>
                                    </div>
                                    <div className="health-metric">
                                        <div className="metric-title">Body Temperature</div>
                                        <div className="metric-value" style={{ color: getStatusColor('temperature', sensorData.temperature) }}>
                                            {sensorData.temperature}°C
                                        </div>
                                    </div>
                                    <div className="health-metric">
                                        <div className="metric-title">Humidity</div>
                                        <div className="metric-value">
                                            {sensorData.humidity}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="card">
                            <h3>Your Health Progress</h3>
                            <div className="health-progress-preview">
                                <p>Track your health metrics over time</p>
                                <div className="progress-metrics">
                                    <div className="metric">
                                        <span className="metric-label">Weight</span>
                                        <span className="metric-value">{healthHistory.length > 0 ? `${healthHistory[0].weight || '–'} kg` : '–'}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Blood Pressure</span>
                                        <span className="metric-value">{healthHistory.length > 0 ? healthHistory[0].bloodPressure || '–' : '–'}</span>
                                    </div>

                                </div>
                                <button
                                    className="progress-button"
                                    onClick={() => setActiveTab('progress')}
                                    style={{
                                        padding: '10px 15px',
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginTop: '15px',
                                        display: 'block',
                                        width: '100%'
                                    }}
                                >
                                    View Health Progress & Download Reports
                                </button>
                            </div>
                            <style jsx>{`
    .health-progress-preview {
      padding: 10px 0;
    }
    .progress-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .metric {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 16px;
      font-weight: bold;
    }
  `}</style>
                            <h3>Quick Actions</h3>
                            <button
                                className="button"
                                style={{ marginRight: '10px' }}
                                onClick={() => setActiveTab('health')}
                            >
                                Fill Health Form
                            </button>
                            <button
                                className="button"
                                style={{ marginRight: '10px' }}
                                onClick={() => setActiveTab('history')}
                            >
                                View Health History
                            </button>
                            <button
                                className="button"
                                onClick={triggerManualRiskAssessment}
                            >
                                ML Bedsore Assessment
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === 'health' && (
                    <div className="card">
                        <h2>Health Information Form</h2>
                        <HealthForm onSubmit={handleHealthFormSubmit} userId={userId} />
                    </div>
                )}
                {activeTab === 'history' && (
                    <div className="card">
                        <h2>Medical History</h2>
                        {selectedRecord ? (
                            renderSelectedRecord()
                        ) : (
                            <>
                                {healthHistory.length > 0 ? (
                                    <div className="history-container">
                                        <div className="history-header">
                                            <span className="header-date">Date</span>
                                            <span className="header-bmi">BMI</span>
                                            <span className="header-bp">Blood Pressure</span>
                                            <span className="header-conditions">Conditions</span>
                                            <span className="header-risk">Bedsore Risk</span>
                                            <span className="header-actions">Actions</span>
                                        </div>
                                        {healthHistory.map((record) => {
                                            const bedsoreEntry = bedsoreHistory.find(assessment =>
                                                new Date(assessment.timestamp).toDateString() === new Date(record.timestamp).toDateString()
                                            );
                                            let bmiCategory = getBMICategory(record.height, record.weight);
                                            return (
                                                <div key={record.id} className="history-row">
                                                    <span className="row-date">{formatDate(record.timestamp)}</span>
                                                    <span className="row-bmi">
                                                        {record.height && record.weight ? (
                                                            <span className={`bmi-tag ${bmiCategory.toLowerCase()}`}>
                                                                {bmiCategory}
                                                            </span>
                                                        ) : "Not recorded"}
                                                    </span>
                                                    <span className="row-bp">
                                                        {record.bloodPressure || "Not recorded"}
                                                    </span>
                                                    <span className="row-conditions">
                                                        {record.existingConditions && record.existingConditions.length > 0
                                                            ? record.existingConditions.slice(0, 2).join(', ') +
                                                            (record.existingConditions.length > 2 ? '...' : '')
                                                            : "None reported"}
                                                    </span>
                                                    <span className="row-risk">
                                                        {bedsoreEntry ? (
                                                            <span className={`risk-tag ${bedsoreEntry.riskLevel}`}>
                                                                {bedsoreEntry.riskLevel.charAt(0).toUpperCase() +
                                                                    bedsoreEntry.riskLevel.slice(1).replace('-', ' ')}
                                                            </span>
                                                        ) : "Not assessed"}
                                                    </span>
                                                    <span className="row-actions">
                                                        <button
                                                            className="button view-button"
                                                            onClick={() => setSelectedRecord(record)}
                                                        >
                                                            View Details
                                                        </button>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-history">
                                        <p>No health records found. Please fill out the health form to begin tracking your health history.</p>
                                        <button
                                            className="button"
                                            onClick={() => setActiveTab('health')}
                                        >
                                            Fill Health Form
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                {activeTab === 'calls' && (
                    <div className="card">
                        <h2>Video Calls History</h2>
                        {recentCalls.length > 0 ? (
                            <table className="calls-list">
                                <thead>
                                    <tr>
                                        <th className="calls-header">Date</th>
                                        <th className="calls-header">Doctor</th>
                                        <th className="calls-header">Status</th>
                                        <th className="calls-header">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCalls.map(call => (
                                        <tr key={call.callId}>
                                            <td className="calls-data">
                                                {new Date(call.timestamp).toLocaleString()}
                                            </td>
                                            <td className="calls-data">
                                                {call.doctorName || `Dr. ID: ${call.doctorId}`}
                                            </td>
                                            <td className="calls-data">
                                                {call.status === 'pending' ? 'Waiting' :
                                                    call.status === 'accepted' ? 'Connected' :
                                                        call.status === 'declined' ? 'Declined' : 'Ended'}
                                            </td>
                                            <td className="calls-data">
                                                {call.endTime && call.status === 'ended' ?
                                                    `${Math.round((new Date(call.endTime) - new Date(call.timestamp)) / 1000 / 60)} min` :
                                                    call.status === 'pending' ? 'Incoming...' :
                                                        call.status === 'declined' ? '-' : 'In progress'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No video calls history.</p>
                        )}
                    </div>
                )}
                {activeTab === 'bedsore' && (
                    <div>
                        <div className="card">
                            <h2>Health Risk Assessment</h2>
                            {sensorData ? (
                                <>
                                    <div className="prediction-container">
                                        <h3>Current Health Status</h3>
                                        <div className="health-metrics-grid">
                                            <div className="metric-card">
                                                <h4>Heart Rate</h4>
                                                <p className="metric-value" style={{ color: getStatusColor('heartRate', sensorData.heartRate) }}>
                                                    {sensorData.heartRate} bpm
                                                </p>
                                                <p className="metric-status">
                                                    {sensorData.heartRate < 60 ? 'Low (Bradycardia)' : 
                                                     sensorData.heartRate > 100 ? 'High (Tachycardia)' : 
                                                     'Normal'}
                                                </p>
                                            </div>
                                            <div className="metric-card">
                                                <h4>Blood Oxygen (SpO2)</h4>
                                                <p className="metric-value" style={{ color: getStatusColor('spo2', sensorData.spo2) }}>
                                                    {sensorData.spo2}%
                                                </p>
                                                <p className="metric-status">
                                                    {sensorData.spo2 < 95 ? 'Low - Needs Attention' : 'Normal'}
                                                </p>
                                            </div>
                                            <div className="metric-card">
                                                <h4>Blood Pressure</h4>
                                                <p className="metric-value" style={{ color: getStatusColor('bp', { systolic: sensorData.bpSystolic, diastolic: sensorData.bpDiastolic }) }}>
                                                    {sensorData.bp}
                                                </p>
                                                <p className="metric-status">
                                                    {sensorData.bpSystolic > 140 || sensorData.bpDiastolic > 90 ? 'High (Hypertension)' :
                                                     sensorData.bpSystolic < 90 || sensorData.bpDiastolic < 60 ? 'Low (Hypotension)' :
                                                     'Normal'}
                                                </p>
                                            </div>
                                            <div className="metric-card">
                                                <h4>Body Temperature</h4>
                                                <p className="metric-value" style={{ color: getStatusColor('temperature', sensorData.temperature) }}>
                                                    {sensorData.temperature}°C
                                                </p>
                                                <p className="metric-status">
                                                    {sensorData.temperature > 37.5 ? 'Fever Detected' :
                                                     sensorData.temperature < 36 ? 'Low - Hypothermia Risk' :
                                                     'Normal'}
                                                </p>
                                            </div>
                                            <div className="metric-card">
                                                <h4>Environment Humidity</h4>
                                                <p className="metric-value">
                                                    {sensorData.humidity}%
                                                </p>
                                                <p className="metric-status">
                                                    {sensorData.humidity > 60 ? 'High' :
                                                     sensorData.humidity < 30 ? 'Low' :
                                                     'Normal'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="health-alerts" style={{ marginTop: '30px' }}>
                                            <h3>Health Alerts & Recommendations</h3>
                                            {(() => {
                                                const alerts = [];
                                                
                                                if (sensorData.heartRate < 60) {
                                                    alerts.push({ type: 'warning', message: '⚠️ Low heart rate detected. Consider consulting a doctor if experiencing dizziness or fatigue.' });
                                                } else if (sensorData.heartRate > 100) {
                                                    alerts.push({ type: 'warning', message: '⚠️ Elevated heart rate. Rest and monitor. Seek medical attention if persistent.' });
                                                }
                                                
                                                if (sensorData.spo2 < 95) {
                                                    alerts.push({ type: 'danger', message: '🚨 Low blood oxygen level. Immediate medical attention recommended!' });
                                                }
                                                
                                                if (sensorData.bpSystolic > 140 || sensorData.bpDiastolic > 90) {
                                                    alerts.push({ type: 'danger', message: '🚨 High blood pressure detected. Please consult your doctor and monitor regularly.' });
                                                } else if (sensorData.bpSystolic < 90 || sensorData.bpDiastolic < 60) {
                                                    alerts.push({ type: 'warning', message: '⚠️ Low blood pressure. Ensure adequate hydration and rest.' });
                                                }
                                                
                                                if (sensorData.temperature > 37.5) {
                                                    alerts.push({ type: 'warning', message: '⚠️ Fever detected. Monitor temperature and stay hydrated. Seek medical care if above 38.5°C.' });
                                                } else if (sensorData.temperature < 36) {
                                                    alerts.push({ type: 'warning', message: '⚠️ Low body temperature. Keep warm and monitor.' });
                                                }
                                                
                                                if (alerts.length === 0) {
                                                    alerts.push({ type: 'success', message: '✅ All vital signs are within normal range. Keep maintaining a healthy lifestyle!' });
                                                }
                                                
                                                return alerts.map((alert, index) => (
                                                    <div key={index} className={`alert alert-${alert.type}`} style={{
                                                        padding: '15px',
                                                        margin: '10px 0',
                                                        borderRadius: '8px',
                                                        backgroundColor: alert.type === 'danger' ? '#ffebee' :
                                                                       alert.type === 'warning' ? '#fff3e0' :
                                                                       '#e8f5e9',
                                                        border: `2px solid ${alert.type === 'danger' ? '#f44336' :
                                                                             alert.type === 'warning' ? '#ff9800' :
                                                                             '#4caf50'}`
                                                    }}>
                                                        {alert.message}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                        <p className="info-text">
                                            Health assessments are automatically performed based on real-time sensor data. Alerts are sent to your healthcare provider when abnormalities are detected.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <p>No sensor data available for health risk assessment.</p>
                                    <p>Please ensure your sensors are connected and transmitting data.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'progress' && (
                    <div className="card">
                        <h2>Health Progress Tracking</h2>
                        <HealthProgressTracker userId={userId} />
                    </div>
                )}
            </main>
            {incomingCall && !activeCall && (
                <CallNotification
                    call={incomingCall}
                    onAccept={handleAcceptCall}
                    onDecline={handleDeclineCall}
                />
            )}
            {activeCall && (
                <div className="video-modal">
                    <div className="video-container">
                        <VideoCall
                            userId={userId}
                            role="patient"
                            callData={activeCall}
                            onEndCall={handleEndCall}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;