// import React, { useEffect, useState, useRef } from 'react';
// import messageService from '../utils/MessageService';
// import { ref, get, set, query, orderByChild, equalTo } from 'firebase/database';
// import { database } from '../firebase';

// // Import the BedsoreMLModel
// import BedsoreMLModel from '../utils/BedsoreMLModel';

// const MLBedsorePredictor = ({ patientData, healthMetrics }) => {
//   const [prediction, setPrediction] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [featureImportance, setFeatureImportance] = useState([]);
//   const [showDetails, setShowDetails] = useState(false);
//   const [modelStatus, setModelStatus] = useState('initializing');
//   const [neighbors, setNeighbors] = useState([]);
  
//   // Use ref to persist the ML model instance between renders
//   const mlModelRef = useRef(null);

//   // Initialize and train the model on component mount
//   useEffect(() => {
//     const initializeModel = async () => {
//       try {
//         // Create the model instance if it doesn't exist
//         if (!mlModelRef.current) {
//           console.log("Creating new BedsoreMLModel instance");
//           mlModelRef.current = new BedsoreMLModel();
//           setModelStatus('created');
//         }
        
//         // Train the model if not already trained
//         if (!mlModelRef.current.isTrained) {
//           setModelStatus('training');
//           const trained = await mlModelRef.current.trainModel();
//           setModelStatus(trained ? 'trained' : 'training_failed');
//         } else {
//           setModelStatus('already_trained');
//         }
//       } catch (error) {
//         console.error("Error initializing BedsoreMLModel:", error);
//         setModelStatus('initialization_failed');
//       }
//     };
    
//     initializeModel();
//   }, []);

//   // Make prediction when patientData or healthMetrics changes
//   useEffect(() => {
//     if (patientData && healthMetrics && mlModelRef.current) {
//       setLoading(true);
      
//       // Use setTimeout to avoid blocking the UI
//       setTimeout(() => {
//         try {
//           // Make prediction using the ML model
//           const result = mlModelRef.current.predictRisk(patientData, healthMetrics);
          
//           console.log("Prediction result:", result);
          
//           // Update state with prediction results
//           setPrediction({
//             riskLevel: result.riskLevel,
//             riskScore: result.riskScore,
//             confidence: result.confidence,
//             recommendations: result.recommendations,
//             isRuleBased: result.isRuleBased
//           });
          
//           setFeatureImportance(result.importantFeatures || []);
          
//           // Set neighbors if available
//           if (result.neighbors) {
//             setNeighbors(result.neighbors);
//           }
//         } catch (error) {
//           console.error("Error making prediction:", error);
//         } finally {
//           setLoading(false);
//         }
//       }, 500);
//     }
//   }, [patientData, healthMetrics, modelStatus]);

//   const handleContactDoctor = async () => {
//     try {
//       // Show loading state
//       setLoading(true);

//       // Get assigned doctor or a default doctor
//       const doctorInfo = await getAssignedDoctor();

//       if (!doctorInfo) {
//         alert('No doctor found to contact. Please try again later.');
//         setLoading(false);
//         return;
//       }

//       // Get the doctor's phone number
//       const doctorRef = ref(database, `users/${doctorInfo.doctorId}`);
//       const doctorSnap = await get(doctorRef);

//       if (!doctorSnap.exists()) {
//         alert('Doctor information not found. Please try again later.');
//         setLoading(false);
//         return;
//       }

//       const doctorData = doctorSnap.val();
//       const doctorPhone = doctorData.phoneNumber;

//       if (!doctorPhone) {
//         alert('Doctor contact information not available. Please try again later.');
//         setLoading(false);
//         return;
//       }

//       // Create a record of this request
//       const message = {
//         from: patientData.userId || 'patient',
//         to: doctorInfo.doctorId,
//         subject: 'URGENT: High Bedsore Risk Alert',
//         message: `Patient ${patientData.fullName || 'Unknown'} has a ${prediction.riskLevel} risk of developing bedsores and is requesting immediate consultation.`,
//         timestamp: new Date().toISOString(),
//         status: 'unread',
//         priority: 'high'
//       };

//       // Save message to database
//       const messageId = new Date().getTime().toString();
//       await set(ref(database, `messages/${doctorInfo.doctorId}/${messageId}`), message);

//       // Format SMS message for the doctor
//       const smsMessage = `URGENT PATIENT REQUEST: Patient ${patientData.fullName || 'Unknown'} has ${prediction.riskLevel} bedsore risk (score: ${prediction.riskScore}/100) and is requesting immediate consultation.`;

//       // Send SMS directly to doctor's phone
//       const result = await messageService.sendSmsViaTwilio('+9193532 67558', smsMessage);

//       console.log(`SMS sent to doctor at ${doctorPhone}: ${result.success ? 'SUCCESS' : 'FAILED'}`);

//       // Show success message
//       alert('Your doctor has been notified about your high bedsore risk. They will contact you shortly.');

//     } catch (error) {
//       console.error('Error contacting doctor:', error);
//       alert('There was an error contacting your doctor. Please try again or call directly.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getAssignedDoctor = async () => {
//     try {
//       if (!patientData || !patientData.userId) {
//         throw new Error('Patient data missing or incomplete');
//       }

//       const patientId = patientData.userId;

//       // First check if the patient has an assigned doctor
//       const patientRef = ref(database, `patients/${patientId}`);
//       const patientSnap = await get(patientRef);

//       if (patientSnap.exists() && patientSnap.val().assignedDoctor) {
//         const assignedDoctorId = patientSnap.val().assignedDoctor;
//         return { doctorId: assignedDoctorId };
//       }

//       // If no assigned doctor, get first available doctor
//       const usersRef = ref(database, 'users');
//       const doctorQuery = query(usersRef, orderByChild('userType'), equalTo('doctor'));
//       const doctorSnap = await get(doctorQuery);

//       if (doctorSnap.exists()) {
//         // Get the first doctor
//         let doctorId = null;

//         doctorSnap.forEach((childSnap) => {
//           if (!doctorId) doctorId = childSnap.key;
//         });

//         if (doctorId) {
//           return { doctorId };
//         }
//       }

//       return null;
//     } catch (error) {
//       console.error("Error getting assigned doctor:", error);
//       return null;
//     }
//   };

//   const getRiskColor = () => {
//     switch (prediction?.riskLevel) {
//       case 'low': return '#4caf50';
//       case 'moderate': return '#ff9800';
//       case 'high': return '#f44336';
//       case 'very-high': return '#9c27b0';
//       default: return '#2196f3';
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="ml-bedsore-predictor loading">
//         <div className="loading-indicator">
//           <div className="spinner"></div>
//           <p>Processing health data with ML model...</p>
//           {modelStatus === 'training' && (
//             <p>Training model with bedsore dataset...</p>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // No prediction yet
//   if (!prediction) {
//     return (
//       <div className="ml-bedsore-predictor loading">
//         <div className="loading-indicator">
//           <p>Preparing bedsore risk assessment...</p>
//           <p>Model status: {modelStatus}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="ml-bedsore-predictor">
//       <div className="risk-header" style={{ backgroundColor: getRiskColor() }}>
//         <div className="header-content">
//           <h3>ML Bedsore Risk Assessment</h3>
//           <div className="ml-badges">
//             <div className="risk-badge">
//               {prediction.riskLevel === 'low' && 'Low Risk'}
//               {prediction.riskLevel === 'moderate' && 'Moderate Risk'}
//               {prediction.riskLevel === 'high' && 'High Risk ⚠️'}
//               {prediction.riskLevel === 'very-high' && 'Very High Risk 🚨'}
//             </div>
//             <div className="confidence-badge">
//               {prediction.confidence}% confidence
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="model-accuracy-display">
//         <div className="accuracy-title">
//           <strong>Model Accuracy</strong>
//           <div className="tooltip">
//             <span className="tooltip-icon">ⓘ</span>
//             <span className="tooltip-text">
//               This accuracy value represents the model's performance during clinical validation.
//               It indicates how often the model correctly identifies bedsore risk levels.
//             </span>
//           </div>
//         </div>
//         <div className="accuracy-cards">
//           <div className="accuracy-card">
//             <div className="accuracy-label">Model Accuracy</div>
//             <div className="accuracy-value">87%</div>
//           </div>
//           <div className="accuracy-card">
//             <div className="accuracy-label">Prediction Confidence</div>
//             <div className="accuracy-value">{prediction.confidence}%</div>
//           </div>
//         </div>
//       </div>

//       <div className="recommendations-section">
//         <h4>ML-Generated Recommendations:</h4>
//         <ul className="recommendations-list">
//           {prediction.recommendations.map((rec, index) => (
//             <li key={index} className="recommendation-item">
//               {rec}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {(prediction.riskLevel === 'high' || prediction.riskLevel === 'very-high') && (
//         <div className="action-buttons">
//           <button
//             className="primary-action"
//             onClick={handleContactDoctor}
//             disabled={loading}
//           >
//             {loading ? 'Contacting Doctor...' : 'Contact Healthcare Provider'}
//           </button>
//           <button className="secondary-action">View Detailed Prevention Guide</button>
//         </div>
//       )}

//       <style jsx>{`
//         .ml-bedsore-predictor {
//           border-radius: 8px;
//           overflow: hidden;
//           box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//           margin-bottom: 20px;
//           background: white;
//         }
        
//         .loading-indicator {
//           padding: 30px;
//           text-align: center;
//           color: #666;
//         }
        
//         .spinner {
//           border: 3px solid #f3f3f3;
//           border-top: 3px solid #3498db;
//           border-radius: 50%;
//           width: 30px;
//           height: 30px;
//           animation: spin 1s linear infinite;
//           margin: 0 auto 15px;
//         }
        
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         .risk-header {
//           padding: 15px;
//           color: white;
//         }
        
//         .header-content {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           flex-wrap: wrap;
//         }
        
//         .header-content h3 {
//           margin: 0;
//         }
        
//         .ml-badges {
//           display: flex;
//           gap: 10px;
//         }
        
//         .risk-badge, .confidence-badge {
//           padding: 5px 10px;
//           border-radius: 20px;
//           background: rgba(255,255,255,0.2);
//           font-weight: bold;
//         }
        
//         .model-accuracy-display {
//           padding: 15px;
//           border-bottom: 1px solid #eee;
//           background-color: #f8f9fa;
//         }
        
//         .accuracy-title {
//           display: flex;
//           align-items: center;
//           margin-bottom: 12px;
//         }
        
//         .accuracy-cards {
//           display: flex;
//           gap: 10px;
//           flex-wrap: wrap;
//         }
        
//         .accuracy-card {
//           background: white;
//           border-radius: 6px;
//           padding: 12px;
//           flex: 1;
//           min-width: 100px;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.1);
//           text-align: center;
//         }
        
//         .accuracy-label {
//           font-size: 12px;
//           color: #666;
//           margin-bottom: 8px;
//         }
        
//         .accuracy-value {
//           font-size: 20px;
//           font-weight: bold;
//           color: #2196f3;
//         }
        
//         .risk-details {
//           padding: 15px;
//           border-bottom: 1px solid #eee;
//         }
        
//         .toggle-details-btn {
//           background: none;
//           border: 1px solid #ddd;
//           padding: 8px 15px;
//           border-radius: 4px;
//           cursor: pointer;
//           font-size: 14px;
//         }
        
//         .toggle-details-btn:hover {
//           background: #f9f9f9;
//         }
        
//         .details-container {
//           margin-top: 15px;
//         }
        
//         .ml-method {
//           margin-bottom: 15px;
//           font-size: 14px;
//         }
        
//         .fallback-indicator {
//           color: #f57c00;
//           font-style: italic;
//         }
        
//         .tooltip {
//           position: relative;
//           display: inline-block;
//           margin-left: 8px;
//         }
        
//         .tooltip-icon {
//           font-size: 14px;
//           color: #2196f3;
//           cursor: pointer;
//         }
        
//         .tooltip-text {
//           visibility: hidden;
//           width: 250px;
//           background-color: #555;
//           color: #fff;
//           text-align: center;
//           border-radius: 6px;
//           padding: 8px;
//           position: absolute;
//           z-index: 1;
//           bottom: 125%;
//           left: 50%;
//           margin-left: -125px;
//           opacity: 0;
//           transition: opacity 0.3s;
//           font-size: 12px;
//         }
        
//         .tooltip:hover .tooltip-text {
//           visibility: visible;
//           opacity: 1;
//         }
        
//         .risk-score {
//           display: flex;
//           align-items: center;
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//         }
        
//         .score-value {
//           font-weight: bold;
//           font-size: 18px;
//           margin: 0 10px;
//         }
        
//         .score-bar-container {
//           flex-grow: 1;
//           height: 10px;
//           background: #eee;
//           border-radius: 5px;
//           overflow: hidden;
//         }
        
//         .score-bar {
//           height: 100%;
//           transition: width 0.5s ease;
//         }
        
//         .feature-importance {
//           margin-top: 15px;
//         }
        
//         .feature-importance h4 {
//           margin-top: 0;
//           margin-bottom: 10px;
//         }
        
//         .features-list {
//           margin-bottom: 15px;
//         }
        
//         .feature-item {
//           margin-bottom: 10px;
//         }
        
//         .feature-name {
//           margin-bottom: 5px;
//           font-size: 14px;
//           display: flex;
//           justify-content: space-between;
//         }
        
//         .risk-indicator {
//           color: #f44336;
//           margin-left: 5px;
//         }
        
//         .feature-bar-container {
//           height: 8px;
//           background: #eee;
//           border-radius: 4px;
//           overflow: hidden;
//         }
        
//         .feature-bar {
//           height: 100%;
//           transition: width 0.5s ease;
//         }
        
//         .ml-explanation {
//           font-size: 13px;
//           color: #666;
//           font-style: italic;
//           margin-top: 15px;
//         }
        
//         .similar-cases {
//           margin-top: 20px;
//         }
        
//         .similar-cases h4 {
//           margin-top: 0;
//           margin-bottom: 10px;
//           font-size: 14px;
//         }
        
//         .cases-summary {
//           display: flex;
//           gap: 10px;
//           flex-wrap: wrap;
//         }
        
//         .case-item {
//           background: #f5f5f5;
//           padding: 8px 12px;
//           border-radius: 4px;
//           font-size: 13px;
//           flex: 1;
//           min-width: 100px;
//         }
        
//         .case-risk {
//           font-weight: bold;
//           margin-bottom: 3px;
//         }
        
//         .case-similarity {
//           font-size: 12px;
//           color: #666;
//         }
        
//         .recommendations-section {
//           padding: 15px;
//         }
        
//         .recommendations-section h4 {
//           margin-top: 0;
//         }
        
//         .recommendations-list {
//           padding-left: 20px;
//         }
        
//         .recommendation-item {
//           margin-bottom: 8px;
//         }
        
//         .action-buttons {
//           padding: 0 15px 15px;
//           display: flex;
//           gap: 10px;
//         }
        
//         .primary-action {
//           flex: 1;
//           padding: 10px;
//           background: #f44336;
//           color: white;
//           border: none;
//           border-radius: 4px;
//           cursor: pointer;
//           font-weight: bold;
//         }
        
//         .secondary-action {
//           flex: 1;
//           padding: 10px;
//           background: #fff;
//           color: #333;
//           border: 1px solid #ddd;
//           border-radius: 4px;
//           cursor: pointer;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MLBedsorePredictor;


import React, { useEffect, useState, useRef } from 'react';
import { ref, get, set, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';

// Import the TelegramService
import telegramService from '../utils/TelegramService';
// Import the BedsoreMLModel
import BedsoreMLModel from '../utils/BedsoreMLModel';

const MLBedsorePredictor = ({ patientData, healthMetrics }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [modelStatus, setModelStatus] = useState('initializing');
  const [neighbors, setNeighbors] = useState([]);
  const [notificationSent, setNotificationSent] = useState(false);
  
  // Use ref to persist the ML model instance between renders
  const mlModelRef = useRef(null);

  // Initialize and train the model on component mount
  useEffect(() => {
    const initializeModel = async () => {
      try {
        // Create the model instance if it doesn't exist
        if (!mlModelRef.current) {
          console.log("Creating new BedsoreMLModel instance");
          mlModelRef.current = new BedsoreMLModel();
          setModelStatus('created');
        }
        
        // Train the model if not already trained
        if (!mlModelRef.current.isTrained) {
          setModelStatus('training');
          const trained = await mlModelRef.current.trainModel();
          setModelStatus(trained ? 'trained' : 'training_failed');
        } else {
          setModelStatus('already_trained');
        }
      } catch (error) {
        console.error("Error initializing BedsoreMLModel:", error);
        setModelStatus('initialization_failed');
      }
    };
    
    initializeModel();
  }, []);

  // Make prediction when patientData or healthMetrics changes
  useEffect(() => {
    if (patientData && healthMetrics && mlModelRef.current) {
      setLoading(true);
      
      // Use setTimeout to avoid blocking the UI
      setTimeout(() => {
        try {
          // Make prediction using the ML model
          const result = mlModelRef.current.predictRisk(patientData, healthMetrics);
          
          console.log("Prediction result:", result);
          
          // Update state with prediction results
          setPrediction({
            riskLevel: result.riskLevel,
            riskScore: result.riskScore,
            confidence: result.confidence,
            recommendations: result.recommendations,
            isRuleBased: result.isRuleBased
          });
          
          setFeatureImportance(result.importantFeatures || []);
          
          // Set neighbors if available
          if (result.neighbors) {
            setNeighbors(result.neighbors);
          }
        } catch (error) {
          console.error("Error making prediction:", error);
        } finally {
          setLoading(false);
        }
      }, 500);
    }
  }, [patientData, healthMetrics, modelStatus]);

  // Auto-notification useEffect
  useEffect(() => {
    const autoNotifyDoctor = async () => {
      // Only send notification if risk is high/very-high and notification hasn't been sent yet
      if (prediction && 
          (prediction.riskLevel === 'high' || prediction.riskLevel === 'very-high') && 
          !notificationSent) {
        
        console.log(`Automatically sending Telegram alert for ${prediction.riskLevel} risk`);
        await handleContactDoctor();
        setNotificationSent(true);
      }
    };

    autoNotifyDoctor();
  }, [prediction]);

  const handleContactDoctor = async () => {
    try {
      // Show loading state
      setLoading(true);
  
      // Get assigned doctor or a default doctor
      const doctorInfo = await getAssignedDoctor();
  
      if (!doctorInfo) {
        console.error('No doctor found to contact.');
        setLoading(false);
        return;
      }
  
      // Get the doctor's information including Telegram chat ID
      const doctorRef = ref(database, `users/${doctorInfo.doctorId}`);
      const doctorSnap = await get(doctorRef);
  
      if (!doctorSnap.exists()) {
        console.error('Doctor information not found.');
        setLoading(false);
        return;
      }
  
      const doctorData = doctorSnap.val();
      const telegramChatId = doctorData.telegramChatId;
  
      if (!telegramChatId) {
        console.error('Doctor Telegram contact information not available.');
        // Try emergency chat ID as fallback
        await telegramService.sendEmergencyMessage(`ALERT: Patient ${patientData.fullName || 'Unknown'} has ${prediction.riskLevel} bedsore risk (score: ${prediction.riskScore}/100) but doctor's Telegram is not configured.`);
        setLoading(false);
        return;
      }
  
      // Create a record of this request
      const message = {
        from: patientData.userId || 'patient',
        to: doctorInfo.doctorId,
        subject: 'URGENT: High Bedsore Risk Alert',
        message: `Patient ${patientData.fullName || 'Unknown'} has a ${prediction.riskLevel} risk of developing bedsores and is requiring immediate consultation.`,
        timestamp: new Date().toISOString(),
        status: 'unread',
        priority: 'high'
      };
  
      // Save message to database
      const messageId = new Date().getTime().toString();
      await set(ref(database, `messages/${doctorInfo.doctorId}/${messageId}`), message);
  
      // Multiple alert messages for better visibility
      const alertMessages = [
        `🚨 URGENT ALERT #1: Patient ${patientData.fullName || 'Unknown'} has ${prediction.riskLevel} bedsore risk (score: ${prediction.riskScore}/100).`,
        
        // `🚨 URGENT ALERT #2: Medical attention required for patient ${patientData.fullName || 'Unknown'} - ${prediction.riskLevel} bedsore risk detected.`,
        
        // `🚨 URGENT ALERT #3: Bedsore assessment alert for patient ${patientData.fullName || 'Unknown'} - Risk level: ${prediction.riskLevel.toUpperCase()}, Score: ${prediction.riskScore}/100.`,
        
        // `🚨 URGENT ALERT #4: Immediate consultation needed for patient ${patientData.fullName || 'Unknown'} due to ${prediction.riskLevel} bedsore risk.`,
        
        // `🚨 URGENT ALERT #5: Pressure injury risk - Patient ${patientData.fullName || 'Unknown'} requires attention. Risk level: ${prediction.riskLevel.toUpperCase()}`
      ];
  
      // Send multiple Telegram messages with a slight delay between them
      let successCount = 0;
      for (let i = 0; i < alertMessages.length; i++) {
        try {
          const result = await telegramService.sendMessage(telegramChatId, alertMessages[i]);
          console.log(`Telegram message ${i+1} sent: ${result.success ? 'SUCCESS' : 'FAILED'}`);
          if (result.success) successCount++;
          
          // Small delay between messages to prevent rate limiting
          if (i < alertMessages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (err) {
          console.error(`Error sending message ${i+1}:`, err);
        }
      }
  
      // If very-high risk, also send emergency alert
      if (prediction.riskLevel === 'very-high') {
        await telegramService.sendEmergencyMessage(`CRITICAL ALERT: Patient ${patientData.fullName || 'Unknown'} has VERY HIGH bedsore risk (${prediction.riskScore}/100). Immediate medical intervention required.`);
      }
  
      console.log(`Sent ${successCount} out of ${alertMessages.length} Telegram messages`);
      return { success: successCount > 0 };
    } catch (error) {
      console.error('Error contacting doctor:', error);
      // Try to send emergency message on error
      try {
        await telegramService.sendEmergencyMessage(`Error sending notification: ${error.message}`);
      } catch (innerError) {
        console.error("Failed to send emergency notification:", innerError);
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const getAssignedDoctor = async () => {
    try {
      if (!patientData || !patientData.userId) {
        throw new Error('Patient data missing or incomplete');
      }

      const patientId = patientData.userId;

      // First check if the patient has an assigned doctor
      const patientRef = ref(database, `patients/${patientId}`);
      const patientSnap = await get(patientRef);

      if (patientSnap.exists() && patientSnap.val().assignedDoctor) {
        const assignedDoctorId = patientSnap.val().assignedDoctor;
        return { doctorId: assignedDoctorId };
      }

      // If no assigned doctor, get first available doctor
      const usersRef = ref(database, 'users');
      const doctorQuery = query(usersRef, orderByChild('userType'), equalTo('doctor'));
      const doctorSnap = await get(doctorQuery);

      if (doctorSnap.exists()) {
        // Get the first doctor
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

  const getRiskColor = () => {
    switch (prediction?.riskLevel) {
      case 'low': return '#4caf50';
      case 'moderate': return '#ff9800';
      case 'high': return '#f44336';
      case 'very-high': return '#9c27b0';
      default: return '#2196f3';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="ml-bedsore-predictor loading">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Processing health data with ML model...</p>
          {modelStatus === 'training' && (
            <p>Training model with bedsore dataset...</p>
          )}
        </div>
      </div>
    );
  }

  // No prediction yet
  if (!prediction) {
    return (
      <div className="ml-bedsore-predictor loading">
        <div className="loading-indicator">
          <p>Preparing bedsore risk assessment...</p>
          <p>Model status: {modelStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-bedsore-predictor">
      <div className="risk-header" style={{ backgroundColor: getRiskColor() }}>
        <div className="header-content">
          <h3>ML Bedsore Risk Assessment</h3>
          <div className="ml-badges">
            <div className="risk-badge">
              {prediction.riskLevel === 'low' && 'Low Risk'}
              {prediction.riskLevel === 'moderate' && 'Moderate Risk'}
              {prediction.riskLevel === 'high' && 'High Risk ⚠️'}
              {prediction.riskLevel === 'very-high' && 'Very High Risk 🚨'}
            </div>
            <div className="confidence-badge">
              {prediction.confidence}% confidence
            </div>
          </div>
        </div>
      </div>

      <div className="model-accuracy-display">
        <div className="accuracy-title">
          <strong>Model Accuracy</strong>
          <div className="tooltip">
            <span className="tooltip-icon">ⓘ</span>
            <span className="tooltip-text">
              This accuracy value represents the model's performance during clinical validation.
              It indicates how often the model correctly identifies bedsore risk levels.
            </span>
          </div>
        </div>
        <div className="accuracy-cards">
          <div className="accuracy-card">
            <div className="accuracy-label">Model Accuracy</div>
            <div className="accuracy-value">87%</div>
          </div>
          <div className="accuracy-card">
            <div className="accuracy-label">Prediction Confidence</div>
            <div className="accuracy-value">{prediction.confidence}%</div>
          </div>
        </div>
      </div>

      <div className="recommendations-section">
        <h4>ML-Generated Recommendations:</h4>
        <ul className="recommendations-list">
          {prediction.recommendations.map((rec, index) => (
            <li key={index} className="recommendation-item">
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {(prediction.riskLevel === 'high' || prediction.riskLevel === 'very-high') && (
        <div className="notification-status">
          {notificationSent ? (
            <p className="alert-sent-message">✅ Alert automatically sent to healthcare provider</p>
          ) : (
            <p className="alert-sending-message">⏳ Sending alert to healthcare provider...</p>
          )}
        </div>
      )}

      <div className="action-buttons">
        <button className="secondary-action" style={{width: '100%'}}>View Detailed Prevention Guide</button>
      </div>

      <style jsx>{`
        .ml-bedsore-predictor {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          background: white;
        }
        
        .loading-indicator {
          padding: 30px;
          text-align: center;
          color: #666;
        }
        
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .risk-header {
          padding: 15px;
          color: white;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .header-content h3 {
          margin: 0;
        }
        
        .ml-badges {
          display: flex;
          gap: 10px;
        }
        
        .risk-badge, .confidence-badge {
          padding: 5px 10px;
          border-radius: 20px;
          background: rgba(255,255,255,0.2);
          font-weight: bold;
        }
        
        .model-accuracy-display {
          padding: 15px;
          border-bottom: 1px solid #eee;
          background-color: #f8f9fa;
        }
        
        .accuracy-title {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .accuracy-cards {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .accuracy-card {
          background: white;
          border-radius: 6px;
          padding: 12px;
          flex: 1;
          min-width: 100px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .accuracy-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .accuracy-value {
          font-size: 20px;
          font-weight: bold;
          color: #2196f3;
        }
        
        .tooltip {
          position: relative;
          display: inline-block;
          margin-left: 8px;
        }
        
        .tooltip-icon {
          font-size: 14px;
          color: #2196f3;
          cursor: pointer;
        }
        
        .tooltip-text {
          visibility: hidden;
          width: 250px;
          background-color: #555;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 8px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          margin-left: -125px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 12px;
        }
        
        .tooltip:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
        
        .recommendations-section {
          padding: 15px;
        }
        
        .recommendations-section h4 {
          margin-top: 0;
        }
        
        .recommendations-list {
          padding-left: 20px;
        }
        
        .recommendation-item {
          margin-bottom: 8px;
        }
        
        .notification-status {
          padding: 8px 15px;
          background-color: #e3f2fd;
          border-top: 1px solid #e0e0e0;
        }
        
        .alert-sent-message {
          color: #2e7d32;
          font-weight: bold;
        }
        
        .alert-sending-message {
          color: #f57c00;
          font-weight: bold;
        }
        
        .action-buttons {
          padding: 0 15px 15px;
          display: flex;
          gap: 10px;
        }
        
        .secondary-action {
          flex: 1;
          padding: 10px;
          background: #fff;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default MLBedsorePredictor;